/**
 * CatalogGridSurface — Erupted catalog display
 * Renders real catalog products from Player sovereign blocks.
 */

import { motion } from "framer-motion";
import { ShoppingBag, Star, ChevronRight } from "lucide-react";
import type { SpatialSurfacePayload } from "../types/spatial";

interface CatalogProduct {
  id?: string;
  name: string;
  price: string;
  emoji?: string;
  description?: string;
  badge?: string;
  rating?: number;
  image?: string;
  image_url?: string;
  category?: string;
}

export function CatalogGridSurface({ payload }: { payload?: SpatialSurfacePayload }) {
  const catalogData = payload?.blockData as { title?: string; products?: CatalogProduct[] } | undefined;
  const products = catalogData?.products || [];
  const title = payload?.title || catalogData?.title || "Catalogue";

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="w-10 h-10 text-[hsl(210,10%,30%)] mb-3" />
        <p className="text-sm text-[hsl(210,10%,50%)]">Aucun produit à afficher</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[hsl(160,84%,39%)]/15 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-[hsl(160,84%,45%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{title}</h3>
          <p className="text-xs text-[hsl(210,10%,50%)]">{products.length} produits disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p, i) => (
          <motion.div
            key={p.id || i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="group relative rounded-2xl overflow-hidden cursor-pointer
                      bg-[hsl(228,14%,12%)] border border-[hsl(228,14%,18%)]
                      hover:border-[hsl(160,60%,40%)]/40 transition-all duration-300
                      hover:shadow-[0_8px_32px_-8px_rgba(100,220,170,0.15)]"
          >
            {p.badge && (
              <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider
                             px-2 py-0.5 rounded-full bg-[hsl(160,84%,39%)]/20 text-[hsl(160,84%,50%)]">
                {p.badge}
              </span>
            )}

            <div className="flex items-center justify-center h-20 text-4xl
                          bg-gradient-to-b from-[hsl(228,14%,14%)] to-[hsl(228,14%,11%)]">
              {p.emoji || "📱"}
            </div>

            <div className="p-3">
              <h4 className="text-xs font-medium text-[hsl(210,20%,85%)] truncate">{p.name}</h4>
              {p.description && (
                <p className="text-[10px] text-[hsl(210,10%,45%)] truncate mt-0.5">{p.description}</p>
              )}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-sm font-bold text-[hsl(160,84%,50%)]">{p.price}</span>
                {p.rating && (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-[hsl(35,95%,55%)] text-[hsl(35,95%,55%)]" />
                    <span className="text-[10px] text-[hsl(210,10%,50%)]">{p.rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute inset-0 bg-[hsl(160,84%,39%)]/0 group-hover:bg-[hsl(160,84%,39%)]/5
                          transition-colors flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
              <span className="text-[10px] font-medium text-[hsl(160,84%,50%)] flex items-center gap-1">
                Voir détails <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
