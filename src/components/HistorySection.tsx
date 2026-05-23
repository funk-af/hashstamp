import { getTransactionExplorerUrl, type HashStampRecord } from "../indexer";

type HistorySectionProps = {
  history: HashStampRecord[];
  historyLoading: boolean;
  historyError: string | null;
  activeNetwork: string;
};

export function HistorySection({
  history,
  historyLoading,
  historyError,
  activeNetwork,
}: HistorySectionProps) {
  return (
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
                    {new Date(record.timestamp * 1000).toLocaleDateString()}
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
  );
}
