// Career Model Lab V1.5: thematic explanations, NOT verified career-outcome prediction.
// These associations are explanatory hypotheses and must never be used to claim salary/promotion.
export const THEMES={
  jupiter:{label:'机会与扩展',opportunity:'关注新项目、合作、能力曝光或外部机会；验证是否有正式授权与资源。',risk:'机会增加不等于职位或收入同步提高。',action:'记录具体机会、职责边界，以及资源与回报是否同步。'},
  saturn:{label:'责任与结构调整',opportunity:'关注职责边界、组织架构、考核规则或长期责任的调整。',risk:'责任和工作量增加，未必换来职级提升。',action:'核对新职责是否伴随头衔、权限和资源支持。'},
  uranus:{label:'变化与转向',opportunity:'关注团队、岗位、项目方向出现的非惯常变化及新的尝试空间。',risk:'变化可能伴随不稳定，不代表一定获得更好的平台。',action:'准备备选方案，比较新方向的授权与持续性。'},
  neptune:{label:'方向澄清',opportunity:'关注职位目标、合作预期与职业定位是否需要重新厘清。',risk:'职责不清、承诺模糊、成果难归因。',action:'把目标、责任、评价标准写成可核实的约定。'},
  pluto:{label:'深层重构',opportunity:'关注权力结构、核心业务或长期职业角色变化的可能性。',risk:'组织资源、权责关系可能发生较大拉扯。',action:'确认决策权、关键支持者与承受的代价。'},
  sun:{label:'自我定位与方向',opportunity:'关注职业身份与长期方向的一致性。',risk:'个人动机增强并不自动产生外部职位机会。',action:'明确下一阶段最想扩大哪项核心职责。'},
  moon:{label:'个人节奏调整',opportunity:'关注开始行动、调整优先级的个人节奏。',risk:'短期感受不等于长期结果。',action:'把职业目标拆成可执行的小步行动。'},
  mercury:{label:'沟通与规划',opportunity:'关注信息收集、沟通、学习及职业路径梳理。',risk:'谈判或计划尚不等于正式获得机会。',action:'把关键沟通落实为书面决定与时间表。'},
  venus:{label:'关系与价值表达',opportunity:'关注合作关系、价值展示及协作方式。',risk:'关系改善不等于薪酬或职级提升。',action:'整理可量化成果，明确自己的贡献。'},
  mars:{label:'行动与推进',opportunity:'关注争取项目、主动承担及执行推进。',risk:'投入更大也可能只有工作量上涨。',action:'优先选择具备明确结果和资源支持的行动。'}
};
const scoreEvent=e=> e.type==='GR' ? (e.priority===1?6:e.priority===2?3:1) : (e.priority===1?2:1);
export function interpretYear(y){
 const events=[...y.events].sort((a,b)=>scoreEvent(b)-scoreEvent(a)||a.best.localeCompare(b.best));
 const principal=events.filter(e=>e.type==='GR'&&e.priority===1);
 const choices=principal.length?principal:events.filter(e=>e.type==='GR').length?events.filter(e=>e.type==='GR'):events;
 const frequency=new Map();
 choices.forEach(e=>frequency.set(e.mover,(frequency.get(e.mover)||0)+scoreEvent(e)));
 const mover=[...frequency.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];
 const theme=mover?THEMES[mover]:null;
 const top=events.slice(0,2);
 const evidence=top.map(e=>`${e.type==='GR'?'外部':'个人'} · ${e.target} · ${e.best}`).join('；');
 const yearLabel=principal.length>=2?'主要职业点变化值得重点观察':principal.length===1?'存在主要职业点变化信号':events.length?'存在辅助或个人节奏信号':'未检出规则命中信号';
 const scope=events.some(e=>e.target.includes('第二宫'))?'包含价值相关宫位触发点；但不能据此判断收入涨幅。':'未取得可验证的薪酬变化证据。';
 return {
  year:y.year,topic:theme?.label||'持续观察与准备',headline:yearLabel,
  opportunity:theme?.opportunity||'目前没有足够的相位依据锁定这一年的职业主题，可持续积累真实机会信息。',
  risk:theme?.risk||'缺少天象信号不代表现实不会发生职业变化。',
  action:theme?.action||'定期记录职责、职位、回报与资源变化。',
  evidence:evidence||'未检出相位',primarySignals:principal.length,
  promotion:'待现实验证',jump:'不可由相位单独判断',income:'不可由相位推算金额或涨幅',incomeNote:scope,
  status:'主题观察（尚未完成职业结果映射）',
  signalCount:y.GR+y.C
 };
}
export function interpretDecade(report){
 const years=report.years.map(interpretYear);
 const ordered=[...years].sort((a,b)=>b.primarySignals-a.primarySignals||b.signalCount-a.signalCount||a.year-b.year);
 const highlights=ordered.filter(y=>y.primarySignals>0).slice(0,3);
 return {years,highlights,disclaimer:'年度主题基于天体与职业相关点的相位信号作探索性解释。现有模型尚缺少经过独立验证的相位→实际职责、职级、收入结果映射；不能指定哪年一定升职、跃迁或涨薪。'};
}
