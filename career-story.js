/* Career Model Lab 2.6 — evidence-first report composition.
   One event is described once per cycle; years show what actually changes.
   This is interpretive timing, not observed career results. */
import {featureDecade,eventKey,category,evidenceStrength,overlapDays,THEMES} from './career-features.js';
import {indexFromFeatures} from './career-index.js';
const kinds=['value','position','opportunity','restructure','action'];
const LABEL={value:'收入与资源价值',position:'正式岗位与权责',opportunity:'新平台与发展机会',restructure:'职业轨道调整',action:'自主职业选择',none:'日常发展'};
const PLAN={value:'比较现有与外部市场报价，列明薪酬、预算、资源权等可谈判条件。',position:'提前明确拟承担的职责与正式授权、职级、汇报关系是否匹配。',opportunity:'优先比较能带来新客户、关键项目或更大业务范围的实际入口。',restructure:'保留现有选择的同时评估新路径的能力积累、转换成本和回报。',action:'将主动调整落实为明确的目标岗位、工作条件或行动期限。'};
const MOTIVE={jupiter:'扩张与机会',saturn:'责任与组织约束',uranus:'突破既有路径',neptune:'方向与条件重估',pluto:'权力结构与角色重塑',sun:'个人身份',moon:'个人行动节奏',mercury:'沟通与决策',venus:'个人价值选择',mars:'个人推动力'};
const GROUP={1:'职业核心位置',2:'个人身份与职责',3:'职业价值与资源'};
const max=(a)=>a.length?Math.max(...a):0;
const yearOf=s=>Number(String(s||'').slice(0,4));
const monthOf=s=>Number(String(s||'').slice(5,7));
const prettyMonths=ms=>[...new Set(ms)].filter(m=>m>=1&&m<=12).sort((a,b)=>a-b).slice(0,3).map(m=>m+'月').join('、');
function fragments(f){
 const ev=f.events.map(e=>({...e,_kind:category(e),_strength:evidenceStrength(e,f.year),_peak:yearOf(e.best)===f.year,_first:yearOf(e.begin)===f.year,_last:yearOf(e.end)===f.year}));
 const by={}; for(const k of kinds)by[k]=ev.filter(e=>e._kind===k).sort((a,b)=>Number(b._peak)-Number(a._peak)||b._strength-a._strength);
 const first=ev.filter(e=>e._first),peaks=ev.filter(e=>e._peak),last=ev.filter(e=>e._last);
 const peakQuarter=[1,2,3,4].map(q=>({q,n:peaks.filter(e=>Math.ceil(monthOf(e.best)/3)===q).length})).sort((a,b)=>b.n-a.n)[0];
 return {ev,by,first,peaks,last,peakQuarter};
}
function focusKind(f,part){
 const scored=kinds.map(k=>{const es=part.by[k],s=es.reduce((a,e)=>a+e._strength*(e._peak?1.35:e._first?1.12:1),0);
 // A stand-alone change signal must not automatically displace a simultaneous value/role window.
 const important=Math.min(1.65,s);const distinct=es.filter(e=>e._peak||e._first).length;
 return {k,score:important,distinct,has:es.length>0};}).filter(x=>x.has);
 scored.sort((a,b)=>b.score-a.score||kinds.indexOf(a.k)-kinds.indexOf(b.k));
 return scored;
}
function lifecycle(f,part,principal){if(!principal)return 'quiet';const subset=part.by[principal.k];
 if(subset.some(e=>e._peak))return 'peak';
 if(subset.some(e=>e._first))return 'start';
 if(subset.some(e=>e._last))return 'exit';
 return 'continuation';}
