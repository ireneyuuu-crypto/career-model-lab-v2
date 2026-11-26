import test from 'node:test';import assert from 'node:assert/strict';
import {observedCareerOutcome,evaluateIndex,splitBySubject} from '../calibration.js';
test('real-world J needs independent E/P/V improvements and positive S/ST',()=>{
 assert.equal(observedCareerOutcome({E:true,P:true,V:false,S:true,ST:true}),1);
 assert.equal(observedCareerOutcome({E:true,P:false,V:false,S:true,ST:true}),0);
 assert.equal(observedCareerOutcome({E:true,P:true,V:false,S:null,ST:true}),null);
});
test('honest validation excludes incomplete real-world observations',()=>{
 const rec=[{subjectId:'fiction-1',year:2030,score:80,observed:{E:true,P:true,V:false,S:true,ST:true}},
 {subjectId:'fiction-2',year:2030,score:75,observed:{E:true,P:true,V:false,S:null,ST:true}}];
 const metrics=evaluateIndex(rec,65);assert.equal(metrics.recordsUsable,1);assert.equal(metrics.tp,1);
});
test('holdout separates every year of the same subject',()=>{
 const records=Array.from({length:10},(_,i)=>[2027,2028,2029].map(year=>({subjectId:'fiction-'+i,year}))).flat();
 const {train,test}=splitBySubject(records);assert.equal(new Set(train.map(x=>x.subjectId)).size+new Set(test.map(x=>x.subjectId)).size,10);
 assert.ok(!train.some(r=>test.some(s=>s.subjectId===r.subjectId)));
});
