/** Career Model V2.0 — user supplied canonical formula (2026-11-27).
 * GR/C = timing signals; O/E/P/V/S/ST/Cost = OBSERVED outcomes only.
 * Never infer real-world evidence from astrology. No numeric outcome weights supplied.
 */
export const CANONICAL_VERSION='Career V2.0 / purified specification / 2026-11-27';
export const MODEL_RULES=Object.freeze({
 order:['GR','C','changeNature','O','E','P','V','S','ST','Cost','eventType'],
 targets:{P1:['mc','ruler10'],P2:['sun','saturn'],P3:['cusp2','ruler2']},
 GR:{movers:['jupiter','saturn','uranus','neptune','pluto'],aspects:[0,90,180],orb:3,targets:['mc','ruler10','sun','saturn','cusp2','ruler2']},
 C:{movers:['sun','moon','mercury','venus','mars'],aspects:[0,90,180],orb:2,targets:['mc','ruler10','sun','saturn','ruler2'],requiredForJump:false},
 jump:{minimumMaterialImprovements:2,dimensions:['E','P','V'],supportAndStabilityMustNotFail:true,stabilityFollowupMonths:[3,6]},
 resultTypes:['0','O','E','P','J','R'],
 safeguards:['C is not a necessary jump condition','exact MC contact does not imply promotion','workload is not E','E differs from P','P differs from V','recognition is not S','good offer is not ST','salary and Cost are independent','growth differs from well-being','repositioning requires R check','no post-hoc changing aspect or outcome rules','freeze windows before validation']
});
const tri=v=>v===true?true:v===false?false:null;
/** Ratings allow 'neutral' separately from unknown and negative.
 * For backwards compatibility true=positive, false=failed, null=unknown.
 */
const gate=v=>v===true||v==='positive'?'positive':v==='neutral'?'neutral':v===false||v==='failed'?'failed':'unknown';
export function verifyCareerEvent(input={}){
 const f={};for(const k of ['O','E','P','V','R'])f[k]=tri(input[k]);
 const support=gate(input.S),stability=gate(input.ST);
 const material=['E','P','V'].filter(k=>f[k]===true),unknown=['E','P','V'].filter(k=>f[k]===null);
 const eligible=material.length>=MODEL_RULES.jump.minimumMaterialImprovements;
 const gateFailed=support==='failed'||stability==='failed';
 const confirmed=eligible&&!gateFailed&&support!=='unknown'&&stability!=='unknown';
 const unstable=eligible&&stability==='failed'&&support!=='failed';
 let type='undetermined';
 if(confirmed)type='J';
 else if(f.R===true)type='R';
 else if(f.P===true)type='P';
 else if(f.E===true)type='E';
 else if(f.O===true)type='O';
 else if(['O','E','P','V','R'].every(k=>f[k]===false))type='0';
 const tags=[];
 if(unstable)tags.push('Unstable J（多维上升，但3–6个月稳定性失败；不计入标准J）');
 if(confirmed&&input.Cost==='high')tags.push('High-Cost J');
 if(f.R===true&&confirmed)tags.push('R → J');
 if(eligible&&support==='failed')tags.push('S未通过：不可确认标准J');
 if(eligible&&!gateFailed&&!confirmed)tags.push('多维上升已记录；S/ST仍需核实');
 const pending=[];if(unknown.length)pending.push('尚未核实实质改善：'+unknown.join('、'));
 if(support==='unknown')pending.push('缺少组织承接证据');
 if(stability==='unknown')pending.push('缺少变化后3–6个月稳定性证据');
 return {version:CANONICAL_VERSION,type,confirmedJump:confirmed,unstableJump:unstable,highCostJump:confirmed&&input.Cost==='high',materialImprovements:material,unverifiedDimensions:unknown,failedConditions:['S','ST'].filter(k=>(k==='S'?support:stability)==='failed'),support,stability,cost:input.Cost||'unknown',tags,pending,observedOnly:true,
  explanation:confirmed?'职责、职位、价值中至少两项实质提升，且组织承接与后续稳定性未失败。':unstable?'已出现多维实质提升，但稳定性失败，应单列为不稳定跃迁，不可作为标准J。':eligible?'已出现至少两项实质改善，但组织承接或稳定性未满足标准J的核验要求。':'当前已核实证据尚不足以确认正式职业跃迁；不能据此判定未来结果。'};
}
/** Time-window classification, not a real-world event outcome. */
export function classifyActivation({gr=false,c=false}={}){
 return gr&&c?{kind:'synchronized',label:'外部变化与个人行动同步',priority:'重点观察窗口'}:
  gr?{kind:'external-first',label:'外部职业结构先变化',priority:'结构变化观察'}:
  c?{kind:'personal-first',label:'个人主动调整或重新定位',priority:'个人行动观察'}:
  {kind:'quiet',label:'未检出明显的规则触发',priority:'常规观察'};
}
