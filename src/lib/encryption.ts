/**
 * Optional encryption utilities for localStorage data
 * Uses Web Crypto API for secure AES-GCM encryption
 * 
 * Note: The encryption key is derived from a user-provided password.
 * For production, consider using a more robust key management solution.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts data using AES-GCM
 * Returns base64-encoded string containing salt + iv + ciphertext
 */
export async function encrypt(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const key = await deriveKey(password, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data that was encrypted with the encrypt function
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder();
  
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  
  // Extract salt, iv, and ciphertext
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}

/**
 * Check if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
}

/**
 * Encrypts and stores data in localStorage
 */
export async function setEncryptedItem(
  key: string,
  value: unknown,
  password: string
): Promise<void> {
  if (!isEncryptionSupported()) {
    throw new Error("Web Crypto API is not supported in this browser");
  }
  
  const jsonString = JSON.stringify(value);
  const encrypted = await encrypt(jsonString, password);
  localStorage.setItem(key, encrypted);
}

/**
 * Retrieves and decrypts data from localStorage
 */
export async function getEncryptedItem<T>(
  key: string,
  password: string
): Promise<T | null> {
  if (!isEncryptionSupported()) {
    throw new Error("Web Crypto API is not supported in this browser");
  }

  const encrypted = localStorage.getItem(key);
  if (!encrypted) {
    return null;
  }

  try {
    const decrypted = await decrypt(encrypted, password);
    return JSON.parse(decrypted) as T;
  } catch {
    // Decryption failed - wrong password or corrupted data
    return null;
  }
}

/**
 * Removes an encrypted item from localStorage
 */
export function removeEncryptedItem(key: string): void {
  localStorage.removeItem(key);
}

