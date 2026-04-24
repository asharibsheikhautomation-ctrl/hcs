"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StoreStatePanel } from "@/components/store/store-state-panel";

export default function StoreError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-space">
      <div className="container-main">
        <StoreStatePanel
          tone="error"
          eyebrow="Storefront Error"
          title="This page could not load."
          description="Please retry or keep browsing the store."
          actions={
            <>
              <button type="button" onClick={unstable_retry} className="btn-base btn-dark">
                Try again
              </button>
              <Link href="/products" className="btn-base btn-secondary">
                Browse products
              </Link>
            </>
          }
        />
      </div>
    </section>
  );
}
