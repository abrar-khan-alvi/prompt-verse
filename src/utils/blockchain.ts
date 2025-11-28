/**
 * Blockchain utility functions
 */

import { ethers } from 'ethers';
import { BLOCKCHAIN, NETWORKS, ERROR_MESSAGES } from '@/lib/constants';
import type { NetworkInfo } from '@/lib/types';

/**
 * Get block explorer URL for a transaction
 * @param txHash - Transaction hash
 * @param chainId - Chain ID
 * @returns Block explorer URL or null
 */
export function getBlockExplorerUrl(txHash: string, chainId: number): string | null {
  const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);

  if (!network || !network.blockExplorerUrl) {
    return null;
  }

  return `${network.blockExplorerUrl}/tx/${txHash}`;
}

/**
 * Get block explorer URL for an address
 * @param address - Ethereum address
 * @param chainId - Chain ID
 * @returns Block explorer URL or null
 */
export function getAddressExplorerUrl(address: string, chainId: number): string | null {
  const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);

  if (!network || !network.blockExplorerUrl) {
    return null;
  }

  return `${network.blockExplorerUrl}/address/${address}`;
}

/**
 * Get network name from chain ID
 * @param chainId - Chain ID
 * @returns Network name
 */
export function getNetworkName(chainId: number | null): string {
  if (!chainId) return 'Unknown Network';

  const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);
  return network?.name || `Chain ID: ${chainId}`;
}

/**
 * Check if network is a testnet
 * @param chainId - Chain ID
 * @returns true if testnet
 */
export function isTestnet(chainId: number): boolean {
  const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);
  return network?.isTestnet ?? false;
}

/**
 * Parse blockchain error message
 * @param error - Error object
 * @returns User-friendly error message
 */
export function parseBlockchainError(error: any): string {
  if (!error) return ERROR_MESSAGES.GENERIC_ERROR;

  const errorMessage = error.message || error.toString();

  // User rejected transaction
  if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
    return ERROR_MESSAGES.TRANSACTION_REJECTED;
  }

  // Insufficient funds
  if (errorMessage.includes('insufficient funds')) {
    return ERROR_MESSAGES.INSUFFICIENT_FUNDS;
  }

  // Contract-specific errors
  if (errorMessage.includes('Not token owner')) {
    return ERROR_MESSAGES.NOT_TOKEN_OWNER;
  }

  if (errorMessage.includes('Already listed')) {
    return ERROR_MESSAGES.ALREADY_LISTED;
  }

  if (errorMessage.includes('Not for sale')) {
    return ERROR_MESSAGES.NOT_FOR_SALE;
  }

  // Generic contract error
  if (errorMessage.includes('execution reverted')) {
    return ERROR_MESSAGES.CONTRACT_ERROR;
  }

  return ERROR_MESSAGES.GENERIC_ERROR;
}

/**
 * Wait for transaction confirmation with timeout
 * @param tx - Transaction response
 * @param confirmations - Number of confirmations to wait for
 * @param timeoutMs - Timeout in milliseconds
 * @returns Transaction receipt
 */
export async function waitForTransaction(
  tx: ethers.TransactionResponse,
  confirmations: number = 1,
  timeoutMs: number = 120000
): Promise<ethers.TransactionReceipt> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Transaction confirmation timeout')), timeoutMs);
  });

  const receiptPromise = tx.wait(confirmations);

  const receipt = await Promise.race([receiptPromise, timeoutPromise]);

  if (!receipt) {
    throw new Error('Transaction failed');
  }

  return receipt;
}

/**
 * Estimate gas with buffer
 * @param estimatedGas - Estimated gas
 * @param bufferPercent - Buffer percentage (default 20%)
 * @returns Gas limit with buffer
 */
export function addGasBuffer(estimatedGas: bigint, bufferPercent: number = 20): bigint {
  const buffer = (estimatedGas * BigInt(bufferPercent)) / BigInt(100);
  return estimatedGas + buffer;
}

/**
 * Convert Wei to ETH with proper formatting
 * @param wei - Amount in Wei
 * @param decimals - Number of decimals to show
 * @returns Formatted ETH string
 */
export function weiToEth(wei: bigint | string, decimals: number = 4): string {
  const ethValue = ethers.formatEther(wei);
  const num = parseFloat(ethValue);

  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';

  return num.toFixed(decimals);
}

/**
 * Convert ETH to Wei
 * @param eth - Amount in ETH
 * @returns Amount in Wei
 */
export function ethToWei(eth: string | number): bigint {
  return ethers.parseEther(eth.toString());
}

/**
 * Check if address is valid Ethereum address
 * @param address - Address to check
 * @returns true if valid
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Normalize address to checksum format
 * @param address - Address to normalize
 * @returns Checksummed address
 */
export function normalizeAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch {
    return address;
  }
}

/**
 * Compare two addresses (case-insensitive)
 * @param address1 - First address
 * @param address2 - Second address
 * @returns true if addresses are equal
 */
export function addressesEqual(address1: string, address2: string): boolean {
  try {
    return normalizeAddress(address1).toLowerCase() === normalizeAddress(address2).toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Calculate optimal block range for event queries
 * @param fromBlock - Starting block
 * @param toBlock - Ending block
 * @returns Array of [from, to] block ranges
 */
export function calculateBlockRanges(fromBlock: number, toBlock: number): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const batchSize = BLOCKCHAIN.EVENT_QUERY_BATCH_SIZE;

  for (let start = fromBlock; start <= toBlock; start += batchSize) {
    const end = Math.min(start + batchSize - 1, toBlock);
    ranges.push([start, end]);
  }

  return ranges;
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Initial delay in milliseconds
 * @returns Result of function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
