export const normalizePhone = (input: string): string => {
  const normalized = input.replace(/[\s-]+/g, "");
  if (!normalized.startsWith("+")) {
    throw new Error("Phone number must be in E.164 format (start with +)");
  }
  if (normalized.length < 2) {
    throw new Error("Phone number is too short");
  }
  return normalized;
};
