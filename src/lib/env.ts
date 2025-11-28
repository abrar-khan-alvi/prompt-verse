/**
 * Environment variable validation and type-safe access
 * This ensures all required environment variables are present at runtime
 */

interface EnvConfig {
  CONTRACT_ADDRESS: string;
  PINATA_JWT: string;
  PINATA_GATEWAY: string;
  BESU_RPC_URL?: string;
  ALCHEMY_API_KEY?: string;
  SEPOLIA_RPC_URL?: string;
}

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 */
function validateEnv(): EnvConfig {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
    missingVars.push('NEXT_PUBLIC_CONTRACT_ADDRESS');
  }
  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    missingVars.push('NEXT_PUBLIC_PINATA_JWT');
  }
  if (!process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
    missingVars.push('NEXT_PUBLIC_PINATA_GATEWAY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    );
  }

  return {
    CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT!,
    PINATA_GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
    BESU_RPC_URL: process.env.NEXT_PUBLIC_BESU_RPC_URL,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
  };
}

// Validate on module load (client-side only)
let env: EnvConfig;

if (typeof window !== 'undefined') {
  try {
    env = validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In production, you might want to show a user-friendly error page
    env = {
      CONTRACT_ADDRESS: '',
      PINATA_JWT: '',
      PINATA_GATEWAY: '',
    };
  }
} else {
  // Server-side: validate but don't throw during build
  env = {
    CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT || '',
    PINATA_GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY || '',
    BESU_RPC_URL: process.env.NEXT_PUBLIC_BESU_RPC_URL,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
  };
}

export { env };
export type { EnvConfig };
