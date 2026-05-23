import { useState, useCallback } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { WalletButton } from "@txnlab/use-wallet-ui-react";
import { hashFile } from "./hash";
import { submitHashStamp } from "./transaction";

export default function App() {
  const { activeAddress, transactionSigner, algodClient } = useWallet();

  const [fileName, setFileName] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

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
    } catch (err) {
      setTxError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentHash, activeAddress, algodClient, transactionSigner]);

  const canStamp = !!activeAddress && !!currentHash && !isSubmitting;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="brand">HashStamp</span>
          <WalletButton />
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
            Connect a Pera or Lute wallet to sign the stamping transaction.
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
                  href={`https://allo.info/tx/${txResult}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txResult}
                </a>
              </div>
            )}
          </div>
        </section>
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
