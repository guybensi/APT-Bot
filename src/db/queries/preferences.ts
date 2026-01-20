import { db } from "../client";
import { Preferences, PreferencesUpsertPayload } from "../../types/db";

export const upsertPreferences = async (
  user_id: number,
  payload: PreferencesUpsertPayload
): Promise<Preferences> => {
  const result = await db.query<Preferences>(
    `
      INSERT INTO preferences (
        user_id,
        city,
        neighborhoods,
        budget_min,
        budget_max,
        rooms_min,
        rooms_max,
        move_in_date,
        no_broker,
        living_type,
        max_roommates,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        city = EXCLUDED.city,
        neighborhoods = EXCLUDED.neighborhoods,
        budget_min = EXCLUDED.budget_min,
        budget_max = EXCLUDED.budget_max,
        rooms_min = EXCLUDED.rooms_min,
        rooms_max = EXCLUDED.rooms_max,
        move_in_date = EXCLUDED.move_in_date,
        no_broker = EXCLUDED.no_broker,
        living_type = EXCLUDED.living_type,
        max_roommates = EXCLUDED.max_roommates,
        updated_at = NOW()
      RETURNING *
    `,
    [
      user_id,
      payload.city,
      payload.neighborhoods,
      payload.budget_min,
      payload.budget_max,
      payload.rooms_min,
      payload.rooms_max,
      payload.move_in_date,
      payload.no_broker,
      payload.living_type,
      payload.max_roommates
    ]
  );

  return result.rows[0];
};

export const getPreferences = async (
  user_id: number
): Promise<Preferences | null> => {
  const result = await db.query<Preferences>(
    `
      SELECT *
      FROM preferences
      WHERE user_id = $1
    `,
    [user_id]
  );

  return result.rows[0] ?? null;
};
