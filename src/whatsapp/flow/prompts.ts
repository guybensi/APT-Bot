import neighborhoods from "../../../data/neighborhoods.json";
import { FlowData, FlowState } from "./state";

const CITY_LABELS = ["תל אביב", "גבעתיים", "רמת גן", "יפו"] as const;
const CITY_KEY_BY_LABEL: Record<(typeof CITY_LABELS)[number], keyof typeof neighborhoods> = {
  "תל אביב": "tel_aviv",
  גבעתיים: "givatayim",
  "רמת גן": "ramat_gan",
  יפו: "yafo"
};

export const resolveCityKey = (label: string): keyof typeof neighborhoods | null =>
  (CITY_KEY_BY_LABEL as Record<string, keyof typeof neighborhoods>)[label] ?? null;

export const getCityLabels = (): string[] => [...CITY_LABELS];

export const getNeighborhoodOptions = (cityLabel: string): string[] => {
  const key = resolveCityKey(cityLabel);
  return key ? neighborhoods[key] : [];
};

const formatList = (items: string[]): string => items.map((item) => `- ${item}`).join("\n");
const withSkipHint = (text: string, hasDefault: boolean): string =>
  hasDefault ? `${text}\nאפשר גם 'דלג' כדי להשאיר את הערך הקודם.` : text;

export const promptForState = (state: FlowState, data: FlowData): string => {
  switch (state) {
    case "choose_city":
      return withSkipHint(
        ["באיזו עיר תרצה לחפש?", formatList(getCityLabels())].join("\n"),
        Boolean(data.city)
      );
    case "choose_neighborhoods":
      return withSkipHint(
        [
          "בחר שכונות מתוך הרשימה (אפשר כמה, מופרד בפסיקים):",
          formatList(getNeighborhoodOptions(data.city ?? ""))
        ].join("\n"),
        Boolean(data.neighborhoods?.length)
      );
    case "budget":
      return withSkipHint(
        "מה טווח התקציב? שלח מינימום ומקסימום (לדוגמה: 4000,6000)",
        data.budget_min !== null && data.budget_max !== null
      );
    case "rooms":
      return withSkipHint(
        "מה טווח החדרים? שלח מינימום ומקסימום (לדוגמה: 2,3)",
        data.rooms_min !== null && data.rooms_max !== null
      );
    case "move_in_date":
      return withSkipHint("מה תאריך הכניסה? (YYYY-MM-DD) או 'דלג'", true);
    case "no_broker":
      return withSkipHint("ללא תיווך? כן / לא / לא משנה", data.no_broker !== null);
    case "living_type":
      return withSkipHint("איך תרצה לגור? לבד / שותפים / לא משנה", Boolean(data.living_type));
    case "max_roommates":
      return withSkipHint("כמה שותפים מקסימום?", data.max_roommates !== null);
    case "confirm":
      return [
        "אלו ההעדפות שלך:",
        formatSummary(data),
        "אם זה נכון כתוב 'אשר' כדי לשמור, או 'ערוך' כדי להתחיל מחדש."
      ].join("\n");
    default:
      return "בוא נתחיל מחדש. כתוב עיר מתוך הרשימה.";
  }
};

export const formatSummary = (data: FlowData): string => {
  const parts: string[] = [];
  if (data.city) parts.push(`עיר: ${data.city}`);
  if (data.neighborhoods?.length) parts.push(`שכונות: ${data.neighborhoods.join(", ")}`);
  if (data.budget_min !== null || data.budget_max !== null) {
    parts.push(`תקציב: ${data.budget_min ?? "?"} - ${data.budget_max ?? "?"}`);
  }
  if (data.rooms_min !== null || data.rooms_max !== null) {
    parts.push(`חדרים: ${data.rooms_min ?? "?"} - ${data.rooms_max ?? "?"}`);
  }
  if (data.move_in_date) {
    parts.push(`תאריך כניסה: ${data.move_in_date.toISOString().slice(0, 10)}`);
  }
  if (data.no_broker !== null) {
    parts.push(`ללא תיווך: ${data.no_broker ? "כן" : "לא"}`);
  }
  if (data.living_type) {
    parts.push(`סוג מגורים: ${data.living_type}`);
  }
  if (data.max_roommates !== null) {
    parts.push(`מספר שותפים מקס': ${data.max_roommates}`);
  }
  return parts.join("\n");
};
