
import crypto from 'crypto';

/**
 * Utility functions for cryptographic operations used by the wallet
 */
export class CryptoUtils {
  
  /**
   * Generate a new cryptographically secure keypair
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    return { publicKey, privateKey };
  }
  
  /**
   * Encrypt data with AES-256-CBC
   */
  static encrypt(data: string, password: string): string {
    // Generate a secure initialization vector
    const iv = crypto.randomBytes(16);
    
    // Derive a key from the password
    const key = crypto.scryptSync(password, 'salt', 32);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend the IV to the encrypted data (IV is not secret)
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypt data with AES-256-CBC
   */
  static decrypt(encryptedData: string, password: string): string {
    // Extract the IV from the encrypted data
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    // Derive the key from the password (must match encryption)
    const key = crypto.scryptSync(password, 'salt', 32);
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Create a digital signature of data using a private key
   */
  static sign(data: string, privateKeyPem: string): string {
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKey, 'hex');
  }
  
  /**
   * Verify a digital signature using a public key
   */
  static verify(data: string, signature: string, publicKeyPem: string): boolean {
    try {
      const publicKey = crypto.createPublicKey(publicKeyPem);
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      return verify.verify(publicKey, Buffer.from(signature, 'hex'));
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
  
  /**
   * Generate a deterministic wallet address from a public key
   */
  static publicKeyToAddress(publicKey: string): string {
    // Hash the public key using SHA-256
    const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
    
    // Return the first 40 characters with AUR prefix
    return 'AUR' + hash.substring(0, 40);
  }
  
  /**
   * Generate a secure random mnemonic phrase (simplified version)
   */
  static generateMnemonic(): string {
    const wordlist = [
      "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
      "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
      "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
      "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
      "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
      "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
      "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger"
    ];
    
    // Generate 12 random words from the wordlist
    const entropy = crypto.randomBytes(16);
    const words = [];
    
    for (let i = 0; i < 12; i++) {
      const index = entropy.readUInt8(i % 16) % wordlist.length;
      words.push(wordlist[index]);
    }
    
    return words.join(' ');
  }
}
