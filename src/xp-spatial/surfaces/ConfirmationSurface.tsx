/**
 * ConfirmationSurface — Success confirmation moment
 * Brief, elegant, impactful.
 */

import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";

export function ConfirmationSurface({ payload }: { payload?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Success burst */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-[hsl(160,84%,39%)]/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[hsl(160,84%,45%)]" />
        </div>
        {/* Sparkle accents */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-5 h-5 text-[hsl(35,95%,55%)]" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-[hsl(210,20%,92%)] mb-2"
      >
        {payload?.title || "Opération réussie"}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-sm text-[hsl(210,10%,50%)] text-center max-w-[240px]"
      >
        {payload?.subtitle || "Votre demande a été traitée avec succès."}
      </motion.p>
    </div>
  );
}
