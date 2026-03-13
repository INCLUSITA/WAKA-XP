/**
 * Sovereign Block: Rating / Feedback Widget
 * WhatsApp: NOT POSSIBLE inline.
 * WAKA: Star ratings, NPS, emoji reactions — all inline in chat.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

interface RatingWidgetProps {
  title: string;
  type?: "stars" | "emoji" | "nps";
  onRate?: (value: number | string) => void;
}

const EMOJI_SCALE = ["😠", "😕", "😐", "😊", "🤩"];

export function RatingWidget({ title, type = "stars", onRate }: RatingWidgetProps) {
  const mode = useDataMode();
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = (val: number | string) => {
    if (typeof val === "number") setRating(val);
    setSubmitted(true);
    onRate?.(val);
  };

  if (submitted) {
    const W = mode === "zero-rated" ? "div" : motion.div;
    return (
      <W
        {...(mode !== "zero-rated" ? { initial: { scale: 0.9 }, animate: { scale: 1 } } : {})}
        className="rounded-xl border border-[hsl(160,50%,75%)] bg-[hsl(160,40%,96%)] px-3 py-2.5 max-w-[85%] flex items-center gap-2"
      >
        <div className="h-5 w-5 rounded-full bg-[hsl(160,55%,40%)] flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
        <p className="text-[11px] font-medium text-[hsl(160,50%,28%)]">
          Merci pour votre avis !
          {rating != null && type === "stars" && ` (${rating}/5 ⭐)`}
        </p>
      </W>
    );
  }

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[85%]">
        <p className="text-[11px] font-bold text-[hsl(160,50%,25%)] mb-1">{title}</p>
        <div className="flex gap-2">
          {(type === "emoji" ? EMOJI_SCALE : ["1", "2", "3", "4", "5"]).map((v, i) => (
            <button
              key={i}
              onClick={() => submit(type === "emoji" ? v : i + 1)}
              className="text-[14px] active:scale-90"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 8 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[85%]"
    >
      <div className="px-3 py-2.5 bg-[hsl(160,40%,96%)] border-b border-[hsl(160,25%,90%)]">
        <p className="text-[12px] font-bold text-[hsl(160,50%,25%)]">{title}</p>
      </div>

      <div className="px-3 py-3">
        {type === "stars" && (
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => submit(s)}
                whileTap={mode === "libre" ? { scale: 1.4 } : {}}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    s <= (hoveredStar ?? 0)
                      ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]"
                      : "text-[hsl(220,10%,80%)]"
                  )}
                />
              </motion.button>
            ))}
          </div>
        )}

        {type === "emoji" && (
          <div className="flex items-center justify-center gap-3">
            {EMOJI_SCALE.map((emoji, i) => (
              <motion.button
                key={i}
                onClick={() => submit(emoji)}
                whileHover={mode === "libre" ? { scale: 1.3 } : {}}
                whileTap={{ scale: 0.9 }}
                className="text-2xl"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        )}

        {type === "nps" && (
          <div className="space-y-1.5">
            <div className="flex gap-1 justify-center flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => submit(i)}
                  className={cn(
                    "h-7 w-7 rounded-lg text-[11px] font-bold border transition-all",
                    i <= 6
                      ? "border-[hsl(350,60%,70%)] text-[hsl(350,60%,50%)] hover:bg-[hsl(350,60%,95%)]"
                      : i <= 8
                      ? "border-[hsl(45,60%,70%)] text-[hsl(45,60%,45%)] hover:bg-[hsl(45,60%,95%)]"
                      : "border-[hsl(160,50%,65%)] text-[hsl(160,55%,35%)] hover:bg-[hsl(160,40%,96%)]"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[8px] text-[hsl(350,50%,55%)]">Pas du tout</span>
              <span className="text-[8px] text-[hsl(160,50%,40%)]">Très probable</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
