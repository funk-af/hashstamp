type NetworkOption = {
  name: string;
  networkId: string;
};

type NavBarProps = {
  activeNetwork: string;
  isSwitchingNetwork: boolean;
  networkOptions: NetworkOption[];
  onNetworkChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function NavBar({
  activeNetwork,
  isSwitchingNetwork,
  networkOptions,
  onNetworkChange,
}: NavBarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="brand">HashStamp</span>
        <div className="appbar-controls">
          <select
            id="network-select"
            className="network-select"
            value={activeNetwork.toLowerCase()}
            onChange={onNetworkChange}
            disabled={isSwitchingNetwork}
            aria-label="Select Algorand network"
          >
            {networkOptions.map((network) => (
              <option key={network.networkId} value={network.networkId}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
