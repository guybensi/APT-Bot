import { db } from "../client";
import { Preferences, User, UserWithPreferences } from "../../types/db";

export const upsertUserByPhoneHash = async (
  phone_hash: string,
  phone_encrypted: string
): Promise<User> => {
  const result = await db.query<User>(
    `
      INSERT INTO users (phone_hash, phone_encrypted)
      VALUES ($1, $2)
      ON CONFLICT (phone_hash)
      DO UPDATE SET phone_encrypted = EXCLUDED.phone_encrypted
      RETURNING *
    `,
    [phone_hash, phone_encrypted]
  );

  return result.rows[0];
};

export const setOptIn = async (
  user_id: number,
  is_opted_in: boolean,
  status: string
): Promise<User> => {
  const result = await db.query<User>(
    `
      UPDATE users
      SET is_opted_in = $2,
          status = $3
      WHERE id = $1
      RETURNING *
    `,
    [user_id, is_opted_in, status]
  );

  return result.rows[0];
};

export const getActiveUsersWithPreferences = async (): Promise<
  UserWithPreferences[]
> => {
  const result = await db.query<
    User & Preferences & { preferences_created_at: Date; preferences_updated_at: Date }
  >(
    `
      SELECT
        u.*,
        p.user_id AS preferences_user_id,
        p.city AS preferences_city,
        p.neighborhoods AS preferences_neighborhoods,
        p.budget_min AS preferences_budget_min,
        p.budget_max AS preferences_budget_max,
        p.rooms_min AS preferences_rooms_min,
        p.rooms_max AS preferences_rooms_max,
        p.move_in_date AS preferences_move_in_date,
        p.no_broker AS preferences_no_broker,
        p.living_type AS preferences_living_type,
        p.max_roommates AS preferences_max_roommates,
        p.created_at AS preferences_created_at,
        p.updated_at AS preferences_updated_at
      FROM users u
      INNER JOIN preferences p ON p.user_id = u.id
      WHERE u.is_opted_in = TRUE
        AND u.status = 'active'
    `
  );

  return result.rows.map((row) => ({
    user: {
      id: row.id,
      phone_hash: row.phone_hash,
      phone_encrypted: row.phone_encrypted,
      is_opted_in: row.is_opted_in,
      status: row.status,
      created_at: row.created_at
    },
    preferences: {
      user_id: row.preferences_user_id,
      city: row.preferences_city,
      neighborhoods: row.preferences_neighborhoods,
      budget_min: row.preferences_budget_min,
      budget_max: row.preferences_budget_max,
      rooms_min: row.preferences_rooms_min,
      rooms_max: row.preferences_rooms_max,
      move_in_date: row.preferences_move_in_date,
      no_broker: row.preferences_no_broker,
      living_type: row.preferences_living_type,
      max_roommates: row.preferences_max_roommates,
      created_at: row.preferences_created_at,
      updated_at: row.preferences_updated_at
    }
  }));
};
