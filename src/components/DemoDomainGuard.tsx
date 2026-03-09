import ShareDemo from "@/pages/ShareDemo";

const DEMO_DOMAIN = "wakaxp.wakacore.com";
const DEFAULT_DEMO_ID = "moov-waka";

/**
 * If the app is served from the demo subdomain (wakaxp.wakacore.com),
 * render the demo directly instead of the normal app routes.
 */
export function isDemoDomain(): boolean {
  return window.location.hostname === DEMO_DOMAIN;
}

export default function DemoDomainRoot() {
  return <ShareDemo overrideDemoId={DEFAULT_DEMO_ID} />;
}
