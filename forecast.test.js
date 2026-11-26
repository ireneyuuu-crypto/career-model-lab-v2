import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {forecast,utcFromLocal,parseChart,DEMO,refineAspectTime} from '../engine.js';
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

test('numerical precision solver minimizes and brackets synthetic known crossing', async()=>{const zero=Date.UTC(2030,0,1);const orbAt=async d=>Math.abs((d.getTime()-zero)/3600000-12);const best=await refineAspectTime({low:new Date(zero),high:new Date(zero+86400000),orbAt});assert.ok(best.orb<0.001);assert.ok(Math.abs(Date.parse(best.time)-(zero+12*3600000))<60000);const crossing=await refineAspectTime({low:new Date(zero),high:new Date(zero+12*3600000),orbAt,threshold:3});assert.ok(Math.abs(Date.parse(crossing)-(zero+9*3600000))<60000);});
