/**
 * cryptoUtils.js — Secure password hashing using Web Crypto API (PBKDF2-SHA256)
 * 
 * Format hash: pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>
 * 
 * - Uses native window.crypto.subtle (no external dependencies)
 * - 100,000 iterations PBKDF2 with SHA-256
 * - 16-byte random salt per password
 * - 32-byte derived key
 */

const ITERATIONS = 100000;
const SALT_LENGTH = 16; // bytes
const KEY_LENGTH = 32;  // bytes
const HASH_PREFIX = 'pbkdf2_sha256$';
const LEGACY_PREFIX = 'pbkdf2_sha256$'; // old Base64 format also uses this prefix

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Hash a plaintext password with PBKDF2-SHA256.
 * Returns a string in format: pbkdf2_sha256$100000$<salt_hex>$<hash_hex>
 * 
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} The hashed password string
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8 // bits
  );

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(derivedBits);

  return `${HASH_PREFIX}${ITERATIONS}$${saltHex}$${hashHex}`;
}

/**
 * Verify a plaintext password against a stored hash.
 * Supports both new PBKDF2 format and legacy Base64 format (for migration).
 * 
 * @param {string} password - The plaintext password to check
 * @param {string} storedHash - The stored hash string
 * @returns {Promise<boolean>} True if the password matches
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  // Check if this is a real PBKDF2 hash (has 4 parts: prefix, iterations, salt, hash)
  if (isModernHash(storedHash)) {
    return verifyModernHash(password, storedHash);
  }

  // Legacy format: pbkdf2_sha256$<base64_of_plaintext>
  if (storedHash.startsWith(LEGACY_PREFIX)) {
    try {
      const base64Part = storedHash.slice(LEGACY_PREFIX.length);
      const decodedPassword = atob(base64Part);
      return password === decodedPassword;
    } catch {
      return false;
    }
  }

  // Plain text fallback (should not happen, but just in case)
  return password === storedHash;
}

/**
 * Verify against the modern PBKDF2 hash format.
 */
async function verifyModernHash(password, storedHash) {
  try {
    // Format: pbkdf2_sha256$100000$<salt_hex>$<hash_hex>
    const withoutPrefix = storedHash.slice(HASH_PREFIX.length);
    const parts = withoutPrefix.split('$');

    if (parts.length !== 3) return false;

    const iterations = parseInt(parts[0], 10);
    const saltHex = parts[1];
    const expectedHashHex = parts[2];

    if (isNaN(iterations) || !saltHex || !expectedHashHex) return false;

    const encoder = new TextEncoder();
    const salt = hexToBuffer(saltHex);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      KEY_LENGTH * 8
    );

    const computedHashHex = bufferToHex(derivedBits);
    return computedHashHex === expectedHashHex;
  } catch {
    return false;
  }
}

/**
 * Check if a stored hash is in the modern PBKDF2 format.
 * Modern format has exactly 4 segments: "pbkdf2_sha256$" + iterations + "$" + salt_hex + "$" + hash_hex
 * Legacy format has only: "pbkdf2_sha256$" + base64_string (no further $ separators in the base64)
 * 
 * @param {string} storedHash 
 * @returns {boolean}
 */
export function isModernHash(storedHash) {
  if (!storedHash || !storedHash.startsWith(HASH_PREFIX)) return false;

  const withoutPrefix = storedHash.slice(HASH_PREFIX.length);
  const parts = withoutPrefix.split('$');

  // Modern format: iterations$salt$hash → 3 parts after prefix
  if (parts.length !== 3) return false;

  const iterations = parseInt(parts[0], 10);
  if (isNaN(iterations) || iterations < 1000) return false;

  // Salt should be hex (32 chars = 16 bytes)
  if (!/^[0-9a-f]{32}$/i.test(parts[1])) return false;

  // Hash should be hex (64 chars = 32 bytes)  
  if (!/^[0-9a-f]{64}$/i.test(parts[2])) return false;

  return true;
}

/**
 * Check if a stored hash needs migration (is in legacy Base64 format).
 * 
 * @param {string} storedHash 
 * @returns {boolean}
 */
export function needsMigration(storedHash) {
  if (!storedHash) return true;
  return !isModernHash(storedHash);
}
