/**
 * Sovereign Block: Product Catalog / Carousel
 * WhatsApp Business has catalog BUT limited to 30 products per message.
 * WAKA: unlimited products, horizontal scroll, rich media, inline purchase.
 *
 * Variant-aware: adapts layout, density, and richness based on BlockVariantWrapper.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";
import { useBlockVariant } from "../BlockVariantWrapper";

export interface CatalogProduct {
  id: string;
  name: string;
  price: string;
  image?: string;
  emoji?: string;
  rating?: number;
  badge?: string;
  description?: string;
}

interface ProductCatalogProps {
  products: CatalogProduct[];
  title?: string;
  onAddToCart?: (product: CatalogProduct) => void;
  onProductClick?: (product: CatalogProduct) => void;
}

export function ProductCatalog({ products, title, onAddToCart, onProductClick }: ProductCatalogProps) {
  const mode = useDataMode();
  const { variant } = useBlockVariant();
  const [scrollIdx, setScrollIdx] = useState(0);

  // Zero-rated: ultra-light list
  if (mode === "zero-rated" || variant === "zero-rated") {
    return (
      <div className="max-w-[90%]">
        {title && <p className="waka-block-title mb-1">{title}</p>}
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => (onProductClick ?? onAddToCart)?.(p)}
            className="flex items-center justify-between w-full py-1.5 text-left border-t border-border first:border-0"
          >
            <span className="text-[11px] text-foreground">
              {p.emoji || "•"} {p.name}
            </span>
            <span className="text-[10px] font-bold text-primary">{p.price}</span>
          </button>
        ))}
      </div>
    );
  }

  // Compact: stacked list, no carousel
  if (variant === "compact") {
    return (
      <div className="max-w-[90%]">
        {title && <p className="waka-block-title mb-1.5 px-1">{title}</p>}
        <div className="space-y-1">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => (onProductClick ?? onAddToCart)?.(product)}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-[hsl(270,15%,97%)] active:bg-[hsl(270,15%,94%)] transition-colors text-left"
            >
              <span className="text-2xl shrink-0">{product.emoji || "📦"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[hsl(220,15%,15%)] truncate">{product.name}</p>
                {product.rating != null && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-2 w-2",
                          s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-[hsl(220,10%,80%)]"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-bold text-[hsl(270,45%,40%)]">{product.price}</span>
                {product.badge && (
                  <span className="block text-[8px] font-bold text-[hsl(350,70%,50%)]">{product.badge}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Expanded: grid layout with full details
  if (variant === "expanded") {
    return (
      <div>
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3 className="h-4 w-4 text-primary/50" />
            <p className="waka-block-title">{title}</p>
            <span className="text-[10px] text-muted-foreground ml-auto">{products.length} produits</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <motion.div
              key={product.id}
              onClick={() => (onProductClick ?? onAddToCart)?.(product)}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Product image area */}
              <div
                className="h-28 flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, hsl(270,20%,96%), hsl(280,18%,94%))",
                }}
              >
                <span className="text-5xl group-hover:scale-110 transition-transform">{product.emoji || "📦"}</span>
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-[hsl(350,70%,50%)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="px-3 py-3">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{product.name}</p>
                {product.description && (
                  <p className="waka-block-subtitle mt-1 line-clamp-2">{product.description}</p>
                )}
                {product.rating != null && (
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3 w-3",
                          s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-[hsl(220,10%,80%)]"
                        )}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                  <span className="text-[15px] font-bold text-primary">{product.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart?.(product);
                    }}
                    className="h-9 w-9 rounded-full flex items-center justify-center shadow-md"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Standard: carousel (original behavior)
  const canScrollLeft = scrollIdx > 0;
  const canScrollRight = scrollIdx < products.length - 1;

  return (
    <div className="max-w-[90%]">
      {title && (
        <p className="text-[12px] font-bold text-[hsl(270,40%,35%)] mb-1.5 px-1">{title}</p>
      )}
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => setScrollIdx(Math.max(0, scrollIdx - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center -ml-2"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-[hsl(220,15%,30%)]" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => setScrollIdx(Math.min(products.length - 1, scrollIdx + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center -mr-2"
          >
            <ChevronRight className="h-3.5 w-3.5 text-[hsl(220,15%,30%)]" />
          </button>
        )}

        <div className="overflow-hidden rounded-xl">
          <motion.div
            className="flex gap-2"
            animate={{ x: `-${scrollIdx * 75}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                onClick={() => (onProductClick ?? onAddToCart)?.(product)}
                className="flex-shrink-0 w-[70%] rounded-xl border border-[hsl(270,20%,90%)] bg-white overflow-hidden shadow-sm cursor-pointer hover:border-[hsl(270,40%,70%)] hover:shadow-md transition-all"
                whileTap={mode === "libre" ? { scale: 0.96 } : {}}
              >
                <div
                  className="h-24 flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(135deg, hsl(270,20%,96%), hsl(280,18%,94%))",
                  }}
                >
                  <span className="text-4xl">{product.emoji || "📦"}</span>
                  {product.badge && (
                    <span className="absolute top-1.5 right-1.5 bg-[hsl(350,70%,50%)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="px-2.5 py-2">
                  <p className="text-[12px] font-semibold text-[hsl(220,15%,15%)] leading-tight">{product.name}</p>
                  {product.description && (
                    <p className="text-[10px] text-[hsl(220,10%,55%)] mt-0.5 line-clamp-2">{product.description}</p>
                  )}
                  {product.rating != null && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-2.5 w-2.5",
                            s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-[hsl(220,10%,80%)]"
                          )}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[13px] font-bold text-[hsl(270,45%,40%)]">{product.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product);
                      }}
                      className="h-9 w-9 rounded-full bg-[hsl(270,45%,48%)] flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-[hsl(270,45%,55%)] hover:shadow-lg"
                    >
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex justify-center gap-1 mt-2">
          {products.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === scrollIdx ? "w-4 bg-[hsl(270,45%,50%)]" : "w-1.5 bg-[hsl(220,10%,80%)]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
