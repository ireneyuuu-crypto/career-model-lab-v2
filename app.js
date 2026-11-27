import {verifyCareerEvent,MODEL_RULES,classifyActivation,CANONICAL_VERSION} from './career-v2-canonical.js';
import {parseChart,validateSettings,calculateMC,forecast,DEMO,CN,dateHuman} from './engine.js';
import {selectTarot} from './tarot.js';
import {renderTarot} from './tarot-ui.js';
import {interpretDecade,interpretYear} from './interpretation.js';
import {decadeProfiles,decadePhases,keyWindows,yearProfile,forecastWindowSummary,modelCaveat} from './outcome.js';
import {indexForDecade,INDEX_METHOD,CDI_WEIGHTS,userTrendsForDecade} from './career-index.js';
import {detailedYear} from './year-details.js';
import {buildCareerStory} from './career-story.js';
const $=id=>document.getElementById(id);
let chart=null,report=null,selectedYear=null;
let careerStory=null;
const H={GR:'外部职业变化信号',C:'个人行动时钟'};
const GLOSSARY=[
 ['GR · Growth / Restructuring','外部职业变化信号','木星、土星、天王星、海王星、冥王星与职业相关的本命点形成合、刑、冲相位。它提示值得关注的变化时期，但不保证升职。'],
 ['C · Career Action Clock','个人职业行动时钟','次限太阳、月亮、水星、金星、火星与职业相关的本命点发生指定相位。用于补充行动节奏，缺少 C 不意味着无法晋升。'],
 ['MC · Midheaven','天顶 / 事业方向参照点','出生星盘中的重要角点。模型将它作为第一优先级职业触发点。'],
 ['Orb · 容许度','距离精确相位的角度差','GR 最多3°，C 最多2°；越接近0°表示几何相位越精确，不代表现实发生概率越高。'],
 ['O · Opportunity','机会','可能出现求职、项目或新职责的机会；仅凭占星信号不能确认现实机会已经出现。'],
 ['E · Expansion','职责扩大','工作范围、影响力或管理权限扩大；工作量变多不自动等于职责扩张。'],
 ['P · Position','职位提升','正式职级、头衔或组织位置改善。'],
 ['V · Value','价值回报','薪酬、市场价值或资源回报改善。'],
 ['S · Support','组织支持','有没有足够的团队、预算、授权和资源支持。'],
 ['ST · Stability','持续稳定性','职业变化之后3至6个月能否持续稳定。'],
 ['Cost · 代价','职业变化付出的成本','包括高压力、时间、健康及其他实际代价。'],
 ['J · Career Jump','实质性职业跃迁','必须有E/P/V中至少两个维度实质改善，且S和ST没有明显失败，才可依据实际证据确认。'],
 ['R · Repositioning','职业重新定位','换方向、重新定位或结构性转变，不自动意味着成功或失败。'],
 ['P1 / P2 / P3','信号关注优先级','P1为天顶和十宫主，P2为太阳和土星，P3为第二宫宫头和宫主；不是预测成功率。']
];
function view(id){for(const v of document.querySelectorAll('.view'))v.classList.toggle('active',v.id===id);for(const [i,t] of ['step1-label','step2-label','step3-label'].entries())$(t).classList.toggle('active',(id==='import-view'?0:id==='validation-view'?1:2)===i);document.querySelector('.app-shell').scrollIntoView({behavior:'smooth',block:'start'});}
function message(id,msg,kind='neutral'){$(id).className='notice '+kind;$(id).textContent=msg;}
function getVal(){return {date:$('birth-date').value,time:$('birth-time').value,tz:$('birth-tz').value,long:$('birth-long').value,mc:$('birth-mc').value,cusp2:$('birth-cusp2').value,startYear:Number($('start-year').value)}}
function parseAction(){const raw=$('raw-chart').value.trim();if(!raw){message('parse-warnings','请先粘贴星盘数据，或点击「填入示范数据」。','error');return;}chart=parseChart(raw);$('analyze-btn').disabled=false;message('parse-warnings',[...chart.errors,...chart.warnings].join(' ')||'星盘资料已初步识别，请核实所有字段。','neutral');view('validation-view');
 const x=chart.extracted;$('birth-date').value=x.date||'';$('birth-time').value=x.time||'';$('birth-tz').value=x.tz||'+08:00';$('birth-long').value=Number.isFinite(x.long)?x.long:'';$('birth-mc').value=x.mc??'';$('birth-cusp2').value=x.cusp2??'';$('zodiac-mode').value=x.zodiac||'tropical';
}
function aText(text,element='span'){const e=document.createElement(element);e.textContent=text;return e}
function utcYearText(year){return `${year}–${year+9}`}
function strengthText(n){return n===0?'未检出符合当前规则的相位时间段':`记录到 ${n} 个相位时间段（同一个相位跨年会分别计入对应年份）`}
function makeEvent(e){const d=document.createElement('article');d.className='signal-card';const top=document.createElement('div');top.className='signal-top';const name=aText(`${CN[e.mover]} ${e.label} ${e.target}`,'div');name.className='signal-name';const badge=aText(e.type+' · P'+e.priority,'span');badge.className='pill '+(e.type==='C'?'blue':'');top.append(name,badge);d.append(top);
 const date=aText(`时间段：${dateHuman(e.begin)} – ${dateHuman(e.end)}  ·  最接近精确相位：${dateHuman(e.best)}`,'p');d.append(date);
 const detail=aText(`${H[e.type]} · 最小插值偏差约 ${e.minOrb.toFixed(3)}°。${e.peakUTC?'插值峰值（UTC）：'+e.peakUTC.slice(0,16).replace('T',' ')+'；':''}${e.entryUTC?'进入容许度：'+e.entryUTC.slice(0,16)+'；':''}${e.exitUTC?'离开容许度：'+e.exitUTC.slice(0,16)+'。':''}时间来自逐日星历插值，尚非独立天文精度验证。`,'small');d.append(detail);return d}
