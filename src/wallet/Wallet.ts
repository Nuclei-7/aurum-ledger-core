
import { KeyPair, KeyPairOutput } from './KeyPair';
import { Transaction } from '../blockchain/Transaction';
import { Blockchain } from '../blockchain/Blockchain';
import crypto from 'crypto';

export class Wallet {
  private keyPair: KeyPair;
  private blockchain: Blockchain;
  
  constructor(blockchain: Blockchain, existingKeyPair?: KeyPair) {
    this.blockchain = blockchain;
    this.keyPair = existingKeyPair || new KeyPair();
  }
  
  getAddress(): string {
    return this.keyPair.getAddress();
  }
  
  getPublicKey(): string {
    return this.keyPair.getPublicKey();
  }
  
  getBalance(): number {
    return this.blockchain.getBalanceOfAddress(this.getAddress());
  }
  
  getKeyPairOutput(): KeyPairOutput {
    return this.keyPair.getKeyPairOutput();
  }
  
  createTransaction(toAddress: string, amount: number): Transaction | null {
    const balance = this.getBalance();
    
    if (balance < amount) {
      console.log('Not enough balance');
      return null;
    }
    
    const transaction = new Transaction(this.getAddress(), toAddress, amount);
    transaction.signTransaction(this.keyPair.getKeyPair().privateKey);
    
    return transaction;
  }
  
  sendTransaction(toAddress: string, amount: number): boolean {
    const transaction = this.createTransaction(toAddress, amount);
    
    if (!transaction) {
      return false;
    }
    
    return this.blockchain.addTransaction(transaction);
  }
  
  getTransactionHistory(): Transaction[] {
    return this.blockchain.getAllTransactionsForAddress(this.getAddress());
  }
  
  stake(amount: number): boolean {
    if (this.getBalance() < amount) {
      console.log('Not enough balance to stake');
      return false;
    }
    
    return this.blockchain.createStakeTransaction(this.getAddress(), amount);
  }
  
  saveToFile(filePath: string, password: string): boolean {
    return this.keyPair.saveToFile(filePath, password);
  }
  
  static loadFromFile(filePath: string, password: string, blockchain: Blockchain): Wallet | null {
    const keyPair = KeyPair.loadFromFile(filePath, password);
    
    if (!keyPair) {
      return null;
    }
    
    return new Wallet(blockchain, keyPair);
  }
}
