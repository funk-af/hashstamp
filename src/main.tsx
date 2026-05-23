import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WalletProvider } from "@txnlab/use-wallet-react";
import { WalletUIProvider } from "@txnlab/use-wallet-ui-react";
import "@txnlab/use-wallet-ui-react/dist/style.css";
import "./style.css";
import { walletManager } from "./wallet";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider manager={walletManager}>
      <WalletUIProvider theme="light">
        <App />
      </WalletUIProvider>
    </WalletProvider>
  </StrictMode>,
);