function renderCareerStory(){
 const root=$('narrative-summary');if(!root||!report)return;root.replaceChildren();
 root.append(aText('职业发展阶段：每一段有什么不同','h3'));
 for(const phase of careerStory.phases){const sec=document.createElement('section');sec.className='narrative-phase';
 sec.append(aText(phase.headline,'h4'),aText(phase.summary,'p'));
 const yearlist=document.createElement('div');yearlist.className='phase-yearlist';
 for(const y of phase.years){const d=careerStory.byYear.get(y),b=document.createElement('button');b.type='button';b.className='phase-yearitem';
 b.append(aText(`${y}｜${d.title}`,'strong'),aText(d.contrast,'span'));
 b.addEventListener('click',()=>selectStoryYear(y,true));yearlist.append(b)}sec.append(yearlist);root.append(sec);
 }
}
function renderDecadeInsights(){
 const host=$('decade-insights');if(!host)return;host.replaceChildren();host.append(aText('三个代表性职业窗口','h3'));
 const cards=document.createElement('div');cards.className='decade-insight-grid';
 for(const d of careerStory.keyYears){const card=document.createElement('button');card.type='button';card.className='decade-insight-card';
 card.append(aText(`${d.year}｜${d.title}`,'strong'),aText(d.summary,'span'),aText(`时间重点：${d.months}`,'small'));
 card.addEventListener('click',()=>selectStoryYear(d.year,true));cards.append(card)}host.append(cards);
}
function selectStoryYear(y,scroll=false){selectedYear=y;renderOpportunityTrends();renderOpportunityTrends();renderIndex();renderTimeline();renderYear();if(scroll)$('year-detail').scrollIntoView({behavior:'smooth',block:'start'});}
function renderForecastFocus(){
 const root=$('forecast-focus');if(!root||!report)return;root.replaceChildren();root.append(aText('未来十年最值得关注的年份','h3'));
 const grid=document.createElement('div');grid.className='forecast-focus-grid';
 for(const w of careerStory.windows){const card=document.createElement('section');card.className='forecast-focus-card';card.append(aText(w.label,'h4'));
 const chosen=w.years.filter(y=>y.peak);const years=chosen.length?chosen:w.years;
 const line=years.length?years.map(y=>y.year).join(' · '):'本轮未出现独立集中窗口';const value=aText(line,'div');value.className='forecast-focus-years';card.append(value);
 if(years.length){const buttons=document.createElement('div');buttons.className='forecast-year-links';for(const v of years){const b=document.createElement('button');b.type='button';b.textContent='查看'+v.year; b.addEventListener('click',()=>selectStoryYear(v.year,true));buttons.append(b)}card.append(buttons)}grid.append(card);
 }root.append(grid);
}
function renderOpportunityTrends(){
 const root=$('user-opportunity-trends');if(!root||!report)return;
 root.replaceChildren();const data=userTrendsForDecade(report);
 const chart=document.createElement('div');chart.className='user-opportunity-list';
 for(const d of data){
  const story=careerStory?.byYear.get(d.year);
  const button=document.createElement('button');button.type='button';button.className='user-opportunity-row'+(d.year===selectedYear?' selected':'');
  button.setAttribute('aria-label',`${d.year}年，事业发展机会指数${d.career}，收入增长机会指数${d.income}，${story?.title||''}。点击查看年度详情`);
  const year=aText(String(d.year),'span');year.className='opportunity-year';
  const bars=document.createElement('span');bars.className='opportunity-bars';
  for(const [name,val] of [['career',d.career],['income',d.income]]){
   const track=document.createElement('span');track.className='opportunity-track';track.setAttribute('aria-hidden','true');
   const fill=document.createElement('span');fill.className='opportunity-fill '+name;fill.style.width=val+'%';track.append(fill);bars.append(track);
  }
  const headline=aText(story?.title||'年度发展观察','span');headline.className='opportunity-headline';
  button.append(year,bars,headline);button.addEventListener('click',()=>selectStoryYear(d.year,true));chart.append(button);
 }
 root.append(chart);
 const foot=document.createElement('p');foot.className='opportunity-footnote';foot.textContent='长条表示模型识别的年度相关信号强弱，不是升职或涨薪的概率；收入仅涵盖薪酬、资源与市场价值等职业回报。';root.append(foot);
 const current=data.find(x=>x.year===selectedYear);
 if(current){const summary=document.createElement('div');summary.className='opportunity-year-summary';
  const heading=aText(`${current.year}｜${careerStory?.byYear.get(current.year)?.title||'年度重点'}`,'strong');
  summary.append(heading,aText(`事业发展机会 ${current.career}/100 · 收入增长机会 ${current.income}/100`,'p'));
  root.append(summary);
 }
}
function renderIndex(){
 const data=report.careerIndex||indexForDecade(report),root=$('career-index-chart');root.replaceChildren();
 const W=920,H=260,l=48,r=32,t=26,b=46,innerW=W-l-r,innerH=H-t-b;
 const NS='http://www.w3.org/2000/svg';const el=(name,attrs={})=>{const x=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);return x;};
 const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'十年发展相关信号指数与职业变化活跃度折线图','preserveAspectRatio':'xMidYMid meet'});
 const yval=s=>t+innerH*(100-s)/100;const xval=i=>l+innerW*i/Math.max(1,data.length-1);
 for(const tick of [0,25,50,75,100]){const y=yval(tick);svg.append(el('line',{x1:l,y1:y,x2:W-r,y2:y,stroke:'#6b6788','stroke-opacity':'.26','stroke-dasharray':'3 7'}));const tx=el('text',{x:10,y:y+4,fill:'#b9b1cb','font-size':12});tx.textContent=String(tick);svg.append(tx);}
 const poly=el('polyline',{points:data.map((d,i)=>`${xval(i)},${yval(d.score)}`).join(' '),fill:'none',stroke:'#ddc4a5','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'});svg.append(poly);
 // Career change activity is a separate descriptive proxy, never the inverse of growth.
 const change=el('polyline',{points:data.map((d,i)=>`${xval(i)},${yval(d.changeIntensity??0)}`).join(' '),fill:'none',stroke:'#a7a6c9','stroke-width':2,'stroke-dasharray':'5 7','stroke-opacity':'.85'});
 svg.append(change);
 data.forEach((d,i)=>{const x=xval(i),y=yval(d.score);const g=el('g',{role:'button',tabindex:'0','aria-label':`${d.year}年，实验性指数${d.score}分，${d.label}`});
 const halo=el('circle',{cx:x,cy:y,r:13,fill:selectedYear===d.year?'#cfb18b':'transparent','fill-opacity':'.26'});const dot=el('circle',{cx:x,cy:y,r:6,fill:selectedYear===d.year?'#ffe0ad':'#ddd2e5',stroke:'#272944','stroke-width':2});
 const lab=el('text',{x,y:y-14,'text-anchor':'middle',fill:'#f6e8d8','font-size':13,'font-weight':'600'});lab.textContent=d.score;
 const yr=el('text',{x,y:H-16,'text-anchor':'middle',fill:'#d8d0e2','font-size':12});yr.textContent=d.year;
 g.append(halo,dot,lab,yr);const choose=()=>{selectedYear=d.year;renderOpportunityTrends();renderIndex();renderTimeline();renderYear();};g.addEventListener('click',choose);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}});svg.append(g);});root.append(svg);
 const legend=$('career-index-legend');legend.replaceChildren();for(const d of data){const b=document.createElement('button');b.className='index-year-chip'+(selectedYear===d.year?' active':'');b.type='button';b.append(aText(d.year+' · '+d.label,'strong'),aText('发展信号 '+d.score+' / 100 · 变化活跃度 '+(d.changeIntensity??0)+' / 100','span'));b.addEventListener('click',()=>{selectedYear=d.year;renderOpportunityTrends();renderIndex();renderTimeline();renderYear();});legend.append(b);}
 $('career-index-method').textContent=INDEX_METHOD;
 const selected=data.find(d=>d.year===selectedYear);if(selected){
  const d=careerStory?.byYear.get(selected.year);const box=document.createElement('div');box.className='index-focused-summary';
  box.append(aText(`${selected.year}年｜${d?.title||selected.label}`,'strong'),aText(`发展指数 ${selected.score} / 100 · 变化活跃度 ${selected.changeIntensity} / 100`,'p'));
  const detail=document.createElement('details');detail.append(aText('查看这年评分明细','summary'));
  detail.append(aText(`机会 ${selected.components.opportunity}×15% · 职责 ${selected.components.expansion}×25% · 职位 ${selected.components.position}×25% · 价值 ${selected.components.value}×35%。总分 ${selected.rawScore.toFixed(2)}。该指数是模型信号的对比指标，并非职业成功概率。`,'p'));box.append(detail);root.append(box);
 }
}
function renderUserOverview(){const root=$('user-overview');root.replaceChildren();
 root.append(aText('你的十年职业发展主线','h3'));
 const overview=careerStory.overview;root.append(aText(overview.headline,'h4'),aText(overview.summary,'p'));
 const list=document.createElement('div');list.className='overview-takeaways';
 const highlighted=careerStory.keyYears||[];
 for(const d of highlighted){const button=document.createElement('button');button.type='button';button.className='overview-year-link';button.append(aText(`${d.year}｜${d.title}`,'strong'),aText(d.months==='—'?'':'关键时间：'+d.months,'span'));button.addEventListener('click',()=>selectStoryYear(d.year,true));list.append(button)}root.append(list);
}
function renderStats(){const gr=report.events.filter(e=>e.type==='GR'),c=report.events.filter(e=>e.type==='C');const highest=Math.max(...report.years.map(y=>y.p1));const strong=report.years.filter(y=>y.p1===highest&&highest>0).map(y=>y.year);const values=[['GR',gr.length,'外部职业变化相位段'],['C',c.length,'个人行动时钟相位段'],[highest?strong.join('、'):'—',highest?'':'无明显主信号','P1 最密集年份 · 数量不等于升职概率']];$('summary-stats').replaceChildren();for(const [num,label,desc] of values){const div=document.createElement('div');div.className='stat';const v=aText(num,'div');v.className='val';div.append(v,aText(label?label+' · '+desc:desc,'p'));$('summary-stats').append(div)}}
function renderTimeline(){const max=Math.max(1,...report.years.map(y=>y.GR+y.C));$('timeline').replaceChildren();$('year-select').replaceChildren();for(const y of report.years){const b=document.createElement('button');b.type='button';b.className='year-bar'+(selectedYear===y.year?' active':'');b.setAttribute('aria-label',`${y.year}年，GR ${y.GR}，C ${y.C}`);const v=document.createElement('div');v.className='bar-vessel';const g=document.createElement('div');g.className='bar-pink';g.style.height=(y.GR/max*116)+'px';const c=document.createElement('div');c.className='bar-blue';c.style.height=(y.C/max*116)+'px';v.append(g,c);b.append(v,aText(y.year,'span'),aText(`外部 ${y.GR}段 · 行动 ${y.C}段`,'span'));b.children[1].className='year-label';b.children[2].className='year-count';b.addEventListener('click',()=>{selectedYear=y.year;renderTimeline();renderOpportunityTrends();renderIndex();renderYear();});$('timeline').append(b);const opt=document.createElement('option');opt.value=y.year;opt.textContent=y.year+' 年';$('year-select').append(opt)}$('year-select').value=selectedYear;}
function renderYear(){
 const y=report.years.find(v=>v.year===selectedYear);if(!y)return;
 const d=careerStory.byYear.get(y.year);if(!d)return;
 $('year-title').textContent=`${selectedYear}｜${d.title}`;const root=$('year-detail');root.replaceChildren();
 const overview=document.createElement('section');overview.className='interpretation-card rich-year';
 const kicker=aText(`${d.role}${d.months==='—'?'':' · '+d.months}`,'div');kicker.className='interpretation-kicker';
 overview.append(kicker,aText(d.title,'h4'),aText(d.summary,'p'));
 const contrast=aText(d.contrast,'p');contrast.className='year-contrast';overview.append(contrast);
 if(d.actions.length){const block=document.createElement('div');block.className='story-actions';block.append(aText('这一年可以做什么','h5'));for(const action of d.actions)block.append(aText(action,'p'));overview.append(block)}
 root.append(overview);
 if(d.evidence.length){const focus=document.createElement('details');focus.className='narrative-year story-evidence';
 focus.append(aText('展开：关键时间与判断依据','summary'));
 for(const f of d.evidence){const item=document.createElement('div');item.className='year-trigger';item.append(aText(`${f.month||'跨年'} · ${f.stage} · ${f.type==='value'?'价值':f.type==='position'?'职位':f.type==='opportunity'?'机会':f.type==='restructure'?'方向调整':'个人行动'}`,'strong'),aText(`活跃 ${f.begin}—${f.end}；最接近 ${f.best}`,'small'));focus.append(item)}root.append(focus);}
 const detail=document.createElement('details');detail.className='raw-signals';detail.append(aText('专业模式：查看全部原始相位','summary'));
 const list=document.createElement('div');list.className='signal-list';for(const e of [...y.events].sort((a,b)=>a.priority-b.priority||(a.best||'').localeCompare(b.best||'')))list.append(makeEvent(e));detail.append(list);root.append(detail);
}
function renderGlossary(){const g=$('glossary');g.replaceChildren();for(const [short,zh,explain] of GLOSSARY){const box=document.createElement('div');box.className='term';box.append(aText(short,'strong'),aText(' '+zh,'div'),aText(explain,'p'));g.append(box)}}
function render(){const first=report.years[0].year;$('range-label').textContent=`${utcYearText(first)} · 根据天文黄经与已冻结的 Career V2.0 GR/C 规则计算`;
 message('report-notice','本报告展示占星模型识别的职业主题与时间窗口，供职业规划参考；综合指数不是实际升职或收入概率。','neutral');
 careerStory=buildCareerStory(report);report.careerIndex=careerStory.indices;if(!selectedYear)selectedYear=first;renderUserOverview();renderOpportunityTrends();renderIndex();renderForecastFocus();renderCareerStory();renderDecadeInsights();renderStats();renderTimeline();renderYear();renderGlossary();renderPrintAll();renderTarot($('career-tarot'),report.tarot||null);$('tarot-draw-controls').hidden=Boolean(report.tarot);view('results-view');}
