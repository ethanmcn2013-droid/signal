import suiteContracts from "./suite-contracts.v1.json";

const suiteProducts = suiteContracts.products;

export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? suiteProducts.studio.canonicalUrl;

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.signalstudio.ie";

export const TASKS_URL =
  process.env.NEXT_PUBLIC_TASKS_URL ?? suiteProducts.tasks.canonicalUrl;

export const TIMELINE_URL =
  process.env.NEXT_PUBLIC_TIMELINE_URL ?? suiteProducts.timeline.canonicalUrl;

export const SIGNAL_URL =
  process.env.NEXT_PUBLIC_SIGNAL_URL ?? suiteProducts.signal.canonicalUrl;

export const NOTES_URL =
  process.env.NEXT_PUBLIC_NOTES_URL ?? suiteProducts.notes.canonicalUrl;

export const IOS_APP_URL =
  process.env.NEXT_PUBLIC_IOS_APP_URL ?? "https://signalstudio.ie/ios";

export const CONTACT_EMAIL = "hello@signalstudio.ie";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
