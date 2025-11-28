/**
 * IPFS utility functions for resolving and handling IPFS URIs
 */

import { env } from '@/lib/env';

/**
 * Resolves an IPFS URI to an HTTP gateway URL
 * @param ipfsUri - The IPFS URI (e.g., "ipfs://Qm...")
 * @param gateway - Optional custom gateway URL (defaults to Pinata gateway from env)
 * @returns HTTP URL to access the IPFS content, or null if invalid
 *
 * @example
 * resolveIpfsUrl("ipfs://QmX...") // "https://gateway.pinata.cloud/ipfs/QmX..."
 * resolveIpfsUrl("https://example.com/image.png") // "https://example.com/image.png"
 * resolveIpfsUrl("invalid") // null
 */
export function resolveIpfsUrl(
  ipfsUri: string | null | undefined,
  gateway?: string
): string | null {
  // Handle null/undefined
  if (!ipfsUri || typeof ipfsUri !== 'string') {
    return null;
  }

  // If already HTTP/HTTPS, return as-is
  if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
    return ipfsUri;
  }

  // Handle IPFS URIs
  if (ipfsUri.startsWith('ipfs://')) {
    const cid = ipfsUri.substring(7); // Remove "ipfs://" prefix
    const gatewayUrl = gateway || env.PINATA_GATEWAY;

    if (!gatewayUrl) {
      console.warn('IPFS gateway URL not configured');
      return null;
    }

    // Ensure gateway URL ends with /ipfs/ or just /
    const normalizedGateway = gatewayUrl.endsWith('/') ? gatewayUrl : `${gatewayUrl}/`;

    return `${normalizedGateway}${cid}`;
  }

  // Invalid format
  return null;
}

/**
 * Resolves multiple IPFS URIs to HTTP gateway URLs
 * @param ipfsUris - Array of IPFS URIs
 * @param gateway - Optional custom gateway URL
 * @returns Array of HTTP URLs (null entries for invalid URIs)
 */
export function resolveIpfsUrls(
  ipfsUris: (string | null | undefined)[],
  gateway?: string
): (string | null)[] {
  return ipfsUris.map((uri) => resolveIpfsUrl(uri, gateway));
}

/**
 * Converts an HTTP gateway URL back to an IPFS URI
 * @param httpUrl - HTTP URL from an IPFS gateway
 * @returns IPFS URI or null if not a valid gateway URL
 *
 * @example
 * httpUrlToIpfsUri("https://gateway.pinata.cloud/ipfs/QmX...") // "ipfs://QmX..."
 */
export function httpUrlToIpfsUri(httpUrl: string | null | undefined): string | null {
  if (!httpUrl || typeof httpUrl !== 'string') {
    return null;
  }

  // Match common IPFS gateway patterns
  const ipfsPattern = /\/ipfs\/([a-zA-Z0-9]+)/;
  const match = httpUrl.match(ipfsPattern);

  if (match && match[1]) {
    return `ipfs://${match[1]}`;
  }

  return null;
}

/**
 * Validates if a string is a valid IPFS CID (Content Identifier)
 * This is a basic validation - for production, consider using a proper CID library
 * @param cid - The CID to validate
 * @returns true if the CID appears valid
 */
export function isValidCid(cid: string | null | undefined): boolean {
  if (!cid || typeof cid !== 'string') {
    return false;
  }

  // Basic CID validation (CIDv0 starts with Qm, CIDv1 is base32/base58)
  // This is simplified - real validation would be more complex
  return /^Qm[a-zA-Z0-9]{44}$/.test(cid) || /^[a-z2-7]{59}$/.test(cid);
}

/**
 * Fetches and parses JSON metadata from IPFS
 * @param ipfsUri - IPFS URI or HTTP URL
 * @param options - Fetch options
 * @returns Parsed JSON data or null on error
 */
export async function fetchIpfsJson<T = any>(
  ipfsUri: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const httpUrl = resolveIpfsUrl(ipfsUri);

    if (!httpUrl) {
      console.error('Invalid IPFS URI:', ipfsUri);
      return null;
    }

    const response = await fetch(httpUrl, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch IPFS content: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Error fetching IPFS JSON:', error);
    return null;
  }
}