async function analyze(){const opts=getVal(),validation=validateSettings(opts);if(validation.errors.length){message('parse-warnings',validation.errors.join(' '),'error');return}
 $('analyze-btn').disabled=true;$('generation-scene').classList.add('active');$('calc-status').textContent='正在加载星历、计算十年的相位时间段…';
 try{const birthUTC=validation.utc;const zodiac=$('zodiac-mode').value;const natRaw=await import('./engine.js').then(x=>x.ephemerisAt(birthUTC));const mc=opts.mc===''?((calculateMC(birthUTC,Number(opts.long))-(zodiac==='lahiri'?natRaw.ayanamsa:0)+360)%360):Number(opts.mc);const cusp2=opts.cusp2===''?null:Number(opts.cusp2);report=await forecast({birthUTC,startYear:opts.startYear,mc,cusp2,natalOverrides:chart.extracted.natal,zodiac});report.interpretation=interpretDecade(report);report.outcomeProfiles=decadeProfiles(report);report.careerIndex=indexForDecade(report);report.careerPhases=decadePhases(report.outcomeProfiles);report.source={sourceLength:$('raw-chart').value.length,parsedOverrideCount:Object.keys(chart.extracted.natal).length};selectedYear=opts.startYear;render();}catch(e){$('calc-status').textContent='计算失败：'+e.message;}finally{$('analyze-btn').disabled=false;$('generation-scene').classList.remove('active');}}
