import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Handles smooth scrolling to anchor IDs (e.g., #about, #how-it-works, #features, #impact, #contact)
 * across both intra-page clicks and cross-page navigation, or scrolls smoothly to the top on page change.
 */
export default function ScrollToTopOrHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 12;

      const tryScroll = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(tryScroll, 80);
        }
      };

      tryScroll();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, hash]);

  return null;
}
