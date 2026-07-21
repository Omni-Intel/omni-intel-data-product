import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the neural multimodal data service homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>全域智能｜神经数据采集与实验范式服务<\/title>/);
  assert.match(html, /采集人的真实反应/);
  assert.match(html, /为智能提供新的理解维度/);
  assert.match(html, /预约体验/);
  assert.match(html, /从记录行为，走向理解行为背后的反应/);
  assert.match(html, /把复杂的采集需求交给可靠的技术体系/);
  assert.match(html, /从研究设计到标准化数据交付/);
  assert.match(html, /src="\/omni-intelligence-logo\.svg"/);
  assert.doesNotMatch(html, /LOGO_WORDMARK/);
  assert.doesNotMatch(html, /HERO_VIDEO_PLACEHOLDER/);
  assert.doesNotMatch(html, /metric__value|StatisticsDashboard/);
  assert.match(html, /汉脑交响/);
  assert.match(html, /27\+万/);
  assert.doesNotMatch(html, />0\+万</);
  assert.match(html, /class="capability-cards"/);
  assert.match(html, /class="application-cards"/);
  assert.doesNotMatch(html, /研究能力概览/);
  assert.match(html, /核心能力/);
  assert.ok(html.indexOf("<h2>研究成果</h2>") < html.indexOf("<h2>面向真实应用</h2>"));
  assert.match(html, /脑电数据采集流程示例/);
  assert.match(html, /肌电数据采集流程示例/);
  assert.doesNotMatch(html, /脑电采集 \/ 图片|肌电采集 \/ 视频/);
  assert.doesNotMatch(html, /RESEARCH STANDARD/);
  assert.doesNotMatch(html, /NEURAL DATA INFRASTRUCTURE/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("renders the required semantic anchors and production contact details", async () => {
  const html = await (await render()).text();
  for (const id of ["services", "order"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /href="\/papers"/);
  assert.match(html, /href="\/products\/neural-data"/);
  assert.match(html, />产品中心</);
  assert.match(html, />查看产品</);
  assert.doesNotMatch(html, />数据产品</);
  assert.match(html, /eeg-collection\.webp/);
  assert.doesNotMatch(html, /EEG_COLLECTION_IMAGE_PLACEHOLDER/);
  assert.match(html, /emg-collection-poster\.webp/);
  assert.match(html, /emg-collection\.webm/);
  assert.match(html, /sales@omni-intel\.cn/);
  assert.doesNotMatch(html, /CONTACT_QR_CODE|CONTACT_WECHAT_ID|CONTACT_EMAIL/);
  assert.match(html, /name="botcheck"/);
  assert.doesNotMatch(html, /ICP_RECORD_NUMBER/);
  assert.doesNotMatch(html, /TODO_CONTENT_REVIEW/);
});

test("renders a separate research-results page with text-only metadata and arrow links", async () => {
  const html = await (await render("/papers")).text();
  assert.match(html, /<button[^>]*class="button button--primary header-order"[^>]*>联系我们<\/button>/);
  assert.doesNotMatch(html, /href="\/\?contact=1"/);
  assert.match(html, /id="order-panel-title">您的需求/);
  assert.ok(html.indexOf('class="drawer') > html.indexOf("</header>"), "contact drawer must render outside the sticky papers header");
  assert.match(html, /Year/);
  assert.match(html, /Paper/);
  assert.match(html, /Author\(s\)/);
  assert.doesNotMatch(html, />Journal</);
  assert.doesNotMatch(html, /论文来源/);
  assert.match(html, /An EEG Dataset for Multimodal Semantic Alignment and Neural Decoding during Reading and Listening/);
  assert.match(html, /Multi-dataset Joint Pre-training of Emotional EEG Enables Generalizable Affective Computing/);
  assert.match(html, /A Multi-Context Emotional EEG Dataset for Cross-Context Emotion Decoding/);
  assert.match(html, /ChineseEEG: A Chinese Linguistic Corpora EEG Dataset for Semantic Alignment and Neural Decoding/);
  assert.match(html, /EEGdenoiseNet: a benchmark dataset for deep learning solutions of EEG denoising/);
  assert.equal((html.match(/class="papers-row"/g) ?? []).length, 6);
  assert.equal((html.match(/class="paper-link"/g) ?? []).length, 6);
  assert.match(html, /id="datasets"/);
  assert.match(html, /ChineseEEG-2/);
  assert.match(html, /ChineseEEG/);
  assert.match(html, /sciencedb\.CHNNeuro\.00001/);
  assert.match(html, /sciencedb\.CHNNeuro\.00007/);
  assert.match(html, />3\+万<\/strong><span>次下载<\/span>/);
  assert.match(html, />8\+万<\/strong><span>次下载<\/span>/);
  assert.ok(html.indexOf("8+万") < html.indexOf("3+万"), "datasets should be ordered by downloads descending");
  assert.match(html, /把复杂的采集需求交给可靠的技术体系/);
  assert.match(html, /从研究设计到标准化数据交付/);
  assert.match(html, /class="site-footer"/);
  assert.match(html, /全域智能 \/ Omni-Intelligence/);
});

test("homepage previews only the newest research paper", async () => {
  const html = await (await render()).text();
  assert.match(html, /An EEG Dataset for Multimodal Semantic Alignment and Neural Decoding during Reading and Listening/);
  assert.doesNotMatch(html, /Multi-dataset Joint Pre-training of Emotional EEG Enables Generalizable Affective Computing/);
  assert.equal((html.match(/class="papers-row"/g) ?? []).length, 1);
  assert.equal((html.match(/class="paper-link"/g) ?? []).length, 0);
  assert.match(html, /href="\/papers" class="research-more research-more--row">查看更多/);
  assert.doesNotMatch(html, /href="https:\/\/www\.nature\.com\/articles\/s41597-025-06466-8"/);
});

test("renders the dedicated neural data product page", async () => {
  const html = await (await render("/products/neural-data")).text();
  assert.match(html, /神经多模态数据服务/);
  assert.match(html, /设备 · 平台 · 流程/);
  assert.match(html, /脑电数据采集流程示例/);
  assert.match(html, /肌电数据采集流程示例/);
  assert.match(html, /eeg-collection\.webp/);
  assert.doesNotMatch(html, /EEG_COLLECTION_IMAGE_PLACEHOLDER/);
  assert.match(html, /emg-collection-poster\.webp/);
  assert.match(html, /emg-collection\.mp4/);
  assert.match(html, /id="eeg"/);
  assert.match(html, /id="emg"/);
  assert.match(html, /服务流程/);
  assert.match(html, /id="order-panel-title">您的需求/);
  assert.equal((html.match(/id="order-panel-title"/g) ?? []).length, 1);
});
