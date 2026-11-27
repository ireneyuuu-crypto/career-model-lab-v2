import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCareerStory} from '../career-story.js';
const e=(mover,target,begin,best,end,priority=1,type='GR')=>({id:`${mover}/${target}`,mover,target,begin,best,end,priority,type,minOrb:.1,label:'合相'});
const y=(year,events)=>({year,events,GR:events.filter(e=>e.type==='GR').length,C:events.filter(e=>e.type==='C').length});
test('single long GR window yields one phase with distinct start peak continuation years',()=>{
 const a=e('uranus','天顶', '2027-07-01','2028-05-10','2029-02-01');const report={years:[y(2027,[a]),y(2028,[a]),y(2029,[a])]};const s=buildCareerStory(report);
 assert.equal(s.phases.length,1);assert.match(s.byYear.get(2027).title,/开始|酝酿|转向/);assert.match(s.byYear.get(2028).title,/关键转折|关键调整/);assert.match(s.byYear.get(2029).title,/承接|后续期/);assert.notEqual(s.byYear.get(2027).contrast,s.byYear.get(2029).contrast);
});
test('finances are not swallowed by a restructuring signal',()=>{
 const report={years:[y(2031,[e('uranus','天顶','2031-01-01','2031-10-01','2031-12-30'),e('jupiter','第二宫宫主','2031-03-01','2031-06-10','2031-08-01',3)])]};const s=buildCareerStory(report);assert.ok(s.byYear.get(2031).topics.includes('value'));assert.equal(s.windows.find(x=>x.type==='value').years[0].year,2031);
});
test('income & role remain separately identified',()=>{const s=buildCareerStory({years:[y(2032,[e('saturn','天顶','2032-01-01','2032-02-15','2032-07-01'),e('jupiter','第二宫宫主','2032-01-01','2032-10-15','2032-12-20',3)])]});assert.ok(s.byYear.get(2032).topics.includes('position'));assert.ok(s.byYear.get(2032).topics.includes('value'));});
test('C alone cannot invent O/E/P/V improvement',()=>{const s=buildCareerStory({years:[y(2027,[e('moon','太阳','2027-01-01','2027-05-01','2027-12-01',2,'C')])]});assert.equal(s.byYear.get(2027).topic,'action');assert.equal(s.windows.find(x=>x.type==='value').years.length,0);});
test('same event in adjacent years does not count as new',()=>{const a=e('pluto','天顶','2027-01-01','2028-03-01','2029-12-01');const s=buildCareerStory({years:[y(2027,[a]),y(2028,[a]),y(2029,[a])]});assert.equal(s.byYear.get(2028).uniqueNewEvents,0);});
