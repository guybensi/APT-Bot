import { FlowData, FlowState, initialFlowData, nextState } from "./state";
import { getNeighborhoodOptions, promptForState, resolveCityKey } from "./prompts";
import { getUserState, upsertUserState, clearUserState } from "../../db/queries/userState";
import { getPreferences, upsertPreferences } from "../../db/queries/preferences";
import { sendText } from "../send";

const parseNumberRange = (input: string): [number, number] | null => {
  const cleaned = input.replace(/\s+/g, "");
  const parts = cleaned.split(",");
  if (parts.length !== 2) return null;
  const min = Number(parts[0]);
  const max = Number(parts[1]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return [min, max];
};

const parseDate = (input: string): Date | undefined => {
  const trimmed = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const parseYesNoMaybe = (input: string): boolean | null | undefined => {
  const trimmed = input.trim();
  if (trimmed === "כן") return true;
  if (trimmed === "לא") return false;
  if (trimmed === "לא משנה") return null;
  return undefined;
};

const parseLivingType = (input: string): "לבד" | "שותפים" | "לא משנה" | undefined => {
  const trimmed = input.trim();
  if (trimmed === "לבד" || trimmed === "שותפים" || trimmed === "לא משנה") return trimmed;
  return undefined;
};

const parseNeighborhoods = (input: string, city: string): string[] | null => {
  const options = getNeighborhoodOptions(city);
  if (options.length === 0) return null;
  const requested = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (requested.length === 0) return null;
  const invalid = requested.filter((item) => !options.includes(item));
  if (invalid.length > 0) return null;
  return requested;
};

const toFlowData = (data: Record<string, unknown>): FlowData =>
  initialFlowData({
    city: typeof data.city === "string" ? data.city : null,
    neighborhoods: Array.isArray(data.neighborhoods) ? (data.neighborhoods as string[]) : null,
    budget_min: typeof data.budget_min === "number" ? data.budget_min : null,
    budget_max: typeof data.budget_max === "number" ? data.budget_max : null,
    rooms_min: typeof data.rooms_min === "number" ? data.rooms_min : null,
    rooms_max: typeof data.rooms_max === "number" ? data.rooms_max : null,
    move_in_date: data.move_in_date ? new Date(String(data.move_in_date)) : null,
    no_broker: typeof data.no_broker === "boolean" ? data.no_broker : null,
    living_type: typeof data.living_type === "string" ? data.living_type : null,
    max_roommates: typeof data.max_roommates === "number" ? data.max_roommates : null
  });

const toPersistedData = (data: FlowData): Record<string, unknown> => ({
  ...data,
  move_in_date: data.move_in_date ? data.move_in_date.toISOString() : null
});

const applyStateInput = (
  state: FlowState,
  data: FlowData,
  input: string
): { next: FlowState; data: FlowData } | null => {
  if (state === "choose_city") {
    if (input.trim() === "דלג" && data.city) {
      return { next: nextState(state, data), data };
    }
    const trimmed = input.trim();
    if (!resolveCityKey(trimmed)) return null;
    const updated = { ...data, city: trimmed, neighborhoods: null };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "choose_neighborhoods") {
    if (!data.city) return null;
    if (input.trim() === "דלג" && data.neighborhoods?.length) {
      return { next: nextState(state, data), data };
    }
    const selected = parseNeighborhoods(input, data.city);
    if (!selected) return null;
    const updated = { ...data, neighborhoods: selected };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "budget") {
    if (input.trim() === "דלג" && data.budget_min !== null && data.budget_max !== null) {
      return { next: nextState(state, data), data };
    }
    const range = parseNumberRange(input);
    if (!range) return null;
    const [min, max] = range;
    const updated = { ...data, budget_min: min, budget_max: max };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "rooms") {
    if (input.trim() === "דלג" && data.rooms_min !== null && data.rooms_max !== null) {
      return { next: nextState(state, data), data };
    }
    const range = parseNumberRange(input);
    if (!range) return null;
    const [min, max] = range;
    const updated = { ...data, rooms_min: min, rooms_max: max };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "move_in_date") {
    if (input.trim() === "דלג") {
      const updated = { ...data, move_in_date: data.move_in_date ?? null };
      return { next: nextState(state, updated), data: updated };
    }
    const parsed = parseDate(input);
    if (!parsed) return null;
    const updated = { ...data, move_in_date: parsed };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "no_broker") {
    if (input.trim() === "דלג" && data.no_broker !== null) {
      return { next: nextState(state, data), data };
    }
    const parsed = parseYesNoMaybe(input);
    if (parsed === undefined) return null;
    const updated = { ...data, no_broker: parsed };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "living_type") {
    if (input.trim() === "דלג" && data.living_type) {
      return { next: nextState(state, data), data };
    }
    const parsed = parseLivingType(input);
    if (!parsed) return null;
    const updated = {
      ...data,
      living_type: parsed,
      max_roommates: parsed === "שותפים" ? data.max_roommates : null
    };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "max_roommates") {
    if (input.trim() === "דלג" && data.max_roommates !== null) {
      return { next: nextState(state, data), data };
    }
    const count = Number(input.trim());
    if (!Number.isFinite(count) || count < 0) return null;
    const updated = { ...data, max_roommates: count };
    return { next: nextState(state, updated), data: updated };
  }

  if (state === "confirm") {
    return { next: "confirm", data };
  }

  return null;
};

const savePreferences = async (user_id: number, data: FlowData): Promise<void> => {
  await upsertPreferences(user_id, {
    city: data.city,
    neighborhoods: data.neighborhoods,
    budget_min: data.budget_min,
    budget_max: data.budget_max,
    rooms_min: data.rooms_min,
    rooms_max: data.rooms_max,
    move_in_date: data.move_in_date,
    no_broker: data.no_broker,
    living_type: data.living_type,
    max_roommates: data.max_roommates
  });
};

export const startPreferenceFlow = async (user_id: number): Promise<string> => {
  const existing = await getPreferences(user_id);
  const seed = existing
    ? initialFlowData({
        city: existing.city,
        neighborhoods: existing.neighborhoods,
        budget_min: existing.budget_min,
        budget_max: existing.budget_max,
        rooms_min: existing.rooms_min,
        rooms_max: existing.rooms_max,
        move_in_date: existing.move_in_date,
        no_broker: existing.no_broker,
        living_type: existing.living_type,
        max_roommates: existing.max_roommates
      })
    : initialFlowData();

  await upsertUserState(user_id, "choose_city", toPersistedData(seed));
  return promptForState("choose_city", seed);
};

export const handlePreferenceFlow = async (
  user_id: number,
  message: string
): Promise<string | null> => {
  const stateRow = await getUserState(user_id);
  if (!stateRow) {
    return null;
  }

  const currentState = stateRow.state as FlowState;
  const data = toFlowData(stateRow.data ?? {});

  if (currentState === "confirm") {
    const trimmed = message.trim();
    if (trimmed === "אשר" || trimmed === "כן") {
      await savePreferences(user_id, data);
      await clearUserState(user_id);
      return "ההעדפות נשמרו בהצלחה.";
    }

    if (trimmed === "ערוך") {
      return startPreferenceFlow(user_id);
    }

    return "כדי לשמור כתוב 'אשר', או 'ערוך' כדי להתחיל מחדש.";
  }

  const applied = applyStateInput(currentState, data, message);
  if (!applied) {
    return "לא הצלחתי להבין. נסה שוב:\n" + promptForState(currentState, data);
  }

  await upsertUserState(user_id, applied.next, toPersistedData(applied.data));
  return promptForState(applied.next, applied.data);
};

export const continueOrStartFlow = async (
  user_id: number,
  message: string
): Promise<string> => {
  const existingState = await getUserState(user_id);
  if (!existingState) {
    return startPreferenceFlow(user_id);
  }
  return (await handlePreferenceFlow(user_id, message)) ?? startPreferenceFlow(user_id);
};
