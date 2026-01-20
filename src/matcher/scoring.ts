import { Listing, Preferences } from "../types/db";
import { evaluateRules } from "./rules";

export type MatchScoreResult = {
  score: number;
  unmetCriteria: string[];
};

export const scoreListing = (
  listing: Listing,
  preferences: Preferences
): MatchScoreResult => {
  const results = evaluateRules(listing, preferences).filter((result) => result.applicable);
  if (results.length === 0) {
    return { score: 0, unmetCriteria: [] };
  }

  const matched = results.filter((result) => result.matched);
  const unmetCriteria = results.filter((result) => !result.matched).map((result) => result.label);
  const score = matched.length / results.length;

  return { score, unmetCriteria };
};
