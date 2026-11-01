(() => {
 'use strict';
 // Add a genre by running the scouting pipeline, dropping <id>.json into data-scouting/, and setting live: true.
 const GENRES = [
  { id: 'gta', label: 'GTA', live: true },
  { id: 'minecraft', label: 'Minecraft', live: false },
  { id: 'roblox', label: 'Roblox', live: false },
  { id: 'fortnite', label: 'Fortnite', live: false },
  { id: 'gaming', label: 'All gaming', live: false },
 ];
 const $ = (s) => document.querySelector(s);
 const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 const fmt = (n) => n == null ? '–' : n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n));
 const flag = (iso) => iso ? iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) : '';
 const longDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
 const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
 const state = { genre: 'gta', type: 'all', country: '', q: '', hideFlagged: false, sort: 'rank' };
 const cache = {};
 try { Object.assign(state, JSON.parse(localStorage.getItem('data-scouting') || '{}'), { q: '' }); } catch (e) { /* storage unavailable */ }
 const save = () => { try { localStorage.setItem('data-scouting', JSON.stringify({ type: state.type, hideFlagged: state.hideFlagged, sort: state.sort })); } catch (e) { /* storage unavailable */ } };

 function tabs() {
  $('#genres').innerHTML = GENRES.map((g) => `<button role="tab" type="button" id="tab-${g.id}" data-genre="${g.id}" aria-selected="${g.id === state.genre}" tabindex="${g.id === state.genre ? 0 : -1}">${esc(g.label)} <small>${g.live ? 'Top 100' : 'Next'}</small></button>`).join('');
 }

 function ranked(data) {
  return data.channels.filter((c) => !(state.hideFlagged && c.flag)).sort((a, b) => b.avg - a.avg).slice(0, 100).map((c, i) => ({ ...c, rank: i + 1 }));
 }

 function summary(list) {
  const top = list[0], last = list[list.length - 1];
  const p = list.filter((c) => c.type === 'personality').length, f = list.filter((c) => c.type === 'faceless').length, pend = list.length - p - f;
  const counts = {}, iso = {};
  list.forEach((c) => { const k = c.country || 'Unknown'; counts[k] = (counts[k] || 0) + 1; iso[k] = c.iso; });
  $('#summary').innerHTML = `
   <div class="stat"><span class="k">#1 · avg views per video</span><span class="v">${fmt(top.avg)}</span><span class="s">${esc(top.name)}</span></div>
   <div class="stat"><span class="k">#100 · cut-off</span><span class="v">${fmt(last.avg)}</span><span class="s">${esc(last.name)}</span></div>
   <div class="stat"><span class="k">Personality / faceless</span><span class="v">${p} <span style="color:var(--muted)">/</span> ${f}</span><span class="split" aria-hidden="true"><i style="width:${p}%;background:var(--person)"></i><i style="width:${f}%;background:var(--faceless)"></i></span><span class="s">${pend ? `${pend} not reviewed yet` : 'Real face shown · never shown'}</span></div>
   <div class="stat"><span class="k">Where they're based</span><span class="countries">${Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `<span>${flag(iso[k])} ${esc(k)} <b>${v}</b></span>`).join('')}</span></div>`;
 }

 function row(c) {
  const flagged = c.flag ? `<div class="note"><span class="pill warn" title="${(c.like_ratio * 100).toFixed(2)}% likes per view on sampled videos">Low engagement · ${(c.like_ratio * 100).toFixed(2)}% likes</span></div>` : '';
  const where = c.country_src === 'listed' ? 'listed on channel' : c.country_src === 'inferred' ? 'inferred · ' + esc(c.country_why || '') : 'not listed';
  const extra = `${Math.round(c.share * 100)}% ${esc(cache[state.genre].label)} videos`;
  return `<div class="row">
   <div class="col-rank"><span class="rank${c.rank <= 10 ? ' top' : ''}">${c.rank}</span></div>
   <div class="col-who who"><img src="data-scouting/avatars/${c.cid}.jpg" alt="" width="44" height="44" loading="lazy" onerror="this.style.visibility='hidden'"><div style="min-width:0"><a href="https://www.youtube.com/channel/${c.cid}" target="_blank" rel="noopener">${esc(c.name)}</a><small>${esc(c.handle || '')}${c.subs ? ' · ' + fmt(c.subs) + ' subscribers' : ''}</small>${flagged}</div></div>
   <div class="col-type"><span class="lbl">Type</span><span class="pill ${c.type}">${{ personality: 'Personality', faceless: 'Faceless', pending: 'Review pending' }[c.type]}</span>${c.note ? `<div class="note">${esc(c.note)}</div>` : ''}</div>
   <div class="col-ctry ctry"><span class="lbl">Based in</span>${flag(c.iso)} ${esc(c.country || 'Unknown')}<small>${where}</small></div>
   <div class="col-avg"><span class="lbl">Avg views per video</span><div class="big">${fmt(c.avg)}</div><div class="sub">median ${fmt(c.median)}</div></div>
   <div class="col-up"><span class="lbl">Long-form videos · 90 days</span><div class="num">${c.n} videos · ${fmt(c.total)} views</div><div class="sub">${extra}</div></div>
   <div class="col-top topv"><span class="lbl">Most-viewed video</span><a href="https://www.youtube.com/watch?v=${c.top.id}" target="_blank" rel="noopener">${esc(c.top.t)}</a><div class="sub">${fmt(c.top.v)} views</div></div>
  </div>`;
 }

 function method(d) {
  const start = shortDate(d.window_start), end = shortDate(d.scraped);
  $('#method-meta').textContent = `Scraped ${longDate(d.scraped)} · ${start} – ${end}`;
  $('#method-content').innerHTML = `<div class="principles">
   <div class="principle"><h3>Finding channels</h3><p>${d.searches.toLocaleString()} YouTube searches across ${esc(d.label)} queries in more than 30 languages, sorted by views for the past week, month and year, with extra searches limited to 4–20 minute and 20+ minute videos. ${d.candidates.toLocaleString()} channels with ${esc(d.label)} long-form videos in the results had their uploads pulled.</p></div>
   <div class="principle"><h3>Long-form only</h3><p>Only the channel's Videos tab counts: uploaded long-form videos from ${start} to ${end}. Shorts and livestream replays are excluded by YouTube's own split, not by a length guess. A channel needs at least 3 long-form videos in the window.</p></div>
   <div class="principle"><h3>What counts as a ${esc(d.label)} channel</h3><p>At least half of the channel's long-form videos in the window are ${esc(d.label)} content. ${d.qualified.toLocaleString()} channels qualified. Official publisher and press channels, music releases and channels that stuff "${esc(d.label)}" into titles of other games were removed by hand.</p></div>
   <div class="principle"><h3>Average views</h3><p>Total long-form views in the window divided by the number of long-form videos. Upload dates come from YouTube's relative dates ("2 months ago"), so the window edge can be off by a few days. Recent videos are still gaining views.</p></div>
   <div class="principle"><h3>Faceless or personality</h3><p>Personality means the creator's real face appears in thumbnails or on camera. Each channel was judged from six recent long-form thumbnails. Channels with a photo avatar but no face in thumbnails were checked against frames from inside three of their videos. Creators who are always masked or in costume count as faceless.</p></div>
   <div class="principle"><h3>Country</h3><p>The country each channel lists on its About page, which creators set themselves. Where none is listed, a country is inferred only from strong evidence such as the creator's own description or regional language, and is marked as inferred. Otherwise it shows as Unknown.</p></div>
   <div class="principle"><h3>Low-engagement flag</h3><p>Likes were sampled on three long-form videos per channel. Under 0.3% likes per view is flagged; most channels here sit between 0.5% and 7%. Millions of views with very few likes or comments points to promoted or inorganic views. Hide low engagement removes flagged channels and moves the next channels up.</p></div>
  </div>`;
  $('#downloads').innerHTML = `<a href="data-scouting/${d.genre}.csv" download>Download the top 100 (CSV) ↓</a><a href="data-scouting/${d.genre}.json">Raw data (JSON) ↗</a>`;
 }

 function render() {
  const g = GENRES.find((x) => x.id === state.genre);
  tabs();
  const live = !!g.live;
  ['#summary', '.controls', '.results-line', '.legend', '#method'].forEach((s) => { $(s).hidden = !live; });
  if (!live) $('#notice').hidden = true;
  if (!live) {
   $('#eyebrow').textContent = `DATA SCOUTING / ${g.label}`;
   $('#headline').innerHTML = `${esc(g.label)} is<br><span>next to scout.</span>`;
   $('#lede').textContent = `The same long-form ranking, faceless or personality call and country check will run for ${g.label} channels.`;
   $('#stat-number').textContent = '—'; $('#stat-label').textContent = 'not scraped yet'; $('#stat-note').textContent = '';
   $('#rows').innerHTML = `<div class="coming"><h2>${esc(g.label)} scouting is queued</h2><p>GTA is live now. Choose GTA to see the current ranking.</p></div>`;
   $('#downloads').innerHTML = '';
   return;
  }
  const d = cache[g.id];
  if (!d) { $('#result-count').textContent = 'Loading channels…'; return; }
  $('#eyebrow').textContent = `DATA SCOUTING / ${d.label} / ${longDate(d.scraped).toUpperCase()}`;
  $('#headline').innerHTML = `Top 100 ${esc(d.label)} channels.<br><span>Long-form only.</span>`;
  $('#lede').textContent = `Ranked by average views per long-form video posted in the last ${d.window_days} days (${shortDate(d.window_start)} – ${shortDate(d.scraped)}). Shorts and livestream replays are excluded. Each channel is marked faceless or personality and placed by country.`;
  const list = ranked(d);
  $('#stat-number').textContent = list.length;
  $('#stat-label').textContent = 'channels ranked';
  $('#stat-note').textContent = d.partial ? `${d.partial.checked.toLocaleString()} of ${d.partial.total.toLocaleString()} channels checked so far` : `from ${d.candidates.toLocaleString()} ${d.label} channels checked`;
  $('#notice').hidden = !d.partial;
  if (d.partial) $('#notice').innerHTML = `<b>Partial results.</b> ${d.partial.checked.toLocaleString()} of ${d.partial.total.toLocaleString()} candidate channels have been checked so far, so positions will shift when the rest are in. Channels marked Review pending haven't had the faceless or personality check yet, and low-engagement flags are still being sampled.`;
  summary(list);
  const sel = $('#country-filter');
  const countries = [...new Set(list.map((c) => c.country || 'Unknown'))].sort();
  if (!countries.includes(state.country)) state.country = '';
  sel.innerHTML = '<option value="">All countries</option>' + countries.map((c) => `<option${c === state.country ? ' selected' : ''}>${esc(c)}</option>`).join('');
  let view = list.filter((c) => (state.type === 'all' || c.type === state.type) && (!state.country || (c.country || 'Unknown') === state.country) &&
   (!state.q || (c.name + ' ' + (c.handle || '')).toLowerCase().includes(state.q.toLowerCase())));
  if (state.sort !== 'rank') view = view.slice().sort((a, b) => (b[state.sort] ?? 0) - (a[state.sort] ?? 0));
  $('#rows').innerHTML = view.length ? view.map(row).join('') : '<div class="empty">No channels match these filters.</div>';
  $('#result-count').textContent = `Showing ${view.length} of ${list.length}${state.hideFlagged ? ' · low-engagement channels hidden' : ''}`;
  document.querySelectorAll('#type-filter button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.type)));
  $('#hide-flagged').setAttribute('aria-pressed', String(state.hideFlagged));
  $('#sort').value = state.sort;
  method(d);
  save();
 }

 async function load(id) {
  if (cache[id]) return render();
  render();
  try {
   const r = await fetch(`data-scouting/${id}.json`, { cache: 'no-cache' });
   if (!r.ok) throw new Error(r.status);
   cache[id] = await r.json();
  } catch (e) {
   $('#result-count').textContent = 'Could not load the ranking. Reload the page to try again.';
   return;
  }
  render();
 }

 function select(id) {
  if (!GENRES.some((g) => g.id === id)) id = 'gta';
  state.genre = id;
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  load(id);
 }

 $('#genres').addEventListener('click', (e) => { const b = e.target.closest('[role=tab]'); if (b) select(b.dataset.genre); });
 $('#genres').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const i = GENRES.findIndex((g) => g.id === state.genre), n = GENRES[(i + (e.key === 'ArrowRight' ? 1 : GENRES.length - 1)) % GENRES.length];
  select(n.id); requestAnimationFrame(() => $(`#tab-${n.id}`).focus());
 });
 $('#type-filter').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.type = b.dataset.v; render(); } });
 $('#country-filter').addEventListener('change', (e) => { state.country = e.target.value; render(); });
 $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
 $('#search').addEventListener('input', (e) => { state.q = e.target.value; render(); });
 $('#hide-flagged').addEventListener('click', () => { state.hideFlagged = !state.hideFlagged; render(); });
 window.addEventListener('hashchange', () => select(location.hash.slice(1)));
 select(location.hash.slice(1) || 'gta');
})();
