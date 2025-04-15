
import crypto from 'crypto';

/**
 * Calculates the SHA256 hash of the input string
 * 
 * @param data Data to hash
 * @returns SHA256 hash of the data as a hexadecimal string
 */
export function calculateHash(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Verifies if a hash meets the difficulty target
 * (starts with a number of zeros equal to the difficulty)
 * 
 * @param hash The hash to verify
 * @param difficulty The target difficulty (number of leading zeros)
 * @returns True if the hash meets the difficulty target, false otherwise
 */
export function hashMeetsDifficulty(hash: string, difficulty: number): boolean {
  const target = Array(difficulty + 1).join('0');
  return hash.substring(0, difficulty) === target;
}

/**
 * Generates a nonce that produces a hash meeting the target difficulty for the given data
 * 
 * @param data Base data to hash
 * @param difficulty Target difficulty (number of leading zeros)
 * @returns A nonce that produces a hash matching the target difficulty
 */
export function mineWithDifficulty(data: string, difficulty: number): { nonce: number, hash: string } {
  let nonce = 0;
  let hash = calculateHash(data + nonce);
  
  while (!hashMeetsDifficulty(hash, difficulty)) {
    nonce++;
    hash = calculateHash(data + nonce);
  }
  
  return { nonce, hash };
}

/**
 * Calculate Merkle Root of transactions
 * 
 * @param transactions Array of transaction hashes
 * @returns Merkle root hash
 */
export function calculateMerkleRoot(transactions: string[]): string {
  if (transactions.length === 0) return calculateHash('');
  
  if (transactions.length === 1) return transactions[0];
  
  const nextLevel: string[] = [];
  
  for (let i = 0; i < transactions.length; i += 2) {
    if (i + 1 < transactions.length) {
      nextLevel.push(calculateHash(transactions[i] + transactions[i + 1]));
    } else {
      nextLevel.push(transactions[i]);
    }
  }
  
  return calculateMerkleRoot(nextLevel);
}

/**
 * Convert a timeframe string to milliseconds
 * 
 * @param timeframe Timeframe string (e.g., "10m", "1h", "1d")
 * @returns Milliseconds
 */
export function timeframeToMs(timeframe: string): number {
  const value = parseInt(timeframe);
  const unit = timeframe.slice(-1);
  
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
}
