import { publicOverview } from "@/server/public-overview.mjs";
import { readPublishedOverview } from "@/server/published-overview.mjs";

/** Publish allowlisted totals and trends without forwarding credentials. */
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (process.env.OMNI_OVERVIEW_MODE === "push") {
    try {
      return Response.json(await readPublishedOverview(), { headers });
    } catch {
      return Response.json({error:{message:"正在等待数据同步，请稍后刷新"}}, {status:503,headers});
    }
  }
  const source = process.env.OMNI_OVERVIEW_SOURCE_URL ||
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:4173/api/public-overview" : "http://127.0.0.1:4180/api/public-overview");
  try {
    const target = new URL(source);
    const date = new URL(request.url).searchParams.get("date");
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) target.searchParams.set("date", date);
    const result = await fetch(target, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!result.ok) return Response.json({ error: { message: "暂时无法读取数据汇总，请稍后刷新" } }, { status: 503, headers });
    return Response.json(publicOverview(await result.json()), { headers });
  } catch {
    return Response.json({ error: { message: "数据汇总服务暂时无法连接，请稍后刷新" } }, { status: 503, headers });
  }
}
