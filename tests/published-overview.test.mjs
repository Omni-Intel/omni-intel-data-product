import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {acceptPublishedOverview,readPublishedOverview,signature} from '../server/published-overview.mjs';
import {publishOnce} from '../server/publish-overview.mjs';

const now=Date.parse('2026-10-15T04:00:00Z'),key=Buffer.alloc(32,9);
const fixture=()=>({selectedDate:'2026-10-15',updatedAt:new Date(now).toISOString(),availableDates:['2026-10-15'],totals:{cumulativeDuration:{value:3600},cumulativeUsable:{value:3000},todayDuration:{value:3600},todayUsable:{value:3000},passRate:97},trend:[],cumulativeTrend:[],records:[{email:'private@example.com'}]});
const request=(data,{timestamp=String(now),secret=key}={})=>{
  const body=JSON.stringify(data);
  return new Request('https://daq.example/api/internal/overview',{method:'POST',body,headers:{'X-Omni-Timestamp':timestamp,'X-Omni-Signature':signature(secret,timestamp,body)}});
};

test('signed publication persists only public aggregates; tampering and expired signatures cannot overwrite them',async t=>{
  const directory=await mkdtemp(path.join(tmpdir(),'omni-overview-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const filename=path.join(directory,'latest.json'),options={filename,key,now};
  assert.equal((await acceptPublishedOverview(request(fixture()),options)).status,200);
  const saved=await readFile(filename,'utf8');assert.equal(saved.includes('private'),false);assert.equal(saved.includes('records'),false);
  assert.equal((await acceptPublishedOverview(request(fixture(),{secret:Buffer.alloc(32,8)}),options)).status,401);
  assert.equal((await acceptPublishedOverview(request(fixture(),{timestamp:String(now-300001)}),options)).status,401);
  const older={...fixture(),updatedAt:new Date(now-60000).toISOString()};
  const duplicate=await acceptPublishedOverview(request(older),options);assert.equal((await duplicate.json()).changed,false);
  assert.equal(await readFile(filename,'utf8'),saved);
  const stale=await readPublishedOverview({filename,now:now+180001});
  assert.equal(stale.sourceRefreshFailed,true);assert.equal(stale.updatedAt,fixture().updatedAt);
});

test('publisher signs a fresh canonical read over HTTPS and requires acknowledgement',async()=>{
  let captured;
  const result=await publishOnce({load:async()=>fixture()},{url:'https://daq.example/api/internal/overview',key,send:async(url,options)=>{
    captured=options;
    assert.equal(url.hostname,'daq.example');
    assert.equal(options.redirect,'error');
    assert.equal(options.headers['X-Omni-Signature'],signature(key,options.headers['X-Omni-Timestamp'],options.body));
    assert.equal(options.body.includes('private'),false);
    return Response.json({ok:true,updatedAt:fixture().updatedAt});
  }});
  assert.ok(captured);assert.equal(result.updatedAt,fixture().updatedAt);
  await assert.rejects(publishOnce({load:async()=>fixture()},{url:'http://daq.example/api/internal/overview',key}));
  await assert.rejects(publishOnce({load:async()=>fixture()},{url:'https://daq.example/api/internal/overview',key,send:async()=>new Response(null,{status:401})}));
});
