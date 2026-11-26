// Creates all text via textContent. No external assets, APIs, or user data upload.
export function renderTarot(root,tarot,{sample=false}={}){
 root.replaceChildren();root.classList.toggle('is-revealed',Boolean(tarot));
 const heading=document.createElement('div');heading.className='tarot-heading';
 const over=document.createElement('span');over.className='tarot-overline';over.textContent='CAREER TAROT · A MESSAGE FOR YOUR JOURNEY';
 const h=document.createElement('h2');h.textContent='给未来的自己，一张职业启示牌';
 const sub=document.createElement('p');sub.textContent='让这张牌成为报告之后的一次温柔自问。';heading.append(over,h,sub);
 const scene=document.createElement('div');scene.className='tarot-scene';const card=document.createElement('div');card.className='tarot-card'+(tarot?' tarot-card--face':'');
 const face=document.createElement('div');face.className='tarot-card-surface';
 const upper=document.createElement('div');upper.className='tarot-top';upper.textContent=tarot?'MAJOR ARCANA  ·  '+String(tarot.cardId).padStart(2,'0'):'✦  CAREER MODEL LAB  ✦';
 const diagram=document.createElement('div');diagram.className='tarot-sigil';diagram.setAttribute('aria-hidden','true');const emblem=document.createElement('span');emblem.className='tarot-emblem';emblem.textContent=tarot?tarot.symbol:'✧';diagram.append(emblem);
 const bottom=document.createElement('div');bottom.className='tarot-card-bottom';bottom.textContent=tarot?`${tarot.en} · ${tarot.cn}`:'YOUR NEXT CHAPTER';face.append(upper,diagram,bottom);card.append(face);scene.append(card);
 const content=document.createElement('div');content.className='tarot-content';
 if(tarot){
  const key=document.createElement('span');key.className='tarot-keyword';key.textContent=tarot.keyword;
  const name=document.createElement('h3');name.textContent=`${tarot.cn} · ${tarot.en}`;
  const msg=document.createElement('p');msg.className='tarot-message';msg.textContent=tarot.message;
  const action=document.createElement('div');action.className='tarot-action';const a=document.createElement('strong');a.textContent='你可以尝试';const ap=document.createElement('p');ap.textContent=tarot.action;action.append(a,ap);
  const why=document.createElement('details');why.className='tarot-why';const s=document.createElement('summary');s.textContent='为什么抽到这张牌？';const wp=document.createElement('p');wp.textContent=tarot.evidence;why.append(s,wp);
  const note=document.createElement('p');note.className='tarot-disclaimer';note.textContent=tarot.disclaimer;
  content.append(key,name,msg,action,why,note);
 }else{
  const lead=document.createElement('p');lead.className='tarot-message';lead.textContent=sample?'这是演示报告，点击翻牌看看结尾的效果。':'我们会参考本次十年报告的 GR / C 信号主题，从相应的牌组中为你选出一张牌。';content.append(lead);
 }
 root.append(heading,scene,content);
}
