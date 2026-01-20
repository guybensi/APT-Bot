import { normalizePhone } from "../security/normalizePhone";
import { phoneHash } from "../security/hash";
import { encryptPhone } from "../security/crypto";
import { upsertUserByPhoneHash, setOptIn } from "../db/queries/users";
import { getPreferences } from "../db/queries/preferences";
import { sendText } from "./send";
import { continueOrStartFlow, handlePreferenceFlow, startPreferenceFlow } from "./flow/handler";

type IncomingMessage = {
  from: string;
  text: string;
};

const toE164 = (waId: string): string => {
  const withPlus = waId.startsWith("+") ? waId : `+${waId}`;
  return normalizePhone(withPlus);
};

const buildPreferencesSummary = (
  summary: Awaited<ReturnType<typeof getPreferences>>
): string => {
  if (!summary) {
    return "אין העדפות שמורות כרגע.";
  }

  const parts: string[] = [];
  if (summary.city) parts.push(`עיר: ${summary.city}`);
  if (summary.neighborhoods?.length) parts.push(`שכונות: ${summary.neighborhoods.join(", ")}`);
  if (summary.budget_min || summary.budget_max) {
    parts.push(`תקציב: ${summary.budget_min ?? "?"} - ${summary.budget_max ?? "?"}`);
  }
  if (summary.rooms_min || summary.rooms_max) {
    parts.push(`חדרים: ${summary.rooms_min ?? "?"} - ${summary.rooms_max ?? "?"}`);
  }
  if (summary.move_in_date) {
    parts.push(`תאריך כניסה: ${summary.move_in_date.toISOString().slice(0, 10)}`);
  }
  if (summary.no_broker !== null) {
    parts.push(`ללא תיווך: ${summary.no_broker ? "כן" : "לא"}`);
  }
  if (summary.living_type) {
    parts.push(`סוג מגורים: ${summary.living_type}`);
  }
  if (summary.max_roommates !== null) {
    parts.push(`מספר שותפים מקס': ${summary.max_roommates}`);
  }

  return parts.length ? parts.join("\n") : "אין העדפות שמורות כרגע.";
};

export const handleIncomingMessage = async (message: IncomingMessage): Promise<void> => {
  const e164 = toE164(message.from);
  const hashed = phoneHash(e164);
  const encrypted = encryptPhone(e164);

  const user = await upsertUserByPhoneHash(hashed, encrypted);

  const command = message.text.trim().toUpperCase();
  if (command === "STOP") {
    await setOptIn(user.id, false, "stopped");
    await sendText(message.from, "הוסרת מהרשימה. אם תרצה להצטרף שוב, שלח הודעה.");
    return;
  }

  if (message.text.trim() === "סטטוס") {
    const preferences = await getPreferences(user.id);
    const summary = buildPreferencesSummary(preferences);
    await sendText(message.from, summary);
    return;
  }

  if (message.text.trim() === "ערוך") {
    const prompt = await startPreferenceFlow(user.id);
    await sendText(message.from, prompt);
    return;
  }

  const flowResponse = await handlePreferenceFlow(user.id, message.text);
  if (flowResponse) {
    await sendText(message.from, flowResponse);
    return;
  }

  const startPrompt = await continueOrStartFlow(user.id, message.text);
  await sendText(message.from, startPrompt);
};
