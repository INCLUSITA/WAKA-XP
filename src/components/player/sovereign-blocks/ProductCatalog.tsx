/**
 * Sovereign Block: Product Catalog / Carousel
 * WhatsApp Business has catalog BUT limited to 30 products per message.
 * WAKA: unlimited products, horizontal scroll, rich media, inline purchase.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

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
  const [scrollIdx, setScrollIdx] = useState(0);

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(270,20%,88%)] bg-white px-3 py-2 max-w-[90%]">
        {title && <p className="text-[11px] font-bold text-[hsl(270,40%,35%)] mb-1">{title}</p>}
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => (onProductClick ?? onAddToCart)?.(p)}
            className="flex items-center justify-between w-full py-1.5 text-left border-t border-[hsl(270,15%,93%)] first:border-0"
          >
            <span className="text-[11px] text-[hsl(220,15%,20%)]">
              {p.emoji || "•"} {p.name}
            </span>
            <span className="text-[10px] font-bold text-[hsl(270,45%,40%)]">{p.price}</span>
          </button>
        ))}
      </div>
    );
  }

  const canScrollLeft = scrollIdx > 0;
  const canScrollRight = scrollIdx < products.length - 1;

  return (
    <div className="max-w-[90%]">
      {title && (
        <p className="text-[12px] font-bold text-[hsl(270,40%,35%)] mb-1.5 px-1">{title}</p>
      )}
      <div className="relative">
        {/* Navigation arrows */}
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

        {/* Carousel track */}
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
                {/* Product image area */}
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

        {/* Dot indicators */}
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
