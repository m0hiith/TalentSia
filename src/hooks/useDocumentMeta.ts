import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
}

const SITE_NAME = "TalentSia";
const DEFAULT_DESCRIPTION = "AI-Powered Career Guidance, Resume Analysis & Job Matching Platform";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

/**
 * Custom hook to set per-page document title and meta tags for SEO.
 * Updates document.title and relevant meta tags on mount, restores defaults on unmount.
 */
export function useDocumentMeta({
  title,
  description,
  canonicalPath,
  ogImage = "/og-image.png",
}: DocumentMetaOptions) {
  useEffect(() => {
    // Set document title
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (attribute: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description || DEFAULT_DESCRIPTION;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);

    if (canonicalPath) {
      const canonicalUrl = `${BASE_URL}${canonicalPath}`;
      setMeta("property", "og:url", canonicalUrl);

      // Set canonical link
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalUrl);
    }

    // Cleanup: restore default title on unmount
    return () => {
      document.title = `${SITE_NAME} - Find Your Path`;
    };
  }, [title, description, canonicalPath, ogImage]);
}
