import crypto from "crypto";
import { env } from "../config/env";
import { normalizePhone } from "./normalizePhone";

export const phoneHash = (e164: string): string => {
  const normalized = normalizePhone(e164);
  const data = `${env.PHONE_HASH_SALT}${normalized}`;
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
};