function renderPrintAll(){const root=$('print-all');root.replaceChildren();root.append(aText('附录：完整十年职业主题与相位明细','h2'));if(lastVerification)root.append(aText('已发生职业事件的独立核验：'+JSON.stringify(lastVerification),'p'));root.append(aText('十年实验性指数：'+(report.careerIndex||[]).map(v=>v.year+'年 '+v.score+'/100').join('；'),'p'),aText(INDEX_METHOD,'p'));const story=careerStory?.phases||[];for(const g of story){const sec=document.createElement('section');sec.className='print-year';sec.append(aText(g.range+'｜'+g.title,'h3'),aText(g.summary,'p'));root.append(sec);}for(const year of report.years){const sec=document.createElement('section');sec.className='print-year';sec.append(aText(year.year+' 年 · GR '+year.GR+' 段 / C '+year.C+' 段','h3'));const d=careerStory.byYear.get(year.year);sec.append(aText(d.title+'。'+d.summary+' '+d.contrast+' '+d.actions.join(' '),'p'));if(!year.events.length)sec.append(aText('本年未检出规则命中相位段。','p'));for(const e of year.events)sec.append(makeEvent(e));root.append(sec)}}
function saveJson(){if(!report)return;const blob=new Blob([JSON.stringify({...report,careerStory:{phases:careerStory.phases,windows:careerStory.windows,years:careerStory.years,keyYears:careerStory.keyYears}},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`career-model-lab-${report.years[0].year}-${report.years.at(-1).year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
const EVENT_FIELDS=[
 ['O','确实出现新的职业机会'],['E','实际职责、权限或影响力明显扩大（不只是工作量）'],
 ['P','正式职位、职级或组织位置提高'],['V','薪酬、资源或市场价值明显提高'],
 ['S','组织提供了足够支持和资源'],['ST','变化后3–6个月持续稳定'],
 ['R','这次变化属于主动的职业方向或结构重定位']
];
let lastVerification=null;
function setupCareerVerification(){
 const root=$('event-review-inputs');if(!root)return;
 for(const [key,label] of EVENT_FIELDS){
   const row=document.createElement('label');row.className='event-review-field';row.append(aText(label,'span'));
   const select=document.createElement('select');select.id='review-'+key;
   for(const [value,text] of (['S','ST'].includes(key)?[['unknown','尚未核实'],['yes','支持良好 / 稳定'],['neutral','中性 / 未明显失败'],['no','明显失败']]:[['unknown','尚未核实'],['yes','是'],['no','否']])){
     const opt=document.createElement('option');opt.value=value;opt.textContent=text;select.append(opt);
   }
   row.append(select);root.append(row);
 }
 $('review-run').addEventListener('click',()=>{
   const f={Cost:$('review-cost').value};for(const [key] of EVENT_FIELDS){const v=$('review-'+key).value;f[key]=v==='yes'?true:v==='no'?false:v==='neutral'?'neutral':null;}
   const r=verifyCareerEvent(f);lastVerification=r;if(report)report.observedEventVerification=r;
   const terms={J:'已核实的实质职业跃迁',R:'职业重构／重新定位',P:'正式职位变化',E:'职责或影响力扩张',O:'出现新的机会','0':'未记录上述类型的变化',undetermined:'现实信息尚不足以分类'};
   $('event-review-result').textContent=(r.unstableJump?'核验结果：多维上升但不稳定（Unstable J）':'核验结果：'+terms[r.type])+'。'+r.explanation+(r.tags.length?' 备注：'+r.tags.join('；')+'。':'')+(r.pending.length?' 待补证据：'+r.pending.join('；')+'。':'');
   if(report)renderPrintAll();
 });
}
setupCareerVerification();
$('tarot-draw-btn').addEventListener('click',()=>{if(!report||report.tarot)return;report.tarot=selectTarot(report);renderTarot($('career-tarot'),report.tarot);$('tarot-draw-controls').hidden=true;});
$('demo-btn').addEventListener('click',()=>{$('raw-chart').value=DEMO});$('parse-btn').addEventListener('click',parseAction);$('back-btn').addEventListener('click',()=>view('import-view'));$('analyze-btn').addEventListener('click',analyze);$('restart-btn').addEventListener('click',()=>{selectedYear=null;report=null;view('import-view')});$('year-select').addEventListener('change',e=>{selectedYear=+e.target.value;renderTimeline();renderOpportunityTrends();renderYear()});$('print-btn').addEventListener('click',()=>window.print());$('print-bottom-btn').addEventListener('click',()=>window.print());$('json-btn').addEventListener('click',saveJson);
