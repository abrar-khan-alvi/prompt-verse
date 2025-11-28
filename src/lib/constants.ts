/**
 * Application-wide constants
 * Centralizes all magic numbers and configuration values
 */

/**
 * Blockchain Configuration
 */
export const BLOCKCHAIN = {
  // Contract deployment block numbers
  SEPOLIA_DEPLOYMENT_BLOCK: 9710000,

  // Event query configuration
  EVENT_QUERY_BATCH_SIZE: 2000,
  MAX_BLOCK_RANGE: 10000,

  // Gas limits
  DEFAULT_GAS_LIMIT: 500000,
  MINT_GAS_LIMIT: 800000,

  // Fee configuration (in basis points)
  MAX_PLATFORM_FEE: 1000, // 10%
  MAX_ROYALTY_FEE: 2000, // 20%
  DEFAULT_PLATFORM_FEE: 250, // 2.5%
} as const;

/**
 * Network Configuration
 */
export const NETWORKS = {
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    isTestnet: false,
    blockExplorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  GOERLI: {
    chainId: 5,
    name: 'Goerli Testnet',
    isTestnet: true,
    blockExplorerUrl: 'https://goerli.etherscan.io',
    rpcUrl: 'https://goerli.infura.io/v3/',
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    isTestnet: true,
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://sepolia.infura.io/v3/',
  },
  POLYGON: {
    chainId: 137,
    name: 'Polygon Mainnet',
    isTestnet: false,
    blockExplorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
  },
  MUMBAI: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    isTestnet: true,
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  },
  LOCALHOST: {
    chainId: 31337,
    name: 'Localhost',
    isTestnet: true,
    blockExplorerUrl: '',
    rpcUrl: 'http://localhost:8545',
  },
} as const;

/**
 * Get network info by chain ID
 */
export function getNetworkInfo(chainId: number) {
  const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);
  return network || null;
}

/**
 * IPFS Configuration
 */
export const IPFS = {
  // Gateway URLs
  DEFAULT_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  CLOUDFLARE_GATEWAY: 'https://cloudflare-ipfs.com/ipfs/',
  IPFS_IO_GATEWAY: 'https://ipfs.io/ipfs/',

  // Upload limits
  MAX_FILE_SIZE_MB: 100,
  MAX_FILES_PER_UPLOAD: 10,

  // Timeouts
  UPLOAD_TIMEOUT_MS: 60000, // 1 minute
  FETCH_TIMEOUT_MS: 30000, // 30 seconds
} as const;

/**
 * File Upload Configuration
 */
export const FILE_UPLOAD = {
  // Accepted file types
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ACCEPTED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],

  // Size limits (in MB)
  MAX_IMAGE_SIZE: 10,
  MAX_VIDEO_SIZE: 100,
  MAX_AUDIO_SIZE: 50,
  MAX_DOCUMENT_SIZE: 10,
} as const;

/**
 * Form Validation Limits
 */
export const VALIDATION = {
  // Prompt creation
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  PROMPT_TEXT_MIN_LENGTH: 10,
  PROMPT_TEXT_MAX_LENGTH: 5000,

  // Pricing
  MIN_PRICE_ETH: 0,
  MAX_PRICE_ETH: 100,
  MIN_ROYALTY_PERCENT: 0,
  MAX_ROYALTY_PERCENT: 20,
} as const;

/**
 * UI Configuration
 */
export const UI = {
  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,

  // Timeouts
  TOAST_DURATION_MS: 5000,
  DEBOUNCE_DELAY_MS: 300,

  // Animation durations (in ms)
  TRANSITION_FAST: 150,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,

  // Skeleton loading
  SKELETON_CARD_COUNT: 6,
  SKELETON_ROW_COUNT: 5,
} as const;

/**
 * API Configuration
 */
export const API = {
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,

  // Timeouts
  DEFAULT_TIMEOUT_MS: 30000,
  UPLOAD_TIMEOUT_MS: 120000,
} as const;

/**
 * Cache Configuration
 */
export const CACHE = {
  // React Query stale times (in ms)
  STALE_TIME_SHORT: 30000, // 30 seconds
  STALE_TIME_MEDIUM: 300000, // 5 minutes
  STALE_TIME_LONG: 3600000, // 1 hour

  // Cache keys
  KEYS: {
    NFT_DETAILS: 'nft-details',
    MARKETPLACE_NFTS: 'marketplace-nfts',
    USER_NFTS: 'user-nfts',
    HERO_STATS: 'hero-stats',
    USER_TRANSACTIONS: 'user-transactions',
  },
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  WALLET_NOT_FOUND: 'No crypto wallet found. Please install MetaMask.',
  NETWORK_MISMATCH: 'Please switch to the correct network',
  TRANSACTION_REJECTED: 'Transaction was rejected',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
  CONTRACT_ERROR: 'Smart contract error occurred',
  IPFS_UPLOAD_FAILED: 'Failed to upload to IPFS',
  METADATA_FETCH_FAILED: 'Failed to fetch metadata',
  INVALID_TOKEN_ID: 'Invalid token ID',
  NOT_TOKEN_OWNER: 'You are not the owner of this token',
  ALREADY_LISTED: 'This token is already listed for sale',
  NOT_FOR_SALE: 'This token is not for sale',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  NFT_MINTED: 'NFT minted successfully!',
  NFT_LISTED: 'NFT listed for sale',
  NFT_DELISTED: 'NFT removed from sale',
  NFT_PURCHASED: 'NFT purchased successfully!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'prompt-verse-theme',
  WALLET_PREFERENCE: 'prompt-verse-wallet',
  LAST_CONNECTED_ACCOUNT: 'prompt-verse-last-account',
  DISMISSED_BANNERS: 'prompt-verse-dismissed-banners',
  FAVORITES: 'prompt-verse-favorites',
  FOLLOWING: 'prompt-verse-following',
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  MARKETPLACE: '/marketplace',
  CREATE: '/create',
  PROFILE: '/profile',
  PROMPT: '/prompt',
  ABOUT: '/about',
} as const;

/**
 * External Links
 */
export const EXTERNAL_LINKS = {
  DOCS: 'https://docs.promptverse.io',
  GITHUB: 'https://github.com/yourusername/prompt-verse',
  DISCORD: 'https://discord.gg/promptverse',
  TWITTER: 'https://twitter.com/promptverse',
} as const;
