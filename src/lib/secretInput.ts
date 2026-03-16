export function normalizeSecretValue(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, "").trim();
}
