import algosdk from "algosdk";
import type { TransactionSigner } from "algosdk";

export async function submitHashStamp(
  algodClient: algosdk.Algodv2,
  activeAddress: string,
  signer: TransactionSigner,
  hash: string,
): Promise<{ txId: string }> {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const note = new TextEncoder().encode(`hashstamp:SHA-256:${hash}`);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: activeAddress,
    receiver: activeAddress,
    amount: 0,
    note,
    suggestedParams,
  });

  const atc = new algosdk.AtomicTransactionComposer();
  atc.addTransaction({ txn, signer });

  const result = await atc.execute(algodClient, 4);
  return { txId: result.txIDs[0] };
}
