import { db } from "../client";
import { CollectorRun } from "../../types/db";

export const startCollectorRun = async (collector: string): Promise<CollectorRun> => {
  const result = await db.query<CollectorRun>(
    `
      INSERT INTO collector_runs (collector, status, started_at)
      VALUES ($1, 'running', NOW())
      RETURNING *
    `,
    [collector]
  );

  return result.rows[0];
};

export const finishCollectorRun = async (
  id: number,
  status: "success" | "failed",
  error_message: string | null
): Promise<void> => {
  await db.query(
    `
      UPDATE collector_runs
      SET status = $2,
          error_message = $3,
          finished_at = NOW()
      WHERE id = $1
    `,
    [id, status, error_message]
  );
};
