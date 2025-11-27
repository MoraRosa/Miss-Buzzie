import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encrypt,
  decrypt,
  isEncryptionSupported,
  setEncryptedItem,
  getEncryptedItem,
  removeEncryptedItem,
} from './encryption';

// Mock crypto.subtle for testing
const mockSubtle = {
  importKey: vi.fn(),
  deriveKey: vi.fn(),
  encrypt: vi.fn(),
  decrypt: vi.fn(),
};

const mockCrypto = {
  subtle: mockSubtle,
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

describe('encryption utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('isEncryptionSupported', () => {
    it('should return true when crypto.subtle is available', () => {
      expect(isEncryptionSupported()).toBe(true);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = 'Hello, World!';
      const password = 'test-password-123';

      const encrypted = await encrypt(originalData, password);
      expect(encrypted).not.toBe(originalData);
      expect(typeof encrypted).toBe('string');

      const decrypted = await decrypt(encrypted, password);
      expect(decrypted).toBe(originalData);
    });

    it('should encrypt complex JSON data', async () => {
      const originalData = JSON.stringify({
        name: 'Test User',
        items: [1, 2, 3],
        nested: { key: 'value' },
      });
      const password = 'secure-password';

      const encrypted = await encrypt(originalData, password);
      const decrypted = await decrypt(encrypted, password);

      expect(JSON.parse(decrypted)).toEqual(JSON.parse(originalData));
    });

    it('should fail to decrypt with wrong password', async () => {
      const originalData = 'Secret data';
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';

      const encrypted = await encrypt(originalData, correctPassword);

      await expect(decrypt(encrypted, wrongPassword)).rejects.toThrow();
    });

    it('should produce different ciphertext for same data (due to random IV)', async () => {
      const data = 'Same data';
      const password = 'password';

      const encrypted1 = await encrypt(data, password);
      const encrypted2 = await encrypt(data, password);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('setEncryptedItem and getEncryptedItem', () => {
    it('should store and retrieve encrypted data from localStorage', async () => {
      const key = 'test-key';
      const value = { name: 'Test', count: 42 };
      const password = 'storage-password';

      await setEncryptedItem(key, value, password);

      // Verify something was stored
      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();
      expect(stored).not.toBe(JSON.stringify(value));

      // Retrieve and verify
      const retrieved = await getEncryptedItem<typeof value>(key, password);
      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await getEncryptedItem('non-existent', 'password');
      expect(result).toBeNull();
    });

    it('should return null for wrong password', async () => {
      const key = 'test-key';
      const value = { secret: 'data' };

      await setEncryptedItem(key, value, 'correct-password');
      const result = await getEncryptedItem(key, 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('removeEncryptedItem', () => {
    it('should remove item from localStorage', async () => {
      const key = 'to-remove';
      await setEncryptedItem(key, { data: 'test' }, 'password');

      expect(localStorage.getItem(key)).not.toBeNull();

      removeEncryptedItem(key);

      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});

