/* Career V2.0: frozen outcome verification rules. No invented numeric weights.
 * GR/C are astronomical signals, NOT observed real-world outcomes.
 * This evaluator is for events with actual evidence only.
 */
export const CANONICAL_VERSION = 'Career V2.0 / frozen 2026-08-14';
export const MODEL_RULES = Object.freeze({
  order:['GR','C','changeNature','O','E','P','V','S','ST','Cost','eventType'],
  targets:{P1:['mc','ruler10'],P2:['sun','saturn'],P3:['cusp2','ruler2']},
  GR:{movers:['jupiter','saturn','uranus','neptune','pluto'],aspects:[0,90,180],orb:3,targets:['mc','ruler10','sun','saturn','cusp2','ruler2']},
  C:{movers:['sun','moon','mercury','venus','mars'],aspects:[0,90,180],orb:2,targets:['mc','ruler10','sun','saturn','ruler2'],requiredForJump:false},
  jump:{minimumMaterialImprovements:2,dimensions:['E','P','V'],supportAndStabilityMustNotFail:true,stabilityFollowupMonths:[3,6]},
  resultTypes:['0','O','E','P','J','R']
});
const tri=v=>v===true?true:v===false?false:null;
/** Input fields O/E/P/V/S/ST/R are true / false / null (unknown);
 * Cost is 'high', 'normal', or 'unknown'.
 * Unknown is NEVER silently treated as success.
 */
export function verifyCareerEvent(input={}) {
  const f={};for (const k of ['O','E','P','V','S','ST','R'])f[k]=tri(input[k]);
  const material=['E','P','V'].filter(k=>f[k]===true);
  const unknown=['E','P','V'].filter(k=>f[k]===null);
  const failures=['S','ST'].filter(k=>f[k]===false);
  const conditionsMet=material.length>=2 && failures.length===0;
  const confirmed=conditionsMet && f.S===true && f.ST===true;
  let type='undetermined';
  if(confirmed)type='J';
  else if(f.R===true)type='R';
  else if(f.P===true)type='P';
  else if(f.E===true)type='E';
  else if(f.O===true)type='O';
  else if(['O','E','P','V','R'].every(k=>f[k]===false))type='0';
  const tags=[];
  if(input.Cost==='high' && confirmed)tags.push('High-Cost J');
  if(f.R===true && confirmed)tags.push('R → J');
  if(f.ST===false && material.length>=2)tags.push('稳定性未通过，不能确认 J');
  if(conditionsMet && !confirmed)tags.push('两项以上提升，但 S/ST 仍需验证');
  const pending=[];
  if(unknown.length)pending.push('尚未核实：'+unknown.join('、'));
  if(f.S===null)pending.push('缺少组织支持证据');
  if(f.ST===null)pending.push('缺少变化后3–6个月稳定性证据');
  return {version:CANONICAL_VERSION,type,confirmedJump:confirmed,materialImprovements:material,unverifiedDimensions:unknown,failedConditions:failures,tags,pending,observedOnly:true,
    explanation:confirmed?'至少两个职业实质维度改善，且组织支持与后续稳定性均已核实。':
    conditionsMet?'已记录多维改善，但尚未具备足够的组织支持或稳定性证据确认跃迁。':
    '当前证据不满足正式职业跃迁的完整判定条件；不代表未来不会发生。'};
}
