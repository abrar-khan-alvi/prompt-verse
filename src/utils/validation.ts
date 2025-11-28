/**
 * Input validation utilities using Zod schemas
 */

import { z } from 'zod';

/**
 * Ethereum address validation schema
 */
export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * IPFS CID validation schema (basic)
 */
export const ipfsCidSchema = z
  .string()
  .regex(/^(Qm[a-zA-Z0-9]{44}|[a-z2-7]{59})$/, 'Invalid IPFS CID');

/**
 * Create Prompt form validation schema
 */
export const createPromptSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),

  platform: z.string().min(1, 'Please select an AI platform'),

  promptText: z
    .string()
    .min(10, 'Prompt text must be at least 10 characters')
    .max(5000, 'Prompt text must be less than 5000 characters')
    .trim(),

  price: z
    .string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Price must be a valid positive number')
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 100; // Max 100 ETH
    }, 'Price cannot exceed 100 ETH'),

  royalty: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 20;
  }, 'Royalty must be between 0% and 20%'),

  includeMedia: z.boolean(),
});

export type CreatePromptFormData = z.infer<typeof createPromptSchema>;

/**
 * Validates an Ethereum address
 * @param address - Address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEthereumAddress(address: string): boolean {
  try {
    ethereumAddressSchema.parse(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates an IPFS CID
 * @param cid - CID to validate
 * @returns true if valid, false otherwise
 */
export function isValidIpfsCid(cid: string): boolean {
  try {
    ipfsCidSchema.parse(cid);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates file type for uploads
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  });
}

/**
 * Validates file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @returns true if valid, false otherwise
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Common file type groups
 */
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  DOCUMENTS: ['application/pdf', 'text/plain'],
  ALL_MEDIA: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
};

/**
 * Validates multiple files
 * @param files - FileList or File array
 * @param options - Validation options
 * @returns Validation result with errors
 */
export function validateFiles(
  files: FileList | File[],
  options: {
    allowedTypes?: string[];
    maxSizeMB?: number;
    maxFiles?: number;
  } = {}
): { valid: boolean; errors: string[] } {
  const { allowedTypes = FILE_TYPES.ALL_MEDIA, maxSizeMB = 10, maxFiles = 10 } = options;

  const errors: string[] = [];
  const fileArray = Array.from(files);

  // Check file count
  if (fileArray.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    return { valid: false, errors };
  }

  // Validate each file
  fileArray.forEach((file, index) => {
    if (!isValidFileType(file, allowedTypes)) {
      errors.push(`File ${index + 1} (${file.name}): Invalid file type`);
    }

    if (!isValidFileSize(file, maxSizeMB)) {
      errors.push(`File ${index + 1} (${file.name}): File too large (max ${maxSizeMB}MB)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
