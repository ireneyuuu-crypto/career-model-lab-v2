/* CDI 2.5: one shared GR/C feature layer with career-story.js.
   Four user-approved weights are presentation proxies, never observed career outcomes. */
import {featureYear,featureDecade,cap,evidenceStrength,category} from './career-features.js';
export const CDI_VERSION='CDI-2.5 / verified weights, exploratory proxy';
export const CDI_WEIGHTS=Object.freeze({opportunity:.15,expansion:.25,position:.25,value:.35});
export const CDI_BASELINE=50;
const clamp=v=>Math.max(0,Math.min(100,v));
export function indexFromFeatures(f){const alignedAction=(f.j>0||f.s>0)?f.action:0;
 const components={opportunity:Math.round(clamp(50+25*f.j+5*alignedAction)),expansion:Math.round(clamp(50+23*f.j+7*f.s+4*alignedAction)),position:Math.round(clamp(50+18*f.s+8*f.j)),value:Math.round(clamp(50+27*f.finance))};
 const contributions=Object.fromEntries(Object.entries(CDI_WEIGHTS).map(([k,w])=>[k,Number((components[k]*w).toFixed(4))]));
 const raw=Object.entries(CDI_WEIGHTS).reduce((a,[k,w])=>a+w*components[k],0);
 const changeIntensity=Math.round(clamp(100*(.40*f.u+.22*f.s+.22*f.j+.16*f.action)));
 return {year:f.year,score:Math.round(clamp(raw)),rawScore:Number(raw.toFixed(4)),weights:CDI_WEIGHTS,contributions,changeIntensity,components,costPenalty:0,
 themes:{growth:f.j>0,role:f.s>0,value:f.finance>0,restructure:f.u>0},support:null,stability:null,calibrated:false,version:CDI_VERSION,
 basis:{jupiter:f.j,saturn:f.s,restructure:f.u,finance:f.finance,action:f.action},dataCoverage:f.events.length?'detected-signals':'no-detected-signals',
 label:f.sorted.length?({'opportunity':'机会增长','position':'职位职责','value':'收入价值','restructure':'职业转向','action':'主动变化'})[f.sorted[0][0]]:'相对平稳',
 primarySignals:f.gr.filter(e=>e.priority===1).length,financeSignals:f.groups.value.length};
}
export function indexForYear(y){return indexFromFeatures(featureYear(y));}
export function indexForDecade(report){return featureDecade(report).map(indexFromFeatures);}
export const INDEX_METHOD='CDI-2.5：机会15%、职责25%、职位25%、价值35%。由同一年度相位特征层生成分项和故事，不是现实薪酬/晋升评分。50为无信号展示基线，且不是及格线；C独立出现只提高变化活跃度，Cost/S/ST不从星象假定。';

// Two accessible user-facing timing indicators. These are activity indices,
// NOT outcome likelihoods, observed salary growth or the CDI weights.
export const OPPORTUNITY_TREND_VERSION='OPPORTUNITY-TRENDS-1.0';
export function userTrendsFromFeatures(f){
 const signal=(events)=>events.reduce((a,e)=>a+evidenceStrength(e,f.year),0);
 const career=signal(f.gr.filter(e=>e.priority===1))*1.15
   +signal(f.gr.filter(e=>e.priority===2))*.72
   +signal(f.gr.filter(e=>e.priority===3))*.22;
 const money=signal(f.gr.filter(e=>e.priority===3||category(e)==='value'));
 // Independent C action does not create career or salary opportunity by itself.
 const actionBoost=career>0?Math.min(.12, f.action*.07):0;
 const careerIndex=Math.round(clamp(100*(1-Math.exp(-(career*(1+actionBoost))/.95))));
 const moneyIndex=Math.round(clamp(100*(1-Math.exp(-money/.65))));
 return {year:f.year,career:careerIndex,income:moneyIndex,
  hasCareer:career>0,hasIncome:money>0,version:OPPORTUNITY_TREND_VERSION};
}
export function userTrendsForDecade(report){return featureDecade(report).map(userTrendsFromFeatures);}
