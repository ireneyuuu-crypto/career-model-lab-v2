// Narrative presentation only. No alteration to GR/C, CDI weights, or canonical J/R classification.
import {yearProfile} from './outcome.js';
const movers={jupiter:'机会和外部资源',saturn:'正式责任与组织规则',uranus:'路径突破与非惯常变化',neptune:'方向与边界厘清',pluto:'组织权责深层调整',sun:'身份目标',moon:'个人节奏',mercury:'规划沟通',venus:'合作与价值表达',mars:'主动推进'};
const target=e=>e.priority===1?'职位与职业方向核心':e.priority===2?'职业身份和权责':(e.target||'').includes('第二宫')?'薪酬、资源与职业价值':'职业辅助目标';
const date=s=>s?`${Number(s.slice(5,7))}月`:'';
const yearOf=s=>Number((s||'').slice(0,4));
function rank(e,y){return (e.type==='GR'?5:1)+(e.priority===1?7:e.priority===2?3:2)+(yearOf(e.best)===y?5:0)+(e.minOrb<=0.5?2:0);}
function cycle(e,y){const first=yearOf(e.begin),peak=yearOf(e.best),end=yearOf(e.end);if(peak===y)return `本年${date(e.best)}接近精确峰值`;
 if(first===y&&peak>y)return `本年开始活跃，预计${peak}年接近峰值`;
 if(first<y&&peak>y)return `承接前期信号，预计${peak}年接近峰值`;
 if(peak<y&&end>=y)return `${peak}年峰值后的延续期`;
 return '本年持续活跃';}
const actionBy={growth:'跟进实质机会：记录项目入口、负责人、可获得的资源，并区分曝光和正式职责',structure:'在接手新责任前核对正式职级、授权、考核边界和可兑现的回报',restructure:'准备可比较的备选职业路径；判断方向调整是否改善长期职业资本',value:'准备薪酬和资源谈判证据，同时核实固定薪资、奖金、预算或外部报价的实际变化',prepare:'梳理已有成果与外部选择，不将暂时缺少强信号理解成职业停滞'};
function ingredients(events){const gr=events.filter(e=>e.type==='GR');return {value:gr.some(e=>(e.target||'').includes('第二宫')),position:gr.some(e=>e.priority===1&&e.mover==='saturn'),opening:gr.some(e=>e.priority===1&&e.mover==='jupiter'),restructure:gr.some(e=>e.priority===1&&['uranus','neptune','pluto'].includes(e.mover)),c:events.some(e=>e.type==='C')};}
export function detailedYear(year,previous=null,next=null){
 const p=yearProfile(year),ev=year.events||[],sorted=[...ev].sort((a,b)=>rank(b,year.year)-rank(a,year.year)||(a.best||'').localeCompare(b.best||''));
 const featured=sorted.filter(e=>e.type==='GR'&&e.priority===1);const principal=(featured.length?featured:sorted).slice(0,2);
 const facts=ingredients(ev),before=previous?ingredients(previous.events||[]):null,after=next?ingredients(next.events||[]):null;
 let difference=previous?'延续上一年的主要观察方向。':'这是本次十年分析的起始年份。';
 if(previous){const gained=Object.keys(facts).filter(k=>facts[k]&&!before[k]);const lost=Object.keys(facts).filter(k=>!facts[k]&&before[k]);const label={value:'职业价值议题',position:'正式责任主题',opening:'外部机会主题',restructure:'职业重构主题',c:'个人行动节奏'};
  if(gained.length)difference=`与${previous.year}年相比，本年新增${gained.map(k=>label[k]).join('、')}。`;
  else if(lost.length)difference=`与${previous.year}年相比，${lost.map(k=>label[k]).join('、')}不再是本年主要信号；重点转向已有主题的承接。`;
  else if(p.theme!==yearProfile(previous).theme)difference=`与${previous.year}年相比，主要职业主题从「${yearProfile(previous).headline}」转向「${p.headline}」。`;
 }
 let foreground='当前缺少足以确认单一年份主导事件的主要职业相位，应结合现实机会判断。';
 if(principal.length){foreground=principal.map((e,i)=>`${i===0?'主导':'辅助'}：${movers[e.mover]||e.mover}触及${target(e)}，${cycle(e,year.year)}`).join('；')+'。';}
 let synergy='';if(facts.value&&(facts.position||facts.opening))synergy='职位/机会与职业价值主题在本年重叠，适合同时核实职责、正式位置和回报；仍不等于已经发生跃迁或涨薪。';
 else if(facts.value)synergy='职业价值相关信号值得单独观察，尤其区分收入、资源权和市场报价；没有足够证据推算涨幅。';
 else if(facts.restructure)synergy='职业结构变化较突出，需区分主动换轨、被动调整与向上发展；不能直接视为升职或失败。';
 else if(facts.position)synergy='权责和组织规则是主要议题，新增责任不等于正式职位提高。';
 else if(facts.opening)synergy='机会扩张是主要议题，重点判断机会是否转换成真实scope和资源。';
 else if(facts.c)synergy='个人行动节奏突出，但缺少相应主要外部职业信号，不构成职业上升的必要或充分条件。';
 else synergy='本年缺少明确的职业关键点触发，适合保持观察，不推断真实职业停滞。';
 const preview=next?`下一年（${next.year}）主要主题：${yearProfile(next).headline}。`:'本十年观察区间的最后一年。';
 return {year:year.year,title:p.headline,kind:p.kind,main:p.summary,foreground,relative:difference,interaction:synergy,action:actionBy[p.theme],risk:p.risk,preview,focus:principal.map(e=>({label:`${movers[e.mover]||e.mover} · ${target(e)}`,when:cycle(e,year.year),begin:e.begin,best:e.best,end:e.end,type:e.type,priority:e.priority})),technical:{GR:year.GR,C:year.C},unknown:'未来真实O/E/P/V、组织支持、3–6个月稳定性及职业代价仍需现实验证。'};
}
