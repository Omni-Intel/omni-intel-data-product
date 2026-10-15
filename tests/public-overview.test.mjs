import test from 'node:test';
import assert from 'node:assert/strict';
import {publicOverview,createAggregateReader} from '../server/public-overview.mjs';
import {createOverviewServer} from '../server/overview-service.mjs';

const fixture=()=>({selectedDate:'2026-10-15',updatedAt:'2026-10-15T03:00:00Z',availableDates:['2026-10-15'],totals:{cumulativeDuration:{value:3600,sessions:10},cumulativeUsable:{value:3000},todayDuration:{value:0},todayUsable:{value:null},passRate:91,participantNumber:'private'},trend:[{date:'2026-10-15',durationSeconds:0,usableSeconds:null,participantNumber:'private'}],cumulativeTrend:[{date:'2026-10-15',durationSeconds:3600,usableSeconds:3000}],records:[{sessionId:'private'}],account:{email:'private'}});
test('public boundary removes identities and records, preserves zero and unknown values',()=>{
  const value=publicOverview(fixture());
  assert.equal(value.totals.todayDuration.value,0);assert.equal(value.totals.todayUsable.value,null);
  assert.equal(JSON.stringify(value).includes('private'),false);
  assert.deepEqual(Object.keys(value.totals).sort(),['cumulativeDuration','cumulativeUsable','passRate','todayDuration','todayUsable'].sort());
  assert.throws(()=>publicOverview({...fixture(),totals:{...fixture().totals,passRate:101}}));
});
test('refreshes live data after TTL, coalesces loads, and never invents a fresh timestamp on failure',async()=>{
  let now=0,calls=0,fail=false;
  const read=createAggregateReader(async()=>{calls++;if(fail)throw Error('offline');return fixture();},{clock:()=>now,ttlMs:100});
  const [first]=await Promise.all([read(),read()]);assert.equal(calls,1);
  now=50;await read();assert.equal(calls,1);
  now=101;await read();assert.equal(calls,2);
  fail=true;now=202;const stale=await read();assert.equal(stale.sourceRefreshFailed,true);assert.equal(stale.updatedAt,first.updatedAt);
  await assert.rejects(createAggregateReader(async()=>{throw Error('offline');})());
});
test('loopback service exposes aggregate only and rejects private routes',async t=>{
  const server=createOverviewServer(async()=>fixture());
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(base+'/api/public-overview');assert.equal(response.status,200);assert.equal(JSON.stringify(await response.json()).includes('private'),false);
  assert.equal((await fetch(base+'/v1/display/snapshot')).status,404);
  assert.equal((await fetch(base+'/api/public-overview',{method:'POST'})).status,405);
});
