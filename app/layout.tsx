import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "全域智能｜神经数据采集与实验范式服务",
  description: "面向科研团队、大模型与具身智能客户，提供实验范式执行、范式调整、定制设计及多模态神经数据采集服务。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "全域智能｜神经数据采集与实验范式服务",
    description: "从实验设置到可验证的数据结果，为科研与模型团队提供神经数据采集服务。",
  },
  twitter: {
    card: "summary_large_image",
    title: "全域智能｜神经数据采集与实验范式服务",
    description: "从实验设置到可验证的数据结果。",
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
