import test from 'node:test';
import assert from 'node:assert/strict';
import {yearProfile,decadePhases,decadeProfiles,keyWindows} from '../outcome.js';
const ev=(mover,target,begin,best,end,priority=1,type='GR')=>({id:`${type}:${mover}:${target}`,mover,target,begin,best,end,priority,type,minOrb:0.2,label:'合相'});
const mk=(year,events=[])=>({year,events,GR:events.filter(e=>e.type==='GR').length,C:events.filter(e=>e.type==='C').length,p1:events.filter(e=>e.type==='GR'&&e.priority===1).length});
test('structural change is R candidate not confirmed jump',()=>{
 const p=yearProfile(mk(2028,[ev('uranus','天顶（MC）','2028-06-01','2029-03-01','2030-02-01')]));
 assert.match(p.kind,/R/);assert.match(p.evidence[0].text,/2029年接近峰值/);assert.doesNotMatch(p.jump,/已确认/);
});
test('finance-only event cannot mean salary rise or J',()=>{
 const p=yearProfile(mk(2030,[ev('jupiter','第二宫宫主星','2030-03-01','2030-04-01','2030-05-01',3)]));
 assert.match(p.kind,/V/);assert.match(p.valueLabel,/需核实/);assert.match(p.jump,/无法确认/);
});
test('primary jupiter and saturn differentiated as position and scope hypothesis',()=>{
 const p=yearProfile(mk(2031,[ev('jupiter','天顶（MC）','2031-01-01','2031-04-01','2031-08-01'),ev('saturn','第十宫宫主星','2031-02-01','2031-07-01','2031-10-01')]));
 assert.match(p.kind,/P\/E/);assert.match(p.support,/无法仅凭/);
});
test('phases reflect signal differences rather than fixed year partition',()=>{
 const report={years:Array.from({length:10},(_,i)=>mk(2027+i,i<3?[ev('saturn','天顶（MC）',`${2027+i}-01-01`,`${2027+i}-06-01`,`${2027+i}-12-01`)]:[ev('uranus','天顶（MC）',`${2027+i}-01-01`,`${2027+i}-06-01`,`${2027+i}-12-01`)]))};
 const ps=decadeProfiles(report),groups=decadePhases(ps);
 assert.deepEqual(groups.map(g=>g.range),['2027–2029','2030–2036']);assert.equal(keyWindows(ps).length,2);
});
