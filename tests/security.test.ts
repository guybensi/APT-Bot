import { describe, expect, it, vi } from "vitest";
import crypto from "crypto";

const setEnv = (vars: Record<string, string>): void => {
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value;
  }
};

describe("crypto utilities", () => {
  it("encrypt/decrypt roundtrip", async () => {
    const key = crypto.randomBytes(32).toString("base64");
    setEnv({
      DATA_ENCRYPTION_KEY: key,
      PHONE_HASH_SALT: "salt-a",
      PGHOST: "localhost",
      PGPORT: "5432",
      PGDATABASE: "test",
      PGUSER: "test",
      PGPASSWORD: "test"
    });

    vi.resetModules();
    const { encryptPhone, decryptPhone } = await import("../src/security/crypto");

    const plain = "+15551234567";
    const cipher = encryptPhone(plain);
    const decrypted = decryptPhone(cipher);
    expect(decrypted).toBe(plain);
  });

  it("different salts produce different hashes", async () => {
    const e164 = "+15551234567";

    setEnv({
      DATA_ENCRYPTION_KEY: crypto.randomBytes(32).toString("base64"),
      PHONE_HASH_SALT: "salt-a",
      PGHOST: "localhost",
      PGPORT: "5432",
      PGDATABASE: "test",
      PGUSER: "test",
      PGPASSWORD: "test"
    });
    vi.resetModules();
    const { phoneHash: phoneHashA } = await import("../src/security/hash");
    const hashA = phoneHashA(e164);

    setEnv({
      DATA_ENCRYPTION_KEY: crypto.randomBytes(32).toString("base64"),
      PHONE_HASH_SALT: "salt-b",
      PGHOST: "localhost",
      PGPORT: "5432",
      PGDATABASE: "test",
      PGUSER: "test",
      PGPASSWORD: "test"
    });
    vi.resetModules();
    const { phoneHash: phoneHashB } = await import("../src/security/hash");
    const hashB = phoneHashB(e164);

    expect(hashA).not.toBe(hashB);
  });
});
