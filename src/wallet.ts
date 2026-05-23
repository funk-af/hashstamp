import { WalletManager, WalletId, NetworkId } from "@txnlab/use-wallet-react";

export const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.LUTE],
  defaultNetwork: NetworkId.MAINNET,
});
