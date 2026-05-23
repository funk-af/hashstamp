import { WalletManager, WalletId, NetworkId } from "@txnlab/use-wallet-react";

export const walletManager = new WalletManager({
  wallets: [WalletId.LUTE, WalletId.PERA],
  defaultNetwork: NetworkId.LOCALNET,
});
