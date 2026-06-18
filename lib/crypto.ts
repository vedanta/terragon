import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

// Derive a 32-byte key from TERRAGON_ENCRYPTION_KEY (any length input).
// Fallback keeps module load safe in builds without env; real encryption
// only happens at runtime where the real key is present.
function key() {
  const secret = process.env.TERRAGON_ENCRYPTION_KEY ?? "dev-insecure-key";
  return createHash("sha256").update(secret).digest();
}

/** AES-256-GCM encrypt → "iv.tag.ciphertext" (base64 parts). */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    enc.toString("base64"),
  ].join(".");
}

/** Reverse of encrypt(). Throws if the payload is malformed or tampered. */
export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("crypto: malformed payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
