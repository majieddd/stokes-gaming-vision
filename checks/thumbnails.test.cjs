'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const plan=JSON.parse(read('thumbnail-lab/creative-directions.json')),m=JSON.parse(read('thumbnail-lab/manifest.json'));
assert.equal(plan.entries.length,130);assert.equal(m.entries.length,130);assert.equal(m.total,130);
const context={window:{}};vm.createContext(context);for(const p of ['canvas-data.js','canvas-new-pitches.js','canvas-brief-map.js'])vm.runInContext(read(p),context);
const original=JSON.stringify(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards));
vm.runInContext(read('canvas-thumbnail-refresh.js'),context);
const cards=context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards),newCards=cards.filter(c=>c.thumbnailRefresh);
assert.equal(cards.length,298);assert.equal(newCards.length,130);assert.equal(new Set(cards.map(c=>c.id)).size,298);
assert.equal(JSON.stringify(cards.filter(c=>!c.thumbnailRefresh)),original,'Every original card and shared review mapping is preserved');
const model=require('../canvas-collections-model.js'),ideas=model.catalog(context.window.STOKES_CANVAS.groups);assert.equal(model.seeds.length,13);
const hashes=new Set();for(const idea of model.seeds){const e=m.entries.filter(e=>e.ideaId===idea.id);assert.equal(e.length,10,idea.id);assert.equal(new Set(e.map(x=>x.name)).size,10);assert.equal(new Set(e.map(x=>x.composition)).size,10);assert.deepEqual(e.map(x=>x.option),Array.from({length:10},(_,i)=>i+1));assert.equal(ideas.find(i=>i.id===idea.id).cards.filter(c=>c.thumbnailRefresh).length,10);}
for(const e of m.entries){assert.ok(e.referenceIds.length>0,e.id);assert.ok(Math.abs(e.width/e.height-16/9)<.01);for(const p of [e.full,e.preview])assert.ok(fs.statSync(path.join(root,p)).size>10000,p);const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,e.full))).digest('hex');assert.equal(hash,e.sha256);assert.ok(!hashes.has(hash),'Duplicate generated asset');hashes.add(hash);assert.equal(context.window.STOKES_BRIEF_MAP[e.id],e.ideaId);assert.ok(plan.entries.find(p=>p.id===e.id)?.prompt);}
assert.match(read('canvas.html'),/canvas-thumbnail-refresh\.js/);assert.match(read('canvas.js'),/scope==='refreshed'/);assert.match(read('video-briefs.js'),/thumbnail-lab\/manifest\.json/);
console.log('Passed: 130 unique images, 10 directions for all 13 pitches, 298 routes, original art/titles/reviews preserved.');
