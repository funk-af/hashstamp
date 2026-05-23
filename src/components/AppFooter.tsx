export function AppFooter() {
  return (
    <footer className="footer">
      <p>
        HashStamp — Open-source file timestamping on{" "}
        <a href="https://algorand.co" target="_blank" rel="noopener noreferrer">
          Algorand
        </a>{" "}
        |{" "}
        <a
          href="https://github.com/funk-af/hashstamp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="HashStamp on GitHub"
          title="HashStamp on GitHub"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
            style={{ verticalAlign: "text-bottom" }}
          >
            <path
              fill="currentColor"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.31 1.23A11.52 11.52 0 0 1 12 5.81c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.69.82.57A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
            />
          </svg>
        </a>
      </p>
    </footer>
  );
}
