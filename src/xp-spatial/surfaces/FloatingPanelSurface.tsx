/**
 * FloatingPanelSurface — Contextual panel for credit, plans, status, forms, etc.
 * Routes to sub-renderers based on blockType from sovereign blocks.
 */

import { motion } from "framer-motion";
import { Info, TrendingUp, CreditCard, Layers, User, MapPin, GraduationCap, ShieldCheck, FileText } from "lucide-react";
import type { SpatialSurfacePayload } from "../types/spatial";

export function FloatingPanelSurface({ payload }: { payload?: SpatialSurfacePayload }) {
  const blockType = payload?.blockType;
  const data = payload?.blockData as any;

  if (blockType === "creditSimulation" && data) return <CreditSimPanel data={data} />;
  if (blockType === "creditContract" && data) return <CreditContractPanel data={data} />;
  if (blockType === "servicePlans" && data) return <ServicePlansPanel data={data} />;
  if (blockType === "clientStatus" && data) return <ClientStatusPanel data={data} />;
  if (blockType === "training" && data) return <TrainingPanel data={data} />;
  if (blockType === "location" && data) return <LocationPanel data={data} />;
  if (blockType === "deviceLockConsent" && data) return <DeviceLockPanel data={data} />;
  if (blockType === "form" && data) return <FormPanel data={data} />;

  // Generic fallback
  return <GenericPanel payload={payload} />;
}

/* ── Credit Simulation ── */
function CreditSimPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[hsl(270,70%,60%)]/15 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[hsl(270,70%,60%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.title || "Simulation de crédit"}</h3>
          {data.product_name && <p className="text-xs text-[hsl(210,10%,50%)]">{data.product_name}</p>}
        </div>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-3">
        <Row label="Montant" value={data.amount} highlight />
        {data.term && <Row label="Durée" value={data.term} />}
        {data.frequency && <Row label="Fréquence" value={data.frequency} />}
        <Row label="Mensualité" value={data.monthly_payment} highlight />
        {data.total_cost && <Row label="Coût total" value={data.total_cost} />}
        {data.interest_rate && <Row label="Taux" value={data.interest_rate} />}
      </div>
    </div>
  );
}

