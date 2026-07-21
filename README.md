# omni-intel-data-product

全域智能（Omni-Intelligence）的神经多模态数据产品官网，使用 Vinext / React 构建。网站无需登录或数据库，包含首页、产品中心、研究成果页和 Web3Forms 联系表单。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://127.0.0.1:3000`。

## 环境变量

复制 `.env.example` 为 `.env.local`：

```env
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=Web3Forms提供的AccessKey
NEXT_PUBLIC_SITE_URL=https://你的正式域名
```

Web3Forms Access Key 应使用 `sales@omni-intel.cn` 申请。`.env.local` 仅用于本地，不应提交到远程仓库；部署时在托管平台配置同名环境变量。

## 常用命令

```bash
npm run dev
npm run build
npm run lint
npm test
```

## 目录

- `app/`：页面、布局和全局样式
- `components/`：可复用组件及交互
- `content/`：网站文案、论文和数据集信息
- `public/`：正式图片、视频、Logo 和图标
- `tests/`：服务端渲染测试
- `worker/`：Vinext 的 Cloudflare Worker 入口

正式网页视频使用 VP9 WebM，并以 H.264 MP4 作为兼容回退。视频母版、构建产物、缓存、本地环境变量和依赖目录均不包含在远程仓库中。
