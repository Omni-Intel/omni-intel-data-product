import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "全域智能｜神经多模态数据服务",
  description: "面向大脑基座模型、科学研究与智能体交互，提供神经多模态数据采集、处理、标注与结构化交付服务。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "全域智能｜神经多模态数据服务",
    description: "从范式设计、多模态采集到处理标注与结构化交付，为科研与模型团队提供可验证的数据基础。",
  },
  twitter: {
    card: "summary_large_image",
    title: "全域智能｜神经多模态数据服务",
    description: "神经多模态数据采集、处理、标注与结构化交付。",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "全域智能",
  url: siteUrl,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </body>
    </html>
  );
}
