import { db } from "../client";
import { Listing, ListingInsertPayload } from "../../types/db";

export const insertListingIfNew = async (
  listing: ListingInsertPayload
): Promise<Listing | null> => {
  const result = await db.query<Listing>(
    `
      INSERT INTO listings (
        source,
        external_id,
        url,
        title,
        content,
        price,
        city,
        neighborhood,
        posted_at,
        first_seen_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      ON CONFLICT (source, url)
      DO NOTHING
      RETURNING *
    `,
    [
      listing.source,
      listing.external_id,
      listing.url,
      listing.title,
      listing.content,
      listing.price,
      listing.city,
      listing.neighborhood,
      listing.posted_at,
      listing.first_seen_at
    ]
  );

  return result.rows[0] ?? null;
};

export const findListingBySourceUrl = async (
  source: string,
  url: string
): Promise<Listing | null> => {
  const result = await db.query<Listing>(
    `
      SELECT *
      FROM listings
      WHERE source = $1 AND url = $2
      LIMIT 1
    `,
    [source, url]
  );

  return result.rows[0] ?? null;
};
