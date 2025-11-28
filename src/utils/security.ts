/**
 * Security utilities for API routes and form handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { API } from '@/lib/constants';

/**
 * Rate limiter using in-memory store
 * For production, use Redis or similar
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited
   */
  isRateLimited(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];

    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    // Check if limit exceeded
    if (validTimestamps.length >= maxRequests) {
      return true;
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return false;
  }

  /**
   * Clear rate limit data for identifier
   * @param identifier - Unique identifier
   */
  clear(identifier: string) {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limit data
   */
  clearAll() {
    this.requests.clear();
  }
}

/**
 * Global rate limiter instance
 */
export const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware for API routes
 * @param req - Next.js request
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 * @returns Response if rate limited, null otherwise
 */
export function checkRateLimit(
  req: NextRequest,
  maxRequests: number = API.MAX_REQUESTS_PER_MINUTE,
  windowMs: number = 60000
): NextResponse | null {
  // Get identifier (IP address or user ID)
  const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  if (rateLimiter.isRateLimited(identifier, maxRequests, windowMs)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
      },
      { status: 429 }
    );
  }

  return null;
}

/**
 * Validate request origin (CORS)
 * @param req - Next.js request
 * @param allowedOrigins - Array of allowed origins
 * @returns true if origin is allowed
 */
export function validateOrigin(req: NextRequest, allowedOrigins: string[]): boolean {
  const origin = req.headers.get('origin');

  if (!origin) {
    // Allow requests without origin (same-origin)
    return true;
  }

  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed.endsWith('*')) {
      const prefix = allowed.slice(0, -1);
      return origin.startsWith(prefix);
    }
    return origin === allowed;
  });
}

/**
 * Validate request method
 * @param req - Next.js request
 * @param allowedMethods - Array of allowed HTTP methods
 * @returns Response if method not allowed, null otherwise
 */
export function validateMethod(req: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(req.method)) {
    return NextResponse.json(
      {
        success: false,
        error: `Method ${req.method} not allowed`,
      },
      { status: 405 }
    );
  }

  return null;
}

/**
 * Validate content type
 * @param req - Next.js request
 * @param expectedType - Expected content type
 * @returns true if content type matches
 */
export function validateContentType(req: NextRequest, expectedType: string): boolean {
  const contentType = req.headers.get('content-type');
  return contentType?.includes(expectedType) ?? false;
}

/**
 * Generate Content Security Policy header value
 * @returns CSP header value
 */
export function generateCSP(): string {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.pinata.cloud https://*.infura.io https://*.alchemy.com wss://*.infura.io",
    "frame-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ];

  return policies.join('; ');
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': generateCSP(),
} as const;

/**
 * Add security headers to response
 * @param response - Next.js response
 * @returns Response with security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Validate file upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @param allowedTypes - Allowed MIME types
 * @returns Validation result
 */
export function validateFileUpload(
  file: File,
  maxSizeMB: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Generate secure random token
 * @param length - Token length
 * @returns Random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash string using SHA-256
 * @param input - String to hash
 * @returns Hashed string
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
