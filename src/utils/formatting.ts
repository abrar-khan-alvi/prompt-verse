/**
 * Formatting utility functions for consistent display across the application
 */

/**
 * Formats an Ethereum address to a shortened version
 * @param address - Full Ethereum address
 * @param prefixLength - Number of characters to show at start (default: 6)
 * @param suffixLength - Number of characters to show at end (default: 4)
 * @returns Formatted address (e.g., "0x1234...5678")
 *
 * @example
 * formatAddress("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
 */
export function formatAddress(
  address: string | null | undefined,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address || typeof address !== 'string') {
    return '';
  }

  if (address.length <= prefixLength + suffixLength) {
    return address;
  }

  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234.5, 0) // "1,235"
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0';
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats ETH amount with proper decimals
 * @param value - ETH amount (as string or number)
 * @param maxDecimals - Maximum decimal places to show (default: 4)
 * @returns Formatted ETH amount
 *
 * @example
 * formatEth("0.001234567") // "0.0012 ETH"
 * formatEth("1.5") // "1.5 ETH"
 */
export function formatEth(
  value: string | number | null | undefined,
  maxDecimals: number = 4
): string {
  if (value === null || value === undefined) {
    return '0 ETH';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0 ETH';
  }

  // Use fewer decimals for larger amounts
  const decimals = num >= 1 ? 2 : maxDecimals;

  return `${formatNumber(num, decimals)} ETH`;
}

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string
 *
 * @example
 * formatDate(1638360000000) // "Dec 1, 2021"
 * formatDate(1638360000000, true) // "Dec 1, 2021, 12:00 PM"
 */
export function formatDate(
  timestamp: number | null | undefined,
  includeTime: boolean = false
): string {
  if (!timestamp) {
    return 'Unknown';
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString(undefined, options);
}

/**
 * Formats a relative time string (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(timestamp: number | null | undefined): string {
  if (!timestamp) {
    return 'Unknown';
  }

  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 *
 * @example
 * truncateText("This is a long text", 10) // "This is a..."
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}...`;
}

/**
 * Formats a transaction hash for display
 * @param txHash - Transaction hash
 * @returns Formatted transaction hash
 *
 * @example
 * formatTxHash("0xabcd...1234") // "0xabcd...1234"
 */
export function formatTxHash(txHash: string | null | undefined): string {
  return formatAddress(txHash, 6, 4);
}

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Capitalizes the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
