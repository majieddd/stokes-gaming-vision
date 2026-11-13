'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),F=require(path.join(root,'canvas-feedback-model.js'));
const context={window:{},document:{querySelector:()=>null}};vm.createContext(context);
for(const name of ['canvas-data.js','canvas-new-pitches.js','canvas-guest-missions.js','canvas-thumbnail-refresh.js','canvas-gta-trapped.js','canvas-footage-thumbnails.js','canvas-leak-thumbnails.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context);
const data=JSON.parse(JSON.stringify(context.window.STOKES_CANVAS)),cards=data.groups.flatMap(g=>g.cards),existing=cards.filter(c=>c.discussion),newCards=cards.filter(c=>!c.discussion);
assert.equal(cards.length,350);assert.equal(existing.length,166);assert.equal(newCards.length,184);
assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
assert.equal(new Set(cards.map(c=>{const t=F.target(c);return t.mapping+':'+t.term;})).size,cards.length,'Every thumbnail has an independent feedback destination');
for(const card of cards){
 const before=JSON.stringify(card),target=F.target(card);
 assert.deepEqual(F.target({...card,title:'An edited title',collection:'Another collection'}),target,'Title or collection changes must preserve feedback');
 assert.equal(JSON.stringify(card),before,'Resolving feedback must preserve artwork and review IDs');
 if(card.discussion){assert.equal(target.mapping,'number');assert.equal(target.number,card.discussion);}
 else{assert.equal(target.mapping,'specific');assert.equal(target.number,0);assert.equal(target.term,'Stokes thumbnail '+card.id);}
}
assert.equal(F.target({id:'a-future-thumbnail'}).mapping,'specific');
assert.notEqual(F.target({id:'001'}).term,F.target({id:'001-alt'}).term);
const card=existing[0],discussion={id:card.discussionId,url:'https://github.com/'+data.repo+'/discussions/'+card.discussion,repository:{nameWithOwner:data.repo},reactionCount:4,totalCommentCount:2,totalReplyCount:3,reactions:{THUMBS_UP:{count:1,viewerHasReacted:false},HEART:{count:3,viewerHasReacted:true}}};
assert(F.matches(card,discussion,data.repo));
assert(!F.matches(card,{...discussion,id:'another-thread'},data.repo));
assert(!F.matches(card,{...discussion,url:discussion.url+'0'},data.repo));
assert(!F.matches(card,{...discussion,repository:{nameWithOwner:'another/repo'}},data.repo));
const emojiTypes={THUMBS_UP:'👍',THUMBS_DOWN:'👎',LAUGH:'😄',HOORAY:'🎉',CONFUSED:'😕',HEART:'❤️',ROCKET:'🚀',EYES:'👀'};
const breakdown=Object.fromEntries(Object.keys(emojiTypes).map(key=>[key,key==='THUMBS_UP'?1:key==='HEART'?3:0]));
assert.deepEqual(F.metrics(discussion),{likes:1,reactions:4,reactionCounts:breakdown,comments:5},'Preserve every emoji count as well as totals and comment replies');
const mixed=F.reactionPreview(F.metrics(discussion));
assert.equal(mixed.text,'👍 1 · ❤️ 3');assert.match(mixed.description,/Thumbs up: 1, Heart: 3/);
for(const [key,emoji] of Object.entries(emojiTypes)){
 const single=F.metrics({...discussion,reactionCount:2,reactions:{[key]:{count:2}}}),preview=F.reactionPreview(single);
 assert.equal(preview.text,emoji+' 2','Single reactions must preview their own emoji: '+key);
 assert.equal(preview.items.length,1);assert.equal(preview.items[0].key,key);
 assert.deepEqual(F.reactionPreview(JSON.parse(JSON.stringify(single))),preview,'Cached breakdowns retain their emoji');
}
const everyEmoji=F.metrics({...discussion,reactionCount:8,reactions:Object.fromEntries(Object.keys(emojiTypes).map(key=>[key,{count:1}]))});
assert.equal(F.reactionPreview(everyEmoji).items.length,8,'Mixed feedback must not hide any reaction type');
assert.equal(F.reactionPreview(F.metrics({...discussion,reactionCount:0,reactions:{}})).text,'Reactions 0','Removing the last reaction clears old emoji previews');
assert.equal(F.reactionPreview({likes:0,reactions:4,comments:0}).text,'Reactions 4','Legacy totals never masquerade as thumbs-up reactions');
assert.equal(F.reactionPreview(null,'…').text,'Reactions …');
assert.equal(F.metrics({...discussion,reactionCount:undefined}).reactions,4,'Fallback totals include non-thumbs-up emoji');
for(const count of [-1,1.5,NaN,'2'])assert.equal(F.metrics({...discussion,reactions:{HEART:{count}}}),null,'Reject invalid per-emoji counts');
assert.equal(F.metrics({...discussion,reactionCount:-1}),null);
assert.equal(F.metrics({...discussion,totalCommentCount:NaN}),null);
const fresh=newCards[0];assert(F.matches(fresh,discussion,data.repo));
assert(!F.matches(fresh,discussion,data.repo,'a-previously-resolved-ID'),'Resolved threads reject late metadata from other cards');
assert(!F.matches(fresh,{...discussion,url:'https://example.com/discussions/1'},data.repo));
assert(F.isUncreated(fresh,'Discussion not found.'));
assert(!F.isUncreated(card,'Discussion not found.'));
assert(!F.isUncreated(fresh,'API rate limit exceeded'));
console.log('Passed: all 350 feedback destinations, 166 existing threads, 184 automatic threads, stable thumbnail identity, metadata isolation, all-emoji previews, removal and cache restoration.');

