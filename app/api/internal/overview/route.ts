import {acceptPublishedOverview} from "@/server/published-overview.mjs";

export async function POST(request: Request) {
  if (process.env.OMNI_OVERVIEW_MODE !== "push") {
    return Response.json({error:{message:"数据同步尚未配置"}}, {status:503,headers:{"Cache-Control":"no-store"}});
  }
  return acceptPublishedOverview(request);
}
