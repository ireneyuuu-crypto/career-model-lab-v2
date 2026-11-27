import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCareerStory} from '../career-story.js';
import {indexForDecade,indexForYear} from '../career-index.js';
import {featureDecade} from '../career-features.js';
const make=(mover,target,best,priority=1,start=null,end=null,type='GR')=>({id:mover+target+best,mover,target,label:'合相',type,priority,begin:start||best.slice(0,4)+'-01-01',best,end:end||best.slice(0,4)+'-12-31',minOrb:.1});
const data=(map)=>({years:Object.entries(map).map(([year,events])=>({year:Number(year),events,GR:events.filter(e=>e.type==='GR').length,C:events.filter(e=>e.type==='C').length}))});
test('one common yearly feature layer drives both narrative and score',()=>{
 const r=data({2028:[make('saturn','天顶','2028-03-15'),make('jupiter','第二宫宫主','2028-06-21',3)],2029:[make('uranus','天顶','2029-02-20')]});
 const s=buildCareerStory(r),i=indexForDecade(r);assert.deepEqual(s.indices.map(x=>x.score),i.map(x=>x.score));
 assert.equal(s.byYear.get(2028).index.score,i[0].score);
});
test('category-specific year ranking represents both career position and financial value',()=>{
 const r=data({2027:[make('uranus','天顶','2027-06-01'),make('neptune','天顶','2027-07-01')],2028:[make('saturn','天顶','2028-07-01')],2029:[make('jupiter','第二宫宫主','2029-09-01',3)]});
 const s=buildCareerStory(r);assert.equal(s.windows.find(w=>w.type==='value').years[0].year,2029);assert.equal(s.windows.find(w=>w.type==='position').years[0].year,2028);
 assert.ok(s.keyYears.some(y=>y.year===2029));assert.ok(s.keyYears.some(y=>y.year===2028));
});
test('annual story uses subtype evidence rather than same generic title on every year',()=>{
 const r=data({2027:[make('saturn','太阳','2027-04-01',2)],2028:[make('jupiter','天顶','2028-08-01')],2029:[make('jupiter','第二宫宫主','2029-09-01',3)]});
 const s=buildCareerStory(r);assert.equal(new Set(s.years.map(y=>y.title)).size,3);assert.equal(new Set(s.years.map(y=>y.summary)).size,3);
});
test('one cross-year event stays one event without multiplying original signals',()=>{
 const a=make('pluto','天顶','2029-03-04',1,'2027-09-01','2030-06-01');const r=data({2027:[a],2028:[a],2029:[a],2030:[a]});const s=buildCareerStory(r);
 assert.equal(s.phases.length,1);assert.equal(s.byYear.get(2028).uniqueNewEvents,0);assert.equal(s.byYear.get(2029).uniqueNewEvents,0);
 assert.equal(s.byYear.get(2029).role,'集中');
});
test('C alone cannot increase development score, nor fabricate role or financial events',()=>{
 const c=make('moon','太阳','2029-05-18',2,null,null,'C');const r=data({2029:[c]});const s=buildCareerStory(r);const score=indexForYear(r.years[0]);
 assert.equal(score.score,50);assert.equal(s.byYear.get(2029).topic,'action');assert.equal(s.windows.find(w=>w.type==='value').years.length,0);assert.equal(s.windows.find(w=>w.type==='position').years.length,0);
});
test('quarterly evidence extracts two separate peak months',()=>{
 const r=data({2031:[make('jupiter','天顶','2031-02-10'),make('saturn','天顶','2031-11-17')]});const f=featureDecade(r)[0];assert.ok(f.monthMap.has(2));assert.ok(f.monthMap.has(11));assert.ok(f.quarters[0]>0&&f.quarters[3]>0);
});
