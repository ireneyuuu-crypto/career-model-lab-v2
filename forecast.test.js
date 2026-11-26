import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {forecast,utcFromLocal,parseChart,DEMO} from '../engine.js';
const originalFetch=globalThis.fetch;
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(await readFile(new URL(path),'utf8'))});
test('end-to-end 10-year forecast has coherent GR/C signals in tropical and Lahiri',async()=>{
 const sample=parseChart(DEMO).extracted;
 const b=utcFromLocal(sample.date,sample.time,sample.tz);
 for(const zodiac of ['tropical','lahiri']){
  const r=await forecast({birthUTC:b,startYear:2027,mc:sample.mc,cusp2:sample.cusp2,zodiac});
  assert.equal(r.years.length,10);
  assert.ok(r.events.length>0);
  assert.ok(r.events.every(e=>e.minOrb<=(e.type==='GR'?3:2)));
  assert.ok(r.events.every(e=>e.begin<=e.end));
  assert.ok(r.events.every(e=>e.type==='GR'||e.type==='C'));
 }
});
