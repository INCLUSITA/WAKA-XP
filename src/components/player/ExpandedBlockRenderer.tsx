/**
 * ExpandedBlockRenderer
 * ─────────────────────
 * Renders sovereign blocks in their expanded (desktop) form
 * when they escape the phone simulator into the side panel, overlay, or modal.
 * Uses the BlockVariantWrapper to apply "expanded" variant styles.
 *
 * Includes:
 *   - A slot-content header showing block name + variant/density badges
 *   - A "collapse" pill to return the block to phone-inline
 */

import { Minimize2, Maximize2, Layers, Zap, Wifi, WifiOff } from "lucide-react";
import {
  ProductCatalog, type CatalogProduct,
  InlineForm, type FormField,
  LocationCard, type LocationData,
  PaymentCard, type PaymentCardData,
  RatingWidget,
  CertificateCard, type CertificateData,
  TrainingProgress, type TrainingModule,
  MediaCarousel, type MediaSlide,
  CreditSimulationCard, type CreditSimulationData,
  ClientStatusCard, type ClientStatusData,
  MoMoAccountCard, type MoMoAccountData,
  ServicePlansCard, type ServicePlansData,
  PaymentConfirmationCard, type PaymentConfirmationData,
  CreditContractCard, type CreditContractData,
  DeviceLockConsentCard, type DeviceLockConsentData,
} from "./sovereign-blocks";
import { Badge } from "@/components/ui/badge";
import { BlockVariantWrapper, useBlockVariant } from "./BlockVariantWrapper";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";
import { cn } from "@/lib/utils";

/* ── Block label map ── */
const BLOCK_LABELS: Record<string, string> = {
  catalog: "Catalogue produits",
  payment: "Paiement",
  paymentConfirmation: "Confirmation paiement",
  creditSimulation: "Simulation crédit",
  creditContract: "Contrat de crédit",
  clientStatus: "Statut client",
  momoAccount: "Compte MoMo",
  servicePlans: "Plans de service",
  deviceLockConsent: "Consentement Device Lock",
  inlineForm: "Formulaire",
  mediaCarousel: "Galerie multimédia",
  training: "Formation",
  certificate: "Certificat",
  location: "Localisation",
  rating: "Évaluation",
};

/* ── Slot Content Header ── */
function SlotContentHeader({
  blockType,
  onCollapse,
}: {
  blockType: string;
  onCollapse: () => void;
}) {
  const { dataPolicy } = useExperienceRuntime();

  const label = BLOCK_LABELS[blockType] || blockType;

  return (
    <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border/40">
      {/* Left: block identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Layers className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{label}</p>
          <p className="text-[9px] text-muted-foreground">Surface expansée</p>
        </div>
      </div>

      {/* Right: badges + collapse */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Variant badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[8px] gap-1 py-0 h-5 uppercase tracking-wider font-bold border",
            "border-primary/20 text-primary bg-primary/5"
          )}
        >
          <Maximize2 className="h-2.5 w-2.5" />
          Expanded
        </Badge>

        {/* Data policy badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[8px] gap-1 py-0 h-5 uppercase tracking-wider font-bold",
            dataPolicy === "libre" && "border-[hsl(120,40%,45%)/0.3] text-[hsl(120,50%,40%)] bg-[hsl(120,40%,50%)/0.06]",
            dataPolicy === "subventionné" && "border-[hsl(35,60%,50%)/0.3] text-[hsl(35,70%,40%)] bg-[hsl(35,60%,50%)/0.06]",
            dataPolicy === "zero-rated" && "border-[hsl(0,50%,50%)/0.3] text-[hsl(0,60%,45%)] bg-[hsl(0,50%,50%)/0.06]",
          )}
        >
          {dataPolicy === "libre" && <><Zap className="h-2.5 w-2.5" />Libre</>}
          {dataPolicy === "subventionné" && <><Wifi className="h-2.5 w-2.5" />Subv.</>}
          {dataPolicy === "zero-rated" && <><WifiOff className="h-2.5 w-2.5" />Zero</>}
        </Badge>

        {/* Collapse */}
        <button
          onClick={onCollapse}
          className="waka-collapse-pill"
        >
          <Minimize2 className="h-3 w-3" />
          Replier
        </button>
      </div>
    </div>
  );
}

