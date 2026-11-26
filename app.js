import {parseChart,validateSettings,calculateMC,forecast,DEMO,CN,dateHuman} from './engine.js';
import {selectTarot} from './tarot.js';
import {renderTarot} from './tarot-ui.js';
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
function renderStats(){const gr=report.events.filter(e=>e.type==='GR'),c=report.events.filter(e=>e.type==='C');const highest=Math.max(...report.years.map(y=>y.p1));const strong=report.years.filter(y=>y.p1===highest&&highest>0).map(y=>y.year);const values=[['GR',gr.length,'外部职业变化相位段'],['C',c.length,'个人行动时钟相位段'],[highest?strong.join('、'):'—',highest?'':'无明显主信号','P1 信号最密集年份（数量比较）']];$('summary-stats').replaceChildren();for(const [num,label,desc] of values){const div=document.createElement('div');div.className='stat';const v=aText(num,'div');v.className='val';div.append(v,aText(label?label+' · '+desc:desc,'p'));$('summary-stats').append(div)}}
function renderTimeline(){const max=Math.max(1,...report.years.map(y=>y.GR+y.C));$('timeline').replaceChildren();$('year-select').replaceChildren();for(const y of report.years){const b=document.createElement('button');b.type='button';b.className='year-bar'+(selectedYear===y.year?' active':'');b.setAttribute('aria-label',`${y.year}年，GR ${y.GR}，C ${y.C}`);const v=document.createElement('div');v.className='bar-vessel';const g=document.createElement('div');g.className='bar-pink';g.style.height=(y.GR/max*116)+'px';const c=document.createElement('div');c.className='bar-blue';c.style.height=(y.C/max*116)+'px';v.append(g,c);b.append(v,aText(y.year,'span'),aText(`${y.GR} / ${y.C}`,'span'));b.children[1].className='year-label';b.children[2].className='year-count';b.addEventListener('click',()=>{selectedYear=y.year;renderTimeline();renderYear();});$('timeline').append(b);const opt=document.createElement('option');opt.value=y.year;opt.textContent=y.year+' 年';$('year-select').append(opt)}$('year-select').value=selectedYear;}
function renderYear(){const y=report.years.find(v=>v.year===selectedYear);$('year-title').textContent=`${selectedYear} 年 · 详细信号`;
 const root=$('year-detail');root.replaceChildren();const lead=aText(`本年 GR：${y.GR} 段，C：${y.C} 段。${strengthText(y.GR+y.C)}。P1（天顶/十宫主）外部信号 ${y.p1} 段。此结果只代表天象规则命中，不等于该年一定跳槽或晋升。`,'p');lead.className='year-lead';root.append(lead);
 if(!y.events.length){root.append(aText('这一年未找到符合规则的相位。模型没有证据判断这一年会发生什么职业事件。','p'));return}
 const list=document.createElement('div');list.className='signal-list';for(const e of y.events.sort((a,b)=>a.priority-b.priority||a.best.localeCompare(b.best)))list.append(makeEvent(e));root.append(list);
 const tip=document.createElement('div');tip.className='notice neutral';tip.style.marginTop='18px';tip.textContent='现实观察建议：记录这一时期是否真正出现机会（O）、职责扩张（E）、正式职级（P）、价值回报（V），以及组织支持（S）、稳定性（ST）和代价（Cost）。只有现实证据齐全时才能认定职业跃迁（J）或重构（R）。';root.append(tip);
}
function renderGlossary(){const g=$('glossary');g.replaceChildren();for(const [short,zh,explain] of GLOSSARY){const box=document.createElement('div');box.className='term';box.append(aText(short,'strong'),aText(' '+zh,'div'),aText(explain,'p'));g.append(box)}}
function render(){const first=report.years[0].year;$('range-label').textContent=`${utcYearText(first)} · 根据天文黄经与已冻结的 Career V2.0 GR/C 规则计算`;
 message('report-notice','本报告已经计算了真实天象相位，但没有把它们直接转译为升职、加薪或 Career Jump 概率。年度相位段数量不是预测成功率。第二宫宫头缺失时会略去对应目标点；预测事件类别仍需补充经过验证的独立映射规则。','caution');
 renderStats();if(!selectedYear)selectedYear=first;renderTimeline();renderYear();renderGlossary();renderPrintAll();renderTarot($('career-tarot'),report.tarot||null);$('tarot-draw-controls').hidden=Boolean(report.tarot);view('results-view');}
async function analyze(){const opts=getVal(),validation=validateSettings(opts);if(validation.errors.length){message('parse-warnings',validation.errors.join(' '),'error');return}
 $('analyze-btn').disabled=true;$('generation-scene').classList.add('active');$('calc-status').textContent='正在加载星历、计算十年的相位时间段…';
 try{const birthUTC=validation.utc;const zodiac=$('zodiac-mode').value;const natRaw=await import('./engine.js').then(x=>x.ephemerisAt(birthUTC));const mc=opts.mc===''?((calculateMC(birthUTC,Number(opts.long))-(zodiac==='lahiri'?natRaw.ayanamsa:0)+360)%360):Number(opts.mc);const cusp2=opts.cusp2===''?null:Number(opts.cusp2);report=await forecast({birthUTC,startYear:opts.startYear,mc,cusp2,natalOverrides:chart.extracted.natal,zodiac});report.source={sourceLength:$('raw-chart').value.length,parsedOverrideCount:Object.keys(chart.extracted.natal).length};selectedYear=opts.startYear;render();}catch(e){$('calc-status').textContent='计算失败：'+e.message;}finally{$('analyze-btn').disabled=false;$('generation-scene').classList.remove('active');}}
function renderPrintAll(){const root=$('print-all');root.replaceChildren();root.append(aText('附录：完整十年相位明细','h2'));for(const year of report.years){const sec=document.createElement('section');sec.className='print-year';sec.append(aText(year.year+' 年 · GR '+year.GR+' 段 / C '+year.C+' 段','h3'));if(!year.events.length)sec.append(aText('本年未检出规则命中相位段。','p'));for(const e of year.events)sec.append(makeEvent(e));root.append(sec)}}
function saveJson(){if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`career-model-lab-${report.years[0].year}-${report.years.at(-1).year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('tarot-draw-btn').addEventListener('click',()=>{if(!report||report.tarot)return;report.tarot=selectTarot(report);renderTarot($('career-tarot'),report.tarot);$('tarot-draw-controls').hidden=true;});
$('demo-btn').addEventListener('click',()=>{$('raw-chart').value=DEMO});$('parse-btn').addEventListener('click',parseAction);$('back-btn').addEventListener('click',()=>view('import-view'));$('analyze-btn').addEventListener('click',analyze);$('restart-btn').addEventListener('click',()=>{selectedYear=null;report=null;view('import-view')});$('year-select').addEventListener('change',e=>{selectedYear=+e.target.value;renderTimeline();renderYear()});$('print-btn').addEventListener('click',()=>window.print());$('print-bottom-btn').addEventListener('click',()=>window.print());$('json-btn').addEventListener('click',saveJson);
