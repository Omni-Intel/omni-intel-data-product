"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { OrderPanel } from "@/components/OrderPanel";
import { ViewportVideo } from "@/components/ViewportVideo";
import { papers } from "@/content/papers";
import { serviceContent, datasetCollection } from "@/content/serviceContent";
import { siteContent } from "@/content/siteContent";

const navItems = [
  { id: "services", href: "#services", label: "服务能力" },
  { id: "research", href: "#research", label: "研究成果" },
  { href: "/products/neural-data", label: "数采中心" },
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
        <Link className="section-more" href="/products/neural-data">查看更多</Link>
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

function CountUp({ value, suffix = "+万" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (reduceMotion) {
        setCount(value);
        return;
      }
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / 1200, 1);
        setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref} data-count-target={value}>{count}{suffix}</span>;
}

function ResearchShowcase() {
  const [activePaper, setActivePaper] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePaper((current) => (current + 1) % papers.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [activePaper]);

  return (
    <section id="research" className="section section--research-showcase">
      <div className="container">
        <SectionHeader {...siteContent.research} />
        <div className="research-showcase">
          <div className="paper-carousel" aria-roledescription="轮播" aria-label="公开论文">
            <div className="paper-carousel__viewport">
              {papers.map((paper, index) => (
                <article className={`paper-slide${index === activePaper ? " is-active" : ""}`} hidden={index !== activePaper} key={paper.url}>
                  <div className="paper-slide__journal">{paper.journal}</div>
                  <a href={paper.url} target="_blank" rel="noreferrer" aria-label={`查看论文：${paper.title}`}>
                    <div className={`paper-slide__image${paper.images.length > 1 ? " paper-slide__image--stacked" : ""}`}>
                      {paper.images.map((image, imageIndex) => (
                        <Image
                          src={image.src}
                          alt={`${paper.title} 论文配图${paper.images.length > 1 ? ` ${imageIndex + 1}` : ""}`}
                          className={`paper-slide__asset paper-slide__asset--fit-${image.fit}`}
                          width={image.width}
                          height={image.height}
                          sizes="(max-width: 860px) 100vw, 55vw"
                          style={image.scale ? { width: `${image.scale * 100}%` } : undefined}
                          unoptimized
                          key={image.src}
                        />
                      ))}
                    </div>
                    <h3>{paper.title}</h3>
                  </a>
                </article>
              ))}
            </div>
            <div className="paper-carousel__controls">
              <div className="paper-carousel__dots" aria-label="选择论文">
                {papers.map((paper, index) => (
                  <button
                    type="button"
                    className={index === activePaper ? "is-active" : ""}
                    onClick={() => setActivePaper(index)}
                    aria-label={`第 ${index + 1} 篇：${paper.title}`}
                    aria-current={index === activePaper ? "true" : undefined}
                    key={paper.url}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="research-datasets" aria-label="汉脑交响数据集下载情况">
            <span className="research-datasets__source">SCIENCE DATA BANK</span>
            <div className="research-datasets__summary">
              <div>
                <p className="research-datasets__eyebrow">数据集社区</p>
                <a className="research-datasets__title" href={datasetCollection.url} target="_blank" rel="noreferrer">{datasetCollection.name}</a>
              </div>
              <div className="research-datasets__total">
                <CountUp value={Number.parseInt(datasetCollection.downloads, 10)} /><small>次下载</small>
              </div>
            </div>
            <div className="research-datasets__list">
              {datasetCollection.datasets.map((dataset) => (
                <a href={dataset.url} target="_blank" rel="noreferrer" key={dataset.name}>
                  <span>{dataset.name}</span>
                  <strong><CountUp value={Number.parseInt(dataset.downloads, 10)} suffix="+万次下载" /></strong>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
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

        <ResearchShowcase />
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
          <span>粤ICP备2026043468号-1</span>
        </div>
      </footer>
      <OrderPanel open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
