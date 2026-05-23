import { useState, useCallback, useEffect } from "react";
import { useNetwork, useWallet } from "@txnlab/use-wallet-react";
import { WalletButton } from "@txnlab/use-wallet-ui-react";
import { hashFile } from "./hash";
import { submitHashStamp } from "./transaction";
import {
  fetchHashStamps,
  getTransactionExplorerUrl,
  type HashStampRecord,
} from "./indexer";
import networks from "./networks.json";

type NetworkOption = {
  name: string;
  networkId: string;
};

const NETWORK_OPTIONS = networks as NetworkOption[];

export default function App() {
  const { activeAddress, transactionSigner, algodClient } = useWallet();
  const { activeNetwork, setActiveNetwork } = useNetwork();

  const [fileName, setFileName] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const [history, setHistory] = useState<HashStampRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const loadHistory = useCallback(
    async (address: string, networkId: string) => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const records = await fetchHashStamps(address, networkId);
        setHistory(records);
      } catch (err) {
        setHistoryError((err as Error).message);
      } finally {
        setHistoryLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeAddress) {
      loadHistory(activeAddress, activeNetwork);
    } else {
      setHistory([]);
      setHistoryError(null);
    }
  }, [activeAddress, activeNetwork, loadHistory]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setCurrentHash(null);
      setHashError(null);
      setTxResult(null);
      setTxError(null);
      setIsHashing(true);

      try {
        const hash = await hashFile(file);
        setCurrentHash(hash);
      } catch (err) {
        setHashError((err as Error).message);
      } finally {
        setIsHashing(false);
      }
    },
    [],
  );

  const handleStamp = useCallback(async () => {
    if (!currentHash || !activeAddress) return;

    setIsSubmitting(true);
    setTxResult(null);
    setTxError(null);

    try {
      const { txId } = await submitHashStamp(
        algodClient,
        activeAddress,
        transactionSigner,
        currentHash,
      );
      setTxResult(txId);
      loadHistory(activeAddress, activeNetwork);
    } catch (err) {
      setTxError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentHash,
    activeAddress,
    activeNetwork,
    algodClient,
    transactionSigner,
    loadHistory,
  ]);

  const handleNetworkChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const networkId = event.target.value;
      setIsSwitchingNetwork(true);
      try {
        await setActiveNetwork(networkId);
      } catch (err) {
        setHistoryError((err as Error).message);
      } finally {
        setIsSwitchingNetwork(false);
      }
    },
    [setActiveNetwork],
  );

  const canStamp = !!activeAddress && !!currentHash && !isSubmitting;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="brand">HashStamp</span>
          <div className="appbar-controls">
            <select
              id="network-select"
              className="network-select"
              value={activeNetwork.toLowerCase()}
              onChange={handleNetworkChange}
              disabled={isSwitchingNetwork}
              aria-label="Select Algorand network"
            >
              {NETWORK_OPTIONS.map((network) => (
                <option key={network.networkId} value={network.networkId}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      <main className="container">
        <section className="hero">
          <h1>Timestamp Your Files on the Blockchain</h1>
          <p>
            Hash any file and record its SHA-256 fingerprint on the Algorand
            blockchain — creating a permanent, verifiable proof of existence.
          </p>
        </section>

        <section className="card">
          <h2>1. Connect Your Wallet</h2>
          <p className="card-description">
            Connect your wallet to sign the stamping transaction.
          </p>
          <WalletButton />
          {activeAddress && (
            <div className="wallet-info">
              <span className="address">{activeAddress}</span>
            </div>
          )}
        </section>

        <section className="card">
          <h2>2. Select a File</h2>
          <p className="card-description">
            Choose a file to hash. The file never leaves your browser — only its
            SHA-256 hash is computed locally.
          </p>
          <label className="file-label">
            <span>{fileName ?? "Choose file…"}</span>
            <input type="file" onChange={handleFileChange} />
          </label>
          <div className="hash-result">
            {isHashing && <div className="status-message info">Hashing…</div>}
            {hashError && (
              <div className="status-message error">
                Failed to hash file: {hashError}
              </div>
            )}
            {currentHash && (
              <>
                <div className="hash-label">SHA-256</div>
                <div className="hash-value">{currentHash}</div>
              </>
            )}
          </div>
        </section>

        <section className="card">
          <h2>3. Stamp on Algorand</h2>
          <p className="card-description">
            Submit a 0-ALGO transaction to yourself with the file hash in the
            note field, creating a permanent on-chain record.
          </p>
          <button
            className="btn btn-success"
            disabled={!canStamp}
            onClick={handleStamp}
          >
            {isSubmitting ? "Submitting…" : "Stamp File Hash"}
          </button>
          <div className="stamp-result">
            {isSubmitting && (
              <div className="status-message info">
                Waiting for wallet signature…
              </div>
            )}
            {txError && (
              <div className="status-message error">
                Transaction failed: {txError}
              </div>
            )}
            {txResult && (
              <div className="status-message success">
                Stamped! Transaction confirmed.
                <br />
                <a
                  className="tx-link"
                  href={getTransactionExplorerUrl(activeNetwork, txResult)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txResult}
                </a>
              </div>
            )}
          </div>
        </section>

        {activeAddress && (
          <section className="card">
            <h2>History</h2>
            <p className="card-description">
              Previous hashstamp transactions from your connected wallet.
            </p>
            {historyLoading && (
              <div className="status-message info">Loading history…</div>
            )}
            {historyError && (
              <div className="status-message error">
                Failed to load history: {historyError}
              </div>
            )}
            {!historyLoading && !historyError && history.length === 0 && (
              <div className="status-message info">
                No hashstamp transactions found for this wallet.
              </div>
            )}
            {history.length > 0 && (
              <div className="table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Algorithm</th>
                      <th>Hash</th>
                      <th>Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.txId}>
                        <td className="no-wrap">
                          {new Date(
                            record.timestamp * 1000,
                          ).toLocaleDateString()}
                        </td>
                        <td>{record.algorithm}</td>
                        <td className="hash-cell" title={record.hash}>
                          {record.hash.slice(0, 16)}…
                        </td>
                        <td>
                          <a
                            href={getTransactionExplorerUrl(
                              activeNetwork,
                              record.txId,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-link"
                            title={record.txId}
                          >
                            {record.txId.slice(0, 12)}…
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          HashStamp — Open-source file timestamping on{" "}
          <a
            href="https://algorand.co"
            target="_blank"
            rel="noopener noreferrer"
          >
            Algorand
          </a>
        </p>
      </footer>
    </>
  );
}
