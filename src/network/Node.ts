
import { Blockchain } from '../blockchain/Blockchain';
import { Transaction } from '../blockchain/Transaction';
import { Block } from '../blockchain/Block';
import { Wallet } from '../wallet/Wallet';
import { EventEmitter } from 'events';
import type { KeyObject } from 'crypto';
import crypto from 'crypto';

export class BlockchainNode extends EventEmitter {
  public blockchain: Blockchain;
  public wallet: Wallet;
  public peers: Map<string, any>; // In a real implementation, this would be WebSocket connections
  public pendingTransactions: Transaction[];
  public isMining: boolean;
  
  constructor() {
    super();
    this.blockchain = new Blockchain();
    this.wallet = new Wallet(this.blockchain);
    this.peers = new Map();
    this.pendingTransactions = [];
    this.isMining = false;
    
    console.log(`Node initialized with address: ${this.wallet.getAddress()}`);
  }
  
  connectToPeer(peerUrl: string): boolean {
    if (this.peers.has(peerUrl)) {
      console.log(`Already connected to peer: ${peerUrl}`);
      return false;
    }
    
    // In a real implementation, this would establish a WebSocket connection
    console.log(`Connecting to peer: ${peerUrl}`);
    this.peers.set(peerUrl, { url: peerUrl, connected: true });
    
    this.emit('peer-connected', peerUrl);
    
    // Request the blockchain from the peer
    this.syncWithPeer(peerUrl);
    
    return true;
  }
  
  disconnectFromPeer(peerUrl: string): boolean {
    if (!this.peers.has(peerUrl)) {
      console.log(`Not connected to peer: ${peerUrl}`);
      return false;
    }
    
    console.log(`Disconnecting from peer: ${peerUrl}`);
    this.peers.delete(peerUrl);
    
    this.emit('peer-disconnected', peerUrl);
    
    return true;
  }
  
  broadcastTransaction(transaction: Transaction): void {
    console.log(`Broadcasting transaction: ${transaction.txId}`);
    
    // In a real implementation, this would send the transaction to all peers
    this.peers.forEach((peer, url) => {
      console.log(`Sending transaction to peer: ${url}`);
      // This would be a network request in a real implementation
    });
    
    this.emit('transaction-broadcasted', transaction);
  }
  
  broadcastBlock(block: Block): void {
    console.log(`Broadcasting block: ${block.hash}`);
    
    // In a real implementation, this would send the block to all peers
    this.peers.forEach((peer, url) => {
      console.log(`Sending block to peer: ${url}`);
      // This would be a network request in a real implementation
    });
    
    this.emit('block-broadcasted', block);
  }
  
  receiveTransaction(transaction: Transaction): boolean {
    console.log(`Received transaction: ${transaction.txId}`);
    
    // Validate the transaction
    if (!transaction.isValid()) {
      console.log('Transaction is invalid');
      return false;
    }
    
    // Check if we already have this transaction
    const existingTx = this.pendingTransactions.find(tx => tx.txId === transaction.txId);
    if (existingTx) {
      console.log('Transaction already exists in pending transactions');
      return false;
    }
    
    // Add the transaction to our pending transactions
    this.pendingTransactions.push(transaction);
    this.emit('transaction-received', transaction);
    
    // If we have enough pending transactions, start mining
    if (this.pendingTransactions.length >= 5 && !this.isMining) {
      this.mineBlock();
    }
    
    return true;
  }
  
  receiveBlock(block: Block): boolean {
    console.log(`Received block: ${block.hash}`);
    
    // Check if the block is valid
    if (block.previousHash !== this.blockchain.getLatestBlock().hash) {
      console.log('Block is not connected to our blockchain');
      
      // Check if this block is part of a longer chain
      this.syncWithNetwork();
      return false;
    }
    
    // Add the block to our blockchain
    this.blockchain.chain.push(block);
    this.emit('block-received', block);
    
    // Remove transactions that are now in the blockchain
    this.pendingTransactions = this.pendingTransactions.filter(tx => {
      return !block.transactions.some(blockTx => blockTx.txId === tx.txId);
    });
    
    return true;
  }
  
  syncWithPeer(peerUrl: string): void {
    console.log(`Syncing with peer: ${peerUrl}`);
    
    // In a real implementation, this would request the blockchain from the peer
    // and update our blockchain if the peer's chain is longer and valid
    
    this.emit('sync-started', peerUrl);
    
    // Simulated sync delay
    setTimeout(() => {
      this.emit('sync-completed', peerUrl);
      console.log(`Sync with peer ${peerUrl} completed`);
    }, 1000);
  }
  
  syncWithNetwork(): void {
    console.log('Syncing with network...');
    
    this.peers.forEach((peer, url) => {
      this.syncWithPeer(url);
    });
    
    this.emit('network-sync-started');
    
    // Simulated sync delay
    setTimeout(() => {
      this.emit('network-sync-completed');
      console.log('Network sync completed');
    }, 2000);
  }
  
  mineBlock(): void {
    if (this.isMining) {
      console.log('Already mining a block');
      return;
    }
    
    if (this.pendingTransactions.length === 0) {
      console.log('No pending transactions to mine');
      return;
    }
    
    console.log('Starting to mine a block...');
    this.isMining = true;
    this.emit('mining-started');
    
    // In a real implementation, this would be done in a separate thread
    // to avoid blocking the main thread
    setTimeout(() => {
      // Mine the block
      if (this.blockchain.stakingEnabled && Math.random() > 0.5) {
        // Use Proof of Stake
        const selectedStaker = this.blockchain.selectNextStaker();
        if (selectedStaker === this.wallet.getAddress()) {
          console.log('Selected as staker, creating block...');
          this.blockchain.minePendingTransactions(this.wallet.getAddress());
          const newBlock = this.blockchain.getLatestBlock();
          this.broadcastBlock(newBlock);
        }
      } else {
        // Use Proof of Work
        this.blockchain.minePendingTransactions(this.wallet.getAddress());
        const newBlock = this.blockchain.getLatestBlock();
        this.broadcastBlock(newBlock);
      }
      
      this.isMining = false;
      this.emit('mining-completed');
      console.log('Block mining completed');
    }, 3000);
  }
  
  getNetworkStatus(): { peers: number, blockchain: { blocks: number, difficulty: number } } {
    return {
      peers: this.peers.size,
      blockchain: {
        blocks: this.blockchain.chain.length,
        difficulty: this.blockchain.difficulty
      }
    };
  }
}