function signalPhrase(e){if(!e)return '';const m=MOTIVE[e.mover]||'变化';return `${m}集中在${GROUP[e.priority]||'职业相关位置'}`;}
function meaningfulChange(f,prev,parts,p){
 if(!prev)return '十年观察区间的第一年。';
 const prevP=parts.get(prev.year),prevKeys=new Set(prevP.ev.map(eventKey));
 const newly=p.ev.filter(e=>!prevKeys.has(eventKey(e)));
 if(newly.length){const main=newly.sort((a,b)=>b._strength-a._strength)[0];return `相较${prev.year}年，新增${LABEL[main._kind]}相关窗口（${signalPhrase(main)}）。`;}
 if(p.peaks.length&&!prevP.peaks.some(e=>p.peaks.some(x=>eventKey(x)===eventKey(e))))return `相比${prev.year}年，本年有${p.peaks.length}个持续窗口进入集中时段。`;
 if(p.last.length)return '原有职业主题逐渐退出活跃区间，重点转向评估此前选择的实际效果。';
 return ''; // Same underlying event, don't manufacture a new annual claim.
}
function buildYear(f,prev,parts){const p=parts.get(f.year),ranking=focusKind(f,p),main=ranking[0],secondary=ranking.filter(x=>x.k!==main?.k&&x.score>=.24).slice(0,2);
 const life=lifecycle(f,p,main),idx=indexFromFeatures(f);
 if(!main)return {year:f.year,role:'平稳观察',title:'没有新的突出职业窗口',summary:'模型在本年度未识别到符合既定规则的集中职业触发。',contrast:prev&&prev.events.length?'上一阶段的主要信号已减弱。':'',months:'—',topic:'none',topics:[],actions:[],evidence:[],uniqueNewEvents:0,peakCount:0,strength:0,index:idx,secondary:[],lifecycle:life};
 const strongest=p.by[main.k][0],direct=p.by[main.k].filter(e=>e._peak),months=prettyMonths(direct.map(e=>monthOf(e.best)));
 const h=main.k==='value'?'薪酬、资源与市场价值':main.k==='position'?'正式职位与组织权责':main.k==='opportunity'?'新平台、新项目与发展入口':main.k==='restructure'?'职业方向与组织角色':'主动职业选择';
 const phase={peak:'集中',start:'启动',exit:'收尾',continuation:'持续'}[life];
 let title=life==='peak'?(main.k==='restructure'?'职业方向与角色进入关键调整期':`${h}进入重点窗口`):life==='start'?`${h}开始活跃`:life==='exit'?(main.k==='restructure'?'职业转向进入承接后续期':`${h}进入收尾阶段`):`${h}持续推进`;
 // Distinguish paired evidence only when a second dimension is substantively active.
 const pair=secondary.find(x=>x.score>=.65&&x.k!==main.k);
 if(pair&&life==='peak')title+=`，叠加${LABEL[pair.k]}`;
 const evidencePhrase=signalPhrase(strongest);
 const peakLine=months?`重点时间为${months}。`:life==='continuation'?'本年没有新的独立精确峰值。':'';
 const overlap=secondary.length?`同时涉及${secondary.map(x=>LABEL[x.k]).join('、')}。`:'';
 const notes=[];
 if(main.k==='position'&&secondary.some(x=>x.k==='value'))notes.push('职位与价值信号并行，适合同时观察正式级别与可兑现回报。');
 else if(main.k==='opportunity'&&secondary.some(x=>x.k==='position'))notes.push('机会与正式位置主题重叠，重点比较新机会是否改变组织角色。');
 else if(main.k==='restructure'&&secondary.some(x=>x.k==='value'))notes.push('轨道调整伴随价值议题，值得把转换成本与资源回报放在一起衡量。');
 else if(main.k==='value'&&secondary.some(x=>x.k==='position'))notes.push('价值与职位主题同步，比单纯工作量增加更值得观察。');
 const summary=`${evidencePhrase}，主要对应${LABEL[main.k]}。${peakLine}${overlap}${notes.join('')}`;
 const contrast=meaningfulChange(f,prev,parts,p);
 const actions=(life==='continuation'&&!p.peaks.length&&!p.first.length)?[]:[PLAN[main.k],...(notes.length?[]:secondary.filter(x=>x.k!=='action').slice(0,1).map(x=>PLAN[x.k]))];
 const evidence=[...p.ev].sort((a,b)=>Number(b._peak)-Number(a._peak)||b._strength-a._strength).slice(0,3).map(e=>({type:e._kind,stage:e._peak?'集中':e._first?'启动':e._last?'收尾':'持续',month:yearOf(e.best)===f.year?monthOf(e.best)+'月':'跨年',begin:e.begin,best:e.best,end:e.end,original:e}));
 return {year:f.year,role:phase,title,summary,contrast,months:months||'跨年持续',topic:main.k,topics:ranking.map(x=>x.k),actions,evidence,uniqueNewEvents:p.first.length,peakCount:p.peaks.length,strength:main.score,index:idx,secondary:secondary.map(x=>x.k),lifecycle:life,peakMonth:months,mechanism:evidencePhrase};
}
function phasesFor(years,parts){const phases=[];
 for(const d of years){const current=parts.get(d.year);const prev=phases.at(-1);
 // Related periods form a single phase only when their event identities overlap.
 const sameCycle=prev&&prev.topic===d.topic&&current.ev.some(e=>prev.keys.has(eventKey(e)));
 if(sameCycle){prev.years.push(d.year);prev.end=d.year;current.ev.forEach(e=>prev.keys.add(eventKey(e)));}
 else phases.push({start:d.year,end:d.year,years:[d.year],topic:d.topic,keys:new Set(current.ev.map(eventKey))});
 }
 for(const ph of phases){const members=years.filter(x=>ph.years.includes(x.year)),peaks=members.filter(x=>x.peakCount);const highlight=(peaks.length?peaks:members).sort((a,b)=>b.peakCount-a.peakCount||b.strength-a.strength)[0];
 ph.range=ph.start===ph.end?String(ph.start):`${ph.start}–${ph.end}`;ph.title=LABEL[ph.topic]||'发展节奏';ph.headline=ph.range+'｜'+ph.title;ph.pivotYear=highlight.year;
 ph.summary=ph.years.length===1?`${ph.start}年的重点是${highlight.title}。${highlight.peakMonth?'关键时间：'+highlight.peakMonth+'。':''}`:`这一轮${ph.title}贯穿${ph.start}–${ph.end}年，${highlight.year}年是窗口集中点。其余年份属于同一周期的启动或延续，不代表发生了多次独立职业事件。`;
 delete ph.keys;}
 return phases;
}
function decadeOverview(years,windows,phases,indices){const strongest=indices.slice().sort((a,b)=>b.score-a.score)[0];const value=windows.find(w=>w.type==='value')?.years[0],role=windows.find(w=>w.type==='position')?.years[0],change=windows.find(w=>w.type==='restructure')?.years[0];
 const present=[value&&`职业价值主题集中在${value.year}年`,role&&`职位权责主题集中在${role.year}年`,change&&`职业调整主题集中在${change.year}年`].filter(Boolean);
 const avg=indices.reduce((a,x)=>a+x.score,0)/Math.max(1,indices.length);const spread=Math.max(...indices.map(x=>x.score))-Math.min(...indices.map(x=>x.score));
 const contrast=spread<8?'发展相关信号整体变化幅度较小':spread<20?'发展相关信号有阶段性起伏':'发展相关信号起伏比较明显';
 const first=phases[0],last=phases.at(-1);const directional=first&&last&&first.topic!==last.topic?`十年初期侧重${first.title}，后期转向${last.title}。`:'主要职业主题在部分年份持续出现。';
 return {headline:`未来十年，${contrast}。`,summary:`${directional}${present.join('；')}${present.length?'。':''}`,bestSignalYear:strongest?.year,avg:Math.round(avg)};
}
export function buildCareerStory(report){const fs=featureDecade(report),parts=new Map(fs.map(f=>[f.year,fragments(f)]));const years=fs.map((f,i)=>buildYear(f,fs[i-1],parts)),byYear=new Map(years.map(y=>[y.year,y]));
 const windows=[['value','收入与职业价值'],['position','职位与责任'],['opportunity','机会扩展'],['restructure','职业转型']].map(([type,label])=>{
 const xs=fs.map(f=>{const events=parts.get(f.year).by[type];return {year:f.year,score:Math.min(1.75,events.reduce((a,e)=>a+e._strength,0)),peak:events.some(e=>e._peak),has:events.length>0};}).filter(x=>x.has);
 xs.sort((a,b)=>Number(b.peak)-Number(a.peak)||b.score-a.score||a.year-b.year);return {type,label,years:xs.slice(0,3)};
 });
 const chosen=[],used=new Set();for(const type of ['value','position','opportunity','restructure']){const winner=windows.find(w=>w.type===type)?.years.find(x=>!used.has(x.year));if(winner&&chosen.length<3){chosen.push(byYear.get(winner.year));used.add(winner.year);}}
 const phases=phasesFor(years,parts),indices=fs.map(indexFromFeatures),overview=decadeOverview(years,windows,phases,indices);
 return {years,byYear,phases,windows,keyYears:chosen,features:fs,indices,overview};
}
