'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),context={window:{},document:{querySelector:()=>null}};vm.createContext(context);
for(const file of ['canvas-data.js','canvas-new-pitches.js','canvas-guest-missions.js','canvas-thumbnail-refresh.js','canvas-gta-trapped.js'])vm.runInContext(read(file),context);
const original=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards)));
vm.runInContext(read('canvas-footage-thumbnails.js'),context);
const cards=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards))),added=cards.filter(c=>c.footageReview),manifest=JSON.parse(read('footage-thumbnails/manifest.json'));
assert.equal(original.length,311);assert.equal(cards.length,330);assert.equal(added.length,19);assert.equal(manifest.concepts.length,19);
assert.deepEqual(cards.filter(c=>!c.footageReview),original,'Earlier cards, titles, artwork and feedback identities are unchanged');
assert.equal(new Set(cards.map(c=>c.id)).size,330);
assert.equal(context.window.STOKES_CANVAS.groups.find(g=>g.id==='multiverse').cards.length,50);
for(const card of added){
 assert(card.summary.includes('Reviewed cut'));assert(card.comparison.includes('creative hypotheses'));
 const entry=manifest.concepts.find(c=>c.id===card.id);assert(entry);assert(entry.prompt.length>500);assert(entry.timecode);
 for(const file of [card.full,card.preview])assert(fs.statSync(path.join(root,file)).size>5000,file);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,card.full))).digest('hex'),entry.jpeg_sha256);
 assert.equal(require('../canvas-feedback-model.js').target(card).mapping,'specific');
}
assert(!/drive\.google\.com\/file\/d\/|next\.frame\.io\/share\//.test(read('footage-thumbnails/manifest.json')),'Private source share links stay out of the public artifact');
vm.runInContext(read('canvas-footage-thumbnails.js'),context);assert.equal(context.window.STOKES_CANVAS.groups.flatMap(g=>g.cards).length,330,'Loading the addition twice must not duplicate thumbnails');
assert.match(read('canvas.html'),/canvas-footage-thumbnails\.js/);
console.log('Passed: 19 distinct rendered concepts, timestamps, image hashes, 311 earlier cards preserved, automatic feedback and private-source exclusion.');
