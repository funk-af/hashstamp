import { WalletButton } from "@txnlab/use-wallet-ui-react";

type WalletSectionProps = {
  activeAddress: string | null;
};

export function WalletSection({ activeAddress }: WalletSectionProps) {
  return (
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
  );
}
