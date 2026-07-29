"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { OrderPanel } from "@/components/OrderPanel";

export function ProductHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const openDrawer = () => setDrawerOpen(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("open-order-panel", openDrawer);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("open-order-panel", openDrawer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <>
      <header className={`papers-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="papers-header__inner">
          <Link className="wordmark" href="/" aria-label="返回首页"><BrandLogo /></Link>
          <nav className="site-nav" aria-label="主导航">
            <Link href="/#services">服务能力</Link>
            <Link href="/#research">研究成果</Link>
            <Link className="is-active" href="/products/neural-data">数采中心</Link>
          </nav>
          <button type="button" className="button button--primary header-order" onClick={() => setDrawerOpen(true)}>联系我们</button>
        </div>
      </header>
      <OrderPanel open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
