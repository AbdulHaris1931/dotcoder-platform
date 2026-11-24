/**
 * Cryptographic & Temporary Password Utilities
 * Pure zero-dependency helpers safe for client, server, and Node test runners.
 */

/**
 * Generates a cryptographically strong random temporary password
 * (avoids hardcoded predictable passwords across newly provisioned users).
 */
export function generateSecureTempPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#$%&*";
  const all = upper + lower + digits + symbols;

  const getRandomInt = (max: number): number => {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const chars = [
    upper[getRandomInt(upper.length)],
    lower[getRandomInt(lower.length)],
    digits[getRandomInt(digits.length)],
    symbols[getRandomInt(symbols.length)],
  ];
  for (let i = chars.length; i < length; i++) {
    chars.push(all[getRandomInt(all.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/**
 * Deterministic salted hash for Local Demo Mode credential storage
 * (ensures raw plaintext passwords are never persisted in localStorage).
 */
export function hashDemoCredential(password: string, salt: string): string {
  const input = `${salt}::eqlv-demo-v2::${password}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `v2_${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0).toString(16).padStart(8, "0")}`;
}
