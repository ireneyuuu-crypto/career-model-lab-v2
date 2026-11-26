/* Career Model Lab V1.8 — experimental, UNVALIDATED career-development index.
 * This module does not modify astronomical signals, outcome classifications or Career V2.0.
 * All scores are heuristic relative presentation estimates, never probabilities.
 */
const cap = n => Math.max(0, Math.min(100, n));
const distinct = events => [...new Map(events.map(e=>[e.id+'|'+e.begin+'|'+e.end,e])).values()];
export function indexForYear(year) {
  const ev=distinct(year.events||[]), prime=ev.filter(e=>e.type==='GR'&&e.priority===1);
  const finance=ev.filter(e=>e.type==='GR'&&/第二宫/.test(e.target||''));
  const action=ev.filter(e=>e.type==='C');
  const j=prime.filter(e=>e.mover==='jupiter').length;
  const s=prime.filter(e=>e.mover==='saturn').length;
  const structural=prime.filter(e=>['uranus','pluto','neptune'].includes(e.mover)).length;
  const val=finance.length;
  // Fixed heuristic mapping: 50 = no detected primary signal, not a neutral career forecast.
  // Scope and position are intentionally differentiated; high structural disruption adds a cost adjustment.
  const opportunity=cap(50+Math.min(28,j*9)+Math.min(10,action.length*2));
  const expansion=cap(50+Math.min(30,j*11)+Math.min(8,s*3));
  const position=cap(50+Math.min(24,s*9)+Math.min(10,j*3));
  const value=cap(50+Math.min(34,val*10));
  const costPenalty=Math.min(22,structural*6+s*2);
  const score=Math.round(cap((opportunity+expansion+position+value)/4-costPenalty));
  const themes={growth:j>0,role:s>0,value:val>0,restructure:structural>0};
  return {year:year.year,score,components:{opportunity,expansion,position,value},costPenalty,
    support:null,stability:null, themes,primarySignals:prime.length,financeSignals:val,
    label:structural?'职业方向调整':s&&j?'职位与职责机会':s?'责任与角色变化':j?'机会与职责扩展':val?'价值议题':'积累与观察',
    calibrated:false};
}
export function indexForDecade(report){return report.years.map(indexForYear);}
export const INDEX_METHOD='实验性展示指数：只使用已计算的木星、土星、天王星/冥王星/海王星主要职业点信号、第二宫信号及个人行动信号。先构造机会、职责、职位、价值四个主题代理值（各占四分之一），再对结构调整与压力信号进行有限扣减。50分代表未检出相关主信号，并不代表现实职业处于平均水平；组织支持和未来稳定性无法从这些数据推断，未纳入计算。该方法未经独立样本校准，仅适合浏览相对主题，不可作为求职、收入或投资决策依据。';
