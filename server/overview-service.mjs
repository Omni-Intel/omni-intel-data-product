import http from 'node:http';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createAggregateReader,publicOverview} from './public-overview.mjs';

export function createOverviewServer(read) {
  return http.createServer(async(req,res)=>{
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
    if (req.method!=='GET') return send(405,{error:{message:'Method not allowed'}});
    const url=new URL(req.url,'http://127.0.0.1');
    if (!['/health','/api/public-overview'].includes(url.pathname)) return send(404,{error:{message:'Not found'}});
    try {
      const data=publicOverview(await read());
      if (url.pathname==='/health') return send(data.sourceRefreshFailed?503:200,{ok:!data.sourceRefreshFailed,updatedAt:data.updatedAt,selectedDate:data.selectedDate});
      return send(200,data);
    } catch { return send(503,{error:{message:'数据汇总服务暂时不可用'}}); }
  });
}

export async function canonicalReader(directory) {
  if (!directory || !path.isAbsolute(directory)) throw new Error('OMNI_DASHBOARD_DIR must name the installed dashboard directory');
  const moduleUrl=name=>pathToFileURL(path.join(directory,'dist',name)).href;
  const [{loadConfig},{createDatabase},{DisplayDashboardService,summarizeSessionRecords,DASHBOARD_DATA_CONTRACT_VERSION}]=await Promise.all([
    import(moduleUrl('config.js')),import(moduleUrl('db/pool.js')),import(moduleUrl('display/dashboard.js')),
  ]);
  if (DASHBOARD_DATA_CONTRACT_VERSION!==7) throw new Error('Dashboard data contract must be version 7');
  const config=loadConfig();
  if (config.database.engine!=='postgres' || config.database.ssl?.rejectUnauthorized!==true) throw new Error('Use the existing verified TLS PostgreSQL configuration');
  const db=createDatabase(config.database);
  return {
    close:()=>db.end(),
    load:async()=>{
      const client=await db.connect();
      try {
        await client.query('BEGIN READ ONLY');
        await client.query("SET LOCAL statement_timeout = '8000ms'");
        const service=new DisplayDashboardService({query:(...args)=>client.query(...args)});
        const snapshot=await service.readSnapshot();
        const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
        const query={date:today,participant:'',paradigm:'',status:'all',page:1};
        const first=summarizeSessionRecords(snapshot.records,query,new Date(snapshot.updatedAt));
        const date=first.availableDates.includes(today)?today:first.availableDates.at(-1)||today;
        const result=date===today?first:summarizeSessionRecords(snapshot.records,{...query,date},new Date(snapshot.updatedAt));
        return publicOverview({...result,updatedAt:snapshot.updatedAt});
      } finally {
        await client.query('ROLLBACK').catch(()=>{});
        client.release();
      }
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const source=await canonicalReader(process.env.OMNI_DASHBOARD_DIR);
    const read=createAggregateReader(source.load);
    await read(); // Do not declare a live service ready before a real database read.
    const port=Number(process.env.OMNI_OVERVIEW_PORT||4180);
    if (!Number.isInteger(port)||port<1024||port>65535) throw new Error('Invalid aggregate port');
    const server=createOverviewServer(read);
    server.listen(port,'127.0.0.1',()=>console.log(`Public aggregate listening on loopback:${port}`));
    const stop=()=>server.close(()=>void source.close().finally(()=>process.exit(0)));
    process.on('SIGTERM',stop);process.on('SIGINT',stop);
  } catch {
    console.error('Cannot start live aggregate: check the dashboard installation, service environment and verified TLS database access.');
    process.exitCode=1;
  }
}
