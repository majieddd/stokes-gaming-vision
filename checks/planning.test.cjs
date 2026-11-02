const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const T=require(path.join(root,'production-timeline-model.js'));
const C=require(path.join(root,'canvas-collections-model.js'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'production-timeline-plan.json'),'utf8'));
const s=T.build(plan);
assert.equal(s.editDays,12);
assert.equal(s.mainUpload,'2026-12-04');
assert.deepEqual(s.guests.map(g=>g.publish),['2026-11-21','2026-11-22','2026-11-23']);
assert.equal(s.maxStreams,3);
assert.equal(s.phases.find(p=>p.video==='v1'&&p.dept==='creative').start,'2026-10-08');
assert.equal(s.phases.find(p=>p.video==='v2'&&p.dept==='recording').start,'2026-11-01');
for(const p of s.phases)assert.equal(T.diff(p.start,p.end)+1,p.days);
for(const id of ['v1','v2']){
 const phases=s.phases.filter(p=>p.video===id);
 for(let i=1;i<phases.length;i++)assert.equal(T.add(phases[i-1].end,1),phases[i].start);
 assert.equal(T.add(phases.at(-1).end,1),s.releases.find(r=>r.video===id).date);
}
assert.equal(T.build(plan,{captureDays:5}).mainUpload,'2026-12-06');
assert.equal(T.build(plan,{captureDays:5}).guests[0].publish,s.guests[0].publish);
assert.equal(T.build(plan,{fakeUpload:'2026-11-15'}).phases.find(p=>p.video==='v2'&&p.dept==='recording').start,'2026-11-02');
assert.equal(T.build(plan,{firstUpload:'2026-11-08'}).editDays,13);
for(const input of [{gtaStart:'2026-11-18'},{captureDays:2},{captureDays:3.5},{editStart:'2026-02-30'},{firstUpload:'2026-10-26'}])assert.throws(()=>T.build(plan,input));
const context={window:{}};
vm.createContext(context);for(const file of ['canvas-data.js','canvas-new-pitches.js','canvas-guest-missions.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const data=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS));
const ideas=C.catalog(data.groups),state=C.defaults(ideas),original=data.groups.flatMap(g=>g.cards),catalog=ideas.flatMap(i=>i.cards);
assert.equal(state.collections[0].name,'Approved ideas');assert.equal(state.collections[0].ideaIds.length,14);
assert.equal(catalog.length,original.length);assert.equal(new Set(catalog.map(c=>c.id)).size,original.length);
const identity=cards=>cards.map(c=>[c.id,c.full,c.preview,c.discussion,c.discussionId]).sort();
assert.deepEqual(identity(catalog),identity(original));
for(const idea of ideas)for(const group of idea.sourceGroups){for(const c of group.cards)assert(idea.titles.includes(c.title));for(const t of group.titleOptions||[])assert(idea.titles.includes(t));}
assert(ideas.find(i=>i.id==='pitch-disasters').titles.includes('Every minute another disaster happens in GTA'));
state.collections.push({id:'custom-test',name:'Ready to film',ideaIds:[state.collections[0].ideaIds.shift()]});
state.titles['pitch-disasters']=['New disaster title'];state.selectedTitles['pitch-disasters']='New disaster title';
const loaded=C.validate(JSON.parse(JSON.stringify(state)),ideas);
assert.deepEqual(loaded.collections.map(c=>c.id),['pitch','all']);
assert(loaded.collections.find(c=>c.id==='all').ideaIds.includes('pitch-gta-guests'));
assert(!loaded.collections.find(c=>c.id==='pitch').ideaIds.includes('pitch-gta-guests'));
assert.equal(loaded.selectedTitles['pitch-disasters'],'New disaster title');
assert.equal(new Set(loaded.collections.flatMap(c=>c.ideaIds)).size,ideas.length);
const recovered=C.validate({version:1,collections:[]},ideas);
assert.equal(recovered.collections.find(c=>c.id==='all').ideaIds.length,ideas.length);
assert.equal(recovered.collections.find(c=>c.id==='pitch').ideaIds.length,C.seeds.length);
assert.throws(()=>C.validate({version:3,collections:[]},ideas));
assert.throws(()=>C.validate({version:1,collections:[{id:'same',name:'A',ideaIds:[]},{id:'same',name:'B',ideaIds:[]}]},ideas));
console.log('Passed: timeline dependencies, launch gating, rolling edits, asset/review preservation, title retention and collection backup round-trip.');

const oldState=JSON.parse(JSON.stringify(C.defaults(ideas)));for(const col of oldState.collections)col.ideaIds=col.ideaIds.filter(id=>!['pitch-minecraft-halo','pitch-civilizations'].includes(id));const upgraded=C.validate(oldState,ideas);assert(upgraded.collections.find(c=>c.id==='pitch').ideaIds.includes('pitch-minecraft-halo'));assert(upgraded.collections.find(c=>c.id==='pitch').ideaIds.includes('pitch-civilizations'));

// Previous browser saves and backups lose obsolete groups, while approved order
// and title choices survive. Returning an idea to All ideas survives a reload.
const legacy={version:1,collections:[{id:'pitch',name:'Videos to pitch',ideaIds:['pitch-car','pitch-disasters']},{id:'backlog',name:'Idea bank',ideaIds:ideas.filter(i=>!['pitch-car','pitch-disasters','pitch-cities'].includes(i.id)).map(i=>i.id)},{id:'custom-ready',name:'Ready to film',ideaIds:['pitch-cities']}],titles:{'pitch-disasters':['Saved title']},selectedTitles:{'pitch-disasters':'Saved title'}};
const migrated=C.validate(legacy,ideas);
assert.deepEqual(migrated.collections.map(c=>c.name),['Approved ideas','All ideas']);
assert.deepEqual(migrated.collections[0].ideaIds,['pitch-car','pitch-disasters']);
assert.equal(migrated.collections[1].ideaIds.length,ideas.length);
assert.equal(migrated.selectedTitles['pitch-disasters'],'Saved title');
assert.deepEqual(C.validate(JSON.parse(JSON.stringify(migrated)),ideas),migrated);
migrated.collections[0].ideaIds.shift();
assert.deepEqual(C.validate(migrated,ideas).collections[0].ideaIds,['pitch-disasters']);
assert.equal(C.validate(C.validate(legacy,ideas),ideas).version,2);
console.log('Passed: two collection views, legacy cleanup, approved membership/order and saved title migration.');
