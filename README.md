# HashStamp

HashStamp is a React + Vite app that creates verifiable proof-of-existence records for files on Algorand.

It computes a SHA-256 hash in the browser, then submits a 0-ALGO self-payment with the hash encoded in the transaction note.

## Features

- Client-side SHA-256 hashing using Web Crypto (`crypto.subtle`)
- Wallet connect via `@txnlab/use-wallet-react` and `@txnlab/use-wallet-ui-react`
- On-chain stamping by sending a 0-ALGO transaction to the connected account
- Multi-network support (`mainnet`, `testnet`, `localnet`)
- Wallet-specific history view powered by Algorand Indexer
- Explorer links for each stamped transaction

## How It Works

1. Select a file in the UI.
2. HashStamp computes the file hash locally in your browser.
3. You sign a transaction from your wallet.
4. HashStamp submits a payment transaction with:
   - `sender = receiver = your wallet address`
   - `amount = 0`
   - `note = hashstamp:SHA-256:<hex-hash>`
5. The transaction is confirmed on-chain and appears in your history.

## Tech Stack

- React 19
- TypeScript
- Vite
- Algorand JavaScript SDK (`algosdk`)
- TxnLab wallet stack (`@txnlab/use-wallet-react`, `@txnlab/use-wallet-ui-react`)

## Requirements

- Node.js 20+
- pnpm
- A supported Algorand wallet:
  - Lute
  - Pera

## Getting Started

```bash
pnpm install
pnpm dev
```

App runs at the local Vite URL shown in terminal (typically `http://localhost:5173`).

## Available Scripts

- `pnpm dev`: Start local dev server
- `pnpm build`: Type-check and produce production build in `dist/`
- `pnpm preview`: Preview the production build locally

## Network Configuration

Network settings are defined in `src/networks.json`.

Default entries:

- `mainnet`: `https://mainnet-idx.algonode.cloud`
- `testnet`: `https://testnet-idx.algonode.cloud`
- `localnet`: `http://localhost:8980`

You can switch networks from the app navbar.

## Transaction Note Format

HashStamp writes notes using this format:

```text
hashstamp:SHA-256:<64-char-lowercase-hex>
```

History parsing filters for this prefix and format.

## Security Notes

- File contents are not uploaded by HashStamp. Only the SHA-256 digest is used.
- Wallet signatures are handled by the connected wallet provider.
- Always verify network selection before stamping.

## Troubleshooting

- Wallet does not connect:
  - Confirm wallet extension/app is installed and unlocked.
  - Refresh and reconnect.
- History is empty:
  - Ensure you are viewing the same wallet address and network used for stamping.
  - Confirm indexer endpoints in `src/networks.json` are reachable.
- Localnet history fails:
  - Start local Algorand node/indexer and verify host/port settings.

## License

MIT
