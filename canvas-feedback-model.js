(function(root){
 'use strict';
 const reactionTypes=[
  {key:'THUMBS_UP',emoji:'👍',label:'Thumbs up'},
  {key:'THUMBS_DOWN',emoji:'👎',label:'Thumbs down'},
  {key:'LAUGH',emoji:'😄',label:'Laugh'},
  {key:'HOORAY',emoji:'🎉',label:'Celebration'},
  {key:'CONFUSED',emoji:'😕',label:'Confused'},
  {key:'HEART',emoji:'❤️',label:'Heart'},
  {key:'ROCKET',emoji:'🚀',label:'Rocket'},
  {key:'EYES',emoji:'👀',label:'Eyes'},
 ];
 const validCount=n=>Number.isSafeInteger(n)&&n>=0;
 function target(card){
  if(Number.isSafeInteger(card.discussion)&&card.discussion>0)return {mapping:'number',number:card.discussion,term:String(card.discussion)};
  if(typeof card.id!=='string'||!card.id)throw Error('A thumbnail needs a stable ID for shared feedback.');
  return {mapping:'specific',number:0,term:'Stokes thumbnail '+card.id};
 }
 function matches(card,discussion,repo,resolvedId){
  if(!discussion||typeof discussion.id!=='string'||!discussion.id||discussion.repository?.nameWithOwner!==repo)return false;
  const prefix='https://github.com/'+repo+'/discussions/';
  if(typeof discussion.url!=='string'||!discussion.url.startsWith(prefix)||!(/^[1-9]\d*$/.test(discussion.url.slice(prefix.length))))return false;
  if(card.discussionId&&discussion.id!==card.discussionId)return false;
  if(card.discussion&&discussion.url!==prefix+card.discussion)return false;
  if(resolvedId&&discussion.id!==resolvedId)return false;
  // Unassigned thumbnails are resolved only from their own immutable, strict-
  // matching iframe. The caller must verify event.origin and event.source.
  return true;
 }
 function metrics(discussion){
  if(discussion.reactions!=null&&(typeof discussion.reactions!=='object'||Array.isArray(discussion.reactions)))return null;
  const reactionCounts=discussion.reactions?Object.fromEntries(reactionTypes.map(r=>[r.key,discussion.reactions[r.key]?.count??0])):null;
  if(reactionCounts&&!Object.values(reactionCounts).every(validCount))return null;
  const likes=reactionCounts?.THUMBS_UP??0,reactions=discussion.reactionCount??Object.values(reactionCounts||{}).reduce((a,b)=>a+b,0),comments=discussion.totalCommentCount,replies=discussion.totalReplyCount??0;
  if(![likes,reactions,comments,replies].every(validCount))return null;
  return {likes,reactions,reactionCounts,comments:comments+replies};
 }
 function reactionPreview(metric,fallback=0){
  const value=metric?.reactions??metric?.likes,total=validCount(value)?value:fallback;
  // Keep GitHub's familiar ordering, and show only emojis actually present.
  const items=reactionTypes.map(r=>({...r,count:metric?.reactionCounts?.[r.key]??0})).filter(r=>validCount(r.count)&&r.count>0);
  const text=items.length?items.map(r=>r.emoji+' '+r.count).join(' · '):'Reactions '+total;
  const description=items.length?items.map(r=>r.label+': '+r.count).join(', ')+' ('+total+' total)':text;
  return {items,total,text,description};
 }
 function isUncreated(card,error){return target(card).mapping==='specific'&&typeof error==='string'&&error.includes('Discussion not found');}
 const api={target,matches,metrics,reactionPreview,isUncreated};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StokesFeedbackModel=api;
})(typeof window!=='undefined'?window:this);

