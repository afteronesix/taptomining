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

  const unspentCoins = useMemo(() => {
    return chain.filter(block => block.index > 1).reduce((sum, block) => sum + block.reward, 0);
  }, [chain]);

  const mineCoin = useCallback((validNonce: number, blockHash: string) => {
    const blockReward = BLOCKCHAIN.getBlockReward();
    BLOCKCHAIN.newTransaction("NHCoin Network", "user", blockReward);
    const newBlock = BLOCKCHAIN.newBlock(validNonce);

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

  const performHash = useCallback((noncesToTest: number = 1) => {
    let { currentNonce, totalProofs, bestZeros, isMining } = miningState;
    
    if (!isMining) {
        BLOCKCHAIN.startMining();
        isMining = true;
    }
    
    let lastBlock = BLOCKCHAIN.lastBlock();
    let difficulty = BLOCKCHAIN.getDifficulty();
    let latestHash = miningState.currentHash;
    let success = false;
    let validNonce = 0;
    
    for (let i = 0; i < noncesToTest; i++) {
        currentNonce++;
        totalProofs++;
        
        const tempBlockHeader = {
            index: lastBlock.index + 1,
            timestamp: BLOCKCHAIN.miningStartTime || Date.now(),
            merkleRoot:
              BLOCKCHAIN.miningMerkleRoot ||
              BLOCKCHAIN.calculateMerkleRoot(BLOCKCHAIN.currentTransactions),
            previousHash: lastBlock.hash,
            nonce: currentNonce,
            difficulty: difficulty,
        };
        const guessHash = BLOCKCHAIN.hashBlock(tempBlockHeader);
        const leadingZeros = guessHash.match(/^0*/)?.[0].length || 0;
        
        if (leadingZeros > bestZeros) {
            bestZeros = leadingZeros;
        }
        
        latestHash = guessHash;

        if (leadingZeros >= difficulty) {
            success = true;
            validNonce = currentNonce;
            break; 
        }
    }

    setMiningState((_prev) => ({
      currentNonce: currentNonce,
      totalProofs: totalProofs,
      bestZeros: bestZeros,
      currentHash: latestHash,
      isMining: isMining,
    }));
    
    if (success) {
        mineCoin(validNonce, latestHash);
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
        performHash(totalCPS);
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
  
  const sellBlock = useCallback((blockIndex: number, reward: number) => {
    const gemsEarned = Math.round(reward * coinValue * 10) / 10;
    
    setGems((prev) => prev + gemsEarned);
    setChain((prevChain) => prevChain.filter(block => block.index !== blockIndex));
    
  }, [coinValue]);

  const sellAllCoins = useCallback(() => {
    const gemsEarned = Math.round(unspentCoins * coinValue * 10) / 10;
    
    setGems((prev) => prev + gemsEarned);
    setChain([BLOCKCHAIN.chain[0]]);
  }, [coinValue, unspentCoins]);


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
    coins: unspentCoins,
    gems,
    chain,
    helperCounts,
    totalCPS,
    coinValue,
    performHash,
    buyHelper,
    getPrice,
    sellAllCoins,
    sellBlock,
  };
};