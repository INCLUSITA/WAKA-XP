import { useEffect, useRef, useState, ReactNode } from "react";

/**
 * Scales its children to fit the available width.
 * Children render at a fixed BASE width (default 1280) and we apply
 * transform: scale(containerWidth / BASE) up to 1.
 */
export default function FitToWidth({
  children,
  base = 1280,
  className,
}: {
  children: ReactNode;
  base?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [innerH, setInnerH] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth || window.innerWidth;
      const s = Math.min(1, w / base);
      setScale(prev => (Math.abs(prev - s) > 0.005 ? s : prev));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [base]);

  // Measure the inner content to reserve the right scaled height
  const innerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setInnerH(el.scrollHeight));
    ro.observe(el);
    setInnerH(el.scrollHeight);
    return () => ro.disconnect();
  }, []);

  const reservedHeight = innerH ? innerH * scale : undefined;

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ height: reservedHeight }}>
        <div
          ref={innerRef}
          style={{
            width: base,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}