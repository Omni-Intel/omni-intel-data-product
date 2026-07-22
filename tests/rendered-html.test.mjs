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
  assert.match(html, /data-count-target="27"/);
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
  for (const id of ["services", "research", "order"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(html, /href="\/papers/);
  assert.match(html, /href="\/products\/neural-data"/);
  assert.match(html, />数采中心</);
  assert.ok(html.indexOf('href="#research"') < html.indexOf('href="/products/neural-data"'));
  assert.match(html, />查看更多</);
  assert.doesNotMatch(html, />数据产品</);
  assert.match(html, /eeg-collection\.webp/);
  assert.doesNotMatch(html, /EEG_COLLECTION_IMAGE_PLACEHOLDER/);
  assert.match(html, /emg-collection-poster\.webp/);
  assert.match(html, /emg-collection\.webm/);
  assert.match(html, /sales@omni-intel\.cn/);
  assert.match(html, /src="\/wechat\.webp"/);
  assert.match(html, /深圳全域智能/);
  assert.match(html, /粤ICP备2026043468号-1/);
  assert.match(html, /href="https:\/\/beian\.miit\.gov\.cn\//);
  assert.doesNotMatch(html, /扫码关注公众号或来信时/);
  assert.match(html, /name="botcheck"/);
  assert.doesNotMatch(html, /ICP_RECORD_NUMBER/);
  assert.doesNotMatch(html, /TODO_CONTENT_REVIEW/);
});

test("renders research as a homepage carousel with dataset counters", async () => {
  const html = await (await render()).text();
  assert.match(html, /class="paper-carousel"/);
  assert.equal((html.match(/class="paper-slide(?: is-active)?"/g) ?? []).length, 5);
  assert.doesNotMatch(html, /s41597-025-06466-8/);
  assert.match(html, /Multi-dataset Joint Pre-training of Emotional EEG Enables Generalizable Affective Computing/);
  assert.match(html, /A Multi-Context Emotional EEG Dataset for Cross-Context Emotion Decoding/);
  assert.match(html, /ChineseEEG: A Chinese Linguistic Corpora EEG Dataset for Semantic Alignment and Neural Decoding/);
  assert.match(html, /EEGdenoiseNet: a benchmark dataset for deep learning solutions of EEG denoising/);
  assert.match(html, /Scientific Data/);
  assert.match(html, /Journal of Neural Engineering/);
  assert.doesNotMatch(html, /论文图片待补充/);
  assert.match(html, /multi-dataset-joint-pre-training\.webp/);
  assert.match(html, /style="width:95%"/);
  assert.match(html, /chineseEEG2\.webp/);
  assert.match(html, /emotional-eeg\.webp/);
  assert.match(html, /chineseEEG\.webp/);
  assert.match(html, /EEGdenoiseNet\.webp/);
  assert.equal((html.match(/paper-slide__asset--fit-width/g) ?? []).length, 2);
  assert.equal((html.match(/paper-slide__asset--fit-height/g) ?? []).length, 3);
  assert.match(html, /2508\.04240[\s\S]*s41597-025-05349-2[\s\S]*s41597-024-03398-7[\s\S]*2510\.22197[\s\S]*1741-2552\/ac2bf8/);
  assert.match(html, /ChineseEEG-2/);
  assert.match(html, /ChineseEEG/);
  assert.match(html, /EmoEEG-MC/);
  assert.match(html, /sciencedb\.CHNNeuro\.00001/);
  assert.match(html, /sciencedb\.CHNNeuro\.00007/);
  assert.match(html, /dataSetId=9b182864c9604255a0433d1edae88f0b/);
  for (const value of [27, 8, 3, 15]) assert.match(html, new RegExp(`data-count-target="${value}"`));
  assert.match(html, /research-datasets__list[\s\S]*EmoEEG-MC[\s\S]*ChineseEEG[\s\S]*ChineseEEG-2/);
  assert.doesNotMatch(html, /上一张|下一张/);
  assert.doesNotMatch(html, /class="papers-row"/);
});

test("does not expose a standalone research-results page", async () => {
  const response = await render("/papers");
  assert.equal(response.status, 404);
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
  assert.ok(html.indexOf('href="/#research"') < html.indexOf('href="/products/neural-data"'));
  assert.match(html, /id="order-panel-title">联系我们/);
  assert.match(html, /class="required-mark"[^>]*>\*</);
  assert.equal((html.match(/class="optional-mark"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /预计规模|期望时间|现有范式链接\/说明/);
  assert.doesNotMatch(html, /class="task-types"|>任务类型</);
  assert.equal((html.match(/id="order-panel-title"/g) ?? []).length, 1);
});
