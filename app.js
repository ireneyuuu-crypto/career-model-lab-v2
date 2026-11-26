import {parseChart,validateSettings,calculateMC,forecast,DEMO,CN,dateHuman} from './engine.js';
import {selectTarot} from './tarot.js';
import {renderTarot} from './tarot-ui.js';
import {interpretDecade,interpretYear} from './interpretation.js';
import {decadeProfiles,decadePhases,keyWindows,yearProfile,modelCaveat} from './outcome.js';
import {indexForDecade,INDEX_METHOD} from './career-index.js';
const $=id=>document.getElementById(id);
let chart=null,report=null,selectedYear=null;
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
 const detail=aText(`${H[e.type]} · 最小计算偏差约 ${e.minOrb.toFixed(2)}°。最接近精确的日期按逐日采样定位，不能保证为精确时刻。`,'small');d.append(detail);return d}
function renderCareerStory(){
 const root=$('narrative-summary');if(!root||!report)return;root.replaceChildren();
 const profiles=decadeProfiles(report), phases=decadePhases(profiles);
 root.append(aText('一、未来十年的职业发展主线','h3'),aText('阶段边界依据每年主导职业信号的变化自动划分，不再强制分成固定年数。以下是职业事件候选主题，不是实际升职或涨薪记录。','p'));
 for(const phase of phases){const sec=document.createElement('section');sec.className='narrative-phase';
 sec.append(aText(`${phase.range}｜${phase.title}`,'h4'),aText(phase.lead,'p'),aText(`这一阶段最值得检验：${phase.opportunity}`,'p'),aText(`主要风险：${phase.risk}`,'p'));
 const detail=document.createElement('details');detail.append(aText(`为何划入这一阶段？代表年份 ${phase.turningYear} 年 · ${phase.signal}`,'summary'));
 for(const e of phase.evidence)detail.append(aText(`${e.text}（活跃 ${e.begin} 至 ${e.end}，最接近 ${e.best}）`,'p'));
 sec.append(detail);root.append(sec);}
 const note=aText(modelCaveat(),'div');note.className='narrative-disclaimer';root.append(note);
}
function renderDecadeInsights(){
 const host=$('decade-insights');if(!host)return;host.replaceChildren();
 const profiles=decadeProfiles(report);host.append(aText('二、值得重点观察的职业窗口','h3'),aText('按信号优先级筛选不同类型的代表年份；这是观察优先级，不是职业成功率排名。','p'));
 const cards=document.createElement('div');cards.className='decade-insight-grid';
 for(const p of keyWindows(profiles)){const card=document.createElement('button');card.type='button';card.className='decade-insight-card';
 card.append(aText(`${p.year} 年｜${p.kind}`,'strong'),aText(p.headline,'span'),aText(p.evidence[0]?.text||'缺少主要相位证据','small'));
 card.addEventListener('click',()=>{selectedYear=p.year;renderTimeline();renderIndex();renderYear();$('year-detail').scrollIntoView({behavior:'smooth',block:'start'});});cards.append(card);}
 host.append(cards,aText('“薪酬/价值”只标示相关议题，不能推算涨幅。“跃迁条件”不是已确认发生的职业跃迁。','small'));
}
function renderIndex(){
 const data=report.careerIndex||indexForDecade(report),root=$('career-index-chart');root.replaceChildren();
 const W=920,H=260,l=48,r=32,t=26,b=46,innerW=W-l-r,innerH=H-t-b;
 const NS='http://www.w3.org/2000/svg';const el=(name,attrs={})=>{const x=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);return x;};
 const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'十年职业发展实验性综合指数折线图','preserveAspectRatio':'xMidYMid meet'});
 const yval=s=>t+innerH*(100-s)/100;const xval=i=>l+innerW*i/Math.max(1,data.length-1);
 for(const tick of [0,25,50,75,100]){const y=yval(tick);svg.append(el('line',{x1:l,y1:y,x2:W-r,y2:y,stroke:'#6b6788','stroke-opacity':'.26','stroke-dasharray':'3 7'}));const tx=el('text',{x:10,y:y+4,fill:'#b9b1cb','font-size':12});tx.textContent=String(tick);svg.append(tx);}
 const poly=el('polyline',{points:data.map((d,i)=>`${xval(i)},${yval(d.score)}`).join(' '),fill:'none',stroke:'#ddc4a5','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'});svg.append(poly);
 data.forEach((d,i)=>{const x=xval(i),y=yval(d.score);const g=el('g',{role:'button',tabindex:'0','aria-label':`${d.year}年，实验性指数${d.score}分，${d.label}`});
 const halo=el('circle',{cx:x,cy:y,r:13,fill:selectedYear===d.year?'#cfb18b':'transparent','fill-opacity':'.26'});const dot=el('circle',{cx:x,cy:y,r:6,fill:selectedYear===d.year?'#ffe0ad':'#ddd2e5',stroke:'#272944','stroke-width':2});
 const lab=el('text',{x,y:y-14,'text-anchor':'middle',fill:'#f6e8d8','font-size':13,'font-weight':'600'});lab.textContent=d.score;
 const yr=el('text',{x,y:H-16,'text-anchor':'middle',fill:'#d8d0e2','font-size':12});yr.textContent=d.year;
 g.append(halo,dot,lab,yr);const choose=()=>{selectedYear=d.year;renderIndex();renderTimeline();renderYear();};g.addEventListener('click',choose);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}});svg.append(g);});root.append(svg);
 const legend=$('career-index-legend');legend.replaceChildren();for(const d of data){const b=document.createElement('button');b.className='index-year-chip'+(selectedYear===d.year?' active':'');b.type='button';b.append(aText(d.year+' · '+d.label,'strong'),aText(d.score+' / 100 · 实验指数','span'));b.addEventListener('click',()=>{selectedYear=d.year;renderIndex();renderTimeline();renderYear();});legend.append(b);}
 $('career-index-method').textContent=INDEX_METHOD;
}
function renderUserOverview(){const root=$('user-overview');root.replaceChildren();const phases=report.careerPhases||decadePhases(decadeProfiles(report));const windows=keyWindows(report.outcomeProfiles||decadeProfiles(report));
 root.append(aText('十年职业发展，一眼看懂','h3'));
 const first=phases[0],last=phases.at(-1);
 root.append(aText(first&&last?`未来十年并非单一路径：从「${first.title}」到「${last.title}」，需要分辨机会、职位变化与职业重构。`:'当前数据不足以生成十年发展主线。','p'));
 const wrap=document.createElement('div');wrap.className='overview-takeaways';
 const texts=windows.slice(0,3).map(x=>`${x.year}年｜${x.headline}`);
 if(!texts.length)texts.push('尚未识别到主要职业窗口');
 for(const text of texts){const item=document.createElement('div');item.append(aText(text,'strong'));wrap.append(item)}root.append(wrap);
 root.append(aText('行动重点：查看下一关键窗口的机会类型，并核实新增职责、正式职位、价值回报与组织支持能否同步改善。该结论属于占星模型的探索性推演。','p'));
}

