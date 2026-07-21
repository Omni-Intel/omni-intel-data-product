import { PapersHeader } from "@/components/PapersHeader";
import { ProductContact } from "@/components/ProductContact";
import { papers } from "@/content/papers";
import { siteContent } from "@/content/siteContent";
import { datasetCollection } from "@/content/serviceContent";

export default function PapersPage() {
  return (
    <div className="papers-page">
      <PapersHeader />

      <main>
        <section className="papers-intro">
          <div className="container papers-intro__inner">
            <header className="section-heading">
              <h1>{siteContent.research.title}</h1>
              <p>{siteContent.research.description}</p>
            </header>
          </div>
        </section>

        <section className="papers-list" aria-label="研究成果论文列表">
          <div className="container">
            <div className="papers-list__head" aria-hidden="true">
              <span>Year</span>
              <span>Paper</span>
              <span>Author(s)</span>
              <span />
            </div>
            {papers.map((paper) => (
              <div className="papers-row" key={paper.url}>
                <span className="paper-row__year">{paper.year}</span>
                <strong>{paper.title}</strong>
                <span className="paper-row__authors">{paper.authors}</span>
                <a className="paper-link" href={paper.url} target="_blank" rel="noreferrer" aria-label={`查看论文：${paper.title}`}>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="datasets" className="dataset-archive">
          <div className="container">
            <header className="section-heading">
              <h2>开放数据集</h2>
              <p>以标准化数据结构记录自然任务中的神经信号、刺激内容与行为信息。</p>
            </header>
          </div>
          <div className="dataset-archive__summary">
            <div className="container dataset-archive__summary-inner">
              <span>SCIENCE DATA BANK</span>
              <p>数据集社区 <a href={datasetCollection.url} target="_blank" rel="noreferrer">{datasetCollection.name}</a> 已被下载 <strong>{datasetCollection.downloads}</strong> 次</p>
            </div>
          </div>
          <div className="container">
            <div className="dataset-rows" aria-label="汉脑交响数据集列表">
              {datasetCollection.datasets.map((dataset) => (
                <article className="dataset-row" key={dataset.name}>
                  <h3>{dataset.name}</h3>
                  <p>{dataset.description}</p>
                  <div className="dataset-row__downloads">
                    <strong>{dataset.downloads}</strong><span>次下载</span>
                  </div>
                  <a href={dataset.url} target="_blank" rel="noreferrer">访问数据集</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--order">
          <div className="container order-cta">
            <h2>{siteContent.order.title}</h2>
            <p>{siteContent.order.description}</p>
            <ProductContact />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>© {new Date().getFullYear()} 全域智能 / Omni-Intelligence</span>
        </div>
      </footer>
    </div>
  );
}
