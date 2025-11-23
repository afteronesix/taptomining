import React, {useRef, useEffect} from "react";
import { useGameLogic, BLOCKCHAIN } from "./logic/useGameLogic";
import Chart from 'chart.js/auto';

interface CoinValueChartProps {
    coinValue: number;
}

const CoinValueChart: React.FC<CoinValueChartProps> = ({ coinValue }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const dataRef = useRef<{labels: string[], data: number[]}>({labels: [], data: []});
    const maxDataPoints = 20;

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (!chartInstanceRef.current) {
            chartInstanceRef.current = new Chart(ctx, {
                type: "line",
                data: {
                    labels: dataRef.current.labels,
                    datasets: [
                        {
                            label: "Coin Value",
                            data: dataRef.current.data,
                            borderColor: "rgba(74, 222, 128, 1)",
                            borderWidth: 2,
                            tension: 0.1,
                            fill: false,
                            pointRadius: 3,
                            pointBackgroundColor: 'rgba(74, 222, 128, 1)'
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1.0, 
                            ticks: { color: 'rgba(74, 222, 128, 0.8)' },
                            grid: { color: 'rgba(74, 222, 128, 0.1)', borderDash: [5, 5] } as any, 
                            title: { display: false }
                        },
                        x: {
                            ticks: { display: false },
                            grid: { color: 'rgba(74, 222, 128, 0.1)' }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    },
                },
            });
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        let currentLabels = dataRef.current.labels;
        let currentData = dataRef.current.data;

        if (currentLabels.length >= maxDataPoints) {
            currentLabels.shift();
            currentData.shift();
        }

        currentLabels.push(timeLabel);
        currentData.push(coinValue);

        if (chartInstanceRef.current) {
            chartInstanceRef.current.data.labels = currentLabels;
            chartInstanceRef.current.data.datasets[0].data = currentData;
            chartInstanceRef.current.update();
        }
    }, [coinValue]);


    return (
        <div className="h-40 w-full bg-gray-900 rounded-sm flex items-center justify-center text-gray-400 font-mono border border-green-700/50">
            <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
        </div>
    );
};


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
    <div className="bg-gray-800 border border-green-600 rounded-lg p-5 shadow-lg shadow-green-900/40 mb-6">
      <div className="flex flex-wrap justify-around gap-2 mb-5">
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-gray-400 font-mono">
            Mining Block
          </span>
          <span className="text-xl font-mono font-bold text-green-400">
            #{BLOCKCHAIN.chain.length + 1}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-gray-400 font-mono">
            Target
          </span>
          <span className="text-xl font-mono font-bold text-green-400">
            {difficulty} zero{difficulty > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-gray-400 font-mono">
            Best Found
          </span>
          <span className="text-xl font-mono font-bold text-green-300">
            {miningState.bestZeros}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 min-w-[120px]">
          <span className="text-sm uppercase tracking-wider text-gray-400 font-mono">
            Attempts
          </span>
          <span className="text-xl font-mono font-bold text-green-300">
            {miningState.totalProofs}
          </span>
        </div>
      </div>

      <div className="bg-black/70 border border-green-700 rounded-sm p-3 mt-3 shadow-inner shadow-green-500/10">
        <div className="text-sm uppercase tracking-wider text-gray-400 mb-2 font-mono">
          Current Hash:
        </div>
        <div
          className={`font-mono text-[0.65rem] md:text-xs break-all leading-relaxed min-h-[50px] flex items-center justify-center 
              ${
                isSuccessMessage
                  ? "bg-green-600/30 rounded-sm p-2 text-green-200"
                  : "text-gray-300"
              }`}
        >
          {isMining &&
          miningState.currentHash.startsWith("0") &&
          !isSuccessMessage ? (
            <>
              <span
                className={`text-green-400 font-bold animate-pulseGlow`}
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
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg shadow-green-900/40 border border-green-600">
      <h2 className="text-2xl font-bold text-green-400 mb-2 font-mono">
        SHOP
      </h2>
      <h6 className="text-base text-gray-400 mb-4 font-mono">
        Quantity of 💎:{" "}
        <span className="font-bold text-yellow-400">{gems.toFixed(1)}</span>
      </h6>

      <table className="min-w-full text-sm text-left text-gray-300 font-mono">
        <thead className="text-xs uppercase text-green-400 bg-green-900/40">
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
                className="border-b border-green-800 hover:bg-green-900/20"
              >
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <button
                    className="bg-green-600 hover:bg-green-500 text-gray-900 py-1 px-3 rounded-sm text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
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
    sellBlock,
  } = useGameLogic();

  const handleMineClick = () => {
    performHash(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold my-4 text-green-400 font-mono animate-pulseGlow">
          Tapcoin Mining Game
        </h1>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <MiningVisualization
            miningState={miningState}
            difficulty={difficulty}
          />

          <div className="bg-gray-800/70 p-3 rounded-lg overflow-x-auto h-20 flex items-center justify-start border border-green-700 shadow-inner shadow-green-900/10">
            {chain.filter(block => block.index > 0).map((block) => (
              <div
                key={block.index}
                className="flex-shrink-0 w-16 h-16 bg-gray-900 border border-green-500 rounded-sm mx-1 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition hover:shadow-lg hover:shadow-green-500/20"
              >
                <span className="text-lg font-mono font-bold text-green-300">
                  {block.index}
                </span>
                <span className="text-xs text-gray-400 font-mono">Block</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg shadow-green-900/40 border border-green-600">
            <CoinValueChart coinValue={coinValue} /> 
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
              className="mt-2 w-full bg-green-900/50 hover:bg-green-900/70 text-green-400 py-2 rounded-sm font-semibold transition font-mono border border-green-600"
            >
              Sell All Coins
            </button>
          </div>

          <div className="flex flex-col items-center justify-between bg-gray-800 p-4 rounded-lg shadow-lg shadow-green-900/40 border border-green-600">
            <div className="w-full">
              <div className="flex justify-between p-2 border-b border-green-800 text-green-300 font-mono">
                <span className="stat-label-inline text-gray-400">
                  Total CPS:
                </span>
                <span className="stat-value-inline font-bold text-xl text-green-400">
                  {totalCPS}
                </span>
              </div>
              <div className="flex justify-between p-2 text-green-300 font-mono">
                <span className="stat-label-inline text-gray-400">
                  TAPC Balance:
                </span>
                <span className="stat-value-inline font-bold text-xl">
                  {coins.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mine-section my-6 w-full max-w-xs relative">
              <button
                onClick={handleMineClick}
                className="w-full bg-green-500 hover:bg-green-400 text-gray-900 font-bold py-4 px-8 rounded-sm text-xl shadow-[0_6px_0_rgb(22,163,74)] active:translate-y-1 active:shadow-none transition duration-100 font-mono"
              >
                Mine Tapcoin
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
          <div className="wallet-container bg-gray-800 border border-green-600 rounded-lg p-5 shadow-lg shadow-green-900/40">
            <div className="text-center mb-4 border-b pb-3 border-green-800">
              <h3 className="text-2xl font-bold text-green-400 mb-2 font-mono">
                💰 Tapcoin Wallet
              </h3>
              <p className="text-sm text-gray-400 font-mono">
                Your mined blocks and rewards
              </p>
            </div>
            <div className="table-responsive overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300 font-mono">
                <thead className="text-xs uppercase text-green-400 bg-green-900/40">
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
                        className="border-b border-green-800 hover:bg-green-900/20"
                      >
                        <td className="px-3 py-2">
                          <button 
                            className="bg-red-600/70 hover:bg-red-700 text-white py-1 px-3 rounded-sm text-xs font-semibold transition"
                            onClick={() => block.index > 1 && sellBlock(block.index, block.reward)}
                            disabled={block.index <= 1}
                          >
                            Sell
                          </button>
                        </td>
                        <td className="px-3 py-2 text-green-300 font-bold">
                          {block.index}
                        </td>
                        <td className="px-3 py-2 text-green-400 font-bold">
                          {block.reward.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-gray-400 text-[0.7rem]">
                          {new Date(block.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 text-green-300 text-[0.6rem] whitespace-nowrap">
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