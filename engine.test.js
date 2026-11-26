import test from 'node:test';import assert from 'node:assert/strict';
import {parseChart,zodiacToLongitude,aspectOrb,calculateMC,validateSettings,utcFromLocal} from '../engine.js';
test('recognizes Chinese chart export basics',()=>{const p=parseChart('出生时间：2001-04-17 09:20:00\n时区：东9区\n经纬度：35.68, 139.69\nMC：天蝎座 17°15′');assert.equal(p.extracted.date,'2001-04-17');assert.equal(p.extracted.time,'09:20');assert.equal(p.extracted.long,139.69);assert.equal(p.extracted.mc,227.25)});
test('zodiac conversion respects signs',()=>{assert.equal(zodiacToLongitude('狮子座 11°30′'),131.5);assert.equal(zodiacToLongitude('双鱼座 29°0′'),359)});
test('aspect wrapping at zero degrees',()=>{assert.equal(aspectOrb(359,1,0),2);assert.equal(aspectOrb(350,80,90),0)});
test('requires location or MC',()=>{assert.ok(validateSettings({date:'2001-04-17',time:'09:20',tz:'+09:00',long:'',mc:'',cusp2:'',startYear:2027}).errors.length)});
test('parses UTC offset correctly',()=>{assert.equal(utcFromLocal('2001-04-17','09:20','+09:00').toISOString(),'2001-04-17T00:20:00.000Z')});
test('recognizes Lahiri sidereal chart setting',()=>{assert.equal(parseChart('出生时间：2001-04-17 09:20\n黄道：恒星黄道 Lahiri').extracted.zodiac,'lahiri')});
test('MC stays in range',()=>{const mc=calculateMC(new Date('2000-01-01T12:00:00Z'),0);assert.ok(mc>=0&&mc<360)});
