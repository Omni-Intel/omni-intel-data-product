"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { OrderPanel } from "@/components/OrderPanel";

export function ProductHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const openDrawer = () => setDrawerOpen(true);
    window.addEventListener("open-order-panel", openDrawer);
    return () => window.removeEventListener("open-order-panel", openDrawer);
  }, []);
  return (
    <>
      <header className="papers-header">
        <div className="papers-header__inner">
          <Link className="wordmark" href="/" aria-label="返回首页"><BrandLogo /></Link>
          <nav className="site-nav" aria-label="主导航">
            <Link href="/#services">服务能力</Link>
            <Link className="is-active" href="/products/neural-data">产品中心</Link>
            <Link href="/papers">研究成果</Link>
          </nav>
          <button type="button" className="button button--primary header-order" onClick={() => setDrawerOpen(true)}>联系我们</button>
        </div>
      </header>
      <OrderPanel open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
