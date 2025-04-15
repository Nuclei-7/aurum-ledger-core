
import { Wallet } from './Wallet';
import { Transaction } from '../blockchain/Transaction';

export interface WalletBalance {
  address: string;
  balance: number;
  staked: number;
}

export interface TransactionHistoryItem {
  txId: string;
  type: 'sent' | 'received' | 'staked' | 'reward';
  amount: number;
  otherParty: string;
  timestamp: number;
  confirmed: boolean;
  blockHeight?: number;
}

export interface WalletStorageFormat {
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  created: number;
}

export interface IWalletProvider {
  getBalance(): Promise<WalletBalance>;
  getTransactionHistory(): Promise<TransactionHistoryItem[]>;
  createTransaction(to: string, amount: number): Promise<Transaction | null>;
  signTransaction(tx: Transaction): Promise<boolean>;
  importWallet(encryptedWallet: WalletStorageFormat, password: string): Promise<Wallet | null>;
  exportWallet(password: string): Promise<WalletStorageFormat>;
  backupWallet(fileName: string, password: string): Promise<boolean>;
}