function renderStats(){const gr=report.events.filter(e=>e.type==='GR'),c=report.events.filter(e=>e.type==='C');const highest=Math.max(...report.years.map(y=>y.p1));const strong=report.years.filter(y=>y.p1===highest&&highest>0).map(y=>y.year);const values=[['GR',gr.length,'外部职业变化相位段'],['C',c.length,'个人行动时钟相位段'],[highest?strong.join('、'):'—',highest?'':'无明显主信号','P1 最密集年份 · 数量不等于升职概率']];$('summary-stats').replaceChildren();for(const [num,label,desc] of values){const div=document.createElement('div');div.className='stat';const v=aText(num,'div');v.className='val';div.append(v,aText(label?label+' · '+desc:desc,'p'));$('summary-stats').append(div)}}
function renderTimeline(){const max=Math.max(1,...report.years.map(y=>y.GR+y.C));$('timeline').replaceChildren();$('year-select').replaceChildren();for(const y of report.years){const b=document.createElement('button');b.type='button';b.className='year-bar'+(selectedYear===y.year?' active':'');b.setAttribute('aria-label',`${y.year}年，GR ${y.GR}，C ${y.C}`);const v=document.createElement('div');v.className='bar-vessel';const g=document.createElement('div');g.className='bar-pink';g.style.height=(y.GR/max*116)+'px';const c=document.createElement('div');c.className='bar-blue';c.style.height=(y.C/max*116)+'px';v.append(g,c);b.append(v,aText(y.year,'span'),aText(`外部 ${y.GR}段 · 行动 ${y.C}段`,'span'));b.children[1].className='year-label';b.children[2].className='year-count';b.addEventListener('click',()=>{selectedYear=y.year;renderTimeline();renderIndex();renderYear();});$('timeline').append(b);const opt=document.createElement('option');opt.value=y.year;opt.textContent=y.year+' 年';$('year-select').append(opt)}$('year-select').value=selectedYear;}
function renderYear(){
 const y=report.years.find(v=>v.year===selectedYear);$('year-title').textContent=`${selectedYear} 年 · 职业机会与关键证据`;
 const root=$('year-detail');root.replaceChildren();const p=yearProfile(y);
 const overview=document.createElement('section');overview.className='interpretation-card';
 const tag=aText('年度事件判断 · 预测候选，不代表已发生','div');tag.className='interpretation-kicker';
 overview.append(tag,aText(p.kind,'h4'),aText(p.headline,'p'),aText(p.summary,'p'));
 const grid=document.createElement('div');grid.className='interpretation-grid';
 for(const [label,val] of [['这一年的机会重点',p.opportunity],['主要风险',p.risk],['现实验证重点',p.jump]]){
 const cell=document.createElement('div');cell.append(aText(label,'strong'),aText(val,'p'));grid.append(cell)}
 overview.append(grid);
 const status=document.createElement('div');status.className='outcome-status';status.append(aText('结果维度（条件观察）','strong'));
 for(const line of [p.valueLabel,p.support,p.cost])status.append(aText(line,'p'));overview.append(status);root.append(overview);
 const lead=aText(`模型信号：GR 外部变化 ${y.GR} 段，C 个人行动 ${y.C} 段；其中 P1 主要职业点 ${y.p1} 段。这里的“段”指相位活跃时间区间，跨年可能重复显示，不能视为概率或职业成功分。`,'p');lead.className='year-lead';root.append(lead);
 const evidence=document.createElement('section');evidence.className='narrative-year';evidence.append(aText('关键证据与时间关系','h4'));
 if(p.evidence.length)for(const item of p.evidence)evidence.append(aText(`• ${item.text}。活跃期 ${item.begin}—${item.end}；最接近精确 ${item.best}。`,'p'));
 else evidence.append(aText('没有足够的主要相位证据。','p'));
 root.append(evidence);
 const detail=document.createElement('details');detail.className='raw-signals';detail.append(aText(`展开全部 ${y.events.length} 条技术相位记录`,'summary'));
 const list=document.createElement('div');list.className='signal-list';for(const e of [...y.events].sort((a,b)=>a.priority-b.priority||a.best.localeCompare(b.best)))list.append(makeEvent(e));detail.append(list);root.append(detail);
 const caveat=document.createElement('div');caveat.className='notice neutral';caveat.textContent=modelCaveat();root.append(caveat);
}
function renderGlossary(){const g=$('glossary');g.replaceChildren();for(const [short,zh,explain] of GLOSSARY){const box=document.createElement('div');box.className='term';box.append(aText(short,'strong'),aText(' '+zh,'div'),aText(explain,'p'));g.append(box)}}
function render(){const first=report.years[0].year;$('range-label').textContent=`${utcYearText(first)} · 根据天文黄经与已冻结的 Career V2.0 GR/C 规则计算`;
 message('report-notice','报告首先呈现规则性职业主题候选，并按证据动态划分阶段。GR/C 为相位活跃段数，非分数、概率。职位、价值和跃迁均需要现实证据，报告不会给出确定的涨薪比例。','caution');
 if(!selectedYear)selectedYear=first;renderUserOverview();renderIndex();renderCareerStory();renderDecadeInsights();renderStats();renderTimeline();renderYear();renderGlossary();renderPrintAll();renderTarot($('career-tarot'),report.tarot||null);$('tarot-draw-controls').hidden=Boolean(report.tarot);view('results-view');}
