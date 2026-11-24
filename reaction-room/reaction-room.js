'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => {
    if (typeof value !== 'string') return '';
    if (/^\.\/(assets|references)\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')) return value;
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  };
  function validate(raw) {
    if (!raw || raw.schema !== 1 || !Array.isArray(raw.entries) || !raw.entries.length || raw.entries.length > 300) throw new Error('Invalid library');
    const seen = new Set();
    const entries = raw.entries.map(e => {
      if (!Number.isInteger(e.id) || seen.has(e.id) || !e.title || !Array.isArray(e.videos) || !e.videos.length || e.videos.length > 12) throw new Error('Invalid entry');
      seen.add(e.id);
      const videos = e.videos.map(v => {
        const url = safeUrl(v.url);
        if (!url || !['youtube','video'].includes(v.kind)) throw new Error('Invalid video');
        if (v.kind === 'youtube' && !/^[a-zA-Z0-9_-]{11}$/.test(v.youtubeId)) throw new Error('Invalid YouTube source');
        return {...v, url, sourceUrl:safeUrl(v.sourceUrl), poster:safeUrl(v.poster), original:safeUrl(v.original)};
      });
      return {...e, videos, reference:safeUrl(e.reference), cue:safeUrl(e.cue)};
    });
    return {...raw,entries};
  }
  let catalog = validate(JSON.parse($('initial-catalog').textContent));
  let scope = 'all', selectedId = null, shot = 0, returnFocus = null;
  let filtered = [];
  const total = entries => entries.reduce((n,e) => n+e.videos.length,0);
  const timecode = value => `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
  const talentPill = name => `<span class="talent-pill ${escape(name.toLowerCase())}"><span class="talent-initial">${escape(name[0])}</span>${escape(name)}</span>`;
  function render() {
    const entries = catalog.entries;
    const q = $('search').value.trim().toLowerCase();
    filtered = entries.filter(e => (scope === 'all' || e.collection === scope) && ($('talent').value === 'all' || e.talent === $('talent').value) && ($('category').value === 'all' || e.type === $('category').value) && `${e.title} ${e.talent} ${e.id} ${e.videos.map(v=>v.label).join(' ')}`.toLowerCase().includes(q));
    if ($('sort').value === 'title') filtered.sort((a,b)=>a.title.localeCompare(b.title));
    if ($('sort').value === 'talent') filtered.sort((a,b)=>a.talent.localeCompare(b.talent));
    const n = total(entries);
    $('video-count').textContent = String(n).padStart(2,'0');
    $('nav-count').textContent = n;
    $('entry-count').textContent = `${entries.length} filming entries`;
    $('all-count').textContent = n;
    $('new-count').textContent = total(entries.filter(e=>e.collection==='new'));
    $('cuts-count').textContent = total(entries.filter(e=>e.collection==='cuts'));
    $('list-title').textContent = scope === 'new' ? 'New shots' : scope === 'cuts' ? 'Prepared cuts' : 'All footage';
    $('list-description').textContent = scope === 'new' ? 'The latest source videos supplied for your tests.' : scope === 'cuts' ? 'Gameplay excerpts prepared for reaction filming.' : 'Every video is included here, with related shots grouped by test.';
    document.querySelectorAll('[data-scope]').forEach(b=>{b.classList.toggle('active',b.dataset.scope===scope);if(b.getAttribute('role')==='tab')b.setAttribute('aria-selected',String(b.dataset.scope===scope));});
    $('talent-nav').innerHTML = ['Alex','Alan','Kat','Tanner'].map(t=>`<button data-talent="${t}" class="${$('talent').value===t?'selected':''}">${talentPill(t)}<span>${entries.filter(e=>e.talent===t).length}</span></button>`).join('');
    $('rows').innerHTML = filtered.map(e=>{
      const seconds = e.videos.reduce((n,v)=>n+(v.duration||0),0);
      return `<article class="footage-row"><div class="row-main"><button class="row-thumbnail" data-open="${e.id}" aria-label="Watch ${escape(e.title)}"><img src="${escape(e.videos[0].poster)}" alt="${escape(e.title)} gameplay preview" loading="lazy"><span class="thumb-action" aria-hidden="true">▶</span></button><div class="row-title"><button data-open="${e.id}">${escape(e.title)}</button><p><span>Entry ${e.id}</span><span>·</span><span>${e.videos.length} ${e.videos.length===1?'video':'videos'}</span>${seconds?`<span>·</span><span>${timecode(seconds)}</span>`:''}</p><span class="mobile-entry-meta">${escape(e.talent)} · ${escape(e.type)}</span></div></div><div class="row-talent">${talentPill(e.talent)}</div><span class="row-category">${escape(e.type)}</span><span class="status-tag ready">${e.collection==='new'?'Source video':'Clean cut'}</span><button class="row-watch button watch-button" data-open="${e.id}">Watch</button></article>`;
    }).join('');
    $('empty').hidden = !!filtered.length;
    $('result-count').textContent = `${filtered.length} ${filtered.length===1?'entry':'entries'} · ${total(filtered)} videos`;
    $('updated').textContent = `Updated ${catalog.updatedLabel}`;
  }
  function updateLink() {
    const url = new URL(location.href);
    if (selectedId) { url.searchParams.set('clip',selectedId); if(shot)url.searchParams.set('video',shot+1);else url.searchParams.delete('video'); }
    else { url.searchParams.delete('clip');url.searchParams.delete('video'); }
    history.replaceState(null,'',url);
  }
  function renderPlayer() {
    const e = catalog.entries.find(e=>e.id===selectedId);
    if (!e) return;
    shot = Math.min(Math.max(0,shot),e.videos.length-1);
    const v = e.videos[shot];
    document.querySelector('.keyboard-hint').hidden = v.kind !== 'video';
    $('player-title').textContent = e.title;
    $('player-eyebrow').textContent = `REACTION FOOTAGE · ENTRY ${e.id}`;
    $('video-selector').hidden = e.videos.length < 2;
    $('video-selector').innerHTML = e.videos.length>1 ? `<p>Choose a video</p><div>${e.videos.map((v,i)=>`<button data-shot="${i}" aria-pressed="${shot===i}">${escape(v.label)}</button>`).join('')}</div>` : '';
    $('video-stage').replaceChildren();
    $('player-error').hidden = true;
    if (v.kind==='youtube') {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${v.youtubeId}`;
      frame.title = `${e.title}: ${v.label}`;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allow = 'autoplay; fullscreen; picture-in-picture';frame.allowFullscreen = true;
      $('video-stage').append(frame);
    } else {
      const video = document.createElement('video');
      video.src = v.url;video.poster = v.poster;video.controls = true;video.playsInline = true;video.preload = 'metadata';
      video.setAttribute('aria-label',`${e.title}: ${v.label}`);
      video.addEventListener('error',()=>{$('player-error').hidden=false;$('player-error').innerHTML=`This player could not load the clip. <a href="${escape(v.original||v.url)}" target="_blank" rel="noopener noreferrer">Open the original file</a>`;});
      $('video-stage').append(video);
    }
    $('brief-meta').innerHTML = `${talentPill(e.talent)}<span class="category-tag">${escape(e.type)}</span>`;
    $('talent-intro').textContent = e.intro;
    $('watch-for').textContent = e.watchFor;
    $('credits').innerHTML = `<span>SOURCE & CREDITS</span><strong>${escape(v.creator)}</strong><p>${escape(e.summary)}</p>${e.coverage?`<p class="evidence-note">${escape(e.coverage)}</p>`:''}<a href="${escape(v.sourceUrl||v.url)}" target="_blank" rel="noopener noreferrer">View source gameplay</a>${e.cue?`<a href="${escape(e.cue)}" target="_blank">Read cue sheet</a>`:''}`;
    $('reference-link').href = e.reference;
    $('reference-image').src = e.reference;
    $('reference-image').alt = `${e.title}: photo reference and circled map`;
    $('open-original').href = v.original||v.url;
    $('open-original').textContent = v.kind==='youtube'?'Open on YouTube':'Open original file';
    $('chapters').hidden = !e.chapters?.length;
    $('chapters').innerHTML = e.chapters?.length?`<div class="chapter-heading"><h3>Jump to a moment</h3><span>All cues stay off the video</span></div><div class="chapters">${e.chapters.map(c=>`<button data-cue="${c.time}"><span>${timecode(c.time)}</span>${escape(c.label)}</button>`).join('')}</div>`:'';
    const queue = filtered.length ? filtered : catalog.entries;
    $('next-video').hidden = shot===e.videos.length-1 && queue.findIndex(x=>x.id===e.id)===queue.length-1;
    updateLink();
  }
  function open(id,index=0) {
    if(!catalog.entries.some(e=>e.id===id))return;
    if(!$('player').open)returnFocus=document.activeElement;
    selectedId=id;shot=Number.isInteger(index)&&index>=0?index:0;renderPlayer();
    if(!$('player').open)$('player').showModal();
    document.body.style.overflow='hidden';
  }
  function close() {
    $('video-stage').querySelector('video')?.pause();
    $('video-stage').replaceChildren();$('player').close();
    selectedId=null;shot=0;document.body.style.overflow='';updateLink();returnFocus?.focus();
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.scope){scope=b.dataset.scope;render();}
    if(b.dataset.talent){$('talent').value=$('talent').value===b.dataset.talent?'all':b.dataset.talent;render();}
    if(b.dataset.open)open(Number(b.dataset.open));
    if(b.dataset.shot!==undefined){shot=Number(b.dataset.shot);renderPlayer();}
    if(b.dataset.cue!==undefined){const v=$('video-stage').querySelector('video');if(v){v.currentTime=Number(b.dataset.cue);v.play().catch(()=>{});}}
  });
  ['search','talent','category','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
  $('clear-filters').addEventListener('click',()=>{$('search').value='';$('talent').value='all';$('category').value='all';render();});
  $('close-player').addEventListener('click',close);
  $('player').addEventListener('cancel',e=>{e.preventDefault();close();});
  $('player').addEventListener('click',e=>{if(e.target===$('player'))close();});
  $('next-video').addEventListener('click',()=>{
    const e=catalog.entries.find(e=>e.id===selectedId);if(!e)return;
    if(shot+1<e.videos.length){shot++;renderPlayer();return;}
    const queue=filtered.length?filtered:catalog.entries;const next=queue[queue.findIndex(x=>x.id===selectedId)+1];if(next)open(next.id);
  });
  $('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('copy-link').textContent='Link copied';setTimeout(()=>{$('copy-link').textContent='Copy clip link';},2000);}catch{$('copy-link').textContent='Copy the address bar link';}});
  document.addEventListener('keydown',e=>{
    if(!$('player').open||/^(INPUT|TEXTAREA|SELECT|BUTTON|A|VIDEO)$/.test(e.target.tagName))return;
    const video=$('video-stage').querySelector('video');if(!video)return;
    if(e.key===' '){e.preventDefault();if(video.paused)video.play().catch(()=>{});else video.pause();}
    if(e.key.toLowerCase()==='j')video.currentTime=Math.max(0,video.currentTime-10);
    if(e.key.toLowerCase()==='l')video.currentTime=Math.min(video.duration||Infinity,video.currentTime+10);
  });
  $('refresh').addEventListener('click',async()=>{
    $('refresh').disabled=true;$('library-state').textContent='Checking for new footage…';
    try{
      const url=new URL('./catalog.json',location.href);url.searchParams.set('refresh',String(Date.now()));
      const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error();
      const next=validate(await response.json());catalog=next;render();
      if(selectedId)renderPlayer();$('library-state').textContent=`Library up to date · ${total(catalog.entries)} videos`;
    }catch{$('library-state').textContent='Could not check for updates. Your loaded footage is still available.';}
    finally{$('refresh').disabled=false;}
  });
  render();
  const params=new URL(location.href).searchParams;
  if(params.has('clip'))open(Number(params.get('clip')),Math.max(0,Number(params.get('video')||1)-1));
})();
