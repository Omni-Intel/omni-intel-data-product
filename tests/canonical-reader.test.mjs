import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {canonicalReader} from '../server/overview-service.mjs';

async function installation(t,{fail=false,projection=true}={}) {
  const directory=await mkdtemp(path.join(tmpdir(),'omni-canonical-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  await mkdir(path.join(directory,'dist','db'),{recursive:true});
  await mkdir(path.join(directory,'dist','display'),{recursive:true});
  const files={
    'package.json':'{"type":"module"}',
    'dist/config.js':'export const loadConfig=()=>({database:{engine:"postgres",ssl:{rejectUnauthorized:true}}});',
    'dist/db/pool.js':`export const events=[];
      export const createDatabase=()=>({
        connect:async()=>({query:async(sql)=>{events.push(sql);if(sql==='SELECT snapshot'&&${fail})throw Object.assign(new Error('query cancelled'),{code:'57014'});return {rows:[]};},release:()=>events.push('release')}),
        end:async()=>events.push('close')});`,
    'dist/display/dashboard.js':`export const DASHBOARD_DATA_CONTRACT_VERSION=7;
      ${projection?"export const DASHBOARD_QC_PROJECTION_SQL='compact QC projection';":''}
      export class DisplayDashboardService {constructor(db){this.db=db;}async readSnapshot(){await this.db.query('SELECT snapshot');return {records:[],updatedAt:new Date().toISOString()};}}
      export const summarizeSessionRecords=(_records,{date})=>({selectedDate:date,availableDates:['2026-10-26'],totals:{cumulativeDuration:{value:2},cumulativeUsable:{value:1},todayDuration:{value:2},todayUsable:{value:1},passRate:100,usableRate:50},trend:[],cumulativeTrend:[]});`,
  };
  for(const [name,body] of Object.entries(files))await writeFile(path.join(directory,name),body);
  const {events}=await import(pathToFileURL(path.join(directory,'dist','db','pool.js')));
  return {directory,events};
}

test('canonical publication reads in a bounded read-only transaction and releases its connection',async t=>{
  const {directory,events}=await installation(t);
  const source=await canonicalReader(directory);
  const data=await source.load();
  await source.close();
  assert.equal(data.sourceRefreshFailed,false);
  assert.equal(data.selectedDate,'2026-10-26');
  assert.equal(data.totals.usableRate,50);
  assert.deepEqual(events,['BEGIN READ ONLY',"SET LOCAL statement_timeout = '30000ms'",'SELECT snapshot','ROLLBACK','release','close']);
});

test('refuses an older contract 7 dashboard that would fetch full QC JSON',async t=>{
  const {directory,events}=await installation(t,{projection:false});
  await assert.rejects(canonicalReader(directory),{code:'DASHBOARD_UNSUPPORTED'});
  assert.deepEqual(events,[]);
});

test('database timeouts propagate and still roll back and release the connection',async t=>{
  const {directory,events}=await installation(t,{fail:true});
  const source=await canonicalReader(directory);
  await assert.rejects(source.load(),{code:'57014'});
  await source.close();
  assert.deepEqual(events.slice(-3),['ROLLBACK','release','close']);
});
