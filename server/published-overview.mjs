import {createHmac, timingSafeEqual, randomUUID} from 'node:crypto';
import {readFile, writeFile, rename, unlink} from 'node:fs/promises';
import path from 'node:path';
import {publicOverview} from './public-overview.mjs';

const maxBytes=1024*1024;
const writes=new Map();
const reply=(status,message)=>Response.json({error:{message}},{status,headers:{'Cache-Control':'no-store'}});

export async function signingKey(filename=process.env.OMNI_OVERVIEW_KEY_FILE) {
  if(!filename || !path.isAbsolute(filename)) throw new Error('Signing key file is not configured');
  const text=(await readFile(filename,'utf8')).trim();
  if(!/^[a-f0-9]{64}$/i.test(text)) throw new Error('Invalid signing key');
  return Buffer.from(text,'hex');
}

export function signature(key,timestamp,body) {
  return createHmac('sha256',key).update(timestamp+'\n').update(body).digest('hex');
}

function storagePath(filename=process.env.OMNI_OVERVIEW_FILE) {
  if(!filename || !path.isAbsolute(filename)) throw new Error('Aggregate storage is not configured');
  return filename;
}

export async function readPublishedOverview({filename,now=Date.now()}={}) {
  const result=publicOverview(JSON.parse(await readFile(storagePath(filename),'utf8')));
  return {...result,sourceRefreshFailed:result.sourceRefreshFailed || now-Date.parse(result.updatedAt)>180000};
}

async function saveLatest(filename,data) {
  const previous=writes.get(filename)||Promise.resolve();
  const next=previous.catch(()=>{}).then(async()=>{
    let old;
    try {old=publicOverview(JSON.parse(await readFile(filename,'utf8')));} catch(error) {if(error.code!=='ENOENT')throw error;}
    if(old && Date.parse(data.updatedAt)<=Date.parse(old.updatedAt)) return false;
    const temporary=filename+'.'+randomUUID()+'.tmp';
    try {
      await writeFile(temporary,JSON.stringify(data)+'\n',{flag:'wx',mode:0o600});
      await rename(temporary,filename);
    } finally {await unlink(temporary).catch(()=>{});}
    return true;
  });
  writes.set(filename,next);
  try {return await next;} finally {if(writes.get(filename)===next)writes.delete(filename);}
}

/** Authenticated input is reduced to the same public allowlist before persistence. */
export async function acceptPublishedOverview(request,{filename,key,now=Date.now()}={}) {
  let destination,secret;
  try {destination=storagePath(filename);secret=key||await signingKey();} catch {return reply(503,'数据同步尚未配置');}
  const timestamp=request.headers.get('x-omni-timestamp')||'';
  const supplied=request.headers.get('x-omni-signature')||'';
  if(!/^\d{13}$/.test(timestamp)||Math.abs(now-Number(timestamp))>300000||!/^[a-f0-9]{64}$/.test(supplied))return reply(401,'同步验证失败');
  if(Number(request.headers.get('content-length'))>maxBytes)return reply(413,'同步内容过大');
  const chunks=[];let size=0;
  try {
    if(!request.body)return reply(400,'缺少汇总数据');
    const reader=request.body.getReader();
    for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>maxBytes){await reader.cancel();return reply(413,'同步内容过大');}chunks.push(Buffer.from(part.value));}
  } catch {return reply(400,'同步内容读取失败');}
  const body=Buffer.concat(chunks);
  if(!timingSafeEqual(Buffer.from(signature(secret,timestamp,body),'hex'),Buffer.from(supplied,'hex')))return reply(401,'同步验证失败');
  let data;
  try {
    data=publicOverview(JSON.parse(body.toString('utf8')));
    const age=Number(timestamp)-Date.parse(data.updatedAt);
    if(data.sourceRefreshFailed || age>180000 || age < -60000)throw new Error('Not a fresh aggregate');
  } catch {return reply(422,'汇总数据格式或更新时间无效');}
  try {
    const changed=await saveLatest(destination,data);
    return Response.json({ok:true,updatedAt:data.updatedAt,changed},{headers:{'Cache-Control':'no-store'}});
  } catch {return reply(503,'汇总数据暂时无法保存');}
}
