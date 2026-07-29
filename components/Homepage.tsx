"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { OrderPanel } from "@/components/OrderPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { ViewportVideo } from "@/components/ViewportVideo";
import { papers } from "@/content/papers";
import { serviceContent, datasetCollection } from "@/content/serviceContent";
import { siteContent } from "@/content/siteContent";

const navItems = [
  { id: "services", href: "#services", label: "服务能力" },
  { id: "research", href: "#research", label: "研究成果" },
  { href: "/products/neural-data", label: "数采中心" },
] as const;

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="section-heading">
      <h2 data-reveal="title">{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1>
            <span>定义以人为中心的</span>
            <span>神经信号数采新范式</span>
          </h1>
          <button type="button" className="button button--primary hero__button" onClick={onBook}>预约体验</button>
        </div>
        <div className="hero__space" aria-hidden="true" />
      </div>
    </section>
  );
}

function Narrative() {
  return (
    <section className="section section--narrative" data-motion-section>
      <div className="container narrative">
        <h2 data-reveal="title">{serviceContent.narrative.title}</h2>
        <div className="narrative__body">
          {serviceContent.narrative.paragraphs.map((paragraph, index) => (
            <p data-reveal="copy" data-reveal-delay={String(180 + index * 70)} key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="section section--services" data-motion-section>
      <div className="container">
        <SectionHeader title="我们可以提供" />
        <div className="service-media-grid">
          <Link className="service-media" href="/products/neural-data#eeg">
            <div className="service-media__visual service-media__visual--image" data-reveal="media" data-reveal-delay="0">
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
            <div className="service-media__copy" data-reveal="copy" data-reveal-delay="180">
              <h3>脑电数据采集流程示例</h3>
            </div>
          </Link>
          <Link className="service-media" href="/products/neural-data#emg">
            <div className="service-media__visual service-media__visual--video" data-reveal="media" data-reveal-delay="0">
              <ViewportVideo className="collection-media__video" label="肌电数据采集流程视频" />
            </div>
            <div className="service-media__copy" data-reveal="copy" data-reveal-delay="250">
              <h3>肌电数据采集流程示例</h3>
            </div>
          </Link>
        </div>
        <Link className="section-more" href="/products/neural-data" data-reveal="copy" data-reveal-delay="320">查看更多</Link>
      </div>
    </section>
  );
}

function DataTypes() {
  return (
    <section className="section section--data-types" data-motion-section>
      <div className="container">
        <SectionHeader title="多模态数据体系" />
        <div className="data-type-grid">
          {serviceContent.dataTypes.map((item, index) => (
            <article data-reveal="copy" data-reveal-delay={String(180 + index * 70)} key={item.title}>
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
    <section className="section section--research section--applications-content" data-motion-section>
      <div className="container">
        <SectionHeader title="应用方向" />
        <div className="application-cards">
          {serviceContent.applications.map((item, index) => (
            <article className="application-card" data-reveal="copy" data-reveal-delay={String(180 + index * 70)} key={item.title}>
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
  const [{ activePaper, previousPaper }, setPaperState] = useState<{ activePaper: number; previousPaper: number | null }>({
    activePaper: 0,
    previousPaper: null,
  });
  const paperPreloaders = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    paperPreloaders.current = papers.slice(1).flatMap((paper) =>
      paper.images.map((image) => {
        const preloader = new window.Image();
        preloader.decoding = "async";
        preloader.src = image.src;
        void preloader.decode().catch(() => undefined);
        return preloader;
      }),
    );

    return () => {
      paperPreloaders.current = [];
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPaperState((current) => ({
        activePaper: (current.activePaper + 1) % papers.length,
        previousPaper: current.activePaper,
      }));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [activePaper]);

  useEffect(() => {
    if (previousPaper === null) return;
    const timer = window.setTimeout(() => {
      setPaperState((current) => current.previousPaper === previousPaper
        ? { ...current, previousPaper: null }
        : current);
    }, 560);
    return () => window.clearTimeout(timer);
  }, [previousPaper]);

  const showPaper = (nextPaper: number) => {
    setPaperState((current) => nextPaper === current.activePaper
      ? current
      : { activePaper: nextPaper, previousPaper: current.activePaper });
  };

  return (
    <section id="research" className="section section--research-showcase" data-motion-section="technical">
      <div className="container">
        <SectionHeader title={siteContent.research.title} />
        <div className="research-showcase">
          <div className="paper-carousel" aria-roledescription="轮播" aria-label="公开论文" data-reveal="media" data-reveal-delay="0">
            <div className="paper-carousel__viewport">
              {papers.map((paper, index) => {
                const isActive = index === activePaper;
                const isLeaving = index === previousPaper;
                return (
                <article
                  className={`paper-slide${isActive ? " is-active" : ""}${isActive && previousPaper !== null ? " is-entering" : ""}${isLeaving ? " is-leaving" : ""}`}
                  hidden={!isActive && !isLeaving}
                  aria-hidden={!isActive}
                  key={paper.url}
                >
                  <div className="paper-slide__journal">{paper.journal}</div>
                  <a href={paper.url} target="_blank" rel="noreferrer" aria-label={`查看论文：${paper.title}`} tabIndex={isActive ? undefined : -1}>
                    <div className={`paper-slide__image${paper.images.length > 1 ? " paper-slide__image--stacked" : ""}`}>
                      {paper.images.map((image, imageIndex) => (
                        <Image
                          src={image.src}
                          alt={`${paper.title} 论文配图${paper.images.length > 1 ? ` ${imageIndex + 1}` : ""}`}
                          className={`paper-slide__asset paper-slide__asset--fit-${image.fit}`}
                          width={image.width}
                          height={image.height}
                          sizes="(max-width: 860px) 100vw, 55vw"
                          loading={index === 0 ? "eager" : "lazy"}
                          style={image.scale ? { width: `${image.scale * 100}%` } : undefined}
                          unoptimized
                          key={image.src}
                        />
                      ))}
                    </div>
                    <h3>{paper.title}</h3>
                  </a>
                </article>
                );
              })}
            </div>
            <div className="paper-carousel__controls">
              <div className="paper-carousel__dots" aria-label="选择论文">
                {papers.map((paper, index) => (
                  <button
                    type="button"
                    className={index === activePaper ? "is-active" : ""}
                    onClick={() => showPaper(index)}
                    aria-label={`第 ${index + 1} 篇：${paper.title}`}
                    aria-current={index === activePaper ? "true" : undefined}
                    key={paper.url}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="research-datasets" aria-label="汉脑交响数据集下载情况" data-reveal="copy" data-reveal-delay="180">
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
    onScroll();
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
        <DataTypes />

        <ResearchShowcase />
        <Applications />

        <section id="order" className="section section--order" data-motion-section>
          <div className="container order-cta">
            <h2 data-reveal="title">{siteContent.order.title}</h2>
            <button className="button button--primary" type="button" onClick={openOrder} data-reveal="copy" data-reveal-delay="180">联系我们</button>
          </div>
        </section>
      </main>

      <SiteFooter />
      <OrderPanel open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
