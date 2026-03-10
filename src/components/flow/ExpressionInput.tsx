import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Suggestion {
  value: string;
  label: string;
  category: string;
}

const BASE_SUGGESTIONS: Suggestion[] = [
  // Input
  { value: "@input.text", label: "input.text", category: "Input" },
  { value: "@input.attachments", label: "input.attachments", category: "Input" },
  // Contact
  { value: "@contact.name", label: "contact.name", category: "Contact" },
  { value: "@contact.first_name", label: "contact.first_name", category: "Contact" },
  { value: "@contact.language", label: "contact.language", category: "Contact" },
  { value: "@contact.channel", label: "contact.channel", category: "Contact" },
  { value: "@contact.uuid", label: "contact.uuid", category: "Contact" },
  { value: "@contact.urn", label: "contact.urn", category: "Contact" },
  { value: "@contact.groups", label: "contact.groups", category: "Contact" },
  { value: "@contact.created_on", label: "contact.created_on", category: "Contact" },
  // Webhook
  { value: "@webhook.status", label: "webhook.status", category: "Webhook" },
  { value: "@webhook.json", label: "webhook.json", category: "Webhook" },
  // URNs
  { value: "@urns.whatsapp", label: "urns.whatsapp", category: "URNs" },
  // Functions
  { value: "@(upper())", label: "upper()", category: "Functions" },
  { value: "@(lower())", label: "lower()", category: "Functions" },
  { value: "@(default(, \"\"))", label: "default(value, fallback)", category: "Functions" },
  { value: "@(parse_json())", label: "parse_json()", category: "Functions" },
  { value: "@(field(, 0, \",\"))", label: "field(value, index, sep)", category: "Functions" },
];

interface ExpressionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  /** Dynamic result names from the flow context */
  resultNames?: string[];
}

export function ExpressionInput({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
  resultNames = [],
}: ExpressionInputProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Build suggestions including dynamic results
  const allSuggestions: Suggestion[] = [
    ...BASE_SUGGESTIONS,
    ...resultNames.map((name) => ({
      value: `@results.${name}`,
      label: `results.${name}`,
      category: "Results",
    })),
  ];

  const filtered = filter
    ? allSuggestions.filter((s) =>
        s.value.toLowerCase().includes(filter.toLowerCase()) ||
        s.label.toLowerCase().includes(filter.toLowerCase())
      )
    : allSuggestions;

  // Find the @ trigger position working backwards from cursor
  const getAtContext = useCallback((text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) return null;
    // Don't trigger if there's a space between @ and cursor (except for @( functions)
    const fragment = before.slice(atIdx + 1);
    if (fragment.includes(" ") && !fragment.startsWith("(")) return null;
    return { atIdx, fragment };
  }, []);

  const handleInput = useCallback(
    (newValue: string, newCursor: number) => {
      onChange(newValue);
      setCursorPos(newCursor);
      const ctx = getAtContext(newValue, newCursor);
      if (ctx) {
        setFilter(ctx.fragment);
        setOpen(true);
        setSelectedIdx(0);
      } else {
        setOpen(false);
      }
    },
    [onChange, getAtContext]
  );

  const insertSuggestion = useCallback(
    (suggestion: Suggestion) => {
      const ctx = getAtContext(value, cursorPos);
      if (!ctx) return;
      const before = value.slice(0, ctx.atIdx);
      const after = value.slice(cursorPos);
      const newValue = before + suggestion.value + after;
      const newCursor = before.length + suggestion.value.length;
      onChange(newValue);
      setOpen(false);
      // Restore focus
      setTimeout(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(newCursor, newCursor);
        }
      }, 0);
    },
    [value, cursorPos, onChange, getAtContext]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (open && filtered.length > 0) {
        e.preventDefault();
        insertSuggestion(filtered[selectedIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const item = menuRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx, open]);

  const sharedProps = {
    value,
    placeholder,
    onKeyDown: handleKeyDown,
    ref: inputRef as any,
    className: cn("font-mono text-sm", className),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInput(e.target.value, e.target.selectionStart || 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setCursorPos(target.selectionStart || 0);
    const ctx = getAtContext(target.value, target.selectionStart || 0);
    if (ctx) {
      setFilter(ctx.fragment);
      setOpen(true);
      setSelectedIdx(0);
    }
  };

  // Group filtered results by category
  const grouped = filtered.reduce<Record<string, Suggestion[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const categoryOrder = ["Input", "Contact", "Results", "Webhook", "URNs", "Functions"];

  return (
    <div className="relative">
      {multiline ? (
        <Textarea
          {...sharedProps}
          onChange={handleChange}
          onClick={handleClick}
        />
      ) : (
        <Input
          {...sharedProps}
          onChange={handleChange}
          onClick={handleClick}
        />
      )}
      {open && filtered.length > 0 && (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[220px] overflow-y-auto rounded-lg border border-border bg-popover shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          {categoryOrder
            .filter((cat) => grouped[cat])
            .map((cat) => (
              <div key={cat}>
                <div className="sticky top-0 bg-popover px-2.5 pt-1.5 pb-0.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {cat}
                  </span>
                </div>
                {grouped[cat].map((s) => {
                  const globalIdx = filtered.indexOf(s);
                  return (
                    <button
                      key={s.value}
                      data-idx={globalIdx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertSuggestion(s);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-2.5 py-1 text-left text-[12px] transition-colors",
                        globalIdx === selectedIdx
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground/80 hover:bg-muted/80"
                      )}
                    >
                      <span className="text-primary/70 font-mono text-[11px]">@</span>
                      <span className="font-mono">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
