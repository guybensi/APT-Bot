import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getKey = (): Buffer => {
  const key = Buffer.from(env.DATA_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes (base64)");
  }
  return key;
};

export const encryptPhone = (plain: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64")
  ].join(".");
};

export const decryptPhone = (cipherText: string): string => {
  const [ivB64, tagB64, payloadB64] = cipherText.split(".");
  if (!ivB64 || !tagB64 || !payloadB64) {
    throw new Error("Invalid cipher format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const payload = Buffer.from(payloadB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
  return decrypted.toString("utf8");
};
