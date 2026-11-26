/* CDI validation harness: actual outcomes supplied by evaluator, never generated from a chart.
 * Records must contain {subjectId,year,score,observed:{E,P,V,S,ST}}.
 * This file tests associations; it does not declare astrology predictions valid.
 */
export function observedCareerOutcome(observed={}) {
 const trues=['E','P','V'].filter(k=>observed[k]===true).length;
 if(['E','P','V','S','ST'].some(k=>typeof observed[k]!=='boolean'))return null;
 return trues>=2 && observed.S && observed.ST?1:0;
}
export function evaluateIndex(records,threshold=65){
 const checked=records.map(x=>({...x,actual:observedCareerOutcome(x.observed)}))
  .filter(x=>x.actual!==null&&Number.isFinite(x.score)&&x.score>=0&&x.score<=100);
 let tp=0,fp=0,tn=0,fn=0;
 for(const x of checked){const predicted=x.score>=threshold?1:0;
  if(predicted&&x.actual)tp++;else if(predicted)fp++;else if(x.actual)fn++;else tn++;}
 const precision=tp+fp?tp/(tp+fp):null,recall=tp+fn?tp/(tp+fn):null;
 return {recordsReceived:records.length,recordsUsable:checked.length,threshold,tp,fp,tn,fn,precision,recall,
  disclaimer:'Associational threshold diagnostic only. Scores are not validated probabilities.'};
}
export function splitBySubject(records,seed=7,holdoutFraction=.25){
 if(!(holdoutFraction>0&&holdoutFraction<1))throw Error('Invalid holdout fraction');
 // stable hash, split all years for a person together (prevents leakage between train and test).
 const hash=s=>{let h=seed|0;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0};
 const subjects=[...new Set(records.map(r=>r.subjectId))].sort((a,b)=>hash(a)-hash(b));
 if(subjects.length<4)throw Error('Need at least four distinct subject IDs for an honest holdout');
 const count=Math.max(1,Math.min(subjects.length-1,Math.round(subjects.length*holdoutFraction)));
 const held=new Set(subjects.slice(0,count));
 return {train:records.filter(r=>!held.has(r.subjectId)),test:records.filter(r=>held.has(r.subjectId)),holdoutSubjects:[...held]};
}
