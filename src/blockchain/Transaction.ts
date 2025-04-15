
import crypto from 'crypto';

export class Transaction {
  public fromAddress: string | null;
  public toAddress: string;
  public amount: number;
  public timestamp: number;
  public signature: string;
  public txId: string;

  constructor(fromAddress: string | null, toAddress: string, amount: number) {
    this.fromAddress = fromAddress; // null for mining rewards
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = '';
    this.txId = this.calculateHash();
  }

  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(
        (this.fromAddress || '') +
          this.toAddress +
          this.amount +
          this.timestamp
      )
      .digest('hex');
  }

  signTransaction(signingKey: crypto.KeyObject): void {
    if (!this.fromAddress) {
      throw new Error('Cannot sign mining reward transactions');
    }

    const sign = crypto.createSign('SHA256');
    sign.update(this.calculateHash());
    
    this.signature = sign.sign(signingKey).toString('hex');
  }

  isValid(): boolean {
    if (this.fromAddress === null) return true; // Mining rewards are always valid

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const verify = crypto.createVerify('SHA256');
    verify.update(this.calculateHash());
    
    try {
      const publicKey = crypto.createPublicKey(this.fromAddress);
      return verify.verify(publicKey, Buffer.from(this.signature, 'hex'));
    } catch (e) {
      return false;
    }
  }
}
