import test from 'node:test';import assert from 'node:assert/strict';
import {parseChart,zodiacToLongitude,aspectOrb,calculateMC,validateSettings,utcFromLocal} from '../engine.js';
test('recognizes Chinese chart export basics',()=>{const p=parseChart('出生时间：1992-12-21 22:35:00\n时区：东8区\n经纬度：31.23, 121.47\nMC：天蝎座 17°15′');assert.equal(p.extracted.date,'1992-12-21');assert.equal(p.extracted.time,'22:35');assert.equal(p.extracted.long,121.47);assert.equal(p.extracted.mc,227.25)});
test('zodiac conversion respects signs',()=>{assert.equal(zodiacToLongitude('狮子座 11°30′'),131.5);assert.equal(zodiacToLongitude('双鱼座 29°0′'),359)});
test('aspect wrapping at zero degrees',()=>{assert.equal(aspectOrb(359,1,0),2);assert.equal(aspectOrb(350,80,90),0)});
test('requires location or MC',()=>{assert.ok(validateSettings({date:'1992-12-21',time:'22:35',tz:'+08:00',long:'',mc:'',cusp2:'',startYear:2027}).errors.length)});
test('parses UTC offset correctly',()=>{assert.equal(utcFromLocal('1992-12-21','22:35','+08:00').toISOString(),'1992-12-21T14:35:00.000Z')});
test('recognizes Lahiri sidereal chart setting',()=>{assert.equal(parseChart('出生时间：1992-12-21 22:35\n黄道：恒星黄道 Lahiri').extracted.zodiac,'lahiri')});
test('MC stays in range',()=>{const mc=calculateMC(new Date('2000-01-01T12:00:00Z'),0);assert.ok(mc>=0&&mc<360)});
