/**
 * Example unit tests for utility functions
 * Run with: npm test (after setting up Jest)
 */

import { describe, it, expect } from '@jest/globals';
import { formatAddress, formatEth, formatNumber, truncateText } from '../formatting';

describe('Formatting Utilities', () => {
  describe('formatAddress', () => {
    it('should format a full Ethereum address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(formatAddress(address)).toBe('0x1234...5678');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatAddress(null)).toBe('');
      expect(formatAddress(undefined)).toBe('');
    });

    it('should handle short addresses', () => {
      const shortAddress = '0x123';
      expect(formatAddress(shortAddress)).toBe('0x123');
    });
  });

  describe('formatEth', () => {
    it('should format ETH amounts correctly', () => {
      expect(formatEth('1.5')).toBe('1.50 ETH');
      expect(formatEth('0.001234567')).toBe('0.0012 ETH');
    });

    it('should handle zero values', () => {
      expect(formatEth('0')).toBe('0.00 ETH');
      expect(formatEth(null)).toBe('0 ETH');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1234567.89)).toContain('1,234,567');
    });

    it('should handle decimals', () => {
      expect(formatNumber(1234.5, 0)).toContain('1,235');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs truncation';
      expect(truncateText(text, 10)).toBe('This is a...');
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });
  });
});
