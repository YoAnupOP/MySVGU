import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { getRequiredEnv } from "@/lib/env";

const IV_LENGTH = 12;
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const rawKey = getRequiredEnv("ERP_CREDENTIAL_ENCRYPTION_KEY");

  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }

  try {
    const base64Key = Buffer.from(rawKey, "base64");
    if (base64Key.length === 32) {
      return base64Key;
    }
  } catch {
    // Fall through to the hashed secret.
  }

  return createHash("sha256").update(rawKey, "utf8").digest();
}

export function encryptErpPassword(password: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptErpPassword(payload: string): string {
  const [ivEncoded, authTagEncoded, encryptedEncoded] = payload.split(".");

  if (!ivEncoded || !authTagEncoded || !encryptedEncoded) {
    throw new Error("Stored ERP credentials are invalid.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivEncoded, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(authTagEncoded, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
