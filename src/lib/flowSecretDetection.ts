export type RequiredSecretRef =
  | "API_KEY"
  | "X_API_KEY"
  | "BEARER_TOKEN"
  | "ACCESS_TOKEN"
  | "SECRET_KEY"
  | "PRIVATE_KEY"
  | "PASSWORD"
  | "TOKEN";

const PLACEHOLDER_PATTERNS = [
  /\$\{[^}]+\}/g,
  /\{\{[^}]+\}\}/g,
  /<(?:YOUR|INSERT|REPLACE)[^>]+>/gi,
] as const;

function classifyPlaceholder(raw: string): RequiredSecretRef | null {
  const value = raw.toLowerCase();

  if (/x[_-]?api[_-]?key/.test(value)) return "X_API_KEY";
  if (/api[_-]?key/.test(value)) return "API_KEY";
  if (/access[_-]?token/.test(value)) return "ACCESS_TOKEN";
  if (/private[_-]?key/.test(value)) return "PRIVATE_KEY";
  if (/secret[_-]?key|secret/.test(value)) return "SECRET_KEY";
  if (/password/.test(value)) return "PASSWORD";
  if (/bearer/.test(value)) return "BEARER_TOKEN";
  if (/token/.test(value)) return "TOKEN";

  return null;
}

export function detectSecretReferences(content?: string | null): RequiredSecretRef[] {
  if (!content || typeof content !== "string") return [];

  const found = new Set<RequiredSecretRef>();

  for (const pattern of PLACEHOLDER_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const label = classifyPlaceholder(match[0]);
      if (label) found.add(label);
    }
  }

  if (/authorization\s*:\s*bearer\s+(\$\{[^}]+\}|\{\{[^}]+\}\}|<(?:YOUR|INSERT|REPLACE)[^>]+>)/i.test(content)) {
    found.add("BEARER_TOKEN");
  }

  return Array.from(found);
}

export function getMissingSecretRefs(
  requiredRefs: RequiredSecretRef[],
  secretValues: Record<string, string>,
): RequiredSecretRef[] {
  return requiredRefs.filter((ref) => !secretValues[ref]?.trim());
}
