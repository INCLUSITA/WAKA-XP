/**
 * FloatingPanelSurface — Generic contextual panel
 * Reusable for info, forms, help, credit simulation, etc.
 */

import { Info } from "lucide-react";

export function FloatingPanelSurface({ payload }: { payload?: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[hsl(270,70%,60%)]/15 flex items-center justify-center">
          <Info className="w-4.5 h-4.5 text-[hsl(270,70%,60%)]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">
          {payload?.title || "Information"}
        </h3>
      </div>

      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4">
        <p className="text-sm text-[hsl(210,20%,80%)] leading-relaxed">
          {payload?.subtitle || "Contenu du panneau contextuel. Ce surface s'adapte au type de données envoyé par le runtime."}
        </p>
        {payload?.items && payload.items.length > 0 && (
          <ul className="mt-3 space-y-2">
            {payload.items.map((item: any, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[hsl(210,20%,75%)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(270,70%,60%)]" />
                {item.name || item.label || JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
