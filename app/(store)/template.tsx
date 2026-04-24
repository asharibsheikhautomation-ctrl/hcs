import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/page-transition";

export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <PageTransition preset="store">{children}</PageTransition>;
}
