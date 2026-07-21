"use client";

export function ProductContact() {
  return <button className="button button--primary" type="button" onClick={() => window.dispatchEvent(new Event("open-order-panel"))}>联系我们</button>;
}
