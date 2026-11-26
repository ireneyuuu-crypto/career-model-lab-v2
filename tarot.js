// Career Tarot V1.4 — symbolic reflection only, never evidence for Career V2.0 predictions.
// All content is offline; card is deterministic per report, preventing rerolls on reload/export.
export const TAROT_VERSION='1.4.0';
export const CARDS=[
 {id:0,en:'The Fool',cn:'愚者',symbol:'✧',theme:'explore',keyword:'新起点',message:'新的方向值得探索，但不必一次投入全部筹码。',action:'写下一个低风险的尝试，并设定检验是否继续的条件。'},
 {id:1,en:'The Magician',cn:'魔术师',symbol:'✴',theme:'explore',keyword:'主动创造',message:'你已拥有一些可以组合的资源，关键是付诸行动。',action:'选定一项技能，把它转化成别人看得见的作品。'},
 {id:2,en:'The High Priestess',cn:'女祭司',symbol:'☾',theme:'reflect',keyword:'倾听直觉',message:'信息尚未完整，给观察与思考留一点空间。',action:'把已知事实和自己的假设分两栏写下来。'},
 {id:3,en:'The Empress',cn:'皇后',symbol:'❀',theme:'build',keyword:'耐心培育',message:'可持续的成长需要被照顾，而非一直催促。',action:'为一项长期能力安排可持续的每周练习。'},
 {id:4,en:'The Emperor',cn:'皇帝',symbol:'◇',theme:'expand',keyword:'建立边界',message:'影响力的增加，也意味着需要更清晰的职责和规则。',action:'明确自己的决策权限，以及需要哪些支持。'},
 {id:5,en:'The Hierophant',cn:'教皇',symbol:'✣',theme:'build',keyword:'向经验学习',message:'稳定的方法论能让摸索不再重复。',action:'向一个信任的同行请教具体的成长路径。'},
 {id:6,en:'The Lovers',cn:'恋人',symbol:'♡',theme:'reflect',keyword:'价值选择',message:'真正值得走的方向，需要与你在意的价值一致。',action:'列出工作选择中最重要的三个不能妥协的条件。'},
 {id:7,en:'The Chariot',cn:'战车',symbol:'➤',theme:'expand',keyword:'聚焦前进',message:'机会和行动同时出现时，清楚的优先级比盲目加速更重要。',action:'为接下来一个月只设定一个职业突破目标。'},
 {id:8,en:'Strength',cn:'力量',symbol:'♌',theme:'expand',keyword:'柔韧的力量',message:'稳定而有耐心的投入，比一次用尽力气更能走远。',action:'选一个难题，拆成可以坚持四周的小步骤。'},
 {id:9,en:'The Hermit',cn:'隐士',symbol:'✧',theme:'reflect',keyword:'向内探索',message:'减少外界噪声，可以更清楚地听见自己的判断。',action:'单独留半小时复盘：真正消耗你的是什么？'},
 {id:10,en:'Wheel of Fortune',cn:'命运之轮',symbol:'◎',theme:'change',keyword:'顺势调整',message:'环境总会变化，重要的是提前准备自己的选择。',action:'为当前方向准备一个备选方案和触发条件。'},
 {id:11,en:'Justice',cn:'正义',symbol:'⚖',theme:'reflect',keyword:'审视事实',message:'做重大决定前，先让证据而非情绪说话。',action:'对比每个选项的实际机会、代价与长期回报。'},
 {id:12,en:'The Hanged Man',cn:'倒吊人',symbol:'▽',theme:'change',keyword:'转换视角',message:'暂时放缓，不一定意味着停滞；也许需要换个角度。',action:'请不同背景的人帮你挑战当前的职业假设。'},
 {id:13,en:'Death',cn:'死神',symbol:'✦',theme:'change',keyword:'结束与更新',message:'告别不再适合的安排，才能腾出空间开始下一章。',action:'列出一件可以停止投入的低价值工作。'},
 {id:14,en:'Temperance',cn:'节制',symbol:'☯',theme:'reflect',keyword:'调整节奏',message:'不是所有机会都需要立刻抓住；持续性同样重要。',action:'检查本月的时间、精力与恢复空间是否平衡。'},
 {id:15,en:'The Devil',cn:'恶魔',symbol:'⌁',theme:'reflect',keyword:'识别束缚',message:'有些熟悉的模式正在牵制你的选择。',action:'找出一个反复消耗注意力的习惯并减少一次触发。'},
 {id:16,en:'The Tower',cn:'高塔',symbol:'⚡',theme:'change',keyword:'重建基础',message:'如果旧结构不再可靠，先找到最需要加固的基础。',action:'列出可能的职业风险与可提前准备的缓冲。'},
 {id:17,en:'The Star',cn:'星星',symbol:'✶',theme:'build',keyword:'保持方向',message:'不需要每一步都立刻有结果，让积累逐渐被看见。',action:'保留一份可以长期更新的成长成果记录。'},
 {id:18,en:'The Moon',cn:'月亮',symbol:'☽',theme:'reflect',keyword:'辨别迷雾',message:'不确定时，避免把猜测直接当成事实。',action:'为一个重要担忧寻找可验证的现实信息。'},
 {id:19,en:'The Sun',cn:'太阳',symbol:'☼',theme:'expand',keyword:'让成果被看见',message:'当你做出了有价值的事，也要学会清晰表达成果。',action:'用数字、案例或反馈整理一个可展示的成果。'},
 {id:20,en:'Judgement',cn:'审判',symbol:'✧',theme:'change',keyword:'重新选择',message:'过去的经历可以成为下一阶段的方向线索。',action:'回顾三个关键工作节点，找到共同的成长主题。'},
 {id:21,en:'The World',cn:'世界',symbol:'◉',theme:'build',keyword:'整合成果',message:'把分散的能力串联起来，形成自己的完整优势。',action:'为最具代表性的三项成果写一段一致的职业叙事。'}
];
const POOLS={
 explore:[0,1,7,17,20],expand:[4,7,8,19,21],build:[3,5,8,17,21],change:[0,10,12,13,16,20],reflect:[2,6,9,11,14,15,18]
};
export function selectTheme(report){
 if(!report||!Array.isArray(report.years)||!report.years.length) throw new Error('缺少可用于抽牌的年度报告');
 const years=report.years;const totalGR=years.reduce((n,y)=>n+(Number(y.GR)||0),0),totalC=years.reduce((n,y)=>n+(Number(y.C)||0),0);
 const p1=years.reduce((n,y)=>n+(Number(y.p1)||0),0);
 // Only use actual model signal counts; do not infer promotions or livelihood outcomes.
 if(totalGR===0&&totalC===0)return 'reflect';
 if(totalGR===0&&totalC>0)return 'explore';
 if(totalC===0&&totalGR>0)return 'change';
 if(p1>=4&&totalGR>=totalC*1.3)return 'expand';
 if(totalC>=totalGR*1.4)return 'explore';
 return 'build';
}
export function seededIndex(seed,length){let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)%length}
export function selectTarot(report){const theme=selectTheme(report);const options=POOLS[theme];const fingerprint=JSON.stringify({v:TAROT_VERSION,birth:report.birthUTC||report.birth?.date||'',start:report.years[0].year,years:report.years.map(y=>[y.year,y.GR,y.C,y.p1])});
 const selected=CARDS[options[seededIndex(fingerprint,options.length)]];
 const gr=report.years.reduce((n,y)=>n+(Number(y.GR)||0),0),c=report.years.reduce((n,y)=>n+(Number(y.C)||0),0);
 const evidence=`这份报告识别到 ${gr} 段外部职业变化信号（GR）和 ${c} 段个人行动时钟信号（C）。卡片依据这些信号的整体分布，从相关主题牌组中选出。`;
 return {version:TAROT_VERSION,cardId:selected.id,cn:selected.cn,en:selected.en,symbol:selected.symbol,keyword:selected.keyword,theme, message:selected.message,action:selected.action,evidence,disclaimer:'塔罗牌仅用于象征性自我反思，不是新的职业预测证据。',selection:'主题匹配 + 固定种子抽取',drawn:true};
}
