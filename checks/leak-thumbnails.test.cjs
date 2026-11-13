'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{},document:{querySelector:()=>null}};vm.createContext(context);
for(const file of ['canvas-data.js','canvas-new-pitches.js','canvas-guest-missions.js','canvas-thumbnail-refresh.js','canvas-gta-trapped.js','canvas-footage-thumbnails.js'])vm.runInContext(read(file),context);
const earlier=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards)));
vm.runInContext(read('canvas-leak-thumbnails.js'),context);
const cards=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards))),added=cards.filter(c=>c.leakRefresh),manifest=JSON.parse(read('leak-thumbnails/manifest.json'));
assert.equal(earlier.length,330);assert.equal(cards.length,350);assert.equal(added.length,20);assert.equal(manifest.entries.length,20);
assert.deepEqual(cards.filter(c=>!c.leakRefresh),earlier,'Preserve every earlier card, artwork path, title and feedback binding');
assert.equal(new Set(cards.map(c=>c.id)).size,350);
assert.equal(new Set(manifest.entries.map(c=>c.composition)).size,20,'Use distinct compositions');
assert.equal(new Set(manifest.entries.map(c=>c.sha256)).size,20,'Every image must be independent');
const feedback=require('../canvas-feedback-model.js');
assert.equal(new Set(cards.map(c=>JSON.stringify(feedback.target(c)))).size,350,'No shared review destinations');
const group=context.window.STOKES_CANVAS.groups.find(g=>g.id==='launch-gta-prank');assert.equal(group.cards.length,30);
for(const card of added){
 const entry=manifest.entries.find(e=>e.id===card.id);assert(entry);assert.equal(entry.ideaId,'idea-launch-gta-prank');assert.equal(card.brief,'episode-details.html#L03');
 assert.equal(entry.width*9,entry.height*16);assert(entry.prompt.length>500);assert(entry.viewerQuestion);
 assert.match(card.summary,/Staged-prank/);assert.match(card.comparison,/creative hypotheses/);
 assert.equal(feedback.target(card).term,'Stokes thumbnail '+card.id);
 for(const [file,hash] of [[entry.full,entry.sha256],[entry.preview,entry.preview_sha256],[entry.original,entry.original_sha256]]){
  const bytes=fs.readFileSync(path.join(root,file));assert(bytes.length>5000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash);
 }
}
const model=require('../canvas-collections-model.js'),ideas=model.catalog(context.window.STOKES_CANVAS.groups);
assert.equal(ideas.find(i=>i.id==='idea-launch-gta-prank').cards.length,30,'New thumbnails follow the existing video into saved collections');
vm.runInContext(read('canvas-leak-thumbnails.js'),context);assert.equal(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards).length,350);
assert.match(read('canvas.html'),/canvas-leak-thumbnails\.js/);assert.match(read('canvas.html'),/leak-thumbnails\/gta-leak-20-concepts\.zip/);
assert.match(read('video-briefs.js'),/leak-thumbnails\/manifest\.json/);
console.log('Passed: 20 distinct images, 350 independent feedback destinations, all 330 earlier cards preserved, hashes, brief links and collection routing.');
