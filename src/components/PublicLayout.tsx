import { useEffect } from "react";

import { Outlet, useLocation } from "react-router-dom";

import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });

      return;
    }

    let frameId = 0;
    let attempts = 0;

    const rawId = location.hash.slice(1);

    let targetId = rawId;

    try {
      targetId = decodeURIComponent(rawId);
    } catch {
      targetId = rawId;
    }

    const scrollToHash = () => {
      const target = document.getElementById(targetId);

      if (target) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });

        return;
      }

      /*
       * The destination may live inside a
       * lazy-loaded route. Give it a short
       * window to mount before giving up.
       */
      if (attempts < 60) {
        attempts += 1;

        frameId = window.requestAnimationFrame(scrollToHash);
      }
    };

    frameId = window.requestAnimationFrame(scrollToHash);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.hash, location.pathname]);

  return (
    <div
      className="
        app-surface

        min-h-screen

        transition-colors
        duration-150
      "
    >
      <Navbar />

      <Outlet />

      <Footer />
    </div>
  );
}
