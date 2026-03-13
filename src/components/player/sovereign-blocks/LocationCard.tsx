/**
 * Sovereign Block: Location Card / Map Preview
 * WhatsApp: Static location pin only.
 * WAKA: Rich location card with address, hours, action buttons.
 */

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { useDataMode } from "../dataMode";

export interface LocationData {
  name: string;
  address: string;
  hours?: string;
  phone?: string;
  emoji?: string;
  distance?: string;
}

interface LocationCardProps {
  location: LocationData;
  onNavigate?: () => void;
  onCall?: () => void;
}

export function LocationCard({ location, onNavigate, onCall }: LocationCardProps) {
  const mode = useDataMode();

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[85%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">
          📍 {location.name}
        </p>
        <p className="text-[10px] text-[hsl(220,10%,50%)]">{location.address}</p>
        {location.phone && (
          <button onClick={onCall} className="text-[10px] text-[hsl(160,60%,30%)] underline mt-0.5">
            ☎ {location.phone}
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 10 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[85%]"
    >
      {/* Map preview area */}
      <div
        className="h-20 relative flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, hsl(160,25%,92%), hsl(200,20%,90%), hsl(160,20%,88%))",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-[hsl(350,65%,55%)] flex items-center justify-center shadow-md">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div className="h-2 w-2 rounded-full bg-[hsl(350,65%,55%)]/30 mt-0.5" />
        </div>
        {location.distance && (
          <span className="absolute top-1.5 right-1.5 bg-white/90 text-[9px] font-bold text-[hsl(160,50%,30%)] px-1.5 py-0.5 rounded-full shadow-sm">
            {location.distance}
          </span>
        )}
      </div>

      <div className="px-3 py-2.5">
        <p className="text-[13px] font-bold text-[hsl(220,15%,15%)]">
          {location.emoji || "📍"} {location.name}
        </p>
        <p className="text-[11px] text-[hsl(220,10%,50%)] mt-0.5">{location.address}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {location.hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-[hsl(160,50%,45%)]" />
              <span className="text-[10px] text-[hsl(220,10%,50%)]">{location.hours}</span>
            </div>
          )}
          {location.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-2.5 w-2.5 text-[hsl(160,50%,45%)]" />
              <span className="text-[10px] text-[hsl(220,10%,50%)]">{location.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex divide-x divide-[hsl(160,20%,92%)] border-t border-[hsl(160,20%,92%)]">
        <button
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-[hsl(160,60%,30%)] hover:bg-[hsl(160,30%,96%)] transition-colors"
        >
          <Navigation className="h-3 w-3" />
          Itinéraire
        </button>
        {location.phone && (
          <button
            onClick={onCall}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-[hsl(160,60%,30%)] hover:bg-[hsl(160,30%,96%)] transition-colors"
          >
            <Phone className="h-3 w-3" />
            Appeler
          </button>
        )}
      </div>
    </motion.div>
  );
}
