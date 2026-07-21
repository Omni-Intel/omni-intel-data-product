"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { OrderPanel } from "@/components/OrderPanel";
import { ViewportVideo } from "@/components/ViewportVideo";
import { papers } from "@/content/papers";
import { serviceContent, datasetCollection } from "@/content/serviceContent";
import { siteContent } from "@/content/siteContent";

const navItems = [
  { id: "services", href: "#services", label: "服务能力" },
  { href: "/products/neural-data", label: "产品中心" },
  { href: "/papers", label: "研究成果" },
] as const;

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="section-heading">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1>
            <span>采集人的真实反应</span>
            <span>为智能提供新的理解维度</span>
          </h1>
          <p className="hero__lead">{serviceContent.lead}</p>
          <p className="hero__support">我们记录人看到了什么、做了什么，也进一步探索人在感知、判断和行动过程中的真实反应。</p>
          <button type="button" className="button button--primary hero__button" onClick={onBook}>预约体验</button>
        </div>
        <div className="hero__space" aria-hidden="true" />
      </div>
    </section>
  );
}

function DatasetProof() {
  return (
    <section id="dataset-proof" className="dataset-proof" aria-label="汉脑交响数据集下载情况">
      <div className="container dataset-proof__inner">
        <span className="dataset-proof__source">SCIENCE DATA BANK</span>
        <p>
          数据集社区
          <a href={datasetCollection.url} target="_blank" rel="noreferrer">汉脑交响</a>
          已被下载 <strong>{datasetCollection.downloads}</strong> 次
        </p>
        <Link className="text-link" href="/papers#datasets">了解更多</Link>
      </div>
    </section>
  );
}

function Narrative() {
  return (
    <section className="section section--narrative">
      <div className="container narrative">
        <h2>{serviceContent.narrative.title}</h2>
        <div className="narrative__body">
          {serviceContent.narrative.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="section section--services">
      <div className="container">
        <SectionHeader title="我们可以提供" description="真实采集设备、实验范式、多模态数据结构与技术验证" />
        <div className="service-media-grid">
          <Link className="service-media" href="/products/neural-data#eeg">
            <div className="service-media__visual service-media__visual--image">
              <Image
                className="collection-media__image"
                src="/eeg-collection.webp"
                alt="脑电数据采集现场"
                fill
                sizes="(max-width: 639px) 100vw, 50vw"
                loading="lazy"
                unoptimized
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
            <div className="service-media__copy">
              <h3>脑电数据采集流程示例</h3>
              <p>以真实采集设备、实验平台和规范流程，完成脑电及眼动、行为等模态的同步采集。</p>
            </div>
          </Link>
          <Link className="service-media" href="/products/neural-data#emg">
            <div className="service-media__visual service-media__visual--video">
              <ViewportVideo className="collection-media__video" label="肌电数据采集流程视频" />
            </div>
            <div className="service-media__copy">
              <h3>肌电数据采集流程示例</h3>
              <p>通过设备、平台与任务流程协同，记录肌电、动作和环境信息，并建立统一时间基准。</p>
            </div>
          </Link>
        </div>
        <Link className="section-more" href="/products/neural-data">查看产品</Link>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="section section--capabilities">
      <div className="container">
        <SectionHeader title="核心能力" description="围绕神经信号建立可执行、可同步、可解析、可规模化的完整数据服务。" />
        <div className="capability-cards">
          {serviceContent.capabilities.map((item, index) => (
            <article className="capability-card" key={item.title}>
              <span>能力 {String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataTypes() {
  return (
    <section className="section section--data-types">
      <div className="container">
        <SectionHeader title="多模态数据结构" description="不只记录单一信号，而是将神经、生理、行为、任务与环境信息组织为可对齐的数据体系。" />
        <div className="data-type-grid">
          {serviceContent.dataTypes.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.items.join(" / ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Applications() {
  return (
    <section className="section section--research section--applications-content">
      <div className="container">
        <SectionHeader title="面向真实应用" description="从研究问题出发，也面向需要理解人的人工智能系统与真实业务场景。" />
        <div className="application-cards">
          {serviceContent.applications.map((item, index) => (
            <article className="application-card" key={item.title}>
              <span>场景 {String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p className="application-card__uses">{item.uses.join(" · ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResearchPreview() {
  const paper = papers[0];
  return (
    <div className="research-preview">
      <div className="research-preview__table" aria-label="研究成果论文预览">
        <div className="papers-list__head" aria-hidden="true">
          <span>Year</span><span>Paper</span><span>Author(s)</span><span />
        </div>
        <div className="papers-row">
          <span className="paper-row__year">{paper.year}</span>
          <strong>{paper.title}</strong>
          <span className="paper-row__authors">{paper.authors}</span>
          <Link className="research-more research-more--row" href="/papers">查看更多</Link>
        </div>
      </div>
    </div>
  );
}

export default function Homepage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openOrder = () => setDrawerOpen(true);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="site-header__inner">
          <a className="wordmark" href="#top" aria-label="返回首页顶部"><BrandLogo /></a>
          <nav className="site-nav" aria-label="主导航">
            {navItems.map((item) => item.href.startsWith("/")
              ? <Link key={item.label} href={item.href}>{item.label}</Link>
              : <a key={item.label} href={item.href}>{item.label}</a>)}
          </nav>
          <button type="button" className="button button--primary header-order" onClick={openOrder}>联系我们</button>
        </div>
      </header>

      <main className="homepage">
        <Hero onBook={openOrder} />
        <Narrative />
        <Services />
        <Capabilities />
        <DataTypes />

        <section className="section section--applications section--research-content">
          <div className="container">
            <SectionHeader {...siteContent.research} />
            <ResearchPreview />
          </div>
        </section>

        <DatasetProof />
        <Applications />

        <section id="order" className="section section--order">
          <div className="container order-cta">
            <h2>{siteContent.order.title}</h2>
            <p>{siteContent.order.description}</p>
            <button className="button button--primary" type="button" onClick={openOrder}>联系我们</button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>© {new Date().getFullYear()} 全域智能 / Omni-Intelligence</span>
        </div>
      </footer>
      <OrderPanel open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