/* ── Credit Contract ── */
function CreditContractPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[hsl(160,84%,39%)]/15 flex items-center justify-center">
          <FileText className="w-5 h-5 text-[hsl(160,84%,45%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.title || "Contrat de crédit"}</h3>
          {data.product_name && <p className="text-xs text-[hsl(210,10%,50%)]">{data.product_name}</p>}
        </div>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-3">
        {data.credit_voice_id && <Row label="Réf. crédit" value={data.credit_voice_id} mono />}
        {data.credit_type && <Row label="Type" value={data.credit_type} />}
        <Row label="Montant" value={data.amount} highlight />
        {data.monthly_payment && <Row label="Mensualité" value={data.monthly_payment} />}
        {data.term && <Row label="Durée" value={data.term} />}
        {data.status && <Row label="Statut" value={data.status} accent />}
        {data.status_explanation && (
          <p className="text-[11px] text-[hsl(210,10%,50%)] mt-2 leading-relaxed">{data.status_explanation}</p>
        )}
        {data.device_lock && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-[hsl(35,90%,50%)]/10">
            <ShieldCheck className="w-4 h-4 text-[hsl(35,90%,55%)]" />
            <span className="text-[11px] text-[hsl(35,90%,55%)]">Device Lock actif</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Service Plans ── */
function ServicePlansPanel({ data }: { data: any }) {
  const plans = data.plans || [];
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[hsl(200,80%,50%)]/15 flex items-center justify-center">
          <Layers className="w-5 h-5 text-[hsl(200,80%,60%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.title || "Plans disponibles"}</h3>
          {data.message && <p className="text-xs text-[hsl(210,10%,50%)]">{data.message}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {plans.map((plan: any, i: number) => (
          <motion.div
            key={plan.sku || i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4
                      hover:border-[hsl(200,80%,50%)]/30 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-medium text-[hsl(210,20%,88%)]">{plan.name}</h4>
                {plan.description && <p className="text-[10px] text-[hsl(210,10%,45%)] mt-0.5">{plan.description}</p>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[hsl(160,84%,50%)]">{plan.price}</span>
                {plan.badge && (
                  <span className="block text-[8px] font-bold uppercase text-[hsl(200,80%,60%)] mt-0.5">{plan.badge}</span>
                )}
              </div>
            </div>
            {plan.features && plan.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {plan.features.map((f: string, fi: number) => (
                  <span key={fi} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(200,80%,50%)]/10 text-[hsl(200,80%,60%)]">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Client Status ── */
function ClientStatusPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[hsl(270,70%,60%)]/15 flex items-center justify-center">
          <User className="w-5 h-5 text-[hsl(270,70%,60%)]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.client_name || "Client"}</h3>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-3">
        {data.voice_id && <Row label="Voice ID" value={data.voice_id} mono />}
        {data.phone && <Row label="Téléphone" value={data.phone} />}
        {data.active_credits != null && <Row label="Crédits actifs" value={String(data.active_credits)} />}
        {data.total_balance && <Row label="Solde total" value={data.total_balance} highlight />}
        {data.next_payment_date && <Row label="Prochain paiement" value={data.next_payment_date} />}
        {data.next_payment_amount && <Row label="Montant dû" value={data.next_payment_amount} accent />}
      </div>
    </div>
  );
}

/* ── Training ── */
function TrainingPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[hsl(35,90%,50%)]/15 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-[hsl(35,90%,55%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.title || "Formation"}</h3>
          <p className="text-xs text-[hsl(210,10%,50%)]">{data.overallProgress || 0}% complété</p>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-[hsl(228,14%,16%)] mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.overallProgress || 0}%` }}
          className="h-full rounded-full bg-[hsl(35,90%,50%)]"
        />
      </div>
      <div className="space-y-2">
        {data.modules?.map((m: any, i: number) => (
          <div key={m.id || i} className="flex items-center gap-3 rounded-lg bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-3">
            <span className="text-lg">{m.emoji || "📚"}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[hsl(210,20%,85%)]">{m.name}</span>
            </div>
            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
              m.status === "completed" ? "bg-[hsl(160,84%,39%)]/15 text-[hsl(160,84%,50%)]" :
              m.status === "current" ? "bg-[hsl(35,90%,50%)]/15 text-[hsl(35,90%,55%)]" :
              "bg-[hsl(228,14%,18%)] text-[hsl(210,10%,40%)]"
            }`}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Location ── */
function LocationPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[hsl(200,80%,50%)]/15 flex items-center justify-center">
          <MapPin className="w-4.5 h-4.5 text-[hsl(200,80%,60%)]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.name || "Localisation"}</h3>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-2">
        {data.address && <Row label="Adresse" value={data.address} />}
        {data.hours && <Row label="Horaires" value={data.hours} />}
        {data.phone && <Row label="Téléphone" value={data.phone} />}
        {data.distance && <Row label="Distance" value={data.distance} />}
      </div>
    </div>
  );
}

/* ── Device Lock Consent ── */
function DeviceLockPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[hsl(35,90%,50%)]/15 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[hsl(35,90%,55%)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.title || "Consentement Device Lock"}</h3>
          {data.device_name && <p className="text-xs text-[hsl(210,10%,50%)]">{data.device_name}</p>}
        </div>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-3">
        {data.amount && <Row label="Montant" value={data.amount} highlight />}
        {data.message && (
          <p className="text-[11px] text-[hsl(210,10%,55%)] leading-relaxed">{data.message}</p>
        )}
      </div>
    </div>
  );
}

/* ── Form Panel ── */
function FormPanel({ data }: { data: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[hsl(270,70%,60%)]/15 flex items-center justify-center">
          <FileText className="w-4.5 h-4.5 text-[hsl(270,70%,60%)]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{data.title || "Formulaire"}</h3>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-3">
        {data.fields?.map((field: any, i: number) => (
          <div key={field.id || i}>
            <label className="text-[11px] text-[hsl(210,10%,55%)] mb-1 block">{field.label}</label>
            <div className="h-9 rounded-lg bg-[hsl(228,14%,14%)] border border-[hsl(228,14%,20%)] px-3 flex items-center">
              <span className="text-xs text-[hsl(210,10%,35%)]">{field.placeholder || field.type}</span>
            </div>
          </div>
        ))}
        {data.submitLabel && (
          <button className="w-full mt-2 py-2 rounded-lg bg-[hsl(160,84%,39%)] text-[hsl(228,20%,6%)] text-xs font-semibold">
            {data.submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Generic Fallback ── */
function GenericPanel({ payload }: { payload?: SpatialSurfacePayload }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[hsl(270,70%,60%)]/15 flex items-center justify-center">
          <Info className="w-4.5 h-4.5 text-[hsl(270,70%,60%)]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">{payload?.title || "Information"}</h3>
      </div>
      <div className="rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4">
        <p className="text-sm text-[hsl(210,20%,80%)] leading-relaxed">
          {payload?.subtitle || "Contenu du panneau contextuel."}
        </p>
      </div>
    </div>
  );
}

/* ── Shared Row ── */
function Row({ label, value, highlight, accent, mono }: {
  label: string;
  value?: string;
  highlight?: boolean;
  accent?: boolean;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <>
      <div className="flex justify-between items-center text-sm">
        <span className="text-[hsl(210,10%,50%)]">{label}</span>
        <span className={`${
          highlight ? "text-base font-bold text-[hsl(160,84%,50%)]" :
          accent ? "font-medium text-[hsl(35,90%,55%)]" :
          "text-[hsl(210,20%,85%)]"
        } ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </span>
      </div>
    </>
  );
}
