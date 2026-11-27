import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCareerStory} from '../career-story.js';
import {indexForDecade,CDI_WEIGHTS} from '../career-index.js';
const event=(mover,target,priority,begin,best,end,type='GR')=>({mover,target,priority,begin,best,end,type,minOrb:.04,label:'合相'});
const report=(es,start=2030,n=10)=>({years:Array.from({length:n},(_,i)=>{const year=start+i;const active=es.filter(e=>Number(e.begin.slice(0,4))<=year&&Number(e.end.slice(0,4))>=year);return {year,events:active,GR:active.filter(e=>e.type==='GR').length,C:active.filter(e=>e.type==='C').length}})});
test('approved weights stay unchanged and all consumers share same score',()=>{
 assert.deepEqual(CDI_WEIGHTS,{opportunity:.15,expansion:.25,position:.25,value:.35});
 const r=report([event('jupiter','第二宫宫主',3,'2032-01-01','2032-06-01','2033-01-01')]);
 assert.deepEqual(buildCareerStory(r).indices.map(x=>x.score),indexForDecade(r).map(x=>x.score));
});
test('ten-year overview is a conclusion rather than concatenated section names',()=>{
 const r=report([event('jupiter','天顶',1,'2030-01-01','2031-02-01','2031-12-01'),event('saturn','太阳',2,'2034-01-01','2035-03-01','2036-01-01')]);
 const s=buildCareerStory(r);assert.match(s.overview.headline,/未来十年/);assert.doesNotMatch(s.overview.summary,/ → |GR|P1|C \d/);
});
test('one sustained event is not repeated as annual new event in the middle',()=>{
 const r=report([event('pluto','天顶',1,'2031-02-01','2033-03-01','2035-10-01')]);const s=buildCareerStory(r);
 for(const year of [2032,2033,2034,2035])assert.equal(s.byYear.get(year).uniqueNewEvents,0);
 assert.equal(s.byYear.get(2034).actions.length,0);
});
test('financial and role windows are separately surfaced and never called guaranteed jumps',()=>{
 const r=report([event('saturn','天顶',1,'2031-01-01','2032-02-01','2033-01-01'),event('jupiter','第二宫主',3,'2034-01-01','2035-03-01','2035-12-01'),event('uranus','天顶',1,'2036-01-01','2037-04-01','2038-01-01')]);
 const s=buildCareerStory(r);assert.equal(s.windows.find(w=>w.type==='position').years[0].year,2032);assert.equal(s.windows.find(w=>w.type==='value').years[0].year,2035);
 assert.ok(s.keyYears.some(y=>y.year===2032));assert.ok(s.keyYears.some(y=>y.year===2035));
 assert.doesNotMatch(s.years.map(y=>y.title+' '+y.summary).join(' '),/必然升职|保证涨薪|已确认跃迁/);
});
test('different fictional profiles produce different primary report structure',()=>{
 const a=buildCareerStory(report([event('jupiter','第二宫主',3,'2031-01-01','2032-03-01','2033-01-01')]));
 const b=buildCareerStory(report([event('uranus','天顶',1,'2035-01-01','2036-03-01','2037-01-01')]));
 assert.notEqual(a.overview.summary,b.overview.summary);
 assert.notDeepEqual(a.keyYears.map(y=>y.year),b.keyYears.map(y=>y.year));
});
