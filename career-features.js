/* Shared, versioned projection of GR/C events into report features.
   Interpretive indicators, NOT actual E/P/V outcomes or observed J/R. */
export const FEATURE_VERSION='CAREER-FEATURES-2.5';
export const THEMES={opportunity:'新机会',position:'职位与权责',value:'收入与职业价值',restructure:'职业转向',action:'主动选择'};
const priorities={1:1,2:.55,3:.34};
const MS=86400000;
const inYear=(s,y)=>String(s||'').startsWith(String(y));
export function category(e){if(e.type==='C')return 'action';if(e.type==='GR'&&(e.priority===3||/第二宫|2C|2R/.test(e.target||'')))return 'value';if(e.mover==='jupiter')return 'opportunity';if(e.mover==='saturn')return 'position';if(['uranus','neptune','pluto'].includes(e.mover))return 'restructure';return 'action';}
export function eventKey(e){return [e.type,e.mover,e.target,e.label,e.begin,e.best,e.end].join('|');}
export function uniqueEvents(events){return [...new Map((events||[]).map(e=>[eventKey(e),e])).values()];}
export function overlapDays(e,y){let a=Date.parse((e.begin||'')+'T00:00:00Z'),b=Date.parse((e.end||'')+'T23:59:59Z');if(!Number.isFinite(a)||!Number.isFinite(b))return 0;return Math.max(0,(Math.min(b,Date.UTC(y+1,0,1))-Math.max(a,Date.UTC(y,0,1)))/MS);}
export function evidenceStrength(e,y){const days=overlapDays(e,y);if(!days)return 0;const priority=priorities[e.priority]||.34;const orb=e.type==='C'?2:3;const proximity=Number.isFinite(e.minOrb)?Math.max(0,1-e.minOrb/orb):.5;return priority*(.6+.4*proximity)*(.35+.65*Math.min(1,days/75));}
export const cap=(xs,lim=1.75)=>Math.min(lim,xs.reduce((a,b)=>a+b,0));
export function featureYear(y){const events=uniqueEvents(y.events).filter(e=>overlapDays(e,y.year)>0);const gr=events.filter(e=>e.type==='GR'),clock=events.filter(e=>e.type==='C');
 const j=cap(gr.filter(e=>e.mover==='jupiter').map(e=>evidenceStrength(e,y.year))),s=cap(gr.filter(e=>e.mover==='saturn').map(e=>evidenceStrength(e,y.year))),u=cap(gr.filter(e=>['uranus','neptune','pluto'].includes(e.mover)).map(e=>evidenceStrength(e,y.year)));
 const finance=cap(gr.filter(e=>category(e)==='value').map(e=>evidenceStrength(e,y.year)),1.5),action=cap(clock.map(e=>evidenceStrength(e,y.year)),1.25);
 const groups={};for(const type of Object.keys(THEMES))groups[type]=[];for(const e of events)groups[category(e)].push(e);
 const strengths={};for(const [type,list] of Object.entries(groups))strengths[type]=cap(list.map(e=>evidenceStrength(e,y.year)),1.75);
 // A dominant theme is not automatically the one with the most repeated aspects.
 const sorted=Object.entries(strengths).filter(([,v])=>v>.0001).sort((a,b)=>b[1]-a[1]);
 const peaks=events.filter(e=>inYear(e.best,y.year));
 const monthMap=new Map();for(const e of peaks){const m=Number((e.best||'').slice(5,7));if(m>=1&&m<=12){if(!monthMap.has(m))monthMap.set(m,[]);monthMap.get(m).push(e)}}
 const quarters=[0,0,0,0];for(const [m,list] of monthMap)quarters[Math.floor((m-1)/3)]+=list.reduce((a,e)=>a+evidenceStrength(e,y.year),0);
 return {year:y.year,events,gr,clock,j,s,u,finance,action,groups,strengths,sorted,peaks,monthMap,quarters};}
export function featureDecade(report){return (report.years||[]).map(featureYear);}
export function stageForEvent(e,y){const b=Number((e.begin||'').slice(0,4)),p=Number((e.best||'').slice(0,4)),end=Number((e.end||'').slice(0,4));if(p===y)return 'peak';if(b===y&&p>y)return 'start';if(b<y&&p>y)return 'build';if(p<y&&end>=y)return 'follow';return 'active';}
