import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/crypto";

describe("crypto (AES-256-GCM)", () => {
  it("round-trips a value", () => {
    const secret = "gho_exampletoken_1234567890";
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  it("ciphertext does not contain the plaintext", () => {
    const secret = "super-secret-token";
    const enc = encrypt(secret);
    expect(enc).not.toContain(secret);
    expect(enc.split(".")).toHaveLength(3);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    expect(encrypt("x")).not.toBe(encrypt("x"));
  });

  it("rejects a tampered payload", () => {
    const enc = encrypt("hello");
    const tampered = enc.slice(0, -2) + (enc.endsWith("a") ? "bb" : "aa");
    expect(() => decrypt(tampered)).toThrow();
  });
});
