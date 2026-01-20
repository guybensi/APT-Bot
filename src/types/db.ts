export type UserStatus = "active" | "inactive" | "pending" | "blocked";

export interface User {
  id: number;
  phone_hash: string;
  phone_encrypted: string;
  is_opted_in: boolean;
  status: UserStatus | string;
  created_at: Date;
}

export interface Preferences {
  user_id: number;
  city: string | null;
  neighborhoods: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  rooms_min: number | null;
  rooms_max: number | null;
  move_in_date: Date | null;
  no_broker: boolean | null;
  living_type: string | null;
  max_roommates: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Listing {
  id: number;
  source: string;
  external_id: string | null;
  url: string;
  title: string | null;
  content: string | null;
  price: number | null;
  city: string | null;
  neighborhood: string | null;
  posted_at: Date | null;
  first_seen_at: Date | null;
}

export interface UserListing {
  user_id: number;
  listing_id: number;
  match_score: number | null;
  unmet_criteria: string[] | null;
  sent_at: Date | null;
  user_action: string | null;
}

export interface CollectorRun {
  id: number;
  collector: string;
  status: string;
  error_message: string | null;
  started_at: Date;
  finished_at: Date | null;
}

export interface UserState {
  user_id: number;
  state: string;
  data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface PreferencesUpsertPayload {
  city: string | null;
  neighborhoods: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  rooms_min: number | null;
  rooms_max: number | null;
  move_in_date: Date | null;
  no_broker: boolean | null;
  living_type: string | null;
  max_roommates: number | null;
}

export interface ListingInsertPayload {
  source: string;
  external_id: string | null;
  url: string;
  title: string | null;
  content: string | null;
  price: number | null;
  city: string | null;
  neighborhood: string | null;
  posted_at: Date | null;
  first_seen_at: Date | null;
}

export interface UserWithPreferences {
  user: User;
  preferences: Preferences;
}
