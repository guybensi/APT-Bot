import { db } from "./client";

export const checkDbHealth = async (): Promise<boolean> => {
  try {
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};
