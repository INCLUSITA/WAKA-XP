import { Node } from "@xyflow/react";

const MYMEMORY_API = "https://api.mymemory.translated.net/get";

export const SUPPORTED_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "tr", label: "Türkçe" },
  { code: "uk", label: "Українська" },
  { code: "ca", label: "Català" },
];

async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return text;
  // Don't translate variables like @contact.name, @input.text, etc.
  if (text.startsWith("@")) return text;

  // Extract variables, translate surrounding text, then reinsert
  const varPattern = /@[\w.()]+/g;
  const vars: { match: string; index: number }[] = [];
  let match;
  while ((match = varPattern.exec(text)) !== null) {
    vars.push({ match: match[0], index: match.index });
  }

  // Replace variables with placeholders before translation
  let processedText = text;
  const placeholders: string[] = [];
  vars.forEach((v, i) => {
    const placeholder = `__VAR${i}__`;
    placeholders.push(placeholder);
    processedText = processedText.replace(v.match, placeholder);
  });

  try {
    const res = await fetch(
      `${MYMEMORY_API}?q=${encodeURIComponent(processedText)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    let translated = data.responseData?.translatedText || processedText;

    // Restore variables
    vars.forEach((v, i) => {
      translated = translated.replace(placeholders[i], v.match);
      // Also handle case where API might uppercase the placeholder
      translated = translated.replace(placeholders[i].toUpperCase(), v.match);
      translated = translated.replace(placeholders[i].toLowerCase(), v.match);
    });

    return translated;
  } catch {
    return text;
  }
}

export interface TranslationProgress {
  current: number;
  total: number;
  currentText: string;
}

export async function translateFlowNodes(
  nodes: Node[],
  fromLang: string,
  toLang: string,
  onProgress?: (progress: TranslationProgress) => void
): Promise<Node[]> {
  // Collect all translatable strings
  const tasks: { nodeIndex: number; key: string; arrayIndex?: number; text: string }[] = [];

  nodes.forEach((node, nodeIndex) => {
    const data = node.data as Record<string, any>;

    switch (node.type) {
      case "sendMsg": {
        if (data.text?.trim()) {
          tasks.push({ nodeIndex, key: "text", text: data.text });
        }
        (data.quick_replies || []).forEach((r: string, i: number) => {
          if (r.trim()) {
            tasks.push({ nodeIndex, key: "quick_replies", arrayIndex: i, text: r });
          }
        });
        break;
      }
      case "waitResponse": {
        if (data.label?.trim()) {
          tasks.push({ nodeIndex, key: "label", text: data.label });
        }
        (data.categories || []).forEach((c: string, i: number) => {
          if (c.trim()) {
            tasks.push({ nodeIndex, key: "categories", arrayIndex: i, text: c });
          }
        });
        break;
      }
      // splitExpression: operand is code (@input.text), don't translate
      // webhook: URL, method, body are code/config, don't translate
    }
  });

  if (tasks.length === 0) return nodes;

  // Translate in batches to avoid rate limiting
  const translatedNodes = nodes.map((n) => ({
    ...n,
    data: { ...(n.data as Record<string, any>) },
  }));

  // Deep copy arrays that will be modified
  translatedNodes.forEach((n) => {
    const data = n.data as Record<string, any>;
    if (data.quick_replies) data.quick_replies = [...data.quick_replies];
    if (data.categories) data.categories = [...data.categories];
  });

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    onProgress?.({ current: i + 1, total: tasks.length, currentText: task.text.slice(0, 50) });

    const translated = await translateText(task.text, fromLang, toLang);
    const nodeData = translatedNodes[task.nodeIndex].data as Record<string, any>;

    if (task.arrayIndex !== undefined) {
      nodeData[task.key][task.arrayIndex] = translated;
    } else {
      nodeData[task.key] = translated;
    }

    // Small delay to respect rate limits
    if (i < tasks.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return translatedNodes;
}