async function analyze(){const opts=getVal(),validation=validateSettings(opts);if(validation.errors.length){message('parse-warnings',validation.errors.join(' '),'error');return}
 $('analyze-btn').disabled=true;$('generation-scene').classList.add('active');$('calc-status').textContent='正在加载星历、计算十年的相位时间段…';
 try{const birthUTC=validation.utc;const zodiac=$('zodiac-mode').value;const natRaw=await import('./engine.js').then(x=>x.ephemerisAt(birthUTC));const mc=opts.mc===''?((calculateMC(birthUTC,Number(opts.long))-(zodiac==='lahiri'?natRaw.ayanamsa:0)+360)%360):Number(opts.mc);const cusp2=opts.cusp2===''?null:Number(opts.cusp2);report=await forecast({birthUTC,startYear:opts.startYear,mc,cusp2,natalOverrides:chart.extracted.natal,zodiac});report.interpretation=interpretDecade(report);report.outcomeProfiles=decadeProfiles(report);report.careerIndex=indexForDecade(report);report.careerPhases=decadePhases(report.outcomeProfiles);report.source={sourceLength:$('raw-chart').value.length,parsedOverrideCount:Object.keys(chart.extracted.natal).length};selectedYear=opts.startYear;render();}catch(e){$('calc-status').textContent='计算失败：'+e.message;}finally{$('analyze-btn').disabled=false;$('generation-scene').classList.remove('active');}}
