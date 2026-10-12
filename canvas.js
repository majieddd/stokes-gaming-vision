(() => {
 'use strict';
 const data=window.STOKES_CANVAS,$=s=>document.querySelector(s),viewport=$('#viewport'),plane=$('#plane'),extent=$('#extent'),dialog=$('#detail'),drawer=$('#review-drawer'),host=$('#giscus-host');
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const all=data.groups.flatMap(g=>g.cards),byId=new Map(all.map(c=>[c.id,c]));
 const ORIGIN='https://giscus.app',cacheKey='stokes-discussion-review-counts-v2';
 let metrics={...data.initialMetrics},likedOnly=false,zoom=1,current=null,opener=null,review=null,reviewOpener=null,skipCloseFocus=false;
 let frameReady=false,reviewTimer=null,lastRefresh=0,countFrame=null,countReady=false,pendingCount=null,countTimer=null,authPopup=null;
 const inFlight=new Set(),queue=[],viewerLikes=new Map();
 function render(){
  $('#bulk-download').href=data.download;
  plane.innerHTML=data.groups.map(g=>'<section class="format-row" id="format-'+esc(g.id)+'" data-format="'+esc(g.id)+'"><div class="format-heading"><h2>'+esc(g.name)+'</h2><span>'+esc(g.label)+'</span></div><p class="format-description">'+esc(g.description)+'</p>'+(g.id==='multiverse'?'<div class="title-options" aria-label="Preview title"><button data-title="0" aria-pressed="true">I Created the Multiverse</button><button data-title="1" aria-pressed="false">I Beat Minecraft With GTA</button></div>':'')+'<div class="cards">'+g.cards.map(c=>'<article class="video-card" id="card-'+esc(c.id)+'" data-id="'+esc(c.id)+'"><button class="thumb-button" data-open="'+esc(c.id)+'" aria-label="Open '+esc(c.title)+(c.variant?' '+esc(c.variant):'')+'"><img src="'+esc(c.preview)+'" alt="'+esc(c.alt)+'" loading="lazy" width="316" height="178"><span class="concept-tag">'+esc(c.variant||'CONCEPT')+'</span></button><div class="card-copy"><span class="avatar" aria-hidden="true">S</span><div><button class="video-title" data-open="'+esc(c.id)+'">'+esc(c.title)+'</button><p class="video-meta">Stokes Twins Gaming<br>'+esc(c.meta)+'</p></div></div><div class="card-actions"><button data-review="'+esc(c.id)+'" data-like="'+esc(c.id)+'" aria-controls="review-drawer" aria-expanded="false" aria-label="Like or review '+esc(c.title)+' '+esc(c.variant||c.id)+'">👍 <span>0</span></button><button data-review="'+esc(c.id)+'" data-comments="'+esc(c.id)+'" aria-controls="review-drawer" aria-expanded="false" aria-label="Comment on '+esc(c.title)+' '+esc(c.variant||c.id)+'">Comments <span>0</span></button><a class="brief-link" href="'+esc(c.brief)+'">Brief ↗</a></div></article>').join('')+'</div></section>').join('');
  $('#format-nav').innerHTML=data.groups.map(g=>'<button data-jump="'+esc(g.id)+'"><span>'+esc(g.short||g.name)+'</span><small>'+esc(g.label)+'</small></button>').join('');
  $('#count').textContent=data.groups.length;size();filter();applyMetrics();
 }
 function size(){extent.style.width=(plane.offsetWidth*zoom)+'px';extent.style.height=(plane.offsetHeight*zoom)+'px';plane.style.transform='scale('+zoom+')';$('#zoom-level').textContent=Math.round(zoom*100)+'%';}
 function setZoom(next){const old=zoom;zoom=Math.max(.5,Math.min(1.5,next));const x=(viewport.scrollLeft+viewport.clientWidth/2)/old,y=(viewport.scrollTop+viewport.clientHeight/2)/old;size();viewport.scrollLeft=x*zoom-viewport.clientWidth/2;viewport.scrollTop=y*zoom-viewport.clientHeight/2;}
 function filter(){const q=$('#search').value.trim().toLowerCase();let n=0;for(const g of data.groups){let gn=0;for(const c of g.cards){const keep=(!q||[c.title,c.meta,g.name,c.summary,c.variant,c.composition].join(' ').toLowerCase().includes(q))&&(!likedOnly||(metrics[c.id]?.likes||0)>0);$('#card-'+c.id).hidden=!keep;if(keep){gn++;n++;}}$('#format-'+g.id).hidden=gn===0;document.querySelector('[data-jump="'+g.id+'"]').hidden=gn===0;}$('#empty').hidden=n!==0;size();}
 function jump(id){const row=$('#format-'+id);if(!row||row.hidden)return;viewport.scrollTop=row.offsetTop*zoom-25;viewport.scrollLeft=0;document.querySelectorAll('[data-jump]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.jump===id)));}
 function reset(){zoom=1;$('#search').value='';likedOnly=false;$('#liked-only').setAttribute('aria-pressed','false');filter();size();viewport.scrollTo(0,0);}
 function saveMetrics(){try{localStorage.setItem(cacheKey,JSON.stringify(metrics));}catch{}}
 function applyMetrics(){for(const c of all){const m=metrics[c.id];document.querySelector('[data-like="'+c.id+'"] span').textContent=m?.likes??'…';document.querySelector('[data-comments="'+c.id+'"] span').textContent=m?.comments??'…';document.querySelector('[data-like="'+c.id+'"]').classList.toggle('has-liked',viewerLikes.get(c.id)===true);}if(current)updateCounts();if(likedOnly)filter();}
 function updateCounts(){const m=metrics[current.id];$('#detail-counts').textContent=m?m.likes+' likes · '+m.comments+' comments':'Shared counts loading…';}
 function recordMetrics(c,d,personal=false){
  if(!d||d.id!==c.discussionId||d.repository?.nameWithOwner!==data.repo)return false;
  const likes=Number(d.reactions?.THUMBS_UP?.count),comments=Number(d.totalCommentCount)+Number(d.totalReplyCount||0);
  if(!Number.isFinite(likes)||!Number.isFinite(comments)||likes<0||comments<0)return false;
  metrics[c.id]={likes,comments,time:Date.now()};
  if(personal)viewerLikes.set(c.id,Boolean(d.reactions.THUMBS_UP.viewerHasReacted));
  applyMetrics();saveMetrics();return true;
 }
 function enqueue(c,force=false){if(!c||inFlight.has(c.id)||(!force&&Date.now()-(metrics[c.id]?.time||0)<60000))return;inFlight.add(c.id);queue.push(c);drain();}
 // A single anonymous widget supplies public metadata through giscus' documented
 // postMessage interface. Its REST endpoint intentionally disallows site-origin CORS.
 // Keep this separate from the signed-in editor; never pass a session to this reader.
 function drain(){
  if(pendingCount||!queue.length)return;pendingCount=queue.shift();const c=pendingCount;
  if(!countFrame){
   countFrame=document.createElement('iframe');countFrame.id='shared-counts';countFrame.hidden=true;countFrame.tabIndex=-1;countFrame.title='Public review counts';countFrame.setAttribute('aria-hidden','true');
   const url=new URL('/en/widget',ORIGIN);url.search=new URLSearchParams({origin:location.origin+location.pathname+'#shared-counts',session:'',theme:'dark',reactionsEnabled:'0',emitMetadata:'1',inputPosition:'top',repo:data.repo,repoId:data.feedback.repoId,category:data.feedback.category,categoryId:data.feedback.categoryId,strict:'1',number:c.discussion,description:'Public thumbnail review counts',backLink:location.origin+location.pathname});
   countFrame.src=url.href;countFrame.addEventListener('load',()=>{countReady=true;if(pendingCount)sendCountConfig(pendingCount);});document.body.append(countFrame);
  }else if(countReady)sendCountConfig(c);
  clearTimeout(countTimer);countTimer=setTimeout(()=>finishCount(false),20000);
 }
 function sendCountConfig(c){countFrame.contentWindow.postMessage({giscus:{setConfig:{number:c.discussion,term:String(c.discussion),emitMetadata:true,reactionsEnabled:false}}},ORIGIN);}
 function finishCount(ok){
  if(!pendingCount)return;clearTimeout(countTimer);inFlight.delete(pendingCount.id);pendingCount=null;
  if(ok){$('#feedback-status').textContent=likedOnly&&queue.length?'Checking all shared reviews…':'Shared reviews synced · Like and comment in the panel';drain();}
  else{queue.forEach(c=>inFlight.delete(c.id));queue.length=0;countFrame?.remove();countFrame=null;countReady=false;$('#feedback-status').textContent='Shared counts could not refresh. The review panel can still be opened.';}
 }
 function visibleCards(){const b=viewport.getBoundingClientRect();return all.filter(c=>{const el=$('#card-'+c.id);if(el.hidden||el.closest('.format-row').hidden)return false;const r=el.getBoundingClientRect();return r.bottom>b.top&&r.top<b.bottom&&r.right>b.left&&r.left<b.right;});}
 function refresh(){if(Date.now()-lastRefresh<10000){$('#feedback-status').textContent='Reviews were just refreshed.';return;}lastRefresh=Date.now();$('#feedback-status').textContent='Refreshing visible shared reviews…';visibleCards().forEach(c=>enqueue(c,true));if(review)enqueue(review,true);if(review&&!drawer.hidden)sendConfig(review);}
 function setExpanded(){document.querySelectorAll('[data-review]').forEach(b=>b.setAttribute('aria-expanded',String(!drawer.hidden&&b.dataset.review===review?.id)));document.querySelectorAll('.video-card').forEach(el=>el.classList.toggle('reviewing',!drawer.hidden&&el.dataset.id===review?.id));}
 function sendConfig(c){host.querySelector('iframe')?.contentWindow?.postMessage({giscus:{setConfig:{number:c.discussion,term:String(c.discussion),description:c.title,backLink:location.origin+location.pathname+'#card-'+c.id,emitMetadata:true,reactionsEnabled:true,inputPosition:'top'}}},ORIGIN);}
 function loadReview(c,retry=false){
  $('#review-loading').hidden=false;$('#review-loading').textContent='Loading shared review…';$('#retry-review').hidden=true;clearTimeout(reviewTimer);
  const frame=host.querySelector('iframe');
  if(frame&&frameReady&&!retry){sendConfig(c);}
  else{
   frameReady=false;host.replaceChildren();const s=document.createElement('script');s.src=ORIGIN+'/client.js';s.async=true;s.crossOrigin='anonymous';
   const attributes={repo:data.repo,'repo-id':data.feedback.repoId,category:data.feedback.category,'category-id':data.feedback.categoryId,mapping:'number',term:String(c.discussion),strict:'1','reactions-enabled':'1','emit-metadata':'1','input-position':'top',theme:data.feedback.theme,lang:'en',loading:'eager'};
   for(const [k,v]of Object.entries(attributes))s.setAttribute('data-'+k,v);
   s.onload=()=>{const f=host.querySelector('iframe');if(f){f.title='Shared reactions and comments';f.addEventListener('load',()=>{frameReady=true;if(review)sendConfig(review);},{once:true});}};
   s.onerror=()=>{$('#review-loading').textContent='The shared review could not load. Retry when your connection is available.';$('#retry-review').hidden=false;};host.append(s);
  }
  reviewTimer=setTimeout(()=>{if(!$('#review-loading').hidden){$('#review-loading').textContent='The review is taking longer to load. You can keep browsing or retry.';$('#retry-review').hidden=false;}},20000);
 }
 function openReview(id,trigger){const c=byId.get(id);if(!c)return;const changed=review?.id!==id;review=c;reviewOpener=trigger||reviewOpener;drawer.hidden=false;$('.workspace').classList.add('reviewing');$('#review-title').textContent=c.title;$('#review-variant').textContent=c.variant||'Idea '+c.id+' · '+c.formatName;$('#review-preview').src=c.preview;$('#review-preview').alt=c.alt;setExpanded();size();if(changed||!host.querySelector('iframe'))loadReview(c);enqueue(c,true);$('#review-title').focus({preventScroll:true});}
 function closeReview(){drawer.hidden=true;$('.workspace').classList.remove('reviewing');setExpanded();size();reviewOpener?.focus({preventScroll:true});}
 window.addEventListener('message',event=>{
  if(authPopup&&event.origin===location.origin&&event.source===authPopup&&event.data?.stokesReviewAuth==='complete'){completeAuth();return;}
  if(event.origin===ORIGIN&&countFrame&&event.source===countFrame.contentWindow){
   // The editor client must not resize or reconfigure itself using reader messages.
   event.stopImmediatePropagation();const msg=event.data?.giscus;
   if(msg?.discussion&&pendingCount&&recordMetrics(pendingCount,msg.discussion)){countReady=true;finishCount(true);}
   else if(typeof msg?.error==='string')finishCount(false);
   return;
  }
  const frame=host.querySelector('iframe');if(event.origin!==ORIGIN||!frame||event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;
  const msg=event.data.giscus;if(!msg||typeof msg!=='object')return;
  if(msg.discussion&&review&&recordMetrics(review,msg.discussion,true)){frameReady=true;clearTimeout(reviewTimer);$('#review-loading').hidden=true;$('#retry-review').hidden=true;$('#review-signin').hidden=Boolean(msg.viewer?.login&&msg.viewer.login!=='giscus[bot]');}
  if(typeof msg.error==='string'){$('#review-loading').hidden=false;$('#review-loading').textContent='Shared review needs to reconnect. Try again, or sign in in the panel.';$('#retry-review').hidden=false;}
 });
 function completeAuth(){authPopup=null;$('#review-auth-status').textContent='Sign-in complete. Loading your shared review…';if(review)loadReview(review,true);}
 window.addEventListener('storage',e=>{if(authPopup&&e.key==='giscus-session'&&e.newValue)completeAuth();});
 $('#review-signin').onclick=()=>{
  try{const id=crypto.randomUUID();localStorage.setItem('stokes-review-auth-flow',JSON.stringify({id,expires:Date.now()+10*60*1000}));const callback=new URL('review-auth.html',location.href);callback.searchParams.set('flow',id);const auth=new URL('/api/oauth/authorize',ORIGIN);auth.searchParams.set('redirect_uri',callback.href);authPopup=window.open(auth.href,'stokes-review-signin','popup,width=650,height=800');$('#review-auth-status').textContent=authPopup?'Complete GitHub sign-in in the separate window. Your canvas stays here.':'Allow the sign-in window in your browser, then try again.';}
  catch{$('#review-auth-status').textContent='Site storage is required to keep you signed in. Enable it and try again.';}
 };
 function showEvidence(c){$('#detail-evidence').hidden=!c.composition;$('#detail-evidence').open=false;$('#composition-note').textContent=c.comparison||'';$('#composition-sources').replaceChildren();for(const r of c.references||[]){const li=document.createElement('li'),a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener';a.textContent=r.channel+' · '+r.title;li.append(a,document.createTextNode(' ('+r.lift+'×, '+r.standing+'). '+r.observation));$('#composition-sources').append(li);}}
 function open(id,trigger){const c=byId.get(id);if(!c)return;current=c;opener=trigger||opener;$('#detail-title').textContent=c.title;$('#detail-label').textContent=c.variant?'Launch episode · Variant '+c.variant:'Idea '+c.id+' · '+c.formatName;$('#detail-image').src=c.full;$('#detail-image').alt=c.alt;$('#detail-summary').textContent=c.summary;$('#detail-position').textContent=(all.indexOf(c)+1)+' / '+all.length;$('#detail-download').href=c.full;$('#detail-download').download=c.full.split('/').pop();$('#detail-brief').href=c.brief;$('#previous').disabled=all.indexOf(c)===0;$('#next').disabled=all.indexOf(c)===all.length-1;updateCounts();showEvidence(c);enqueue(c);if(!dialog.open)dialog.showModal();}
 function step(n){const i=all.indexOf(current)+n;if(i>=0&&i<all.length)open(all[i].id);}
 document.addEventListener('click',e=>{const r=e.target.closest('[data-review]');if(r){openReview(r.dataset.review,r);return;}const o=e.target.closest('[data-open]');if(o){open(o.dataset.open,o);return;}const b=e.target.closest('[data-jump]');if(b){jump(b.dataset.jump);return;}const t=e.target.closest('[data-title]');if(t){const title=data.titleOptions[+t.dataset.title];data.groups[0].cards.forEach(c=>{c.title=title;$('#card-'+c.id+' .video-title').textContent=title;});if(review?.id.startsWith('MV-'))$('#review-title').textContent=title;document.querySelectorAll('[data-title]').forEach(x=>x.setAttribute('aria-pressed',String(x===t)));}});
 $('#close-detail').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{if(!skipCloseFocus)opener?.focus({preventScroll:true});skipCloseFocus=false;});$('#previous').onclick=()=>step(-1);$('#next').onclick=()=>step(1);dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);});dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
 $('#detail-review').onclick=()=>{skipCloseFocus=true;dialog.close();openReview(current.id,opener);};$('#team-reviews').onclick=e=>openReview((review||current||all[0]).id,e.target);$('#close-review').onclick=closeReview;$('#retry-review').onclick=()=>loadReview(review,true);drawer.addEventListener('keydown',e=>{if(e.key==='Escape')closeReview();});
 $('#search').addEventListener('input',()=>{filter();viewport.scrollTo(0,0);});$('#liked-only').onclick=()=>{likedOnly=!likedOnly;$('#liked-only').setAttribute('aria-pressed',String(likedOnly));if(likedOnly){$('#feedback-status').textContent='Checking all shared reviews…';all.forEach(c=>enqueue(c));}filter();};$('#reset-view').onclick=reset;$('#zoom-out').onclick=()=>setZoom(zoom-.1);$('#zoom-in').onclick=()=>setZoom(zoom+.1);$('#refresh-feedback').onclick=refresh;
 let drag=null;viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&!e.target.closest('button,a,input,.video-card')){drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');}});viewport.addEventListener('pointermove',e=>{if(drag){viewport.scrollLeft=drag.left-(e.clientX-drag.x);viewport.scrollTop=drag.top-(e.clientY-drag.y);}});function stop(){drag=null;viewport.classList.remove('dragging');}viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);viewport.addEventListener('wheel',e=>{if(e.shiftKey&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();viewport.scrollLeft+=e.deltaY;}},{passive:false});
 function hash(){const id=decodeURIComponent(location.hash.slice(1)).replace(/^card-/,'');if(byId.has(id)){if($('#card-'+id).hidden)reset();const c=$('#card-'+id);viewport.scrollTop=Math.max(0,c.offsetTop*zoom-25);viewport.scrollLeft=Math.max(0,c.offsetLeft*zoom-30);open(id,c.querySelector('button'));}}
 try{const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');if(cached&&typeof cached==='object')for(const c of all){const m=cached[c.id];if(m&&Number.isFinite(m.likes)&&Number.isFinite(m.comments)&&m.likes>=0&&m.comments>=0)metrics[c.id]=m;}}catch{}
 render();const observer=new IntersectionObserver(entries=>entries.filter(e=>e.isIntersecting).forEach(e=>enqueue(byId.get(e.target.dataset.id))),{root:viewport});document.querySelectorAll('.video-card').forEach(c=>observer.observe(c));
 $('#feedback-status').textContent='Shared reviews ready · Like and comment in the panel';hash();window.addEventListener('hashchange',hash);window.addEventListener('resize',size);
})();
