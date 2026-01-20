import { db } from "../client";
import { UserListing } from "../../types/db";

export const findUserListing = async (
  user_id: number,
  listing_id: number
): Promise<UserListing | null> => {
  const result = await db.query<UserListing>(
    `
      SELECT *
      FROM user_listing
      WHERE user_id = $1 AND listing_id = $2
      LIMIT 1
    `,
    [user_id, listing_id]
  );

  return result.rows[0] ?? null;
};

export const markSent = async (
  user_id: number,
  listing_id: number,
  match_score: number | null,
  unmet_criteria: string[] | null
): Promise<UserListing> => {
  const result = await db.query<UserListing>(
    `
      INSERT INTO user_listing (
        user_id,
        listing_id,
        match_score,
        unmet_criteria,
        sent_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, listing_id)
      DO UPDATE SET
        match_score = EXCLUDED.match_score,
        unmet_criteria = EXCLUDED.unmet_criteria,
        sent_at = NOW()
      RETURNING *
    `,
    [user_id, listing_id, match_score, unmet_criteria]
  );

  return result.rows[0];
};

export const setUserAction = async (
  user_id: number,
  listing_id: number,
  action: string
): Promise<UserListing> => {
  const result = await db.query<UserListing>(
    `
      UPDATE user_listing
      SET user_action = $3
      WHERE user_id = $1 AND listing_id = $2
      RETURNING *
    `,
    [user_id, listing_id, action]
  );

  return result.rows[0];
};
