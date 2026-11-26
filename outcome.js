/* Career Model Lab V1.7 — forecast hypotheses based on documented signals.
 * These are NOT validated predictions or factual O/E/P/V/S/ST outcomes.
 * Never convert missing support/stability data into a Career Jump verdict.
 */
const PRIMARY = e => e.type === 'GR' && e.priority === 1;
const FINANCE = e => e.type === 'GR' && /第二宫/.test(e.target || '');
const RESTRUCTURE = new Set(['uranus', 'pluto', 'neptune']);
const GROWTH = new Set(['jupiter']);
const STRUCTURE = new Set(['saturn']);
const clean = ev => [...new Map(ev.map(e => [e.id + '|' + e.begin + '|' + e.end, e])).values()];
const point = e => e.target?.includes('天顶') ? '天顶' : e.target?.includes('第十宫') ? '第十宫主' : e.target?.includes('第二宫') ? '第二宫' : e.target || '职业关联点';
const chinese = {jupiter:'木星',saturn:'土星',uranus:'天王星',neptune:'海王星',pluto:'冥王星',sun:'太阳',moon:'月亮',mercury:'水星',venus:'金星',mars:'火星'};
function stage(e,year){const yr = s => Number((s || '').slice(0,4));const from=yr(e.begin),peak=yr(e.best),to=yr(e.end); if(peak===year)return '峰值接近';if(from===year&&peak>year)return `启动期，${peak}年接近峰值`;if(from<year&&peak>year)return `持续酝酿，${peak}年接近峰值`;if(peak<year&&to>=year)return '峰值后的延续期';return '活跃期';}
export function yearProfile(y){
 const ev=clean(y.events || []),primary=ev.filter(PRIMARY),finance=ev.filter(FINANCE),secondary=ev.filter(e=>e.type==='GR' && e.priority===2),clock=ev.filter(e=>e.type==='C');
 const score=e=>(PRIMARY(e)?4:FINANCE(e)?2:e.type==='C'?1:1) + (Number(e.minOrb)<0.5?1:0);
 const top=[...primary,...finance,...secondary,...clock].sort((a,b)=>score(b)-score(a)||(a.best||'').localeCompare(b.best||''));
 const byMover=m=>primary.filter(e=>e.mover===m);
 const growth=primary.filter(e=>GROWTH.has(e.mover));const rebuild=primary.filter(e=>RESTRUCTURE.has(e.mover));const formal=primary.filter(e=>STRUCTURE.has(e.mover));
 const value=finance.length>0;
 let kind='观察与积累',headline='暂无明确的主要职业变化主题',summary='本年没有足够的第一优先级职业点信号，不能因此排除现实中的职业变化。';
 if(rebuild.length){kind='R · 职业重构候选';headline='职业方向与权责结构值得重点关注';summary='更应关注岗位轨道、组织权责或职业身份是否发生结构性变化。变化本身不代表向上，也可能带来重新定位。';}
 else if(formal.length && growth.length){kind='P/E · 职责与位置窗口';headline='正式责任与扩张机会可能同时成为议题';summary='值得观察新增职责是否伴随正式职位、决策权限及资源配置调整，而不只是工作量增加。';}
 else if(formal.length){kind='P · 正式职责观察窗口';headline='职业位置、考核与责任边界成为重点';summary='适合观察职级、汇报关系、正式责任与支持资源有没有同步变化。土星信号本身不能证明晋升。';}
 else if(growth.length){kind='O/E · 机会与扩展窗口';headline='新项目、协作机会与职责扩展值得关注';summary='重点检验机会是否真正带来扩大职责或进入更高价值项目的条件，而不是只增加曝光。';}
 else if(primary.length){kind='职业结构变化观察期';headline='主要职业点有变化信号';summary='需结合具体相位与现实背景，辨别属于角色调整、外部机会还是组织结构变化。';}
 else if(value){kind='V · 价值议题观察期';headline='薪酬与资源回报值得关注';summary='第二宫有关信号出现，可将薪酬、预算、市场定价等列入现实核验；不能推算金额或涨幅。';}
 else if(secondary.length||clock.length){kind='准备与行动节奏期';headline='个人规划或辅助信号相对突出';summary='适合重新整理能力证据与行动计划，但尚不足以据此判断明显职业跃迁。';}
 const valueLabel=value?'V · 价值/收入变化候选（需核实）':'V · 未检出直接价值相关信号';
 const support='S/ST · 组织支持和变化后稳定性无法仅凭本命/行运数据获得';
 let jump='J · 目前无法确认';
 if((growth.length || formal.length) && value)jump='J · 多维改善条件值得观察（不是已成立的跃迁）';
 if(rebuild.length && (growth.length||formal.length||value)) jump='R → J · 重构后可能出现跃迁条件（需实证）';
 const cost = rebuild.some(e=>e.mover==='pluto'||e.mover==='uranus')||formal.length?'Cost · 权责压力或转轨代价需重点评估':'Cost · 按实际投入和风险核对';
 const opportunity = rebuild.length?'优先检验新业务轨道、组织变化和关键资源是否使你获得真正的选择权。':formal.length?'优先检验正式职位、责任边界、授权和考核规则能否同步调整。':growth.length?'优先检验新项目、合作平台或扩展职责能否转化为可积累的职业资本。':value?'优先核对薪酬谈判、资源回报和市场价值的现实变化。':'主动积累可核验的职业成果，观察真实外部机会。';
 const risk=rebuild.length?'方向重置不自动等于职位或收入提升；尤其注意稳定性。':formal.length?'责任增长可能没有职级、授权或回报同步。':growth.length?'机会增多可能只是工作量增加，未必构成职业跃迁。':'避免把相位出现或缺失理解为真实职业结果。';
 const evidence=top.slice(0,5).map(e=>({text:`${chinese[e.mover]||e.mover} ${e.label} ${point(e)} · ${stage(e,y.year)}`,begin:e.begin,best:e.best,end:e.end,orb:e.minOrb,type:e.type,priority:e.priority}));
 return {year:y.year,kind,headline,summary,opportunity,risk,valueLabel,support,jump,cost,evidence,primaryCount:primary.length,financeCount:finance.length,clockCount:clock.length,topMover:top[0]?.mover||null,topTarget:top[0]?.target||null,theme:rebuild.length?'restructure':formal.length?'structure':growth.length?'growth':value?'value':'prepare',score:primary.reduce((s,e)=>s+score(e),0)+finance.length*2+clock.length};
}
export function decadeProfiles(report){return report.years.map(yearProfile);}
// Dynamic segmentation based on changes in the actual dominant themes, not fixed 2/3/3/2 years.
// Adjacent years with the same dominant narrative are grouped; small one-year variations
// are smoothed only when their neighbors agree and the year is not itself signal-rich.
export function decadePhases(profiles){
 if(!profiles.length)return [];
 const themes=profiles.map(p=>p.theme);
 for(let i=1;i<themes.length-1;i++)if(themes[i-1]===themes[i+1] && themes[i]!==themes[i-1] && profiles[i].primaryCount===0) themes[i]=themes[i-1];
 const out=[];for(let i=0;i<profiles.length;){let j=i+1;while(j<profiles.length && themes[j]===themes[i])j++;
 const subset=profiles.slice(i,j),pivot=[...subset].sort((a,b)=>b.score-a.score||a.year-b.year)[0];
 const labels={restructure:'职业结构重新定位',structure:'职位与责任重整',growth:'机会与职责扩展',value:'价值回报观察',prepare:'积累与准备'};
 out.push({start:subset[0].year,end:subset.at(-1).year,range:`${subset[0].year}${subset.length>1?'–'+subset.at(-1).year:''}`,theme:themes[i],title:labels[themes[i]],lead:pivot.summary,opportunity:pivot.opportunity,risk:pivot.risk,turningYear:pivot.year,signal:`${subset.reduce((s,p)=>s+p.primaryCount,0)}段主要职业点信号（跨年活动可能重复计入）`,evidence:pivot.evidence.slice(0,2)});i=j;}
 return out;
}
export function keyWindows(profiles){const ranked=profiles.filter(p=>p.primaryCount>0||p.financeCount>0).sort((a,b)=>b.score-a.score||a.year-b.year);const chosen=[];const used=new Set();for(const p of ranked){if(used.has(p.theme))continue;chosen.push(p);used.add(p.theme);if(chosen.length===4)break;}return chosen.length?chosen:profiles.slice(0,2);}
export function modelCaveat(){return '以上职业事件是透明的规则性主题候选，不是已经完成外部验证的升职、收入或职业跃迁预测。J 的现实认定需要 E/P/V 至少两项实质提升，且 S/ST 未明显失败；本软件没有这些现实证据，不能推算具体涨幅。';}

