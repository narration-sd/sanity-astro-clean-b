import { defineMiddleware } from "astro:middleware";
import type { ClientPerspective } from "@sanity/client";

// Module-scoped active perspective for the current SSR request
let currentPerspective: ClientPerspective = "drafts";

export function getActivePerspective(): ClientPerspective {
  return currentPerspective;
}

export const onRequest = defineMiddleware((context, next) => {
  // 1. Check if the Presentation iframe URL passed ?sanity-preview-perspective=...
  const urlParam = context.url.searchParams.get("sanity-preview-perspective");

  // 2. Otherwise check the cookie set by VisualEditingStandalone
  const cookieVal = context.cookies.get("sanity-preview-perspective")?.value;
  const raw = urlParam || cookieVal;

  if (raw === "published" || raw === "drafts" || raw === "previewDrafts") {
    currentPerspective = raw;
  } else if (raw) {
    // Content Releases pass comma-separated release IDs
    currentPerspective = raw.split(",");
  } else {
    // Fallback when no Studio signal has been established yet
    currentPerspective = "drafts";
  }

  return next();
});
