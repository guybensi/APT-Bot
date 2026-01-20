import { getActiveUsersWithPreferences } from "../db/queries/users";
import { insertListingIfNew } from "../db/queries/listings";
import { findUserListing, markSent } from "../db/queries/userListing";
import { startCollectorRun, finishCollectorRun } from "../db/queries/collectorRuns";
import { scoreListing } from "../matcher/scoring";
import { ListingInsertPayload } from "../types/db";
import { sendText } from "../whatsapp/send";
import { decryptPhone } from "../security/crypto";

const HOUR_MS = 60 * 60 * 1000;
const MIN_SCORE = 0.75;

const sourceLabel = (source: string): string => {
  if (source === "yad2") return "יד2";
  if (source === "facebook") return "פייסבוק";
  return source;
};

const buildMatchMessage = (
  source: string,
  url: string,
  unmetCriteria: string[]
): string => {
  const unmet =
    unmetCriteria.length > 0
      ? `קריטריונים שלא התאימו: ${unmetCriteria.join(", ")}`
      : "כל הקריטריונים התאימו.";

  return [
    "מצאנו דירה חדשה שמתאימה לך!",
    `מקור: ${sourceLabel(source)}`,
    `קישור: ${url}`,
    unmet
  ].join("\n");
};

const collectYad2Listings = async (): Promise<ListingInsertPayload[]> => {
  return [];
};

const collectFacebookListings = async (): Promise<ListingInsertPayload[]> => {
  return [];
};

const runCollector = async (
  collector: string,
  collectFn: () => Promise<ListingInsertPayload[]>
): Promise<ListingInsertPayload[]> => {
  const run = await startCollectorRun(collector);
  try {
    const listings = await collectFn();
    await finishCollectorRun(run.id, "success", null);
    return listings;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await finishCollectorRun(run.id, "failed", message);
    return [];
  }
};

const matchAndSend = async (
  users: Awaited<ReturnType<typeof getActiveUsersWithPreferences>>,
  listings: ListingInsertPayload[]
): Promise<void> => {
  for (const listingPayload of listings) {
    const listing = await insertListingIfNew(listingPayload);
    if (!listing) continue;

    for (const { user, preferences } of users) {
      const { score, unmetCriteria } = scoreListing(listing, preferences);
      if (score < MIN_SCORE) continue;

      const existing = await findUserListing(user.id, listing.id);
      if (existing) continue;

      const message = buildMatchMessage(listing.source, listing.url, unmetCriteria);
      try {
        const to = decryptPhone(user.phone_encrypted);
        await sendText(to, message);
        await markSent(user.id, listing.id, score, unmetCriteria);
      } catch {
        // Skip failures to avoid blocking the pipeline.
      }
    }
  }
};

export const runMatchingPipeline = async (): Promise<void> => {
  const users = await getActiveUsersWithPreferences();

  const [yad2Listings, facebookListings] = await Promise.all([
    runCollector("yad2", collectYad2Listings),
    runCollector("facebook", collectFacebookListings)
  ]);

  await matchAndSend(users, [...yad2Listings, ...facebookListings]);
};

export const startScheduler = (): void => {
  void runMatchingPipeline();
  setInterval(() => {
    void runMatchingPipeline();
  }, HOUR_MS);
};
