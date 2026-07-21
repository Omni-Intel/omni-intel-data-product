"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { siteContent, taskTypes } from "@/content/siteContent";

type OrderPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function OrderPanel({ open, onClose }: OrderPanelProps) {
  const [taskId, setTaskId] = useState<string>(taskTypes[0].id);
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
    const task = taskTypes.find((item) => item.id === taskId);
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
          subject: `网站需求咨询｜${String(data.get("name") ?? "未填写")}｜${task?.title ?? taskId}`,
          from_name: "Omni-Intelligence 网站",
          botcheck: data.get("botcheck") ?? "",
          任务类型: task?.title ?? taskId,
          姓名称呼: data.get("name"),
          机构团队: data.get("organization"),
          联系方式: data.get("contact"),
          需求概述: data.get("summary"),
          预计规模: data.get("scale") || "未填写",
          期望时间: data.get("timeline") || "未填写",
          现有范式说明: data.get("paradigm") || "未填写",
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
            <h2 id="order-panel-title">您的需求</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭下单面板">×</button>
        </header>

        <div className="task-types" role="radiogroup" aria-label="任务类型">
          {taskTypes.map((task) => (
            <label className={`task-card${taskId === task.id ? " is-selected" : ""}`} key={task.id}>
              <input type="radio" name="taskTypeCard" value={task.id} checked={taskId === task.id} onChange={() => setTaskId(task.id)} />
              <span className="task-card__number">{String(taskTypes.indexOf(task) + 1).padStart(2, "0")}</span>
              <strong>{task.title}</strong>
              <span>{task.description}</span>
              <span className="task-card__pricing">{task.pricing.join(" + ")}</span>
              {"note" in task && <small>{task.note}</small>}
            </label>
          ))}
        </div>

        <form className="order-form" onSubmit={submit}>
          <input className="form-botcheck" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <label>任务类型
            <select value={taskId} onChange={(event) => setTaskId(event.target.value)} required>
              {taskTypes.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}
            </select>
          </label>
          <div className="form-grid">
            <label>姓名/称呼<input name="name" required placeholder="请填写称呼" /></label>
            <label>机构/团队<input name="organization" required placeholder="请填写机构或团队" /></label>
          </div>
          <label>邮箱或微信<input name="contact" required placeholder="至少提供一种联系方式" /></label>
          <label>需求概述<textarea name="summary" required rows={4} placeholder="目标、任务、被试或场景" /></label>
          <div className="form-grid">
            <label>预计规模<input name="scale" placeholder="人数、小时、批次等（选填）" /></label>
            <label>期望时间<input name="timeline" placeholder="期望启动或交付时间（选填）" /></label>
          </div>
          <label>现有范式链接/说明<textarea name="paradigm" rows={2} placeholder="纯文本或 URL（选填，不要求上传文件）" /></label>
          <button className="button button--primary form-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "发送中" : "确认"}</button>
          {notice && <p className="form-notice" role="status">{notice}</p>}
        </form>

        <aside className="contact-placeholder">
          <div>
            <p><strong>邮箱</strong> <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a></p>
            <small>来信请注明：机构/团队、任务类型、预计规模与期望时间。</small>
          </div>
        </aside>
      </div>
    </div>
  );
}
