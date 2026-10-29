"""Build concise creative briefs from the preserved canvas and reference snapshots."""
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
read = lambda name: json.loads((ROOT / name).read_text())
write = lambda name, data: (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
code = """
const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);
for(const f of ['canvas-data.js','canvas-new-pitches.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const model=require('./canvas-collections-model.js');
console.log(JSON.stringify(model.catalog(c.window.STOKES_CANVAS.groups)));
"""
catalog = json.loads(subprocess.run(['node', '-e', code], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
content = read('video-briefs-content.json')
sources = {}
for source in read('sources.json'):
    perf = source.get('performance', {})
    sources[source['id']] = dict(id=source['id'], title=source['title'], channel=source['channel'], url=source['url'],
        views=perf.get('views'), lift=perf.get('lift'), publishedAt=source.get('published_at'),
        observedAt=source.get('observed_at'), metricBasis='Public catalogue snapshot', sourceUrl=source.get('source_url'))
for source in read('brief-reference-updates.json'):
    sources[source['id']] = dict(id=source['id'], title=source['title'], channel=source['channel'], url=source['url'],
        views=source.get('views'), lift=source.get('lift'), publishedAt=source.get('published_at'),
        observedAt=source['retrieved_at'], metricBasis='Indexed YouTube snapshot; retrieved', sourceUrl=source['url'])

launch_ids = {'idea-multiverse', 'idea-launch-gta-prank', 'idea-launch-gta6'}
aliases = {'episode-MV01': 'idea-multiverse', 'episode-L03': 'idea-launch-gta-prank', 'episode-L01': 'idea-launch-gta6',
           'MV01': 'idea-multiverse', 'L03': 'idea-launch-gta-prank', 'L01': 'idea-launch-gta6'}
briefs = []
card_map = {}
for idea in catalog:
    spec = content[idea['id']]
    entry = dict(id=idea['id'], title=idea['title'], group='pitch' if idea['id'].startswith('pitch-') else 'launch' if idea['id'] in launch_ids else 'bank',
        titleOptions=idea['titles'], sourceGroups=idea['groups'],
        artwork=[{k: c.get(k) for k in ['id', 'title', 'preview', 'full', 'alt']} for c in idea['cards']])
    entry.update(spec)
    entry.setdefault('channel', 'Stokes Twins Gaming')
    entry['intro'] = [dict(time=t, speaker=beat[0], line=beat[1], show=beat[2]) for t, beat in zip(['0–5s', '5–15s', '15–30s'], spec['intro'])]
    entry['refs'] = [dict(source=id, take=take) for id, take in spec['refs']]
    for card in idea['cards']:
        card_map[card['id']] = idea['id']
    briefs.append(entry)
guest_plan = read('production-timeline-plan.json')
for key, asset_id in [('guest-howie', 'howie-bank'), ('guest-kai', 'kai-getaway'), ('guest-room', 'guest-room')]:
    spec = content[key]
    guest = next(g for g in guest_plan['guests'] if g['id'] == asset_id)
    entry = dict(id=key, titleOptions=[spec['title']], sourceGroups=[], artwork=[dict(id=asset_id, title=spec['title'], preview=guest['asset'], full=guest['asset'], alt=guest['alt'])], **spec)
    entry['intro'] = [dict(time=t, speaker=beat[0], line=beat[1], show=beat[2]) for t, beat in zip(['0–5s', '5–15s', '15–30s'], spec['intro'])]
    entry['refs'] = [dict(source=id, take=take) for id, take in spec['refs']]
    briefs.append(entry)

# Original idea-bank cards remain individual title/thumbnail options. Each gets a
# concise spoken opening and its existing objective, escalation and payoff.
start_lines = {
 '01': 'First test: put them side by side.', '02': 'They’re coming. We need to move.',
 '03': 'Your first room is hidden somewhere right here.', '04': 'Your build time starts now.',
 '05': 'The first disaster is already here. Move!', '06': 'Let’s test the first myth.',
 '07': 'Let’s see what it chooses first.', '08': 'Come outside. I’ve got something to show you.',
 '09': 'Here comes the first test.', '10': 'First stop. Let’s start the challenge.',
 '11': 'Everybody freeze. Where were you when this happened?', '12': 'Let’s start with something small.',
 '13': 'Our first job is already waiting.', '14': 'Who’s taking the first attempt?',
 '15': 'You can keep this—or risk it on the next challenge.', '16': 'Your time starts now.',
 '17': 'Show me what you’re going to build.', '18': 'Three, two, one—go!',
 '19': 'Let’s start with this one.', '20': 'Who’s trying it first?'
}
variants = {}
plan = read('launch-plan.json')
for idea in plan['ideas']:
    id, format_id = idea['id'], idea['format_id']
    title = idea['title'].rstrip('!?.') + ('?' if idea['title'].endswith('?') else '.')
    objective = idea['objective'].strip().rstrip('.')
    goal_line = 'We have one goal: ' + objective[0].lower() + objective[1:] + '.'
    intro = [dict(time='0–5s', speaker='ALEX', line=title, show=idea['image_scene']),
             dict(time='5–15s', speaker='ALAN', line=goal_line, show='Show the goal and the result the players are trying to reach.'),
             dict(time='15–30s', speaker='ALEX', line=start_lines[format_id], show='Begin the first attempt and stay with its result.')]
    variants[id] = dict(id=id, brief=card_map[id], title=idea['title'], promise=idea['summary'], intro=intro,
        how=[idea['objective'], idea['escalation'], idea['payoff']],
        turn=['ALAN', 'That changes the plan.', idea['first_complication']],
        payoff=['ALEX', 'Let’s see how this ends.', idea['payoff']])
    idea['intro'] = [dict(start=a, end=b, speaker=beat['speaker'], line=beat['line'], show=beat['show'],
                         beat=f"{beat['speaker']}: “{beat['line']}” Show: {beat['show']}") for (a,b),beat in zip([(0,5),(5,15),(15,30)], intro)]
    idea['creative_brief'] = 'episode-details.html?variant=' + id + '#' + card_map[id]

used = {r['source'] for b in briefs for r in b['refs']}
assert all(id in sources for id in used)
out = dict(schemaVersion=2, updated='2026-10-29', voice='Short spoken lines, visible actions, one clear objective and an earned payoff.',
    measurementNote='Reference views and source-reported nearby-upload multiples are public snapshots, not CTR or measured intro retention. They support the format ingredients, not a guaranteed result.',
    scriptNote='Script lines are proposed. Say the payoff lines when the corresponding result occurs.',
    briefs=briefs, variants=variants, cardToBrief=card_map, aliases=aliases, references={id:sources[id] for id in sorted(used)})
write('video-briefs.json', out)
write('canvas-brief-map.json', card_map)
(ROOT / 'canvas-brief-map.js').write_text('window.STOKES_BRIEF_MAP=' + json.dumps(card_map, ensure_ascii=False) + ';\n')

# Retain the original research and metrics, while upgrading its intro fields and
# pointing readers to the concise, current briefs.
plan['creative_brief_version'] = 2
plan['creative_briefs'] = 'video-briefs.json'
plan['editorial_style'] = out['voice']
plan['new_pitches'] = [b for b in briefs if b['id'] in ['pitch-minecraft-halo', 'pitch-civilizations']]
def clean(value):
    if isinstance(value, dict):
        return {k:clean(v) for k,v in value.items() if k != 'avoid'}
    if isinstance(value, list): return [clean(v) for v in value]
    if isinstance(value, str):
        return value.replace('A decorative crowd without real pursuit does not earn the count.', 'Open on the hunters closing in, then show the twins’ escape goal.')
    return value
write('launch-plan.json', clean(plan))
retention = clean(read('retention-cases.json'))
retention['editorial_note'] = 'Positive creative directions are retained as reference notes. Use video-briefs.json for the current spoken openings.'
write('retention-cases.json', retention)

# The earlier three-episode download now mirrors the current, concise launch briefs.
write('episode-treatments.json', dict(schema_version=2, updated='2026-10-29', scope='Three launch videos',
    episodes=[b for b in briefs if b['id'] in launch_ids], creative_briefs='video-briefs.json'))
lines = ['# Stokes video briefs', '', 'Updated October 29, 2026. Proposed script lines and linked public reference snapshots.', '']
for b in briefs:
    lines += ['## '+b['title'], '', b['promise'], '', '### How it works', ''] + ['- '+s for s in b['how']]
    lines += ['', '### Opening 30 seconds', '']
    for beat in b['intro']: lines += ['**'+beat['time']+' · '+beat['speaker']+':** “'+beat['line']+'”', '', 'Show: '+beat['show'], '']
    lines += ['### Turn', '', b['turn'][0]+': “'+b['turn'][1]+'”', '', b['turn'][2], '', '### Payoff', '', b['payoff'][0]+': “'+b['payoff'][1]+'”', '', b['payoff'][2], '', '### Packaging', ''] + ['- '+s for s in b['packaging']]
    for r in b['refs']:
        s=sources[r['source']]
        metric=f"{s['views']:,.0f} public views" if s.get('views') is not None else 'Views not captured'
        if s.get('lift') is not None: metric+=f" · {s['lift']}× nearby-upload median (source-reported)"
        lines += ['', '['+s['channel']+' · '+s['title']+']('+s['url']+') — '+metric+'. '+r['take']]
    lines += ['', '---', '']
(ROOT/'episode-details.md').write_text('\n'.join(lines))

# Update the existing vision page in place; retain its research tables, cards,
# thumbnails and title variants, and route the main Brief action to the new hub.
index = (ROOT/'index.html').read_text()
for id, v in variants.items():
    pattern=r'(<article\b[^>]*\bid="idea-'+re.escape(id)+r'"[^>]*>)(.*?)(</article>)'
    def update_article(match):
        body=match.group(2)
        opening='<ol class="intro">'+''.join('<li><b>'+beat['time']+'</b><span><strong>'+beat['speaker']+': “'+html.escape(beat['line'])+'”</strong><br/>Show: '+html.escape(beat['show'])+'</span></li>' for beat in v['intro'])+'</ol>'
        body=re.sub(r'<ol class="intro">.*?</ol>',lambda _:opening,body,count=1,flags=re.S)
        if 'episode-details.html?variant='+id not in body:
            body=body.replace('<div class="idea-meta">','<div class="idea-meta"><a href="episode-details.html?variant='+id+'#'+card_map[id]+'">Video brief ↗</a>',1)
        return match.group(1)+body+match.group(3)
    index, n=re.subn(pattern,update_article,index,count=1,flags=re.S)
    assert n==1, 'Missing idea article '+id
index=index.replace('Detailed launch briefs','Video briefs · scripts &amp; references')
index=index.replace('A decorative crowd without real pursuit does not earn the count.', 'Open on the hunters closing in, then show the twins’ escape goal.')
(ROOT/'index.html').write_text(index)
master=ROOT/'NEW_CHANNEL_LAUNCH_VISION_DOC.md'
md=master.read_text()
if not md.startswith('> Current video briefs:'):
    md='> Current video briefs: [spoken openings, story and packaging references](episode-details.html). Updated October 29, 2026. The reference research below is retained.\n\n'+md
md=md.replace('A decorative crowd without real pursuit does not earn the count.', 'Open on the hunters closing in, then show the twins’ escape goal.')
master.write_text(md)
print(f'Built {len(briefs)} briefs, {len(variants)} title-specific openings, {len(card_map)} card routes and {len(used)} linked reference snapshots.')
