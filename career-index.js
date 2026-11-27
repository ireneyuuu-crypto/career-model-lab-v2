/* Career Model Lab — CDI v2.0 transparent scenario INDEX, not a Career V2.0 frozen rule.
   Career V2.0 astronomical signals and observed event classifications remain unchanged.
   The CDI is a presentation tool for comparing time windows within ONE report.
   It cannot be empirically calibrated without independently observed outcomes.
*/
export const CDI_VERSION='CDI-2.1.0 / experimental presentation, NOT canonical outcomes';
export const CDI_WEIGHTS=Object.freeze({opportunity:0.25,expansion:0.25,position:0.25,value:0.25});
export const CDI_BASELINE=50;
const clamp=x=>Math.max(0,Math.min(100,x));
const YEAR_MS=86400000;
function distinct(events){return [...new Map(events.map(e=>[e.id+'|'+e.begin+'|'+e.end,e])).values()];}
function yearOverlap(event,year){
  const a=Date.parse(event.begin+'T00:00:00Z'),b=Date.parse(event.end+'T23:59:59Z');
  const start=Date.UTC(year,0,1),end=Date.UTC(year+1,0,1);
  return Math.max(0,Math.min(b,end)-Math.max(a,start))/YEAR_MS;
}
function evidenceWeight(e,year){
  const days=yearOverlap(e,year);
  if(!days)return 0;
  // Within-year overlap, priority and closeness; a transit is not counted in full just because it crosses 1 Jan.
  const priority=e.priority===1?1:e.priority===2?0.52:0.30;
  const orbMax=e.type==='C'?2:3;
  const proximity=Number.isFinite(e.minOrb)?Math.max(0,1-e.minOrb/orbMax):0.5;
  const duration=0.35+0.65*Math.min(1,days/75);
  return priority*(0.60+0.40*proximity)*duration;
}
function cappedSum(a,cap=1.75){return Math.min(cap,a.reduce((x,y)=>x+y,0));}
export function indexForYear(year){
 const unique=distinct(year.events||[]),gr=unique.filter(e=>e.type==='GR'),clock=unique.filter(e=>e.type==='C');
 const by=(set)=>cappedSum(gr.filter(e=>set.includes(e.mover)).map(e=>evidenceWeight(e,year.year)));
 const j=by(['jupiter']),s=by(['saturn']),u=by(['uranus','pluto','neptune']);
 const finance=cappedSum(gr.filter(e=>/第二宫/.test(e.target||'')).map(e=>evidenceWeight(e,year.year)),1.5);
 const action=cappedSum(clock.map(e=>evidenceWeight(e,year.year)),1.25);
 // Rulebook-defined factor mapping. No item below claims measured E/P/V or S/ST.
 const components={
  opportunity:Math.round(clamp(50+25*j+5*action)),
  expansion:Math.round(clamp(50+23*j+7*s+4*action)),
  position:Math.round(clamp(50+18*s+8*j)),
  value:Math.round(clamp(50+27*finance))
 };
 // The canonical formula treats Cost independently: a Uranus/Pluto/Neptune
 // contact is never evidence of actual stress, health loss or political cost.
 const disruption=0;
 const changeIntensity=Math.round(clamp(100*(0.40*u+0.22*s+0.22*j+0.16*action)));
 const raw=Object.entries(CDI_WEIGHTS).reduce((total,[key,w])=>total+components[key]*w,0);
 const score=Math.round(clamp(raw));
 const structural=u>0,formal=s>0,growth=j>0,financial=finance>0;
 return {year:year.year,score,changeIntensity,components,costPenalty:disruption,
   themes:{growth,role:formal,value:financial,restructure:structural},
   support:null,stability:null,version:CDI_VERSION,calibrated:false,
   basis:{jupiter:j,saturn:s,restructure:u,finance,action},
   dataCoverage:year.events?.length?'detected-signals':'no-detected-signals',
   label:structural?'职业结构变化':formal&&growth?'职位与机会并行':formal?'职位职责变化':growth?'机会扩展':financial?'价值主题':'常规积累',
   primarySignals:gr.filter(e=>e.priority===1).length,
   financeSignals:gr.filter(e=>/第二宫/.test(e.target||'')).length};
}
export function indexForDecade(report){return report.years.map(indexForYear);}
export const INDEX_METHOD='CDI v2.1：此0–100分是公开、可复现但尚未实证校准的「发展相关信号指数」，不是已发生职业结果、成功率、薪资涨幅，也不是 Career V2.0 原始公式的一部分。机会/职责/职位/价值四个代理维度各25%，以50为无相关信号时的基线；另提供独立「变化活跃度」。重要修订：不再用天王、冥王、海王或土星相位自动推断现实Cost并扣分。正式职业跃迁必须由真实的E/P/V至少两项改善及S/ST核验得出；无法从天象直接证明。';
