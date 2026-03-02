"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopLayout } from "./desktop-layout";
import { MobileLayout } from "./mobile-layout";

export function NotebookWorkspace() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
