/**
 * Shared TypeScript types for the PromptVerse application
 */

/**
 * NFT Prompt metadata structure (stored on IPFS)
 */
export interface PromptMetadata {
  name: string;
  description: string;
  platform: string;
  prompt_text: string;
  image?: string;
  input_media_uris?: string[];
  output_sample_uris?: string[];
  attributes?: MetadataAttribute[];
}

/**
 * NFT metadata attribute
 */
export interface MetadataAttribute {
  trait_type: string;
  value: string | number | boolean;
}

/**
 * On-chain prompt data structure
 */
export interface PromptData {
  title: string;
  platform: string;
  description: string;
  promptText: string;
  creator: string;
  createdAt: bigint;
  includeMedia: boolean;
  includeOutputSample: boolean;
  promptHash: string;
}

/**
 * On-chain sale data structure
 */
export interface SaleData {
  price: bigint;
  isForSale: boolean;
  seller: string;
}

/**
 * Complete NFT details (on-chain + metadata)
 */
export interface NFTDetails {
  tokenId: string;
  // On-chain data
  title: string;
  platform: string;
  description: string;
  promptText: string;
  creator: string;
  currentOwner: string;
  createdAt: number; // timestamp in ms
  price: string | null; // in ETH
  isForSale: boolean;
  seller: string;
  tokenURI: string;
  includeMedia: boolean;
  includeOutputSample: boolean;
  // Metadata from IPFS
  metadata?: PromptMetadata;
  metadataImage?: string;
  metadataInputMediaURIs?: string[];
  metadataOutputSampleURIs?: string[];
}

/**
 * User transaction types
 */
export type TransactionType = 'Mint' | 'Purchase' | 'Sale' | 'List' | 'Delist' | 'Royalty';

/**
 * User transaction record
 */
export interface UserTransaction {
  type: TransactionType;
  promptId: string;
  promptTitle: string;
  from?: string;
  to?: string;
  price: string; // in ETH or '-'
  date: number; // timestamp in ms
  txHash: string;
  blockNumber?: number;
}

/**
 * Blockchain statistics
 */
export interface BlockchainStats {
  promptsCreated: string;
  activeCreators: string;
  totalTrades: string;
  volumeTraded: string;
}

/**
 * Wallet connection state
 */
export interface WalletState {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

/**
 * Form data for creating a prompt NFT
 */
export interface CreatePromptFormData {
  title: string;
  description: string;
  platform: string;
  promptText: string;
  includeMedia: boolean;
  price: string; // in ETH
  royalty: string; // percentage
}

/**
 * Media file wrapper for uploads
 */
export interface MediaFileWrapper {
  id: string;
  file: File;
  preview: string; // data URL
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * IPFS upload response
 */
export interface IpfsUploadResponse {
  success: boolean;
  cid?: string;
  error?: string;
}

/**
 * Mint NFT result
 */
export interface MintResult {
  success: boolean;
  transactionHash: string;
  tokenId: string | null;
}

/**
 * Network information
 */
export interface NetworkInfo {
  chainId: number;
  name: string;
  isTestnet: boolean;
  blockExplorerUrl?: string;
  rpcUrl?: string;
}

/**
 * Supported AI platforms
 */
export const AI_PLATFORMS = [
  'OpenAI',
  'Midjourney',
  'Stable Diffusion',
  'Google Gemini',
  'Anthropic Claude',
  'Cohere',
  'Hugging Face',
  'Microsoft Azure AI',
  'Amazon Bedrock',
  'Perplexity',
  'Other',
] as const;

export type AIPlatform = (typeof AI_PLATFORMS)[number];

/**
 * Contract event types
 */
export interface PromptMintedEvent {
  tokenId: bigint;
  creator: string;
  title: string;
  platform: string;
  price: bigint;
  tokenURI: string;
}

export interface PromptListedEvent {
  tokenId: bigint;
  seller: string;
  price: bigint;
}

export interface PromptSoldEvent {
  tokenId: bigint;
  seller: string;
  buyer: string;
  price: bigint;
}

export interface PromptDelistedEvent {
  tokenId: bigint;
  seller: string;
}
