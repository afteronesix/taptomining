// src/logic/useGameLogic.ts
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Blockchain, type Block } from "./Blockchain";

interface MiningState {
  currentNonce: number;
  totalProofs: number;
  bestZeros: number;
  currentHash: string;
  isMining: boolean;
}

interface HelperCounts {
  helper: number;
  miner: number;
  engineer: number;
  factory: number;
  rocket: number;
}

const initialMiningState: MiningState = {
  currentNonce: 0,
  totalProofs: 0,
  bestZeros: 0,
  currentHash: 'Click "Mine NHCoin" to start finding valid blocks!',
  isMining: false,
};

export const BLOCKCHAIN = new Blockchain();

export const useGameLogic = () => {
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [helperCounts, setHelperCounts] = useState<HelperCounts>({
    helper: 0,
    miner: 0,
    engineer: 0,
    factory: 0,
    rocket: 0,
  });
  const [miningState, setMiningState] =
    useState<MiningState>(initialMiningState);
  const [chain, setChain] = useState<Block[]>(BLOCKCHAIN.chain);
  const [coinValue, setCoinValue] = useState(0.5);

  const helpersIntervalRef = useRef<number>(0);

  const mineCoin = useCallback((validNonce: number, blockHash: string) => {
    const blockReward = BLOCKCHAIN.getBlockReward();
    BLOCKCHAIN.newTransaction("NHCoin Network", "user", blockReward);
    const newBlock = BLOCKCHAIN.newBlock(validNonce);

    setCoins((prev) => prev + blockReward);
    setChain([...BLOCKCHAIN.chain]);

    setMiningState({
      ...initialMiningState,
      currentHash: `✅ Block #${newBlock.index} mined! ${blockReward.toFixed(
        2
      )} NHC earned. Hash: ${blockHash.substring(0, 32)}...`,
    });

    setTimeout(() => {
      setMiningState((prev) => ({
        ...prev,
        currentHash: `Ready to mine Block #${
          newBlock.index + 1
        }. Difficulty: ${BLOCKCHAIN.getDifficulty()} zeros. Click to start!`,
        isMining: false,
      }));
    }, 2500);
  }, []);

  const performHash = useCallback(() => {
    const { currentNonce, totalProofs } = miningState;
    const lastBlock = BLOCKCHAIN.lastBlock();
    const difficulty = BLOCKCHAIN.getDifficulty();

    if (!miningState.isMining) {
      BLOCKCHAIN.startMining();
      setMiningState((prev) => ({
        ...prev,
        isMining: true,
        bestZeros: 0,
        totalProofs: 0,
      }));
    }

    const nextNonce = currentNonce + 1;
    const nextProofs = totalProofs + 1;

    const tempBlockHeader = {
      index: lastBlock.index + 1,
      timestamp: BLOCKCHAIN.miningStartTime || Date.now(),
      merkleRoot:
        BLOCKCHAIN.miningMerkleRoot ||
        BLOCKCHAIN.calculateMerkleRoot(BLOCKCHAIN.currentTransactions),
      previousHash: lastBlock.hash,
      nonce: nextNonce,
      difficulty: difficulty,
    };
    const guessHash = BLOCKCHAIN.hashBlock(tempBlockHeader);
    const leadingZeros = guessHash.match(/^0*/)?.[0].length || 0;
    const isValid = leadingZeros >= difficulty;

    setMiningState((prev) => ({
      ...prev,
      currentNonce: nextNonce,
      totalProofs: nextProofs,
      bestZeros: Math.max(prev.bestZeros, leadingZeros),
      currentHash: guessHash,
    }));

    if (isValid) {
      mineCoin(nextNonce, guessHash);
    }
  }, [miningState, mineCoin]);

  const totalCPS = useMemo(() => {
    return (
      helperCounts.helper * 3 +
      helperCounts.miner * 10 +
      helperCounts.engineer * 25 +
      helperCounts.factory * 75 +
      helperCounts.rocket * 200
    );
  }, [helperCounts]);

  useEffect(() => {
    if (helpersIntervalRef.current) {
      clearInterval(helpersIntervalRef.current);
    }

    if (totalCPS > 0) {
      helpersIntervalRef.current = setInterval(() => {
        for (let i = 0; i < totalCPS; i++) {
          performHash();
        }
      }, 1000) as unknown as number;
    }

    return () => {
      if (helpersIntervalRef.current) {
        clearInterval(helpersIntervalRef.current);
      }
    };
  }, [totalCPS, performHash]);

  const getPrice = useCallback(
    (type: keyof HelperCounts) => {
      const basePrices = {
        helper: 15,
        miner: 50,
        engineer: 200,
        factory: 800,
        rocket: 4000,
      };
      return Math.floor(basePrices[type] * Math.pow(1.15, helperCounts[type]));
    },
    [helperCounts]
  );

  const buyHelper = useCallback(
    (type: keyof HelperCounts) => {
      const price = getPrice(type);
      if (gems >= price) {
        setGems((prev) => prev - price);
        setHelperCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
      } else {
        alert("Not enough gems to buy that upgrade!");
      }
    },
    [gems, getPrice]
  );

  const sellAllCoins = useCallback(() => {
    const gemsEarned = Math.round(coins * coinValue * 10) / 10;
    setGems((prev) => prev + gemsEarned);
    setCoins(0);
  }, [coins, coinValue]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const newCoinValue = Math.round((Math.random() * 0.9 + 0.1) * 10) / 10;
      setCoinValue(newCoinValue);
    }, 2000);

    return () => clearInterval(updateInterval);
  }, []);

  return {
    miningState,
    difficulty: BLOCKCHAIN.getDifficulty(),
    coins,
    gems,
    chain,
    helperCounts,
    totalCPS,
    coinValue,
    performHash,
    buyHelper,
    getPrice,
    sellAllCoins,
  };
};