function renderPrintAll(){const root=$('print-all');root.replaceChildren();root.append(aText('附录：完整十年职业主题与相位明细','h2'));root.append(aText('十年实验性指数：'+(report.careerIndex||[]).map(v=>v.year+'年 '+v.score+'/100').join('；'),'p'),aText(INDEX_METHOD,'p'));const story=decadePhases(decadeProfiles(report));for(const g of story){const sec=document.createElement('section');sec.className='print-year';sec.append(aText(g.range+'｜'+g.title,'h3'),aText(g.lead+' 机会重点：'+g.opportunity+' 主要风险：'+g.risk,'p'));root.append(sec);}for(const year of report.years){const sec=document.createElement('section');sec.className='print-year';sec.append(aText(year.year+' 年 · GR '+year.GR+' 段 / C '+year.C+' 段','h3'));const info=yearProfile(year);sec.append(aText('候选类型：'+info.kind+'。'+info.summary+' 机会重点：'+info.opportunity+' 主要风险：'+info.risk,'p'));sec.append(aText(info.valueLabel+'；'+info.jump+'；'+info.support,'p'));if(!year.events.length)sec.append(aText('本年未检出规则命中相位段。','p'));for(const e of year.events)sec.append(makeEvent(e));root.append(sec)}}
function saveJson(){if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`career-model-lab-${report.years[0].year}-${report.years.at(-1).year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('tarot-draw-btn').addEventListener('click',()=>{if(!report||report.tarot)return;report.tarot=selectTarot(report);renderTarot($('career-tarot'),report.tarot);$('tarot-draw-controls').hidden=true;});
$('demo-btn').addEventListener('click',()=>{$('raw-chart').value=DEMO});$('parse-btn').addEventListener('click',parseAction);$('back-btn').addEventListener('click',()=>view('import-view'));$('analyze-btn').addEventListener('click',analyze);$('restart-btn').addEventListener('click',()=>{selectedYear=null;report=null;view('import-view')});$('year-select').addEventListener('change',e=>{selectedYear=+e.target.value;renderTimeline();renderYear()});$('print-btn').addEventListener('click',()=>window.print());$('print-bottom-btn').addEventListener('click',()=>window.print());$('json-btn').addEventListener('click',saveJson);
