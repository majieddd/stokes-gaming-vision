const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const briefs=read('video-briefs.json'),byId=new Map(briefs.briefs.map(b=>[b.id,b]));
assert.equal(briefs.briefs.length,27);assert.equal(Object.keys(briefs.variants).length,100);
assert.equal(briefs.briefs.filter(b=>b.group==='pitch').length,13);
const context={window:{}};vm.createContext(context);for(const f of ['canvas-data.js','canvas-new-pitches.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const cards=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards)));
assert.equal(cards.length,168);assert.equal(new Set(cards.map(c=>c.id)).size,168);
for(const c of cards){assert(byId.has(briefs.cardToBrief[c.id]),c.id);const b=byId.get(briefs.cardToBrief[c.id]);assert(b.artwork.some(a=>a.id===c.id&&a.full===c.full&&a.preview===c.preview));assert(b.titleOptions.includes(c.title));}
for(const b of briefs.briefs){assert.equal(b.intro.length,3);assert.equal(b.how.length,3);assert(b.refs.length>=2);assert.equal(b.packaging.length,3);assert(b.turn.length===3&&b.payoff.length===3);for(const beat of b.intro){assert(beat.line&&beat.show&&beat.speaker);assert(!/avoid:|earn the count|compatibility|capture stack/i.test(beat.line+' '+beat.show));}for(const r of b.refs){const s=briefs.references[r.source];assert(s&&s.url.startsWith('https://www.youtube.com/watch?v='));assert(s.views>0);assert(s.observedAt);}}
for(const [id,v]of Object.entries(briefs.variants)){assert(byId.has(v.brief));assert.equal(v.id,id);assert.equal(v.intro.length,3);assert(briefs.cardToBrief[id]===v.brief);}
const first=byId.get('idea-multiverse');assert(first.promise.includes('pickle dunk'));assert(first.intro[0].line.includes('world’s greatest'));assert(!first.promise.includes('Godzilla'));
assert.equal(briefs.aliases['episode-MV01'],'idea-multiverse');
assert.equal(byId.get('pitch-minecraft-halo').channel,'Stokes Twins · main channel');assert.equal(byId.get('pitch-civilizations').channel,'Stokes Twins · main channel');
for(const file of ['launch-plan.json','retention-cases.json','index.html','NEW_CHANNEL_LAUNCH_VISION_DOC.md'])assert(!fs.readFileSync(path.join(root,file),'utf8').includes('A decorative crowd without real pursuit does not earn the count.'));
for(const p of read('brief-reference-updates.json'))assert.equal(p.lift,null);
console.log('Passed: 27 concise briefs, 100 openings, all 168 card routes, original title/art preservation, legacy anchors, source metrics and updated first-video story.');
