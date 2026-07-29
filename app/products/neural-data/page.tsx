import Image from "next/image";
import { ProductContact } from "@/components/ProductContact";
import { ProductHeader } from "@/components/ProductHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ViewportVideo } from "@/components/ViewportVideo";
import { serviceContent } from "@/content/serviceContent";
import { siteContent } from "@/content/siteContent";

const workflow = [
  { title: "需求澄清与数据设计", description: "明确研究问题、模型任务或交互场景，确定被试范围、数据模态、任务上下文、标注体系、质量标准与交付结构。" },
  { title: "范式与预实验验证", description: "根据现有范式执行、调整或定制设计实验流程，完成设备接入、时间同步、事件标记与预实验验证。" },
  { title: "多模态采集与在线质控", description: "按照统一流程采集脑电及相关多模态数据，在线监测信号质量、任务执行与异常情况，保留原始数据和完整实验记录。" },
  { title: "数据处理、对齐与标注", description: "完成格式转换、去噪、切分、时间对齐、质量评估以及事件与状态标注，形成可追溯的数据处理记录。" },
  { title: "结构化交付与下游验证", description: "交付原始数据、处理数据、标签、说明文档与质量报告，并按约定支持研究分析、模型训练与下游任务验证。" },
] as const;

export default function NeuralDataProductPage() {
  return (
    <div className="product-page">
      <ProductHeader />
      <main>
        <section className="product-hero">
          <div className="container product-hero__inner">
            <h1>神经多模态数据服务</h1>
            <p>{serviceContent.lead}</p>
          </div>
        </section>

        <section className="product-overview" data-motion-section>
          <div className="container product-overview__inner">
            <p data-reveal="copy" data-reveal-delay="180">围绕研究问题、模型任务或交互场景，组织范式设计与验证、设备接入、多模态同步、在线质控、数据处理、标注与结构化交付。既支持现有范式执行，也可根据目标人群、任务上下文和下游验证要求定制数据方案。</p>
          </div>
        </section>

        <section id="eeg" className="product-media-section" data-motion-section>
          <div className="container product-media-row">
            <div className="product-media-row__visual product-media-row__visual--image" data-reveal="media" data-reveal-delay="0">
              <Image
                className="collection-media__image"
                src="/eeg-collection.webp"
                alt="脑电数据采集现场"
                fill
                sizes="(max-width: 860px) 100vw, 58vw"
                loading="lazy"
                unoptimized
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
            <div><h2 data-reveal="title">脑电数据采集流程示例</h2><p data-reveal="copy" data-reveal-delay="180">面向阅读、视听刺激与交互任务，完成脑电设备配置、实验范式运行、事件标记、多模态同步与信号质量检查。</p></div>
          </div>
        </section>

        <section id="emg" className="product-media-section product-media-section--reverse" data-motion-section>
          <div className="container product-media-row">
            <div className="product-media-row__visual product-media-row__visual--video" data-reveal="media" data-reveal-delay="0">
              <ViewportVideo className="collection-media__video" controls label="肌电数据采集流程视频" />
            </div>
            <div><h2 data-reveal="title">肌电数据采集流程示例</h2><p data-reveal="copy" data-reveal-delay="180">同步记录肌电、人体动作、操作过程与环境信息，观察任务执行中的身体响应，并与神经信号、行为事件和场景上下文对齐。</p></div>
          </div>
        </section>

        <section className="section section--capabilities" data-motion-section>
          <div className="container">
            <header className="section-heading"><h2 data-reveal="title">服务流程</h2></header>
            <div className="editorial-list">
              {workflow.map((item, index) => <article className="editorial-row" data-reveal="fast-copy" data-reveal-delay={String(180 + index * 70)} key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section section--order" data-motion-section>
          <div className="container order-cta">
            <h2 data-reveal="title">{siteContent.order.title}</h2>
            <div data-reveal="copy" data-reveal-delay="180"><ProductContact /></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
