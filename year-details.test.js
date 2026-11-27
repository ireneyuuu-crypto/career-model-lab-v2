import test from 'node:test';
import assert from 'node:assert/strict';
import {detailedYear} from '../year-details.js';
const ev=(mover,target,best,priority=1,type='GR')=>({id:`${type}:${mover}:${target}:${best}`,mover,target,begin:best.slice(0,4)+'-01-01',best,end:best.slice(0,4)+'-12-31',priority,type,minOrb:0.12,label:'合相'});
const yr=(year,events)=>({year,events,GR:events.filter(x=>x.type==='GR').length,C:events.filter(x=>x.type==='C').length,p1:events.filter(x=>x.type==='GR'&&x.priority===1).length});
test('salary theme remains separate from position and from confirmed salary',()=>{const x=detailedYear(yr(2031,[ev('jupiter','第二宫宫主星','2031-05-01',3)]));assert.match(x.interaction,/职业价值/);assert.doesNotMatch(x.interaction,/已经发生跃迁/);});
test('year-on-year comparison highlights actual new dimension',()=>{const a=yr(2030,[ev('jupiter','天顶（MC）','2030-04-01')]);const b=yr(2031,[ev('saturn','天顶（MC）','2031-08-01'),ev('jupiter','第二宫宫头','2031-10-01',3)]);const x=detailedYear(b,a);assert.match(x.relative,/新增/);assert.match(x.relative,/职业价值议题/);assert.equal(x.focus.length,1);});
test('phase: activation vs peak vs extension differ',()=>{const a=ev('uranus','天顶（MC）','2030-06-01');a.begin='2029-01-01';a.end='2031-08-01';const start=detailedYear(yr(2029,[a]));const peak=detailedYear(yr(2030,[a]));const tail=detailedYear(yr(2031,[a]));assert.match(start.foreground,/预计2030年/);assert.match(peak.foreground,/6月接近/);assert.match(tail.foreground,/峰值后的延续/);});
test('C without GR does not become guaranteed upward event',()=>{const x=detailedYear(yr(2030,[ev('moon','本命太阳','2030-03-01',2,'C')]));assert.match(x.interaction,/个人行动节奏/);assert.match(x.interaction,/不构成职业上升/);});