// Extra presentation layer: named candidate WINDOWS, not observed promotions/pay rises.
// Candidate identification is based solely on already-computed yearly GR signals.
export function forecastWindowSummary(report) {
 const years=(report.years||[]).map(y=>{
  const e=clean(y.events||[]).filter(x=>x.type==='GR');
  const primary=e.filter(PRIMARY), finance=e.filter(FINANCE);
  const growth=primary.filter(x=>x.mover==='jupiter'),position=primary.filter(x=>x.mover==='saturn');
  const major=e.filter(x=>x.priority===1&&RESTRUCTURE.has(x.mover));
  const jumpSignals=(growth.length>0||position.length>0)&&finance.length>0;
  return {year:y.year,jumpCandidate:jumpSignals,valueCandidate:finance.length>0,restructureCandidate:major.length>0,
   roleCandidate:position.length>0,opportunityCandidate:growth.length>0,
   evidence:[...new Map([...primary,...finance].map(x=>[x.id,x])).values()].slice(0,4).map(x=>({begin:x.begin,end:x.end,best:x.best,mover:x.mover,target:x.target}))};
 });
 return {years,jump:years.filter(y=>y.jumpCandidate),value:years.filter(y=>y.valueCandidate),
  restructure:years.filter(y=>y.restructureCandidate),position:years.filter(y=>y.roleCandidate)};
}
