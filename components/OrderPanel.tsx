"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { siteContent } from "@/content/siteContent";

type OrderPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function OrderPanel({ open, onClose }: OrderPanelProps) {
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("drawer-open");
    window.setTimeout(() => dialogRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("drawer-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const contact = String(data.get("contact") || "未填写");
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      setNotice("邮件服务尚未配置，请联系网站管理员。");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `网站需求咨询｜${contact}`,
          from_name: "Omni-Intelligence 网站",
          botcheck: data.get("botcheck") ?? "",
          姓名称呼: data.get("name") || "未填写",
          机构团队: data.get("organization") || "未填写",
          联系方式: contact,
          需求概述: data.get("summary") || "未填写",
        }),
      });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || "发送失败，请稍后重试。");
      form.reset();
      setNotice("需求已发送至 sales@omni-intel.cn，我们会尽快与您联系。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "发送失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button className="drawer__backdrop" type="button" aria-label="关闭下单面板" onClick={onClose} />
      <div className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="order-panel-title" ref={dialogRef} tabIndex={-1}>
        <header className="drawer__header">
          <div>
            <h2 id="order-panel-title">联系我们</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭下单面板">×</button>
        </header>

        <aside className="contact-placeholder">
          <img className="contact-qr-image" src="/wechat.webp" alt="深圳全域智能公众号二维码" width="190" height="190" />
          <div className="contact-details">
            <p><strong>公众号</strong> {siteContent.contact.officialAccount}</p>
            <p><strong>邮箱</strong> <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a></p>
          </div>
        </aside>

        <form className="order-form" onSubmit={submit}>
          <input className="form-botcheck" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="form-grid">
            <label><span>姓名/称呼 <span className="optional-mark">（选填）</span></span><input name="name" placeholder="请填写称呼" /></label>
            <label><span>机构/团队 <span className="optional-mark">（选填）</span></span><input name="organization" placeholder="请填写机构或团队" /></label>
          </div>
          <label><span>邮箱或微信<span className="required-mark" aria-hidden="true">*</span></span><input name="contact" required placeholder="至少提供一种联系方式" /></label>
          <label><span>需求概述 <span className="optional-mark">（选填）</span></span><textarea name="summary" rows={6} placeholder="目标、任务、被试或场景" /></label>
          <button className="button button--primary form-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "发送中" : "确认"}</button>
          {notice && <p className="form-notice" role="status">{notice}</p>}
        </form>

      </div>
    </div>
  );
}
