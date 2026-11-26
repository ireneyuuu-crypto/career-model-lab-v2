import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretYear,interpretDecade} from '../interpretation.js';
test('explains dominant career theme without inventing jumps',()=>{
 const y={year:2027,GR:2,C:0,events:[{type:'GR',priority:1,mover:'saturn',target:'MC',best:'2027-03-10'},{type:'GR',priority:2,mover:'jupiter',target:'太阳',best:'2027-04-01'}]};
 const result=interpretYear(y);
 assert.equal(result.topic,'责任与结构调整');
 assert.equal(result.jump,'不可由相位单独判断');
 assert.equal(result.income,'不可由相位推算金额或涨幅');
 assert.equal(result.primarySignals,1);
});
test('does not infer lack of opportunities from zero astro events',()=>{
 const result=interpretYear({year:2028,GR:0,C:0,events:[]});
 assert.match(result.risk,/不代表现实不会发生/);
});
test('highlights compare P1 signal counts not salary probabilities',()=>{
 const years=[{year:2027,GR:0,C:0,events:[]},{year:2028,GR:1,C:0,events:[{type:'GR',priority:1,mover:'jupiter',target:'MC',best:'2028-02-02'}]}];
 const result=interpretDecade({years});assert.equal(result.highlights[0].year,2028);
});
