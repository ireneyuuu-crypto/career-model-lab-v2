/* Independently invented example windows. Never copy user chart or calibration history. */
import {buildCareerStory} from './career-story.js';
import {userTrendsForDecade} from './career-index.js';
import {selectTarot} from './tarot.js';
import {renderTarot} from './tarot-ui.js';
const $=id=>document.getElementById(id);
const years=Array.from({length:10},(_,i)=>({year:2030+i,events:[]}));
function ev(mover,target,priority,begin,best,end,type='GR'){
 return {id:`fictional-${mover}-${target}-${best}`,type,mover,target,priority,begin,best,end,minOrb:.12,label:'合相'};
}
const eventData=[
 ev('jupiter','天顶',1,'2030-09-01','2031-02-18','2031-06-30'),
 ev('saturn','太阳',2,'2031-07-01','2032-03-14','2032-08-01'),
 ev('jupiter','第二宫宫主',3,'2032-09-01','2033-01-30','2033-06-01'),
 ev('uranus','天顶',1,'2033-05-01','2034-02-11','2035-01-01'),
 ev('moon','本命土星',2,'2034-01-01','2034-06-15','2034-12-10','C'),
 ev('jupiter','天顶',1,'2035-01-10','2035-08-23','2036-03-10'),
 ev('saturn','天顶',1,'2036-04-01','2037-03-17','2037-09-10'),
 ev('jupiter','第二宫宫主',3,'2038-02-01','2038-11-21','2039-04-01'),
 ev('pluto','太阳',2,'2038-01-01','2039-07-16','2039-12-31')
];
for(const year of years){year.events=eventData.filter(e=>e.begin.slice(0,4)<=String(year.year)&&e.end.slice(0,4)>=String(year.year));year.GR=year.events.filter(e=>e.type==='GR').length;year.C=year.events.filter(e=>e.type==='C').length;year.p1=year.events.filter(e=>e.type==='GR'&&e.priority===1).length;}
const report={years},story=buildCareerStory(report),scores=story.indices;
const opportunityTrends=userTrendsForDecade(report);
const info=(txt,tag='p')=>{const x=document.createElement(tag);x.textContent=txt;return x;};
$('sample-overview').textContent=story.overview.headline+' '+story.overview.summary;
for(const y of story.keyYears){const card=document.createElement('div');card.className='sample-card';card.append(info(y.year+'年 · '+y.title,'h3'),info(y.summary));$('sample-highlight').append(card)}
for(const w of story.windows){const card=document.createElement('div');card.className='sample-card';card.append(info(w.label,'h3'),info(w.years.map(y=>y.year).join(' · ')||'本轮无突出窗口'));$('sample-windows').append(card)}
for(const p of story.phases){const box=document.createElement('div');box.className='sample-card';box.style.marginBottom='12px';box.append(info(p.headline,'h3'),info(p.summary));$('sample-phases').append(box)}
const W=900,H=240,left=40,right=30,top=20,bottom=35;
const X=i=>left+(W-left-right)*i/9,Y=v=>top+(H-top-bottom)*(100-v)/100;
const points=(key)=>scores.map((s,i)=>`${X(i)},${Y(s[key])}`).join(' ');
$('sample-svg').innerHTML=`<svg class="sample-trends" viewBox="0 0 ${W} ${H}" role="img" aria-label="完全虚构的十年双曲线指数">
 ${[25,50,75].map(v=>`<line x1="${left}" x2="${W-right}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e7dfea" stroke-dasharray="4 7"/>`).join('')}
 <polyline fill="none" stroke="#ad88b8" stroke-width="3" stroke-linecap="round" points="${points('score')}"/>
 <polyline fill="none" stroke="#b8a5d0" stroke-width="2" stroke-dasharray="6 6" points="${points('changeIntensity')}"/>
 ${scores.map((s,i)=>`<circle cx="${X(i)}" cy="${Y(s.score)}" r="5" fill="#fff" stroke="#94749f" stroke-width="2"/>`).join('')}</svg>`;
function renderSampleOpportunity(selected){const root=$('sample-user-trends');root.replaceChildren();
 for(const d of opportunityTrends){const row=document.createElement('button');row.type='button';row.className='user-opportunity-row'+(selected===d.year?' selected':'');row.setAttribute('aria-label',`${d.year}年 事业发展机会 ${d.career} 收入增长机会 ${d.income}`);
 const year=info(String(d.year),'span');year.className='opportunity-year';const bars=info('','span');bars.className='opportunity-bars';
 for(const [k,n] of [['career',d.career],['income',d.income]]){const tr=info('','span');tr.className='opportunity-track';const fill=info('','span');fill.className='opportunity-fill '+k;fill.style.width=n+'%';tr.append(fill);bars.append(tr)}
 const headline=info(story.byYear.get(d.year)?.title||'年度观察','span');headline.className='opportunity-headline';row.append(year,bars,headline);row.addEventListener('click',()=>{select(d.year);$('sample-detail').scrollIntoView({behavior:'smooth',block:'nearest'})});root.append(row)}
 const note=info('指数代表模型内的相关信号强弱，不是升职或涨薪概率。','p');note.className='opportunity-footnote';root.append(note);
}
let selected=2030;
function select(y){selected=y;renderSampleOpportunity(y);$('sample-years').replaceChildren();for(const year of years){const b=document.createElement('button');b.textContent=year.year;b.className=year.year===selected?'active':'';b.addEventListener('click',()=>select(year.year));$('sample-years').append(b)}
 const d=story.byYear.get(y),value=scores.find(s=>s.year===y);const detail=$('sample-detail');detail.replaceChildren();detail.append(info(`${y} · ${d.title}`,'h3'),info(d.summary),info(d.contrast),info(`模型指数 ${value.score} / 100 · 变化活跃度 ${value.changeIntensity} / 100`));
 if(d.months!=='—')detail.append(info(`主要时间：${d.months}`));if(d.actions.length)detail.append(info('本年准备重点：'+d.actions[0]));}
select(selected);
renderTarot($('sample-career-tarot'),null,{sample:true});
$('sample-tarot-btn').addEventListener('click',()=>{renderTarot($('sample-career-tarot'),selectTarot({birthUTC:'fictional',years}),{sample:true});$('sample-tarot-controls').hidden=true});
