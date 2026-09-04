"use client";

import { useEffect } from "react";

const VISIT_KEY = "squishy-visit-counted";

export function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem(VISIT_KEY)) return;
    sessionStorage.setItem(VISIT_KEY, "1");
    void fetch("/api/views", { method: "POST" });
  }, []);

  return null;
}
