import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer2, ArrowRight, ChevronRight, Sparkles } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  /** CSS position for the spotlight/pointer */
  target: { top: string; left: string; width: string; height: string };
  /** Where the tooltip card appears */
  tooltip: { top?: string; bottom?: string; left?: string; right?: string };
  /** Direction the hand points */
  pointerDirection: "left" | "right" | "down" | "up";
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "scenarios",
    title: "1. Choisissez un scénario",
    description: "Sélectionnez un cas d'usage à gauche : GSM→Money, Réactivation, Fibre, Agents ou Lead Capture.",
    target: { top: "60px", left: "0", width: "282px", height: "calc(100% - 60px)" },
    tooltip: { top: "120px", left: "296px" },
    pointerDirection: "left",
    icon: "👈",
  },
  {
    id: "launch",
    title: "2. Lancez la démo",
    description: "Cliquez sur « ▶ Lancer la Démo Complète » pour démarrer la simulation WhatsApp.",
    target: { top: "60px", left: "calc(100% - 268px)", width: "268px", height: "80px" },
    tooltip: { top: "160px", right: "280px" },
    pointerDirection: "right",
    icon: "👉",
  },
  {
    id: "phone",
    title: "3. Suivez la conversation",
    description: "Regardez la simulation WhatsApp au centre. L'IA joue le rôle du bot et du client automatiquement.",
    target: { top: "100px", left: "282px", width: "calc(100% - 550px)", height: "calc(100% - 140px)" },
    tooltip: { bottom: "80px", left: "50%" },
    pointerDirection: "down",
    icon: "📱",
  },
  {
    id: "operations",
    title: "4. Testez les opérations",
    description: "Après l'onboarding, les opérations Moov Money ou Agent se débloquent à droite. Cliquez pour les tester !",
    target: { top: "200px", left: "calc(100% - 268px)", width: "268px", height: "calc(100% - 260px)" },
    tooltip: { top: "180px", right: "280px" },
    pointerDirection: "right",
    icon: "💰",
  },
];

const PointerHand = ({ direction }: { direction: string }) => {
  const rotations: Record<string, number> = {
    left: 180,
    right: 0,
    up: -90,
    down: 90,
  };
  const translateDir: Record<string, string> = {
    left: "-12px, 0",
    right: "12px, 0",
    up: "0, -12px",
    down: "0, 12px",
  };

  return (
    <motion.div
      animate={{
        x: direction === "left" ? [-8, 0, -8] : direction === "right" ? [8, 0, 8] : 0,
        y: direction === "up" ? [-8, 0, -8] : direction === "down" ? [8, 0, 8] : 0,
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        ...(direction === "left" ? { right: -28, top: "50%", transform: "translateY(-50%)" } : {}),
        ...(direction === "right" ? { left: -28, top: "50%", transform: "translateY(-50%)" } : {}),
        ...(direction === "up" ? { bottom: -28, left: "50%", transform: "translateX(-50%)" } : {}),
        ...(direction === "down" ? { top: -28, left: "50%", transform: "translateX(-50%)" } : {}),
      }}
    >
      <MousePointer2
        className="text-amber-400 drop-shadow-lg"
        size={28}
        style={{ transform: `rotate(${rotations[direction]}deg)` }}
      />
    </motion.div>
  );
};

export default function GuidedTourOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      setVisible(false);
      setTimeout(onDismiss, 400);
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, onDismiss]);

  const skip = useCallback(() => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  }, [onDismiss]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, skip, step]);

  if (!current) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "auto",
          }}
        >
          {/* Dark overlay with cutout */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(2px)",
            }}
            onClick={skip}
          />

          {/* Spotlight cutout */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: current.target.top,
              left: current.target.left,
              width: current.target.width,
              height: current.target.height,
              border: "2px solid rgba(245,158,11,0.5)",
              borderRadius: 12,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.72), 0 0 30px rgba(245,158,11,0.2)",
              background: "transparent",
              pointerEvents: "none",
            }}
          >
            {/* Animated pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: -4,
                border: "2px solid rgba(245,158,11,0.3)",
                borderRadius: 14,
              }}
            />
            <PointerHand direction={current.pointerDirection} />
          </motion.div>

          {/* Tooltip card */}
          <motion.div
            key={`tip-${current.id}`}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            style={{
              position: "absolute",
              ...current.tooltip,
              ...(current.tooltip.left === "50%" ? { transform: "translateX(-50%)" } : {}),
              width: 290,
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                background: "linear-gradient(145deg, #1a1f35, #0f1526)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 14,
                padding: "16px 18px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.08)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{current.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#f5a623" }}>
                    {current.title}
                  </span>
                </div>
                <button
                  onClick={skip}
                  style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}
                >
                  <X size={14} color="#7a9bbf" />
                </button>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12.5, color: "#c8d6e5", lineHeight: 1.6, margin: "0 0 14px 0" }}>
                {current.description}
              </p>

              {/* Footer: progress + nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Step dots */}
                <div style={{ display: "flex", gap: 5 }}>
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === step ? 18 : 6,
                        height: 6,
                        borderRadius: 3,
                        background: i === step ? "#f5a623" : i < step ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.12)",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#7a9bbf",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ← Retour
                    </button>
                  )}
                  <button
                    onClick={next}
                    style={{
                      background: isLast
                        ? "linear-gradient(135deg, #25D366, #128C7E)"
                        : "linear-gradient(135deg, #f5a623, #e67e22)",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 16px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#fff",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {isLast ? (
                      <>
                        <Sparkles size={13} /> C'est parti !
                      </>
                    ) : (
                      <>
                        Suivant <ChevronRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skip hint */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={skip}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "5px 16px",
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Passer le guide (Esc)
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
