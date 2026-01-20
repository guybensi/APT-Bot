import { db } from "../client";
import { UserState } from "../../types/db";

export const getUserState = async (user_id: number): Promise<UserState | null> => {
  const result = await db.query<UserState>(
    `
      SELECT *
      FROM user_state
      WHERE user_id = $1
      LIMIT 1
    `,
    [user_id]
  );

  return result.rows[0] ?? null;
};

export const upsertUserState = async (
  user_id: number,
  state: string,
  data: Record<string, unknown>
): Promise<UserState> => {
  const result = await db.query<UserState>(
    `
      INSERT INTO user_state (user_id, state, data, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        state = EXCLUDED.state,
        data = EXCLUDED.data,
        updated_at = NOW()
      RETURNING *
    `,
    [user_id, state, data]
  );

  return result.rows[0];
};

export const clearUserState = async (user_id: number): Promise<void> => {
  await db.query(
    `
      DELETE FROM user_state
      WHERE user_id = $1
    `,
    [user_id]
  );
};
