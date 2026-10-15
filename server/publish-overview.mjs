import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {canonicalReader} from './overview-service.mjs';
import {signature,signingKey} from './published-overview.mjs';
import {publicOverview} from './public-overview.mjs';

export async function publishOnce(source,{url,key,send=fetch}={}) {
  const target=new URL(url);
  if(target.protocol!=='https:' || target.username || target.password || target.hash || target.search)throw new Error('Use an HTTPS publication URL without credentials');
  const data=publicOverview(await source.load());
  if(data.sourceRefreshFailed)throw new Error('Only fresh database reads can be published');
  const body=JSON.stringify(data),timestamp=String(Date.now());
  const response=await send(target,{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json','X-Omni-Timestamp':timestamp,'X-Omni-Signature':signature(key,timestamp,body)},body});
  if(!response.ok)throw new Error(`Aggregate publication returned HTTP ${response.status}`);
  const result=await response.json();
  if(!result.ok || result.updatedAt!==data.updatedAt)throw new Error('Publication not acknowledged');
  return {updatedAt:data.updatedAt};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  let source;
  try {
    const key=await signingKey();
    source=await canonicalReader(process.env.OMNI_DASHBOARD_DIR);
    const url=process.env.OMNI_OVERVIEW_PUBLISH_URL;
    const result=await publishOnce(source,{url,key});
    console.log(`Aggregate synchronized: ${result.updatedAt}`);
  } catch {
    console.error('Aggregate sync failed. Check HTTPS access, signing key, clock and the existing dashboard database environment.');
    process.exitCode=1;
  } finally {await source?.close();}
}
