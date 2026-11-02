'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const read=p=>fs.readFileSync(p,'utf8'),plan=JSON.parse(read('gta-guest-missions.json')),briefs=JSON.parse(read('video-briefs.json'));
function canvas(previous=false){const context={window:{}};vm.createContext(context);for(const file of ['canvas-data.js','canvas-new-pitches.js','canvas-brief-map.js','canvas-thumbnail-refresh.js'])vm.runInContext(previous?cp.execFileSync('git',['show','88a2c60cfe61840c35167a7f753be12468ad21c1:'+file],{encoding:'utf8',maxBuffer:8e6}):read(file),context);if(!previous)vm.runInContext(read('canvas-guest-missions.js'),context);return JSON.parse(JSON.stringify(context.window.STOKES_CANVAS.groups));}
const before=canvas(true).flatMap(g=>g.cards),groups=canvas(),after=groups.flatMap(g=>g.cards);
assert.equal(before.length,298);assert.equal(after.length,306);
assert.deepEqual(after.filter(c=>!c.guestMission),before,'All existing card titles, artwork and review identities remain intact');
const cards=after.filter(c=>c.guestMission);
assert.equal(cards.length,8);assert.equal(new Set(plan.entries.map(e=>e.guest)).size,8);
const hashes=new Set();
for(const entry of plan.entries){
 const card=cards.find(c=>c.id===entry.card);assert(card);assert.equal(card.title,entry.title);assert.equal(card.briefVariant,entry.card);assert(card.retainEpisodeTitle);
 assert.equal(briefs.cardToBrief[card.id],plan.ideaId);assert.equal(briefs.variants[card.id].brief,plan.ideaId);
 for(const file of [card.full,card.preview])assert(fs.statSync(file).size>10000,file);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(card.full)).digest('hex');assert(!hashes.has(hash));hashes.add(hash);
 assert(!card.discussion,'New art must not reuse unrelated shared-review discussions');
}
for(const asset of plan.recoveredOriginals){const current=fs.readFileSync(asset.asset),previous=cp.execFileSync('git',['show','88a2c60cfe61840c35167a7f753be12468ad21c1:'+asset.asset],{maxBuffer:4e6});assert(current.equals(previous),'Recovered original changed: '+asset.asset);}
const C=require('../canvas-collections-model.js'),ideas=C.catalog(groups),defaults=C.defaults(ideas);
const prior=JSON.parse(JSON.stringify(defaults));for(const col of prior.collections)col.ideaIds=col.ideaIds.filter(id=>id!==plan.ideaId);
prior.collections.find(c=>c.id==='pitch').ideaIds=prior.collections.find(c=>c.id==='pitch').ideaIds.filter(id=>id!=='pitch-cities');prior.collections.push({id:'custom-ready',name:'Ready to film',ideaIds:['pitch-cities']});prior.titles['pitch-car']=['My saved race title'];prior.selectedTitles['pitch-car']='My saved race title';
const migrated=C.validate(prior,ideas);assert(migrated.collections.find(c=>c.id==='pitch').ideaIds.includes(plan.ideaId));assert(!migrated.collections.some(c=>c.id==='custom-ready'));assert(migrated.collections.find(c=>c.id==='all').ideaIds.includes('pitch-cities'));assert(!migrated.collections.find(c=>c.id==='pitch').ideaIds.includes('pitch-cities'));assert.equal(migrated.selectedTitles['pitch-car'],'My saved race title');
assert.equal(ideas.find(i=>i.id===plan.ideaId).cards.length,8);
assert.match(read('canvas.html'),/canvas-guest-missions\.js/);
console.log('Passed: 8 distinct guest packages, earlier 298 cards/reviews and 3 recovered originals preserved, variant routes and saved-collection migration.');
