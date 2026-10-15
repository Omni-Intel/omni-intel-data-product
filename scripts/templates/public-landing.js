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

 /* PUBLIC_CHART_HELPERS */

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
