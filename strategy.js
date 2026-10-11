(() => {
 'use strict';
 const $ = (s) => document.querySelector(s);
 const cards = [...document.querySelectorAll('#ideas-grid .idea')];
 const controls = ['#idea-search','#format-filter','#game-filter','#cost-filter','#evidence-filter','#page-size'].map($);
 let page=0, filtered=cards;
 function filter(reset=true) {
  if(reset) page=0;
  const [q,f,g,c,e,size] = controls.map(x=>x.value);
  filtered=cards.filter(x=>(!q||x.dataset.search.includes(q.trim().toLowerCase()))&&(!f||x.dataset.format===f)&&(!g||x.dataset.game===g)&&(!c||x.dataset.cost===c)&&(!e||x.dataset.coverage===e));
  const limit=+size, pages=Math.max(1,Math.ceil(filtered.length/limit));page=Math.min(page,pages-1);
  cards.forEach(x=>x.hidden=true);filtered.slice(page*limit,(page+1)*limit).forEach(x=>x.hidden=false);
  $('#result-count').textContent=filtered.length ? `${page*limit+1}–${Math.min((page+1)*limit,filtered.length)} of ${filtered.length} ideas` : '0 ideas';
  $('#page-label').textContent=`Page ${page+1} of ${pages}`;
  $('#previous-page').disabled=page===0;$('#next-page').disabled=page>=pages-1;
  $('#no-results').hidden=filtered.length!==0;
 }
 controls.forEach(x=>x.addEventListener(x.tagName==='INPUT'?'input':'change',()=>filter()));
 function reset(){controls.slice(0,5).forEach(x=>x.value='');filter();}
 $('#clear-filters').addEventListener('click',reset);
 function paginate(direction){page+=direction;filter(false);$('#thumbnail-gallery').scrollIntoView({block:'start'});}
 $('#previous-page').addEventListener('click',()=>paginate(-1));$('#next-page').addEventListener('click',()=>paginate(1));
 function revealHash() {
  const id=location.hash.slice(1);
  if(id.startsWith('format-')) { const format=document.getElementById(id);if(format){format.open=true;for(let p=format.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;requestAnimationFrame(()=>format.scrollIntoView({block:'start'}));}return; }
  const card=cards.find(x=>x.id===id);
  if(!card)return;
  const [q,f,g,c,e]=controls.map(x=>x.value);
  if(!filtered.includes(card)){controls.slice(0,5).forEach(x=>x.value='');filtered=cards;}
  page=Math.floor(filtered.indexOf(card)/+controls[5].value);filter(false);
  requestAnimationFrame(()=>card.scrollIntoView({block:'start'}));
 }
 window.addEventListener('hashchange',revealHash);filter();if(location.hash)revealHash();
 document.addEventListener('click',ev=>{const link=ev.target.closest('a[href^="#idea-"]');if(link&&location.hash===link.getAttribute('href'))revealHash();});
 const dialog=$('#thumbnail-dialog');let current=0,opener=null;
 function updateViewer(){const card=cards[current],link=card.querySelector('.generated-thumb');$('#thumbnail-title').textContent=card.querySelector('h3').textContent;$('#thumbnail-full').src=link.getAttribute('href');$('#thumbnail-full').alt=card.querySelector('img').alt;$('#thumbnail-position').textContent=`${current+1} / ${cards.length}`;$('#thumbnail-download').href=link.getAttribute('href');$('#thumbnail-download').download=`Stokes-${card.id.slice(5)}.jpg`;$('#thumbnail-idea').href=`#${card.id}`;$('#thumbnail-prev').disabled=current===0;$('#thumbnail-next').disabled=current===cards.length-1;}
 document.addEventListener('click',ev=>{const link=ev.target.closest('[data-thumbnail-id]');if(!link)return;ev.preventDefault();current=cards.findIndex(x=>x.id===`idea-${link.dataset.thumbnailId}`);if(current<0)return;opener=link;updateViewer();dialog.showModal();});
 $('#thumbnail-prev').addEventListener('click',()=>{if(current>0){current--;updateViewer();}});$('#thumbnail-next').addEventListener('click',()=>{if(current<cards.length-1){current++;updateViewer();}});
 $('#thumbnail-idea').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
 dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('keydown',ev=>{if(ev.key==='ArrowLeft'&&current>0){current--;updateViewer();}if(ev.key==='ArrowRight'&&current<cards.length-1){current++;updateViewer();}});
 const nav=[...document.querySelectorAll('.chapter-nav a')];
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible.length)nav.forEach(x=>x.setAttribute('aria-current',String(x.hash===`#${visible[0].target.id}`)));},{rootMargin:'-65px 0px -70% 0px'});
 document.querySelectorAll('main > .chapter').forEach(x=>observer.observe(x));
})();
