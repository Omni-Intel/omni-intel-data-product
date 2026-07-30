"use client";

import { SiteFooter } from "@/components/SiteFooter";
import { siteContent } from "@/content/siteContent";

type SiteBottomProps = {
  onContact?: () => void;
};

export function SiteBottom({ onContact }: SiteBottomProps) {
  const openContact = () => {
    if (onContact) {
      onContact();
      return;
    }

    window.dispatchEvent(new Event("open-order-panel"));
  };

  return (
    <>
      <section id="order" className="section section--order" data-motion-section>
        <div className="container order-cta">
          <h2 data-reveal="title">{siteContent.order.title}</h2>
          <button className="button button--primary" type="button" onClick={openContact} data-reveal="copy" data-reveal-delay="180">
            联系我们
          </button>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