interface ExpandedBlockRendererProps {
  blockType: string;
  data: Record<string, any>;
  onAction?: (action: string) => void;
  onAddToCart?: (product: CatalogProduct) => void;
  onFormSubmit?: (values: Record<string, string>) => void;
  onPayment?: (method: string) => void;
  onRate?: (value: number | string) => void;
  onModuleClick?: (moduleId: string) => void;
  onSlideAction?: (slide: MediaSlide) => void;
  onSelectPlan?: (sku: string, name: string) => void;
  onDeviceLockConsent?: (accepted: boolean) => void;
}

export function ExpandedBlockRenderer({
  blockType,
  data,
  onAction,
  onAddToCart,
  onFormSubmit,
  onPayment,
  onRate,
  onModuleClick,
  onSlideAction,
  onSelectPlan,
  onDeviceLockConsent,
}: ExpandedBlockRendererProps) {
  const { collapseBlock, dataPolicy } = useExperienceRuntime();

  return (
    <BlockVariantWrapper blockType={blockType}>
      <div className="space-y-4 waka-panel-enter" data-policy={dataPolicy}>
        {/* ── Slot Content Header ── */}
        <SlotContentHeader blockType={blockType} onCollapse={collapseBlock} />

        {/* ── Block Content ── */}
        <div className="[&>*]:max-w-full">
          {blockType === "catalog" && data.catalog && (
            <ProductCatalog title={data.catalog.title} products={data.catalog.products} onAddToCart={onAddToCart} />
          )}
          {blockType === "payment" && data.payment && (
            <PaymentCard payment={data.payment} onPay={onPayment} />
          )}
          {blockType === "paymentConfirmation" && data.paymentConfirmation && (
            <PaymentConfirmationCard data={data.paymentConfirmation} onAction={onAction} />
          )}
          {blockType === "creditSimulation" && data.creditSimulation && (
            <CreditSimulationCard data={data.creditSimulation} onAction={onAction} />
          )}
          {blockType === "creditContract" && data.creditContract && (
            <CreditContractCard data={data.creditContract} onAction={onAction} />
          )}
          {blockType === "clientStatus" && data.clientStatus && (
            <ClientStatusCard data={data.clientStatus} />
          )}
          {blockType === "momoAccount" && data.momoAccount && (
            <MoMoAccountCard data={data.momoAccount} onAction={onAction} />
          )}
          {blockType === "servicePlans" && data.servicePlans && (
            <ServicePlansCard data={data.servicePlans} onSelectPlan={onSelectPlan} />
          )}
          {blockType === "deviceLockConsent" && data.deviceLockConsent && (
            <DeviceLockConsentCard data={data.deviceLockConsent} onConsent={onDeviceLockConsent} />
          )}
          {blockType === "inlineForm" && data.inlineForm && (
            <InlineForm title={data.inlineForm.title} fields={data.inlineForm.fields} submitLabel={data.inlineForm.submitLabel} icon={data.inlineForm.icon} onSubmit={onFormSubmit} />
          )}
          {blockType === "location" && data.location && (
            <LocationCard location={data.location} />
          )}
          {blockType === "mediaCarousel" && data.mediaCarousel && (
            <MediaCarousel title={data.mediaCarousel.title} slides={data.mediaCarousel.slides} onSlideAction={onSlideAction} />
          )}
          {blockType === "training" && data.training && (
            <TrainingProgress title={data.training.title} modules={data.training.modules} overallProgress={data.training.overallProgress} onModuleClick={onModuleClick} />
          )}
          {blockType === "certificate" && data.certificate && (
            <CertificateCard certificate={data.certificate} />
          )}
          {blockType === "rating" && data.rating && (
            <RatingWidget title={data.rating.title} type={data.rating.type} onRate={onRate} />
          )}
        </div>
      </div>
    </BlockVariantWrapper>
  );
}
