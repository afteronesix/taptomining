import { TapcoinHash } from "../crypto/Blake2s";

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  previousHash: string;
  difficulty: number;
  reward: number;
  merkleRoot: string;
  hash: string;
}

export class Blockchain {
  public chain: Block[] = [];
  public currentTransactions: Transaction[] = [];
  public difficulty: number = 1;
  public targetBlockTime: number = 20000;
  public difficultyAdjustmentInterval: number = 5;
  public maxDifficulty: number = 2;
  public minDifficulty: number = 1;
  public miningStartTime: number | null = null;
  public miningMerkleRoot: string | null = null;

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock() {
    const genesis: Omit<Block, "hash"> = {
      index: 1,
      timestamp: Date.now(),
      transactions: [{ sender: "Genesis", recipient: "Network", amount: 0 }],
      nonce: 0,
      previousHash:
        "0000000000000000000000000000000000000000000000000000000000000000",
      difficulty: this.difficulty,
      reward: 50,
      merkleRoot: this.calculateMerkleRoot([]),
    };
    const finalGenesis: Block = {
      ...genesis,
      hash: this.hashBlock(genesis as Block),
    };
    this.chain.push(finalGenesis);
  }

  public newBlock(nonce: number): Block {
    const blockHeader = {
      index: this.chain.length + 1,
      timestamp: this.miningStartTime || Date.now(),
      transactions: this.currentTransactions,
      nonce: nonce,
      previousHash: this.lastBlock().hash,
      difficulty: this.difficulty,
      reward: this.getBlockReward(),
      merkleRoot:
        this.miningMerkleRoot ||
        this.calculateMerkleRoot(this.currentTransactions),
    };

    const block: Block = {
      ...blockHeader,
      hash: this.hashBlock(blockHeader as Block),
    };

    this.currentTransactions = [];
    this.chain.push(block);

    if (
      this.chain.length % this.difficultyAdjustmentInterval === 0 &&
      this.chain.length > 1
    ) {
      this.adjustDifficulty();
    }

    this.miningStartTime = null;
    this.miningMerkleRoot = null;
    return block;
  }

  public calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) {
      return TapcoinHash("empty");
    }

    let hashes = transactions.map((tx) => TapcoinHash(JSON.stringify(tx)));

    while (hashes.length > 1) {
      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = i + 1 < hashes.length ? hashes[i + 1] : hashes[i];
        newHashes.push(TapcoinHash(left + right));
      }
      hashes = newHashes;
    }

    return hashes[0];
  }

  public hashBlock(
    block: Pick<
      Block,
      | "index"
      | "timestamp"
      | "merkleRoot"
      | "previousHash"
      | "nonce"
      | "difficulty"
    >
  ): string {
    const blockHeader = {
      index: block.index,
      timestamp: block.timestamp,
      merkleRoot: block.merkleRoot,
      previousHash: block.previousHash,
      nonce: block.nonce,
      difficulty: block.difficulty,
    };
    return TapcoinHash(JSON.stringify(blockHeader));
  }

  public getBlockReward(): number {
    const halvings = Math.floor(this.chain.length / 100);
    return 50 / Math.pow(2, halvings);
  }

  public adjustDifficulty() {
    const lastAdjustmentBlockIndex =
      this.chain.length - this.difficultyAdjustmentInterval;
    if (lastAdjustmentBlockIndex < 0) return;

    const lastAdjustmentBlock = this.chain[lastAdjustmentBlockIndex];
    const timeExpected =
      this.targetBlockTime * this.difficultyAdjustmentInterval;
    const timeActual =
      this.chain[this.chain.length - 1].timestamp -
      lastAdjustmentBlock.timestamp;

    if (this.chain.length > this.difficultyAdjustmentInterval) {
      this.minDifficulty = 2;
    }

    if (timeActual < timeExpected * 0.75) {
      this.difficulty = Math.min(this.maxDifficulty, this.difficulty + 1);
    } else if (timeActual > timeExpected * 2.5) {
      this.difficulty = Math.max(this.minDifficulty, this.difficulty - 2);
    } else if (timeActual > timeExpected * 1.5) {
      this.difficulty = Math.max(this.minDifficulty, this.difficulty - 1);
    }
  }

  public newTransaction(
    sender: string,
    recipient: string,
    amount: number
  ): number {
    this.currentTransactions.push({ sender, recipient, amount });
    return this.lastBlock().index + 1;
  }

  public startMining() {
    this.miningStartTime = Date.now();
    this.miningMerkleRoot = this.calculateMerkleRoot(this.currentTransactions);
  }

  public validProof(nonce: number): boolean {
    const tempBlockHeader = {
      index: this.chain.length + 1,
      timestamp: this.miningStartTime || Date.now(),
      merkleRoot:
        this.miningMerkleRoot ||
        this.calculateMerkleRoot(this.currentTransactions),
      previousHash: this.lastBlock().hash,
      nonce: nonce,
      difficulty: this.difficulty,
    };

    const hash = this.hashBlock(tempBlockHeader);
    const target = "0".repeat(this.difficulty);
    return hash.startsWith(target);
  }

  public getDifficulty(): number {
    return this.difficulty;
  }

  public getTotalSupply(): number {
    return this.chain.reduce((total, block) => total + (block.reward || 0), 0);
  }

  public lastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
}
