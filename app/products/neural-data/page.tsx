import Image from "next/image";
import { ProductContact } from "@/components/ProductContact";
import { ProductHeader } from "@/components/ProductHeader";
import { ViewportVideo } from "@/components/ViewportVideo";
import { serviceContent } from "@/content/serviceContent";

const workflow = [
  { title: "数据采集", description: "根据目标任务配置设备、实验范式、被试流程与同步方式，保留原始信号和完整实验记录。" },
  { title: "数据处理", description: "完成格式转换、去噪、切分、对齐与质量检查，建立可追溯的数据处理记录。" },
  { title: "数据标注", description: "结合刺激、任务、行为与场景信息，为数据增加事件、状态和结果标签。" },
  { title: "数据交付", description: "按约定的数据结构、说明文档和质量标准交付，支持后续研究分析与模型训练。" },
] as const;

export default function NeuralDataProductPage() {
  return (
    <div className="product-page">
      <ProductHeader />
      <main>
        <section className="product-hero">
          <div className="container product-hero__inner">
            <span>设备 · 平台 · 流程</span>
            <h1>神经多模态数据服务</h1>
            <p>{serviceContent.lead}</p>
          </div>
        </section>

        <section className="product-overview">
          <div className="container product-overview__inner">
            <p>从设备接入、实验程序、时间同步到现场执行，我们将分散的采集环节组织为可复用的技术流程。服务可根据已有范式直接执行，也可围绕目标人群、任务场景和交付要求完成调整与验证。</p>
          </div>
        </section>

        <section id="eeg" className="product-media-section">
          <div className="container product-media-row">
            <div className="product-media-row__visual product-media-row__visual--image">
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
            <div><h2>脑电数据采集流程示例</h2><p>面向自然阅读、视听刺激和交互任务，完成脑电设备配置、范式运行、事件标记、多模态同步与数据质量检查。</p></div>
          </div>
        </section>

        <section id="emg" className="product-media-section product-media-section--reverse">
          <div className="container product-media-row">
            <div className="product-media-row__visual product-media-row__visual--video">
              <ViewportVideo className="collection-media__video" controls label="肌电数据采集流程视频" />
            </div>
            <div><h2>肌电数据采集流程示例</h2><p>结合肌电、人体动作、操作过程和环境信息，记录人在执行与交互过程中的身体响应，支持具身智能和人机协作研究。</p></div>
          </div>
        </section>

        <section className="section section--capabilities">
          <div className="container">
            <header className="section-heading"><h2>服务流程</h2><p>从需求澄清到结构化数据交付，每一步都保留明确的输入、执行与验证记录。</p></header>
            <div className="editorial-list">
              {workflow.map((item, index) => <article className="editorial-row" key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section section--order">
          <div className="container order-cta">
            <h2>从一项真实任务开始设计采集方案</h2>
            <p>告诉我们目标、场景、数据模态与预计规模</p>
            <ProductContact />
          </div>
        </section>
      </main>
    </div>
  );
}
