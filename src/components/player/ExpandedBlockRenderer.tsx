/**
 * ExpandedBlockRenderer
 * ─────────────────────
 * Renders sovereign blocks in their expanded (desktop) form
 * when they escape the phone simulator into the side panel, overlay, or modal.
 * Uses the BlockVariantWrapper to apply "expanded" variant styles.
 *
 * Includes a "collapse" pill to return the block to phone-inline.
 */

import { Minimize2, Maximize2 } from "lucide-react";
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
import { BlockVariantWrapper } from "./BlockVariantWrapper";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";

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
  const { collapseBlock } = useExperienceRuntime();

  return (
    <BlockVariantWrapper blockType={blockType}>
      <div className="space-y-4 waka-panel-enter">
        {/* Header with expanded badge + collapse */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[9px] border-primary/20 text-primary gap-1">
            <Maximize2 className="h-2.5 w-2.5" />
            Vue expansée · Desktop
          </Badge>
          <button
            onClick={collapseBlock}
            className="waka-collapse-pill"
          >
            <Minimize2 className="h-3 w-3" />
            Replier
          </button>
        </div>

        {/* Render the block in expanded form */}
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
