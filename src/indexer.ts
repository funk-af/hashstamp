import algosdk from "algosdk";
import networks from "./networks.json";

interface NetworkIndexerConfig {
  networkId: string;
  indexer: {
    url: string;
    port: string;
    token: string;
  };
}

const networkConfigs = networks as NetworkIndexerConfig[];
const indexerClients = new Map<string, algosdk.Indexer>();

const NOTE_PREFIX = new TextEncoder().encode("hashstamp:");

function resolveNetworkId(networkId: string): string {
  const normalized = networkId.toLowerCase();
  return networkConfigs.some((config) => config.networkId === normalized)
    ? normalized
    : "localnet";
}

function getIndexerClient(networkId: string): algosdk.Indexer {
  const resolvedNetworkId = resolveNetworkId(networkId);
  const cached = indexerClients.get(resolvedNetworkId);
  if (cached) return cached;

  const config = networkConfigs.find(
    (item) => item.networkId === resolvedNetworkId,
  );
  if (!config) {
    throw new Error(`Missing indexer config for network: ${resolvedNetworkId}`);
  }

  const client = new algosdk.Indexer(
    config.indexer.token,
    config.indexer.url,
    config.indexer.port,
  );

  indexerClients.set(resolvedNetworkId, client);
  return client;
}

export function getTransactionExplorerUrl(
  networkId: string,
  txId: string,
): string {
  const resolvedNetworkId = resolveNetworkId(networkId);
  return `https://lora.algokit.io/${resolvedNetworkId}/transaction/${txId}`;
}

export interface HashStampRecord {
  txId: string;
  algorithm: string;
  hash: string;
  timestamp: number;
  confirmedRound: number;
}

export async function fetchHashStamps(
  address: string,
  networkId: string,
): Promise<HashStampRecord[]> {
  const indexerClient = getIndexerClient(networkId);
  const records: HashStampRecord[] = [];
  let nextToken: string | undefined;

  do {
    const query = indexerClient
      .searchForTransactions()
      .address(address)
      .addressRole("sender")
      .txType("pay")
      .notePrefix(NOTE_PREFIX)
      .limit(100);

    if (nextToken) {
      query.nextToken(nextToken);
    }

    const response = await query.do();
    const txns = response.transactions ?? [];

    for (const txn of txns) {
      // 0 Algo send-to-self
      const payTxn = txn.paymentTransaction;
      if (
        !payTxn ||
        payTxn.amount !== BigInt(0) ||
        payTxn.receiver !== address
      ) {
        continue;
      }

      if (!txn.note) continue;

      const noteStr = new TextDecoder().decode(txn.note);

      const match = noteStr.match(/^hashstamp:([^:]+):([0-9a-fA-F]+)$/);
      if (!match) continue;

      records.push({
        txId: txn.id!,
        algorithm: match[1],
        hash: match[2],
        timestamp: txn.roundTime ?? 0,
        confirmedRound: Number(txn.confirmedRound ?? 0),
      });
    }

    nextToken = response.nextToken;
  } while (nextToken);

  // Most recent first
  records.sort((a, b) => b.timestamp - a.timestamp);
  return records;
}
