/**
 * Sovereign Block: Product Catalog / Carousel
 * WhatsApp Business has catalog BUT limited to 30 products per message.
 * WAKA: unlimited products, horizontal scroll, rich media, inline purchase.
 *
 * Variant-aware: adapts layout, density, and richness based on BlockVariantWrapper.
 * Includes product detail overlay for full info before purchasing.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ShoppingCart, Star, Grid3X3,
  X, Package, Cpu, Battery, Monitor, Wifi, HardDrive, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";
import { useBlockVariant } from "../BlockVariantWrapper";

export interface CatalogProduct {
  id: string;
  name: string;
  price: string;
  image?: string;
  image_url?: string;
  emoji?: string;
  rating?: number;
  badge?: string;
  description?: string;
  specs?: Record<string, string>;
  features?: string[];
  stock?: string;
  category?: string;
}

function ProductImage({ product, sizeClass = "text-4xl", imgClass = "w-full h-full object-cover" }: { product: CatalogProduct; sizeClass?: string; imgClass?: string }) {
  const src = product.image || product.image_url;
  if (src) {
    return <img src={src} alt={product.name} className={cn(imgClass, "rounded")} loading="lazy" />;
  }
  return <span className={sizeClass}>{product.emoji || "📦"}</span>;
}

/* ── Product Detail Overlay ── */
function ProductDetail({
  product,
  onClose,
  onAddToCart,
}: {
  product: CatalogProduct;
  onClose: () => void;
  onAddToCart?: (product: CatalogProduct) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute inset-0 z-20 bg-card rounded-xl border border-border shadow-xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60 bg-muted/30">
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <p className="text-xs font-semibold text-foreground truncate flex-1">{product.name}</p>
        {product.badge && (
          <span className="text-[8px] font-bold uppercase bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            {product.badge}
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto">
        {/* Hero image */}
        <div
          className="h-36 flex items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--accent)))",
          }}
        >
          <ProductImage product={product} sizeClass="text-7xl" imgClass="w-full h-full object-cover" />
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Name & Price */}
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{product.name}</h3>
            <p className="text-lg font-extrabold text-primary mt-1">{product.price}</p>
          </div>

          {/* Rating */}
          {product.rating != null && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "h-3.5 w-3.5",
                    s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">{product.rating}/5</span>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Caractéristiques</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2 py-1.5">
                    <Package className="h-3 w-3 text-primary/60 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-muted-foreground truncate">{key}</p>
                      <p className="text-[10px] font-semibold text-foreground truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Points forts</p>
              <div className="space-y-1">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary text-xs mt-0.5">✓</span>
                    <span className="text-[11px] text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          {product.stock && (
            <p className="text-[10px] text-muted-foreground">
              Disponibilité: <span className="font-semibold text-foreground">{product.stock}</span>
            </p>
          )}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="px-4 py-3 border-t border-border/60 bg-card">
        <button
          onClick={() => onAddToCart?.(product)}
          className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
        >
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier — {product.price}
        </button>
      </div>
    </motion.div>
  );
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
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const handleProductClick = (product: CatalogProduct) => {
    setSelectedProduct(product);
    onProductClick?.(product);
  };

  const handleAddToCart = (product: CatalogProduct) => {
    onAddToCart?.(product);
    setSelectedProduct(null);
  };

  // Zero-rated: ultra-light list
  if (mode === "zero-rated" || variant === "zero-rated") {
    return (
      <div className="max-w-[90%]">
        {title && <p className="waka-block-title mb-1">{title}</p>}
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProductClick(p)}
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
      <div className="max-w-[90%] relative">
        {title && <p className="waka-block-title mb-1.5 px-1">{title}</p>}
        <div className="space-y-1">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 active:bg-muted/60 transition-colors text-left"
            >
              <span className="shrink-0"><ProductImage product={product} sizeClass="text-2xl" imgClass="w-8 h-8 object-cover rounded" /></span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{product.name}</p>
                {product.rating != null && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-2 w-2",
                          s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-bold text-primary">{product.price}</span>
                {product.badge && (
                  <span className="block text-[8px] font-bold text-destructive">{product.badge}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded: grid layout with full details
  if (variant === "expanded") {
    return (
      <div className="relative">
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
              onClick={() => handleProductClick(product)}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Product image area */}
              <div
                className="h-28 flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--accent)))",
                }}
              >
                <span className="group-hover:scale-110 transition-transform"><ProductImage product={product} sizeClass="text-5xl" imgClass="w-full h-full object-cover" /></span>
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
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
                          s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-muted-foreground/30"
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
                      handleAddToCart(product);
                    }}
                    className="waka-cart-btn h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-90 transition-all"
                  >
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard: carousel (original behavior)
  const canScrollLeft = scrollIdx > 0;
  const canScrollRight = scrollIdx < products.length - 1;

  return (
    <div className="max-w-[90%] relative">
      {title && (
        <p className="text-[12px] font-bold text-primary mb-1.5 px-1">{title}</p>
      )}
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => setScrollIdx(Math.max(0, scrollIdx - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-card shadow-md flex items-center justify-center -ml-2 border border-border"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => setScrollIdx(Math.min(products.length - 1, scrollIdx + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-card shadow-md flex items-center justify-center -mr-2 border border-border"
          >
            <ChevronRight className="h-3.5 w-3.5 text-foreground" />
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
                onClick={() => handleProductClick(product)}
                className="flex-shrink-0 w-[70%] rounded-xl border border-border bg-card overflow-hidden shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                whileTap={mode === "libre" ? { scale: 0.96 } : {}}
              >
                <div
                  className="h-24 flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--accent)))",
                  }}
                >
                  <ProductImage product={product} sizeClass="text-4xl" imgClass="w-full h-full object-cover" />
                  {product.badge && (
                    <span className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="px-2.5 py-2">
                  <p className="text-[12px] font-semibold text-foreground leading-tight">{product.name}</p>
                  {product.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                  )}
                  {product.rating != null && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-2.5 w-2.5",
                            s <= product.rating! ? "text-[hsl(45,90%,50%)] fill-[hsl(45,90%,50%)]" : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[13px] font-bold text-primary">{product.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="waka-cart-btn h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-primary/90 hover:shadow-lg"
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
                i === scrollIdx ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
