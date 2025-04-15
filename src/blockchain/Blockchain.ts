
import { Block } from './Block';
import { Transaction } from './Transaction';
import crypto from 'crypto';

export class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: Transaction[];
  public miningReward: number;
  public stakingEnabled: boolean;
  public stakers: Map<string, number>;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 50; // Initial mining reward (halves every 210,000 blocks)
    this.stakingEnabled = false; // Start with PoW, enable PoS later
    this.stakers = new Map();
  }

  createGenesisBlock(): Block {
    return new Block(0, Date.now(), [], '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string): void {
    // Create reward transaction for the miner
    const rewardTx = new Transaction(
      null,
      miningRewardAddress, 
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    // Create new block and mine it
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash,
      this.difficulty,
      miningRewardAddress,
      this.miningReward
    );
    block.mineBlock(this.difficulty);

    // Add the mined block to the chain
    console.log('Block successfully mined!');
    this.chain.push(block);

    // Reset pending transactions
    this.pendingTransactions = [];

    // Adjust difficulty periodically based on mining speed
    if (this.chain.length % 100 === 0) {
      this.adjustDifficulty();
    }

    // Check if it's time to halve the mining reward
    if (this.chain.length % 210000 === 0) {
      this.miningReward /= 2;
    }
  }

  // For PoS implementation
  createStakeTransaction(address: string, amount: number): boolean {
    if (this.getBalanceOfAddress(address) < amount) {
      return false; // Not enough balance to stake
    }
    
    // Add address to stakers with their stake amount
    const currentStake = this.stakers.get(address) || 0;
    this.stakers.set(address, currentStake + amount);
    
    // Create a transaction to move tokens to staking
    const stakeTx = new Transaction(
      address,
      'STAKING_ADDRESS', // Special address for staking
      amount
    );
    
    this.addTransaction(stakeTx);
    return true;
  }

  selectNextStaker(): string | null {
    if (!this.stakingEnabled || this.stakers.size === 0) {
      return null;
    }
    
    // Implement weighted selection based on stake amount
    const totalStake = Array.from(this.stakers.values()).reduce((a, b) => a + b, 0);
    let cumulativeWeight = 0;
    const randomPoint = Math.random() * totalStake;
    
    for (const [address, stake] of this.stakers.entries()) {
      cumulativeWeight += stake;
      if (cumulativeWeight >= randomPoint) {
        return address;
      }
    }
    
    return null;
  }

  addTransaction(transaction: Transaction): boolean {
    // Verify the transaction
    if (!transaction.fromAddress && !transaction.toAddress) {
      return false;
    }
    
    if (transaction.fromAddress && !transaction.isValid()) {
      return false;
    }
    
    if (transaction.amount <= 0) {
      return false;
    }
    
    // If sender doesn't have enough balance
    if (
      transaction.fromAddress &&
      this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount
    ) {
      return false;
    }
    
    this.pendingTransactions.push(transaction);
    return true;
  }

  getBalanceOfAddress(address: string): number {
    let balance = 0;
    
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    
    return balance;
  }

  getAllTransactionsForAddress(address: string): Transaction[] {
    const txs: Transaction[] = [];
    
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }
    
    return txs;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check if the current block hash is correct
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      
      // Check if the current block points to the correct previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      // Check if all transactions in the block are valid
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
    }
    
    return true;
  }

  replaceChain(newChain: Block[]): boolean {
    // Check if the new chain is longer than the current one
    if (newChain.length <= this.chain.length) {
      console.log('Received chain is not longer than the current chain. Chain not replaced.');
      return false;
    }
    
    // Check if the new chain is valid
    if (!this.validateChain(newChain)) {
      console.log('Received chain is invalid. Chain not replaced.');
      return false;
    }
    
    console.log('Replacing chain with new validated chain');
    this.chain = newChain;
    return true;
  }

  private validateChain(chain: Block[]): boolean {
    // Check if the genesis block is valid
    if (JSON.stringify(chain[0]) !== JSON.stringify(this.createGenesisBlock())) {
      return false;
    }
    
    // Check the rest of the chain
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previousBlock = chain[i - 1];
      
      if (block.previousHash !== previousBlock.hash) {
        return false;
      }
      
      if (block.hash !== block.calculateHash()) {
        return false;
      }
      
      if (!block.hasValidTransactions()) {
        return false;
      }
    }
    
    return true;
  }

  private adjustDifficulty(): void {
    const lastBlock = this.getLatestBlock();
    const prevBlock = this.chain[this.chain.length - 2];
    const timeExpected = 10 * 60; // 10 minutes in seconds
    const timeTaken = (lastBlock.timestamp - prevBlock.timestamp) / 1000; // in seconds
    
    if (timeTaken < timeExpected / 2) {
      this.difficulty++;
    } else if (timeTaken > timeExpected * 2) {
      this.difficulty = Math.max(1, this.difficulty - 1);
    }
    
    console.log(`Difficulty adjusted to: ${this.difficulty}`);
  }

  switchToProofOfStake(): void {
    if (this.chain.length < 1000) {
      console.log('Cannot switch to PoS yet: chain too short');
      return;
    }
    
    this.stakingEnabled = true;
    console.log('Switched to Proof of Stake consensus');
  }
}
