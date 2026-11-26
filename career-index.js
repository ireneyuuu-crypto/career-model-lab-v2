/* Career Model Lab — CDI v2.0 transparent scenario INDEX, not a Career V2.0 frozen rule.
   Career V2.0 astronomical signals and observed event classifications remain unchanged.
   The CDI is a presentation tool for comparing time windows within ONE report.
   It cannot be empirically calibrated without independently observed outcomes.
*/
export const CDI_VERSION='CDI-2.0.0 / rules frozen for reproducible demonstration';
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
 const disruption=Math.min(20,Math.round(11*u+3*s));
 const raw=Object.entries(CDI_WEIGHTS).reduce((total,[key,w])=>total+components[key]*w,0);
 const score=Math.round(clamp(raw-disruption));
 const structural=u>0,formal=s>0,growth=j>0,financial=finance>0;
 return {year:year.year,score,components,costPenalty:disruption,
   themes:{growth,role:formal,value:financial,restructure:structural},
   support:null,stability:null,version:CDI_VERSION,calibrated:false,
   basis:{jupiter:j,saturn:s,restructure:u,finance,action},
   dataCoverage:year.events?.length?'detected-signals':'no-detected-signals',
   label:structural?'职业结构变化':formal&&growth?'职位与机会并行':formal?'职位职责变化':growth?'机会扩展':financial?'价值主题':'常规积累',
   primarySignals:gr.filter(e=>e.priority===1).length,
   financeSignals:gr.filter(e=>/第二宫/.test(e.target||'')).length};
}
export function indexForDecade(report){return report.years.map(indexForYear);}
export const INDEX_METHOD='CDI v2.0（透明、可复现、尚未实证校准）：使用Career V2.0已计算的GR/C相位窗口，按目标点优先级、偏差、窗口在当年的持续比例计算代理强度。机会25%、职责25%、职位25%、价值25%，另对结构性变化作有限代价调整。50分为没有检测到相关信号时的起点，并非人群平均分。0–100分仅代表本模型内部的相对发展条件，不是成功概率、预测薪资、真实职位结果。组织支持(S)及3–6个月稳定性(ST)缺少现实证据，显示未知，不擅自代入。以上权重是V2.0新增公开评分规范，不是此前Career V2.0的冻结预测公式；必须使用独立现实数据校准后才能声称有经验预测效度。';
