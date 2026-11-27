import test from 'node:test';import assert from 'node:assert/strict';import {indexForYear,indexForDecade,CDI_WEIGHTS,CDI_VERSION} from '../career-index.js';
const ev=(mover,target,priority=1)=>({id:mover+target,mover,target,type:'GR',priority,begin:'2028-01-01',end:'2028-05-01'});
test('score in 0-100 and equal data deterministic',()=>{const y={year:2028,events:[ev('jupiter','天顶'),ev('saturn','天顶'),ev('uranus','天顶')]};const a=indexForYear(y);assert.equal(a.score,indexForYear(y).score);assert.ok(a.score>=0&&a.score<=100);});
test('structural signal alone does not imply actual Cost penalty',()=>{const base=indexForYear({year:2028,events:[]});const r=indexForYear({year:2028,events:[ev('uranus','天顶')]});assert.equal(r.costPenalty,0);assert.equal(r.score,base.score);assert.ok(r.changeIntensity>0);});
test('support and stability remain missing, not fabricated',()=>{const d=indexForYear({year:2030,events:[ev('jupiter','第二宫宫主',3)]});assert.equal(d.support,null);assert.equal(d.stability,null);});
test('ten years yields ten scores',()=>{const r={years:Array.from({length:10},(_,i)=>({year:2027+i,events:[]}))};assert.equal(indexForDecade(r).length,10)});

test('cross-year span contributes only in intersecting calendar year',()=>{const e={...ev('jupiter','天顶'),begin:'2028-12-30',end:'2029-01-08',minOrb:0.12};const d28=indexForYear({year:2028,events:[e]}),d29=indexForYear({year:2029,events:[e]});assert.ok(d28.score<d29.score);});
test('a signal outside year does not alter score',()=>{const e={...ev('jupiter','天顶'),begin:'2028-01-01',end:'2028-04-01',minOrb:0};assert.equal(indexForYear({year:2029,events:[e]}).score,50);});
test('all four model components and version explain score',()=>{const d=indexForYear({year:2028,events:[{...ev('saturn','天顶'),minOrb:0.1}]});assert.deepEqual(Object.keys(d.components),['opportunity','expansion','position','value']);assert.ok(d.version);});


test('confirmed presentation weights are 15/25/25/35 and normalized',()=>{
 assert.deepEqual(CDI_WEIGHTS,{opportunity:.15,expansion:.25,position:.25,value:.35});
 assert.equal(Object.values(CDI_WEIGHTS).reduce((a,b)=>a+b,0),1);
 assert.match(CDI_VERSION,/2\.2/);
});
test('score is weighted sum of four proxies, no hidden cost subtraction',()=>{
 const y={year:2028,events:[ev('jupiter','天顶'),ev('saturn','天顶'),ev('jupiter','第二宫宫主',3)]};
 const d=indexForYear(y);
 const raw=Object.entries(CDI_WEIGHTS).reduce((sum,[k,w])=>sum+d.components[k]*w,0);
 assert.ok(Math.abs(d.rawScore-raw)<1e-7);assert.equal(d.score,Math.round(raw));assert.equal(d.costPenalty,0);
 for(const [k,w] of Object.entries(CDI_WEIGHTS))assert.ok(Math.abs(d.contributions[k]-d.components[k]*w)<1e-7);
});
test('personal clock without GR increases change intensity but not development score',()=>{
 const c={...ev('moon','天顶'),type:'C',priority:1};
 const data=indexForYear({year:2028,events:[c]});
 assert.equal(data.score,50);assert.ok(data.changeIntensity>0);
});
test('financial theme receives higher weight without manufacturing confirmed jump',()=>{
 const base=indexForYear({year:2028,events:[]});
 const fin=indexForYear({year:2028,events:[ev('jupiter','第二宫宫主',3)]});
 assert.ok(fin.score>base.score);assert.equal(fin.support,null);assert.equal(fin.stability,null);
});
