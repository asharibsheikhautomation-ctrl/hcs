import Link from "next/link";
import { StoreStatePanel } from "@/components/store/store-state-panel";

export default function ProductsNotFound() {
  return (
    <section className="section-space">
      <div className="container-main">
        <StoreStatePanel
          eyebrow="Product Not Found"
          title="Product not found."
          description="It may have been removed or renamed."
          actions={
            <Link href="/products" className="btn-base btn-primary">
              Back to products
            </Link>
          }
        />
      </div>
    </section>
  );
}
