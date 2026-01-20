import { Listing, Preferences } from "../types/db";

export type MatchRuleResult = {
  key: string;
  label: string;
  applicable: boolean;
  matched: boolean;
};

export const evaluateRules = (listing: Listing, preferences: Preferences): MatchRuleResult[] => {
  const results: MatchRuleResult[] = [];

  if (preferences.city && listing.city) {
    results.push({
      key: "city",
      label: "עיר",
      applicable: true,
      matched: listing.city === preferences.city
    });
  }

  if (preferences.neighborhoods?.length && listing.neighborhood) {
    results.push({
      key: "neighborhood",
      label: "שכונה",
      applicable: true,
      matched: preferences.neighborhoods.includes(listing.neighborhood)
    });
  }

  if (preferences.budget_min !== null || preferences.budget_max !== null) {
    const min = preferences.budget_min ?? Number.NEGATIVE_INFINITY;
    const max = preferences.budget_max ?? Number.POSITIVE_INFINITY;
    const matched = listing.price === null ? true : listing.price >= min && listing.price <= max;
    results.push({
      key: "budget",
      label: "תקציב",
      applicable: true,
      matched
    });
  }

  return results;
};
