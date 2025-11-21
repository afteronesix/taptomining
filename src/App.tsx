import React from "react";
import { useGameLogic, BLOCKCHAIN } from "./logic/useGameLogic";

interface HelperCounts {
  helper: number;
  miner: number;
  engineer: number;
  factory: number;
  rocket: number;
}

interface ShopPanelProps {
  gems: number;
  helperCounts: HelperCounts;
  buyHelper: (type: keyof HelperCounts) => void;
  getPrice: (type: keyof HelperCounts) => number;
}

const MiningVisualization: React.FC<any> = ({ miningState, difficulty }) => {
  const isMining = miningState.totalProofs > 0;
  const hashZeros = miningState.currentHash.match(/^0*/)?.[0] || "";
  const hashRest = miningState.currentHash.substring(hashZeros.length);
  const isSuccessMessage = miningState.currentHash.includes("✅");

  return (
    <div className="bg-nh-card-bg border border-nh-border rounded-lg p-5 shadow-inner shadow-nh-terminal-green/10 mb-6">
      <div className="flex flex-wrap justify-around gap-2 mb-5">
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-nh-text-muted font-mono">
            Mining Block
          </span>
          <span className="text-xl font-mono font-bold text-nh-terminal-green">
            #{BLOCKCHAIN.chain.length + 1}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-nh-text-muted font-mono">
            Target
          </span>
          <span className="text-xl font-mono font-bold text-nh-terminal-green">
            {difficulty} zero{difficulty > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-nh-text-muted font-mono">
            Best Found
          </span>
          <span className="text-xl font-mono font-bold text-nh-terminal-light">
            {miningState.bestZeros}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-nh-text-muted font-mono">
            Attempts
          </span>
          <span className="text-xl font-mono font-bold text-nh-terminal-light">
            {miningState.totalProofs}
          </span>
        </div>
      </div>

      <div className="bg-black/70 border border-nh-border rounded-sm p-3 mt-3 shadow-inner shadow-nh-terminal-green/5">
        <div className="text-sm uppercase tracking-wider text-nh-text-muted mb-2 font-mono">
          Current Hash:
        </div>
        <div
          className={`font-mono text-[0.65rem] md:text-xs break-all leading-relaxed min-h-[50px] flex items-center justify-center 
              ${
                isSuccessMessage
                  ? "bg-nh-terminal-green/20 rounded-sm p-2 text-nh-terminal-green"
                  : "text-gray-300"
              }`}
        >
          {isMining &&
          miningState.currentHash.startsWith("0") &&
          !isSuccessMessage ? (
            <>
              <span
                className={`text-nh-terminal-green font-bold ${
                  hashZeros.length > 0 ? "animate-pulseGlow" : ""
                }`}
              >
                {hashZeros}
              </span>
              <span className="text-gray-300">{hashRest}</span>
            </>
          ) : (
            <span className="text-gray-300">{miningState.currentHash}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ShopPanel: React.FC<ShopPanelProps> = ({
  gems,
  helperCounts,
  buyHelper,
  getPrice,
}) => {
  const helperKeys: (keyof HelperCounts)[] = [
    "helper",
    "miner",
    "engineer",
    "factory",
    "rocket",
  ];
  const cpsMap: Record<keyof HelperCounts, number> = {
    helper: 3,
    miner: 10,
    engineer: 25,
    factory: 75,
    rocket: 200,
  };
  const emojiMap: Record<keyof HelperCounts, string> = {
    helper: "🤖",
    miner: "⛏️",
    engineer: "👷",
    factory: "🏭",
    rocket: "🚀",
  };

  return (
    <div className="bg-nh-card-bg p-4 md:p-6 rounded-lg shadow-inner shadow-nh-terminal-green/10 border border-nh-border">
      <h2 className="text-2xl font-bold text-nh-terminal-green mb-2 font-mono">
        SHOP
      </h2>
      <h6 className="text-base text-nh-text-muted mb-4 font-mono">
        Quantity of 💎:{" "}
        <span className="font-bold text-yellow-400">{gems.toFixed(1)}</span>
      </h6>

      <table className="min-w-full text-sm text-left text-gray-300 font-mono">
        <thead className="text-xs uppercase text-nh-terminal-green bg-nh-terminal-green/10">
          <tr>
            <th scope="col" className="px-3 py-2">
              Item
            </th>
            <th scope="col" className="px-3 py-2 text-center">
              Clicks/s
            </th>
            <th scope="col" className="px-3 py-2 text-center">
              Qty
            </th>
            <th scope="col" className="px-3 py-2 text-center">
              Price (💎)
            </th>
          </tr>
        </thead>
        <tbody>
          {helperKeys.map((type) => {
            const price = getPrice(type);

            return (
              <tr
                key={type}
                className="border-b border-nh-border hover:bg-nh-terminal-green/5"
              >
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <button
                    className="bg-nh-terminal-green/70 hover:bg-nh-terminal-green text-nh-bg-dark py-1 px-3 rounded-sm text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    onClick={() => buyHelper(type)}
                    disabled={gems < price}
                  >
                    Buy {emojiMap[type]}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">{cpsMap[type]}</td>
                <td className="px-3 py-2 text-center">{helperCounts[type]}</td>
                <td className="px-3 py-2 text-center text-yellow-400 font-bold">
                  {price}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const HelperDisplay: React.FC<any> = ({ helperCounts }) => {
  const helperKeys: (keyof HelperCounts)[] = [
    "helper",
    "miner",
    "engineer",
    "factory",
    "rocket",
  ];
  const emojiMap: Record<keyof HelperCounts, string> = {
    helper: "🤖",
    miner: "⛏️",
    engineer: "👷",
    factory: "🏭",
    rocket: "🚀",
  };

  return (
    <div className="my-4 text-center min-h-[50px]">
      {helperKeys.map((key) => {
        const count = helperCounts[key];
        return Array(count as number)
          .fill(0)
          .map((_, i) => (
            <span
              key={`${key}-${i}`}
              className="inline-block text-2xl mx-1 animate-bob"
            >
              {emojiMap[key]}
            </span>
          ));
      })}
    </div>
  );
};

const App: React.FC = () => {
  const {
    miningState,
    difficulty,
    coins,
    gems,
    totalCPS,
    coinValue,
    chain,
    helperCounts,
    performHash,
    buyHelper,
    getPrice,
    sellAllCoins,
  } = useGameLogic();

  const handleMineClick = () => {
    performHash();
  };

  return (
    <div className="min-h-screen bg-nh-bg-dark text-white p-4 font-sans">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold my-4 text-nh-terminal-green font-mono animate-pulseGlow">
          Tapcoin Mining Game
          <button className="info-button bg-nh-terminal-green/70 hover:bg-nh-terminal-green text-nh-bg-dark rounded-full w-9 h-9 ml-2 text-xl align-middle shadow-md transition">
            ℹ️
          </button>
        </h1>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <MiningVisualization
            miningState={miningState}
            difficulty={difficulty}
          />

          <div className="bg-nh-card-bg/70 p-3 rounded-lg overflow-x-auto h-20 flex items-center justify-start border border-nh-border shadow-inner shadow-nh-terminal-green/5">
            {chain.map((block) => (
              <div
                key={block.index}
                className="flex-shrink-0 w-16 h-16 bg-nh-bg-dark border border-nh-terminal-green rounded-sm mx-1 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition hover:shadow-lg hover:shadow-nh-terminal-green/20"
              >
                <span className="text-lg font-mono font-bold text-nh-terminal-light">
                  {block.index}
                </span>
                <span className="text-xs text-nh-text-muted font-mono">
                  Block
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-nh-card-bg p-4 rounded-lg shadow-inner shadow-nh-terminal-green/10 border border-nh-border">
            <div className="h-40 w-full bg-nh-bg-dark rounded-sm flex items-center justify-center text-nh-text-muted font-mono border border-nh-border/50">
              [Coin Value Chart Placeholder]
            </div>
            <h3 className="text-xl font-semibold mt-3 text-gray-200 font-mono">
              Coin Price:{" "}
              <span className="text-yellow-400 font-bold">
                {coinValue.toFixed(1)}
              </span>
              <span className="ml-2 text-lg">
                {coinValue > 0.5 ? "🚀" : "🔻"}
              </span>
            </h3>
            <button
              onClick={sellAllCoins}
              className="mt-2 w-full bg-nh-terminal-green/20 hover:bg-nh-terminal-green/30 text-nh-terminal-green py-2 rounded-sm font-semibold transition font-mono border border-nh-terminal-green/50"
            >
              Sell All Coins
            </button>
          </div>

          <div className="flex flex-col items-center justify-between bg-nh-card-bg p-4 rounded-lg shadow-inner shadow-nh-terminal-green/10 border border-nh-border">
            <div className="w-full">
              <div className="flex justify-between p-2 border-b border-nh-border text-nh-terminal-light font-mono">
                <span className="stat-label-inline text-nh-text-muted">
                  Total CPS:
                </span>
                <span className="stat-value-inline font-bold text-xl text-nh-terminal-green">
                  {totalCPS}
                </span>
              </div>
              <div className="flex justify-between p-2 text-nh-terminal-light font-mono">
                <span className="stat-label-inline text-nh-text-muted">
                  NHC Balance:
                </span>
                <span className="stat-value-inline font-bold text-xl">
                  {coins.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mine-section my-6 w-full max-w-xs relative">
              <button
                onClick={handleMineClick}
                className="w-full bg-nh-terminal-green hover:bg-nh-terminal-light text-nh-bg-dark font-bold py-4 px-8 rounded-sm text-xl shadow-[0_6px_0_rgb(0,180,60)] active:translate-y-1 active:shadow-none transition duration-100 font-mono"
              >
                Mine NHCoin
              </button>
            </div>
            <HelperDisplay helperCounts={helperCounts} />
          </div>

          <ShopPanel
            gems={gems}
            helperCounts={helperCounts}
            buyHelper={buyHelper}
            getPrice={getPrice}
          />
        </div>

        <div className="mt-8">
          <div className="wallet-container bg-nh-card-bg border border-nh-border rounded-lg p-5 shadow-inner shadow-nh-terminal-green/10">
            <div className="text-center mb-4 border-b pb-3 border-nh-border">
              <h3 className="text-2xl font-bold text-nh-terminal-green mb-2 font-mono">
                💰 Tapcoin Wallet
              </h3>
              <p className="text-sm text-nh-text-muted font-mono">
                Your mined blocks and rewards
              </p>
            </div>
            <div className="table-responsive overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300 font-mono">
                <thead className="text-xs uppercase text-nh-terminal-green bg-nh-terminal-green/10">
                  <tr>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Block #</th>
                    <th className="px-3 py-2">Reward</th>
                    <th className="px-3 py-2">Mined At</th>
                    <th className="px-3 py-2">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {chain
                    .slice()
                    .reverse()
                    .map((block) => (
                      <tr
                        key={block.index}
                        className="border-b border-nh-border hover:bg-nh-terminal-green/5"
                      >
                        <td className="px-3 py-2">
                          <button className="bg-red-600/70 hover:bg-red-700 text-white py-1 px-3 rounded-sm text-xs font-semibold transition">
                            Sell
                          </button>
                        </td>
                        <td className="px-3 py-2 text-nh-terminal-light font-bold">
                          {block.index}
                        </td>
                        <td className="px-3 py-2 text-nh-terminal-green font-bold">
                          {block.reward.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-nh-text-muted text-[0.7rem]">
                          {new Date(block.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 text-nh-terminal-light text-[0.6rem] whitespace-nowrap">
                          {block.hash.substring(0, 16)}...
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
