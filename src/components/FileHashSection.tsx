type FileHashSectionProps = {
  fileName: string | null;
  isHashing: boolean;
  hashError: string | null;
  currentHash: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FileHashSection({
  fileName,
  isHashing,
  hashError,
  currentHash,
  onFileChange,
}: FileHashSectionProps) {
  return (
    <section className="card">
      <h2>2. Select a File</h2>
      <p className="card-description">
        Choose a file to hash. The file never leaves your browser — only its
        SHA-256 hash is computed locally.
      </p>
      <label className="file-label">
        <span>{fileName ?? "Choose file…"}</span>
        <input type="file" onChange={onFileChange} />
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
  );
}
