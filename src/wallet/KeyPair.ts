
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface KeyPairOutput {
  publicKey: string;
  privateKey: string;
  address: string;
}

export class KeyPair {
  private publicKey: crypto.KeyObject;
  private privateKey: crypto.KeyObject;
  private address: string;
  
  constructor(keys?: { publicKey: crypto.KeyObject; privateKey: crypto.KeyObject }) {
    if (keys) {
      this.publicKey = keys.publicKey;
      this.privateKey = keys.privateKey;
    } else {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      
      this.publicKey = crypto.createPublicKey(publicKey);
      this.privateKey = crypto.createPrivateKey(privateKey);
    }
    
    // Generate address from public key
    this.address = this.generateAddress();
  }
  
  private generateAddress(): string {
    const publicKeyString = this.publicKey.export({
      type: 'spki',
      format: 'pem'
    }).toString();
    
    // Hash the public key to create the address
    const hash = crypto.createHash('sha256')
      .update(publicKeyString)
      .digest('hex');
    
    // Use the first 40 chars of the hash as the address with AUR prefix
    return 'AUR' + hash.substring(0, 40);
  }
  
  getPublicKey(): string {
    return this.publicKey.export({
      type: 'spki',
      format: 'pem'
    }).toString();
  }
  
  getPrivateKey(): string {
    return this.privateKey.export({
      type: 'pkcs8',
      format: 'pem'
    }).toString();
  }
  
  getAddress(): string {
    return this.address;
  }
  
  getKeyPair(): { publicKey: crypto.KeyObject; privateKey: crypto.KeyObject } {
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey
    };
  }
  
  getKeyPairOutput(): KeyPairOutput {
    return {
      publicKey: this.getPublicKey(),
      privateKey: this.getPrivateKey(),
      address: this.address
    };
  }
  
  static loadFromPrivateKey(privateKeyPem: string): KeyPair {
    try {
      const privateKey = crypto.createPrivateKey(privateKeyPem);
      const publicKey = crypto.createPublicKey(privateKey);
      
      return new KeyPair({ publicKey, privateKey });
    } catch (error) {
      throw new Error('Invalid private key format');
    }
  }
  
  saveToFile(filePath: string, password: string): boolean {
    try {
      const keyPairData = this.getKeyPairOutput();
      
      // Encrypt the private key before storing
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(password, 'salt', 32), iv);
      let encryptedPrivateKey = cipher.update(keyPairData.privateKey, 'utf8', 'hex');
      encryptedPrivateKey += cipher.final('hex');
      encryptedPrivateKey = iv.toString('hex') + ':' + encryptedPrivateKey;
      
      const dataToStore = {
        publicKey: keyPairData.publicKey,
        encryptedPrivateKey,
        address: keyPairData.address
      };
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write to file
      fs.writeFileSync(filePath, JSON.stringify(dataToStore, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save key pair:', error);
      return false;
    }
  }
  
  static loadFromFile(filePath: string, password: string): KeyPair | null {
    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Decrypt the private key
      const [ivHex, encryptedKey] = fileData.encryptedPrivateKey.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(password, 'salt', 32), iv);
      let decryptedPrivateKey = decipher.update(encryptedKey, 'hex', 'utf8');
      decryptedPrivateKey += decipher.final('utf8');
      
      return KeyPair.loadFromPrivateKey(decryptedPrivateKey);
    } catch (error) {
      console.error('Failed to load key pair:', error);
      return null;
    }
  }
}
