import dotenv from "dotenv";

dotenv.config();

type Env = {
  PGHOST: string;
  PGPORT: number;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  DATA_ENCRYPTION_KEY: string;
  PHONE_HASH_SALT: string;
  WA_PHONE_NUMBER_ID: string;
  WA_ACCESS_TOKEN: string;
  WA_WEBHOOK_VERIFY_TOKEN: string;
  WA_TEMPLATE_NEW_MATCH: string;
  BASE_URL: string;
  PORT: number;
};

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const parseNumber = (key: string, fallback?: number): number => {
  const raw = process.env[key];
  if (!raw) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required env var: ${key}`);
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for env var: ${key}`);
  }
  return parsed;
};

export const env: Env = {
  PGHOST: required("PGHOST"), // fill in .env
  PGPORT: parseNumber("PGPORT"), // fill in .env
  PGDATABASE: required("PGDATABASE"), // fill in .env
  PGUSER: required("PGUSER"), // fill in .env
  PGPASSWORD: required("PGPASSWORD"), // fill in .env
  DATA_ENCRYPTION_KEY: required("DATA_ENCRYPTION_KEY"), // fill in .env
  PHONE_HASH_SALT: required("PHONE_HASH_SALT"), // fill in .env
  WA_PHONE_NUMBER_ID: required("WA_PHONE_NUMBER_ID"), // fill in .env
  WA_ACCESS_TOKEN: required("WA_ACCESS_TOKEN"), // fill in .env
  WA_WEBHOOK_VERIFY_TOKEN: required("WA_WEBHOOK_VERIFY_TOKEN"), // fill in .env
  WA_TEMPLATE_NEW_MATCH: required("WA_TEMPLATE_NEW_MATCH"), // fill in .env
  BASE_URL: required("BASE_URL"), // fill in .env
  PORT: parseNumber("PORT", 3000) // optional override in .env
};
