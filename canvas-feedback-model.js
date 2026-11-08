(function(root){
 'use strict';
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
  const likes=discussion.reactions?.THUMBS_UP?.count??0,reactions=discussion.reactionCount??likes,comments=discussion.totalCommentCount,replies=discussion.totalReplyCount??0;
  if(![likes,reactions,comments,replies].every(n=>Number.isSafeInteger(n)&&n>=0))return null;
  return {likes,reactions,comments:comments+replies};
 }
 function isUncreated(card,error){return target(card).mapping==='specific'&&typeof error==='string'&&error.includes('Discussion not found');}
 const api={target,matches,metrics,isUncreated};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StokesFeedbackModel=api;
})(typeof window!=='undefined'?window:this);
