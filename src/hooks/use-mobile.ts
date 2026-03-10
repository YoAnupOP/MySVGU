"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const getMatches = React.useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth < MOBILE_BREAKPOINT;
  }, []);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const update = () => setIsMobile(getMatches());

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, [getMatches]);

  return isMobile;
}
