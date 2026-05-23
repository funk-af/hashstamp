import { getTransactionExplorerUrl } from "../indexer";

type StampSectionProps = {
  canStamp: boolean;
  isSubmitting: boolean;
  txError: string | null;
  txResult: string | null;
  activeNetwork: string;
  onStamp: () => void;
};

export function StampSection({
  canStamp,
  isSubmitting,
  txError,
  txResult,
  activeNetwork,
  onStamp,
}: StampSectionProps) {
  return (
    <section className="card">
      <h2>3. Stamp on Algorand</h2>
      <p className="card-description">
        Submit a 0-ALGO transaction to yourself with the file hash in the note
        field, creating a permanent on-chain record.
      </p>
      <button
        className="btn btn-success"
        disabled={!canStamp}
        onClick={onStamp}
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
  );
}
