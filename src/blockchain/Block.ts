
import { Transaction } from './Transaction';
import crypto from 'crypto';

export class Block {
  public index: number;
  public timestamp: number;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public difficulty: number;
  public miner: string;
  public reward: number;

  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string,
    difficulty: number = 4,
    miner: string = '',
    reward: number = 50
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.difficulty = difficulty;
    this.miner = miner;
    this.reward = reward;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }

  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

export function isValidBlockStructure(block: Block): boolean {
  return typeof block.index === 'number' && 
         typeof block.hash === 'string' &&
         typeof block.previousHash === 'string' &&
         typeof block.timestamp === 'number' &&
         Array.isArray(block.transactions);
}
