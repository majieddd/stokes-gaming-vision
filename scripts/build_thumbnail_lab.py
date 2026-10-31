"""Build the thumbnail gallery and non-destructive canvas extension."""
import argparse,json,pathlib

root=pathlib.Path(__file__).resolve().parents[1]
partial=argparse.ArgumentParser();partial.add_argument('--partial',action='store_true');args=partial.parse_args()
plan=json.loads((root/'thumbnail-lab/creative-directions.json').read_text())
records={r['id']:r for line in (root/'thumbnail-lab/generated-assets.jsonl').read_text().splitlines() if (r:=json.loads(line))}
if not args.partial and len(records)!=130:raise SystemExit(f'Expected 130 generated thumbnails; have {len(records)}')
briefs=json.loads((root/'video-briefs.json').read_text());by_brief={b['id']:b for b in briefs['briefs']}
research=json.loads((root/'thumbnail-lab/research.json').read_text())
catalogue={r['id']:{**r,'channel':c['name'],'sourceUrl':c['source']} for c in research['channels'] for r in c['selected']}
reference_map={
 'pitch-cities':['Dy06SXknr_g','-5bcG6tZKx8'],
 'pitch-car':['6EtuOTq5TmM','nopEs-K4ExM'],
 'pitch-rooms':['-5bcG6tZKx8','cfFtBojH_-Y','xN8ENrfE-TY'],
 'pitch-hunters':['Caxv8tLATnc','DWCl2dN6hpg'],
 'pitch-disasters':['kbRvNp8kwA0','h8VE9_aHd94'],
 'pitch-life':['TQmwAmCsj_I','PyLGTmWz37U'],
 'pitch-experiments':['SCrO3kS1upU','nopEs-K4ExM'],
 'pitch-killer':['FO9kMeIQI7M','qTim1iIQbwA'],
 'pitch-course':['nopEs-K4ExM','nM21hVqvhmk'],
 'pitch-steal':['gVE2t-LRK-s','6EtuOTq5TmM'],
 'pitch-prison':['nM21hVqvhmk','xN8ENrfE-TY'],
 'pitch-minecraft-halo':['SCrO3kS1upU','DWCl2dN6hpg','zPbrkmdcTfo'],
 'pitch-civilizations':['zPbrkmdcTfo','Dy06SXknr_g']}
entries=[];cards=[]
for e in plan['entries']:
 if e['id'] not in records:continue
 r=records[e['id']]
 refs=[catalogue[i] for i in reference_map[e['ideaId']] if i in catalogue]
 entry={**{k:v for k,v in e.items() if k not in ['prompt','file']},'full':r['full'],'preview':r['preview'],'width':r['width'],'height':r['height'],'sha256':r['sha256'],'sourceSha256':r['sourceSha256'],'referenceIds':[x['id'] for x in refs]}
 entries.append(entry)
 cards.append({'id':e['id'],'title':e['title'],'fixedTitle':False,'variant':f"NEW {e['option']:02} · {e['name']}",'preview':r['preview'],'full':r['full'],'alt':e['scene'],'summary':e['scene'],'meta':'New thumbnail · '+e['composition'],'formatName':e['title'],'brief':'episode-details.html#'+e['ideaId'],'channel':'Stokes Twins' if e['ideaId'] in ['pitch-minecraft-halo','pitch-civilizations'] else 'Stokes Twins Gaming','composition':e['composition'],'comparison':e['name']+'. '+e['scene'],'references':[{'title':x['title'],'channel':x['channel'],'url':x['url'],'lift':x['lift'],'standing':'Oct 29 public catalogue','observation':'Visual format reference. Public views and nearby-upload scores do not isolate thumbnail effectiveness.'} for x in refs],'shortlisted':False,'artworkStatus':'AI-generated thumbnail concept · October 30, 2026','thumbnailRefresh':True,'ideaId':e['ideaId'],'sourceGroup':e['sourceGroup']})
manifest={'version':1,'date':'2026-10-30','total':len(entries),'expectedTotal':130,'ideaCount':13,'measurementNote':research['measurementNote'],'references':catalogue,'entries':entries}
(root/'thumbnail-lab/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
js='(()=>{\n const cards='+json.dumps(cards,ensure_ascii=False,separators=(',',':'))+';\n for(const card of cards){const g=window.STOKES_CANVAS.groups.find(g=>g.id===card.sourceGroup);if(!g)throw Error("Unknown thumbnail group "+card.sourceGroup);if(!g.cards.some(c=>c.id===card.id))g.cards.push(card);(window.STOKES_BRIEF_MAP??={})[card.id]=card.ideaId;}\n for(const g of window.STOKES_CANVAS.groups)g.label=g.cards.length+" thumbnail options";\n})();\n'
(root/'canvas-thumbnail-refresh.js').write_text(js)
provenance={'date':'2026-10-30','tool':'built-in image_gen','method':'One independent base generation per option, with targeted revisions where needed. Reference image used for twin likeness and broad thumbnail craft, not scene copying. JPEG and WebP encoding preserve the complete generated composition.','identityReference':'https://www.youtube.com/watch?v=6EtuOTq5TmM','prompts':'creative-directions.json','research':'research.json','assets':[{k:e[k] for k in ['id','full','preview','width','height','sha256','sourceSha256']} for e in entries]}
(root/'thumbnail-lab/provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
print(f'Built {len(entries)} new thumbnail cards across {len(set(e["ideaId"] for e in entries))} ideas')
