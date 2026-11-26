import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,selectTheme,selectTarot} from '../tarot.js';
const make=(gr,c,p1)=>({birthUTC:'2001-04-17T14:35:00Z',years:Array.from({length:10},(_,i)=>({year:2027+i,GR:gr,C:c,p1}))});
test('deck covers all 22 unique major arcana',()=>{assert.equal(CARDS.length,22);assert.equal(new Set(CARDS.map(x=>x.id)).size,22)});
test('theme uses real GR and C evidence, not made-up J predictions',()=>{assert.equal(selectTheme(make(0,0,0)),'reflect');assert.equal(selectTheme(make(0,3,0)),'explore');assert.equal(selectTheme(make(4,0,1)),'change');assert.equal(selectTheme(make(6,3,2)),'expand')});
test('selection is stable per report and respects theme',()=>{const r=make(4,3,1);let a=selectTarot(r),b=selectTarot(r);assert.deepEqual(a,b);assert.ok(a.cardId>=0&&a.cardId<22);assert.match(a.evidence,/GR/);assert.match(a.disclaimer,/不是/)});
test('missing years are rejected',()=>assert.throws(()=>selectTarot({years:[]})));
