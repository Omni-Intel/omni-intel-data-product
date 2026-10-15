(() => {
 'use strict';
 /* eslint @typescript-eslint/no-unused-vars: ["warn", {"varsIgnorePattern":"^(embedded|countFrame|unit|chartDuration)$"}] -- These bindings are consumed by the injected chart helpers. */
 const embedded = true;
 const state = {trend:'cumulative'};
 const app = document.getElementById('app');
 let data=null,loading=false,error='',countFrame=0,extraGap=0;
 let noticeOpen=false,noticeTimer=0;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=(value,decimals=0)=>value==null?'—':Number(value).toLocaleString('zh-CN',{minimumFractionDigits:decimals,maximumFractionDigits:2});
 const hours=seconds=>seconds==null?null:Number(seconds)/3600*29;
 const unit=()=> '通道小时';
 const chartDuration=seconds=>seconds==null?'—':number(hours(seconds));

 function metric(label,seconds,decimals=0){const value=hours(seconds);return `<article class="live-metric"><h2>${label}</h2><div class="live-value" role="img" aria-label="${number(value,decimals)} ${unit()}"><strong ${value==null?'':`data-count-to="${value}" data-count-decimals="${decimals}"`} aria-hidden="true">${number(value,decimals)}</strong><span aria-hidden="true">${unit()}</span></div></article>`;}
function pairedMetric(label,raw,usable){const values=[hours(raw),hours(usable)];return `<article class="live-metric"><h2>${label}</h2><div class="live-value live-paired-value" role="img" aria-label="${number(values[0],2)} / ${number(values[1],2)} ${unit()}"><span class="live-paired-numbers" aria-hidden="true">${values.map(value=>`<strong ${value==null?'':`data-count-to="${value}" data-count-decimals="2"`}>${number(value,2)}</strong>`).join('<span class="live-paired-divider">/</span>')}</span><span aria-hidden="true">${unit()}</span></div></article>`;}
function passRing(rate){const value=rate==null?'—':rate.toFixed(1)+'%';if(embedded)return `<article class="live-quality live-quality-text" aria-label="质量通过率"><h2>质量通过率</h2><strong class="${rate!=null&&rate>90?'is-good':''}">${value}</strong></article>`;return `<article class="live-quality" aria-label="质量通过率"><h2>质量通过率</h2><div class="live-quality-ring" role="img" aria-label="质量通过率 ${value}"><svg viewBox="0 0 160 160" aria-hidden="true"><circle class="quality-track" cx="80" cy="80" r="66"/><circle class="quality-value" cx="80" cy="80" r="66" pathLength="100" stroke-dasharray="${rate==null?0:Math.min(100,Math.max(0,rate))} 100"/></svg><strong aria-hidden="true">${value}</strong></div></article>`;}
function overview(data){
  const t=data.totals;
  const trend=`<section class="panel live-trend-panel"><div class="panel-heading"><h2>${state.trend==='cumulative'?'累计采集有效时长':'每日采集有效时长'}</h2><div class="segmented" aria-label="趋势显示方式"><button data-trend="cumulative" aria-pressed="${state.trend==='cumulative'}">累计</button><button data-trend="daily" aria-pressed="${state.trend==='daily'}">每日</button></div></div>${trendChart(data)}<p class="live-chart-note">单位：${unit()}</p></section>`;
  if(embedded)return `<section class="live-statistics" data-count-state="complete" aria-label="核心指标"><div class="live-duration-grid live-summary-groups">${pairedMetric('累计采集时长 / 累计有效时长',t.cumulativeDuration.value,t.cumulativeUsable.value)}${pairedMetric('今日采集时长 / 今日有效时长',t.todayDuration.value,t.todayUsable.value)}</div>${passRing(t.passRate)}</section>${trend}`;
  return `<section class="live-statistics" data-count-state="complete" aria-label="核心指标"><div class="live-duration-grid"><div class="live-duration-row"><div class="live-date">截至 ${escape(data.selectedDate)}</div>${metric('累计采集时长',t.cumulativeDuration.value)}${metric('累计有效时长',t.cumulativeUsable.value)}</div><div class="live-duration-row"><div class="live-date">${escape(data.selectedDate)}</div>${metric('当日采集时长',t.todayDuration.value)}${metric('当日有效时长',t.todayUsable.value)}</div></div>${passRing(t.passRate)}</section>${trend}`;
 }
function chartAnnotation(index,x,rawY,usableY,top,bottom){return `<g class="live-chart-annotation" data-chart-annotation="${index}" aria-hidden="true"><line class="live-chart-guide" x1="${x}" x2="${x}" y1="${top}" y2="${bottom}"/>${rawY==null?'':`<circle class="live-chart-marker" cx="${x}" cy="${rawY}" r="4" stroke="var(--chart-raw)"/>`}${usableY==null?'':`<circle class="live-chart-marker" cx="${x}" cy="${usableY}" r="4" stroke="var(--chart-usable)"/>`}</g>`;}
function trendChart(data){
  const cumulative=state.trend==='cumulative';
  const rows=(cumulative?data.cumulativeTrend:data.trend).filter(r=>r.durationSeconds!==null||r.usableSeconds!==null);
  if(!rows.length)return '<div class="live-empty compact">暂无已归属日期的时长记录</div>';
  const max=Math.max(1,...rows.flatMap(r=>[hours(r.durationSeconds)||0,hours(r.usableSeconds)||0]));const scale=10**Math.floor(Math.log10(max)),ceiling=Math.ceil(max/scale)*scale;
  const left=80,right=embedded?1080:720,top=20,bottom=230,inset=10;
  const x=i=>rows.length===1?(left+right)/2:left+inset+i/(rows.length-1)*(right-left-2*inset),y=v=>bottom-hours(v)/ceiling*(bottom-top);
  const line=key=>{let connected=false;return rows.map((r,i)=>{if(r[key]==null){connected=false;return '';}const command=connected?'L':'M';connected=true;return `${command}${x(i)},${y(r[key])}`;}).join(' ');};
  const labels=new Set([0,Math.floor((rows.length-1)/2),rows.length-1]);
  return `<div class="live-chart-scroll"><div class="live-chart-wrap"><svg class="live-chart" viewBox="${embedded?'30 0 1090 315':'0 0 760 315'}" role="group" aria-label="${cumulative?'累计':'每日'}时长，单位${unit()}"><defs><linearGradient id="live-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="var(--chart-raw)" stop-opacity=".16"/><stop offset="1" stop-color="var(--chart-raw)" stop-opacity="0"/></linearGradient></defs>${[0,1,2,3,4].map(i=>{const value=ceiling*i/4,yy=bottom-value/ceiling*(bottom-top);return `<line x1="${left}" x2="${right}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-dasharray="2 5"/><text x="${left-12}" y="${yy+4}" text-anchor="end">${number(value)}</text>`;}).join('')}${cumulative&&rows.every(r=>r.durationSeconds!==null)?`<path d="${line('durationSeconds')} L${x(rows.length-1)},${bottom} L${x(0)},${bottom} Z" fill="url(#live-chart-fill)"/>`:''}<path d="${line('durationSeconds')}" fill="none" stroke="var(--chart-raw)" stroke-width="2"/><path d="${line('usableSeconds')}" fill="none" stroke="var(--chart-usable)" stroke-width="2"/>${rows.map((r,i)=>`<g><title>${escape(r.date)} · 采集 ${chartDuration(r.durationSeconds)} ${unit()} · 有效 ${chartDuration(r.usableSeconds)} ${unit()}</title>${r.durationSeconds==null?'':`<circle cx="${x(i)}" cy="${y(r.durationSeconds)}" r="3" fill="var(--chart-raw)"/>`}${r.usableSeconds==null?'':`<circle cx="${x(i)}" cy="${y(r.usableSeconds)}" r="3" fill="var(--chart-usable)"/>`}${!cumulative&&r.durationSeconds!=null?`<text class="live-point-label" x="${x(i)}" y="${y(r.durationSeconds)-9}" text-anchor="middle">${hours(r.durationSeconds).toFixed(2)}</text>`:''}${!cumulative&&r.usableSeconds!=null?`<text class="live-point-label usable" x="${x(i)}" y="${y(r.usableSeconds)+15}" text-anchor="middle">${hours(r.usableSeconds).toFixed(2)}</text>`:''}</g>${!cumulative?`<text x="${x(i)}" y="250" text-anchor="end" transform="rotate(-45 ${x(i)} 250)">${escape(r.date)}</text>`:labels.has(i)?`<text x="${x(i)}" y="255" text-anchor="middle">${escape(r.date)}</text>`:''}${chartAnnotation(i,x(i),r.durationSeconds==null?null:y(r.durationSeconds),r.usableSeconds==null?null:y(r.usableSeconds),top,bottom)}<rect x="${i? (x(i-1)+x(i))/2:left}" y="${top}" width="${(i===rows.length-1?right:(x(i)+x(i+1))/2)-(i?(x(i-1)+x(i))/2:left)}" height="${bottom-top}" fill="transparent" tabindex="0" data-chart-point="${i}" data-chart-info="${escape(`${r.date}｜采集时长 ${chartDuration(r.durationSeconds)} ${unit()}｜有效时长 ${chartDuration(r.usableSeconds)} ${unit()}`)}" aria-label="${escape(`${r.date} 采集 ${chartDuration(r.durationSeconds)} ${unit()} 有效 ${chartDuration(r.usableSeconds)} ${unit()}`)}"/>`).join('')}</svg><div class="live-tooltip" role="status" hidden></div><div class="live-chart-legend"><span><i style="background:var(--chart-raw)"></i>采集时长</span><span><i style="background:var(--chart-usable)"></i>有效时长</span></div></div></div>`;
 }
function showPoint(event){const point=event.target.closest('[data-chart-info]');if(!point)return;const wrap=point.closest('.live-chart-wrap');wrap.querySelectorAll('.live-chart-annotation.is-active').forEach(node=>node.classList.remove('is-active'));wrap.querySelector(`[data-chart-annotation="${point.dataset.chartPoint}"]`)?.classList.add('is-active');const tip=wrap.querySelector('.live-tooltip');tip.textContent=point.dataset.chartInfo;tip.hidden=false;}
function hidePoint(event){const point=event.target.closest('[data-chart-info]');if(!point)return;const wrap=point.closest('.live-chart-wrap');wrap.querySelectorAll('.live-chart-annotation.is-active').forEach(node=>node.classList.remove('is-active'));wrap.querySelector('.live-tooltip').hidden=true;}
function animateNumbers(){cancelAnimationFrame(countFrame);const panel=document.querySelector('.live-statistics');if(!panel||matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return;const nodes=[...panel.querySelectorAll('[data-count-to]')];panel.dataset.countState='running';const start=performance.now();const step=now=>{if(!panel.isConnected)return;const p=Math.min(1,(now-start)/1100);for(const node of nodes)node.textContent=number(Number(node.dataset.countTo)*(1-(1-p)**3),Number(node.dataset.countDecimals)||0);if(p<1)countFrame=requestAnimationFrame(step);else panel.dataset.countState='complete';};countFrame=requestAnimationFrame(step);}

 function publishHeight(){const gap=matchMedia('(min-width:1001px)').matches?extraGap:0;window.parent.postMessage({type:'omni-dashboard-resize',height:app.getBoundingClientRect().height-gap},location.origin);}
 function syncNotice(){
  const notice=document.getElementById('upgrade-notice');
  const trigger=app.querySelector('[data-action="more"]');
  if(notice)notice.hidden=!noticeOpen;
  trigger?.setAttribute('aria-expanded',String(noticeOpen));
 }
 function setNotice(open){
  clearTimeout(noticeTimer);noticeOpen=open;syncNotice();
  if(open)noticeTimer=setTimeout(()=>setNotice(false),5000);
 }
 function render(){
  app.innerHTML=`<main class="landing-main live-main"><div class="live-heading embedded-heading"><h1>采集数据总览</h1><div class="embedded-actions"><button class="dashboard-more" data-action="more" aria-controls="upgrade-notice" aria-expanded="false">了解更多 <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></button><div class="upgrade-notice" id="upgrade-notice" role="status" hidden><p>系统升级中，敬请期待</p><button class="upgrade-notice-close" data-action="dismiss-notice" aria-label="关闭提示">×</button></div></div></div>${error?`<div class="live-message" role="status">${escape(error)}</div>`:''}${data?overview(data):'<section class="live-empty"><span>正在读取采集数据…</span></section>'}</main>`;
  syncNotice();
 }
 async function load(animate=false){
  if(loading)return;
  loading=true;
  try{
   const response=await fetch('/api/public-overview',{cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('数据服务暂时不可用，请稍后刷新');
   const next=await response.json();
   if(!next.totals||!Array.isArray(next.trend)||!Array.isArray(next.cumulativeTrend))throw new Error('数据服务暂时不可用，请稍后刷新');
   data=next;error=next.sourceRefreshFailed?'数据更新暂时不可用，保留最近统计。':'';
  }catch(problem){error=data?'数据更新暂时不可用，保留最近统计。':problem.message;}
  finally{loading=false;render();if(animate)animateNumbers();}
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.trend){state.trend=button.dataset.trend;render();}
  if(button.dataset.action==='more')setNotice(!noticeOpen);
  if(button.dataset.action==='dismiss-notice')setNotice(false);
 });
 document.addEventListener('pointerdown',event=>{if(noticeOpen&&!event.target.closest('.embedded-actions'))setNotice(false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&noticeOpen)setNotice(false);});
 window.addEventListener('blur',()=>{if(noticeOpen)setNotice(false);});
 document.addEventListener('pointerover',showPoint);
 document.addEventListener('focusin',showPoint);
 document.addEventListener('pointerout',hidePoint);
 document.addEventListener('focusout',hidePoint);
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='omni-dashboard-command')return;
  if(event.data.action==='sync')publishHeight();
  if(event.data.action==='spacing'){
   const gap=Number(event.data.extraGap);if(!Number.isFinite(gap))return;
   const next=Math.max(0,Math.min(3000,gap));
   if(Math.abs(next-extraGap)>.1){extraGap=next;document.body.style.setProperty('--overview-extra-gap',next+'px');publishHeight();}
  }
 });
 new ResizeObserver(publishHeight).observe(app);
 const refresh=()=>{if(!document.hidden)void load();};
 document.addEventListener('visibilitychange',refresh);
 setInterval(refresh,60000);
 render();void load(true);
})();
