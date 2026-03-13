/**
 * Sovereign Block: Media Carousel
 * WhatsApp: One image/video per message, no carousel.
 * WAKA: Horizontal swipeable carousel with lazy loading, captions, CTAs.
 * Zero-rated: text-only list with optional thumbnail toggle.
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Download, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface MediaSlide {
  id: string;
  type: "image" | "video";
  /** URL or emoji placeholder */
  src?: string;
  emoji?: string;
  caption?: string;
  cta?: string;
  duration?: string;
}

interface MediaCarouselProps {
  slides: MediaSlide[];
  title?: string;
  onSlideAction?: (slide: MediaSlide) => void;
}

function LazyMedia({ slide, visible }: { slide: MediaSlide; visible: boolean }) {
  const [loaded, setLoaded] = useState(false);

  if (!visible) return null;

  if (slide.src && slide.type === "image") {
    return (
      <div className="relative h-full w-full">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(160,20%,94%)]">
            <ImageIcon className="h-6 w-6 text-[hsl(160,30%,70%)] animate-pulse" />
          </div>
        )}
        <img
          src={slide.src}
          alt={slide.caption || ""}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn("h-full w-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        />
      </div>
    );
  }

  // Emoji placeholder or video placeholder
  return (
    <div
      className="h-full w-full flex items-center justify-center relative"
      style={{ background: "linear-gradient(135deg, hsl(160,25%,92%), hsl(200,20%,90%))" }}
    >
      <span className="text-5xl">{slide.emoji || (slide.type === "video" ? "🎬" : "🖼")}</span>
      {slide.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
            <Play className="h-4 w-4 text-[hsl(160,55%,35%)] ml-0.5" />
          </div>
          {slide.duration && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
              {slide.duration}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function MediaCarousel({ slides, title, onSlideAction }: MediaCarouselProps) {
  const mode = useDataMode();
  const [activeIdx, setActiveIdx] = useState(0);
  const [showThumbs, setShowThumbs] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const canPrev = activeIdx > 0;
  const canNext = activeIdx < slides.length - 1;

  // Zero-rated: text-only list with optional thumbnail toggle
  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        {title && <p className="text-[11px] font-bold text-[hsl(160,50%,25%)] mb-1">{title}</p>}
        <button
          onClick={() => setShowThumbs(!showThumbs)}
          className="flex items-center gap-1 text-[9px] text-[hsl(160,50%,40%)] mb-1"
        >
          {showThumbs ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
          {showThumbs ? "Masquer médias" : "Afficher médias"}
        </button>
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSlideAction?.(s)}
            className="flex items-center gap-2 w-full py-1 text-left border-t border-[hsl(160,20%,92%)] first:border-0"
          >
            {showThumbs && (
              <div className="h-8 w-8 rounded bg-[hsl(160,20%,93%)] flex items-center justify-center flex-shrink-0 text-sm">
                {s.emoji || (s.type === "video" ? "▶" : "🖼")}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[hsl(220,15%,20%)]">
                {s.type === "video" ? "▶" : "🖼"} {s.caption || `Média ${i + 1}`}
              </span>
              {s.duration && <span className="text-[9px] text-[hsl(220,10%,60%)] ml-1">({s.duration})</span>}
            </div>
            {s.cta && <span className="text-[9px] text-[hsl(160,60%,30%)] font-medium">→</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[90%]">
      {title && (
        <p className="text-[12px] font-bold text-[hsl(160,50%,25%)] mb-1.5 px-1">{title}</p>
      )}

      <div className="relative rounded-xl overflow-hidden border border-[hsl(160,30%,88%)] bg-white shadow-sm">
        {/* Main viewport */}
        <div className="relative h-40 overflow-hidden">
          <motion.div
            ref={trackRef}
            className="flex h-full"
            animate={{ x: `-${activeIdx * 100}%` }}
            transition={mode === "libre"
              ? { type: "spring", stiffness: 300, damping: 30 }
              : { duration: 0.2 }
            }
          >
            {slides.map((slide, i) => (
              <div key={slide.id} className="flex-shrink-0 w-full h-full">
                <LazyMedia slide={slide} visible={Math.abs(i - activeIdx) <= 1} />
              </div>
            ))}
          </motion.div>

          {/* Nav arrows */}
          {canPrev && (
            <button
              onClick={() => setActiveIdx(activeIdx - 1)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/85 shadow flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-[hsl(220,15%,25%)]" />
            </button>
          )}
          {canNext && (
            <button
              onClick={() => setActiveIdx(activeIdx + 1)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/85 shadow flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronRight className="h-3.5 w-3.5 text-[hsl(220,15%,25%)]" />
            </button>
          )}

          {/* Slide counter */}
          <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {activeIdx + 1}/{slides.length}
          </div>
        </div>

        {/* Caption & CTA */}
        {(slides[activeIdx]?.caption || slides[activeIdx]?.cta) && (
          <div className="px-3 py-2">
            {slides[activeIdx].caption && (
              <p className="text-[12px] text-[hsl(220,15%,20%)] leading-snug">{slides[activeIdx].caption}</p>
            )}
            {slides[activeIdx].cta && (
              <button
                onClick={() => onSlideAction?.(slides[activeIdx])}
                className="mt-1.5 w-full py-1.5 rounded-lg bg-[hsl(160,55%,38%)] text-white text-[11px] font-semibold hover:bg-[hsl(160,55%,42%)] transition-colors active:scale-[0.98]"
              >
                {slides[activeIdx].cta}
              </button>
            )}
          </div>
        )}

        {/* Dot indicators */}
        <div className="flex justify-center gap-1 pb-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIdx ? "w-4 bg-[hsl(160,55%,40%)]" : "w-1.5 bg-[hsl(220,10%,80%)]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
