import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/page-transition";

export default function AdminTemplate({ children }: { children: ReactNode }) {
  return <PageTransition preset="admin">{children}</PageTransition>;
}
