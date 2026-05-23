import { useState, useCallback, useEffect } from "react";
import { useNetwork, useWallet } from "@txnlab/use-wallet-react";
import { hashFile } from "./hash";
import { submitHashStamp } from "./transaction";
import { fetchHashStamps, type HashStampRecord } from "./indexer";
import networks from "./networks.json";
import { NavBar } from "./components/NavBar";
import { HeroSection } from "./components/HeroSection";
import { WalletSection } from "./components/WalletSection";
import { FileHashSection } from "./components/FileHashSection";
import { StampSection } from "./components/StampSection";
import { HistorySection } from "./components/HistorySection";
import { AppFooter } from "./components/AppFooter";

type NetworkOption = {
  name: string;
  networkId: string;
};

const NETWORK_OPTIONS = networks as NetworkOption[];

export default function App() {
  const { activeAddress, transactionSigner, algodClient } = useWallet();
  const { activeNetwork, setActiveNetwork } = useNetwork();

  const [fileName, setFileName] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const [history, setHistory] = useState<HashStampRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const loadHistory = useCallback(
    async (address: string, networkId: string) => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const records = await fetchHashStamps(address, networkId);
        setHistory(records);
      } catch (err) {
        setHistoryError((err as Error).message);
      } finally {
        setHistoryLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeAddress) {
      loadHistory(activeAddress, activeNetwork);
    } else {
      setHistory([]);
      setHistoryError(null);
    }
  }, [activeAddress, activeNetwork, loadHistory]);

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
      loadHistory(activeAddress, activeNetwork);
    } catch (err) {
      setTxError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentHash,
    activeAddress,
    activeNetwork,
    algodClient,
    transactionSigner,
    loadHistory,
  ]);

  const handleNetworkChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const networkId = event.target.value;
      setIsSwitchingNetwork(true);
      try {
        await setActiveNetwork(networkId);
      } catch (err) {
        setHistoryError((err as Error).message);
      } finally {
        setIsSwitchingNetwork(false);
      }
    },
    [setActiveNetwork],
  );

  const canStamp = !!activeAddress && !!currentHash && !isSubmitting;

  return (
    <>
      <NavBar
        activeNetwork={activeNetwork}
        isSwitchingNetwork={isSwitchingNetwork}
        networkOptions={NETWORK_OPTIONS}
        onNetworkChange={handleNetworkChange}
      />

      <main className="container">
        <HeroSection />

        <WalletSection activeAddress={activeAddress} />

        <FileHashSection
          fileName={fileName}
          isHashing={isHashing}
          hashError={hashError}
          currentHash={currentHash}
          onFileChange={handleFileChange}
        />

        <StampSection
          canStamp={canStamp}
          isSubmitting={isSubmitting}
          txError={txError}
          txResult={txResult}
          activeNetwork={activeNetwork}
          onStamp={handleStamp}
        />

        {activeAddress && (
          <HistorySection
            history={history}
            historyLoading={historyLoading}
            historyError={historyError}
            activeNetwork={activeNetwork}
          />
        )}
      </main>

      <AppFooter />
    </>
  );
}
