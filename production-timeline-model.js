(function(root){
 'use strict';
 const DAY=86400000;
 const date=s=>new Date(s+'T00:00:00Z');
 const iso=d=>d.toISOString().slice(0,10);
 const add=(s,n)=>iso(new Date(date(s).getTime()+n*DAY));
 const diff=(a,b)=>Math.round((date(b)-date(a))/DAY);
 const between=(s,a,b)=>s>=a&&s<=b;
 function build(plan,inputs){
  const o={...plan.defaults,...inputs};
  for(const k of ['editStart','firstUpload','fakeUpload','gtaStart'])if(!/^\d{4}-\d{2}-\d{2}$/.test(o[k])||!Number.isFinite(+date(o[k]))||iso(date(o[k]))!==o[k])throw Error('Choose a valid date for every field.');
  const editDays=diff(o.editStart,o.firstUpload);
  if(editDays<1||editDays>60)throw Error('Video 1 upload must be 1–60 days after its edit starts.');
  const captureDays=Number(o.captureDays);
  if(!Number.isInteger(captureDays)||captureDays<3||captureDays>30)throw Error('Use a room planning hold of 3–30 days.');
  if(o.gtaStart<plan.officialRelease)throw Error('GTA VI capture must start on or after the official November 19 release.');
  o.captureDays=captureDays;
  const phases=[],releases=[],videos=plan.videos.map(v=>({...v}));
  const push=(video,dept,start,days,label,evidence,handoff,extra={})=>phases.push({id:video+'-'+dept+'-'+phases.length,video,dept,start,end:add(start,days-1),days,label,evidence,handoff,projected:true,...extra});
  function standard(v,editStart,upload,isFirst){
   const shoot=add(editStart,-1),production=add(shoot,-10),creative=add(production,-7);
   push(v,'creative',creative,7,'Writing · 7d',isFirst?'Reconstructed from the reported one-week writing duration. Exact historical dates are unconfirmed.':'Projected backward from the upload target using Video 1’s duration.','Locked treatment, opening, rules, beat sheet and packaging direction.');
   push(v,'production',production,10,'Prepare · 10d',isFirst?'Reconstructed from about 1½ weeks of production, rounded to 10 calendar days.':'Projected production preparation; readiness has not been reported.','Playable/build or prank setup tested; cast, props, capture and run-of-show ready.');
   push(v,'recording',shoot,1,'●',isFirst?'One recording day reported; this specific date is inferred from the Monday edit start.':'Proposed recording date; confirm cast and production readiness.','Verified gameplay + camera/audio recordings, producer log and backups.');
   push(v,'post',editStart,editDays,'Edit + review · '+editDays+'d',isFirst?(editStart===plan.defaults.editStart?'Edit start interpreted as Monday, October 26. End date is a target, not a reported completion.':'Scenario dates differ from the reported baseline. This is an adjusted projection, not a new historical record.'):'Projected using the same '+editDays+'-day edit/review allocation as Video 1.','Approved final master, audio, thumbnail/title, captions and upload checks.',{projected:true,reportedStart:isFirst&&editStart===plan.defaults.editStart});
   releases.push({id:v+'-upload',video:v,date:upload,label:'Upload target',dept:'release'});
  }
  standard('v1',o.editStart,o.firstUpload,true);
  standard('v2',add(o.fakeUpload,-editDays),o.fakeUpload,false);
  const roomEnd=add(o.gtaStart,captureDays-1),mainPost=add(roomEnd,1),mainUpload=add(mainPost,editDays);
  push('v3','creative',add(o.gtaStart,-24),7,'Room + guests · 7d','Projected: reuse the one-week creative allocation. Guest mission details stay flexible until the game is available.','Room challenge outline, guest block structures, booking briefs and alternate activities.');
  push('v3','production',add(o.gtaStart,-17),10,'Build + book · 10d','Projected: 10 days for room, capture system and guest logistics; availability is unconfirmed.','Multicamera/isolated-audio test, recording redundancy, media handoff and guest windows.');
  push('v3','production',add(o.gtaStart,-7),7,'Rehearse / buffer','Additional pre-launch buffer, not another reported production duration.','Dry-run routing, media verification, shift coverage and launch/preload readiness.');
  push('v3','recording',o.gtaStart,captureDays,'Room capture · '+captureDays+'d','Illustrative room hold only. Game completion time is unknown; extend the hold and main-film release together.','Complete main story and guest blocks, with routine rests and verified recording coverage.');
  push('v3','post',o.gtaStart,captureDays,'Daily assembly','Proposed overlapping work; requires a main-film editor separate from guest editors.','Daily scene assemblies and a continuity log, while the room continues recording.',{stream:'main-assembly'});
  push('v3','post',mainPost,editDays,'Main film · '+editDays+'d','Conservative extrapolation: preserve the full Video 1 post window after capture. Earlier assembly may help, but no reduction is assumed.','Final challenge narrative, finishing pass, approvals and main-film upload.',{stream:'main-final'});
  releases.push({id:'v3-upload',video:'v3',date:mainUpload,label:'Main-film target',dept:'release'});
  const guests=plan.guests.map((g,i)=>{
   const record=add(o.gtaStart,i),end=add(record,1),publish=add(record,2);
   const guest={...g,record,editStart:record,editEnd:end,publish};
   push('v3','guest',record,2,g.name+' · guest edit','Stretch plan: '+g.name+' has a complete capture block, two calendar days for guest post and a review/release day. Appearance and mission availability remain unconfirmed.','Standalone episode has a setup, mission attempt, result and approved package.',{stream:g.id,guest:g.id});
   releases.push({id:g.id+'-upload',video:'v3',date:publish,label:g.name+' guest target',dept:'release',guest:g.id});
   return guest;
  });
  const allDates=[...phases.flatMap(p=>[p.start,p.end]),...releases.map(r=>r.date)];
  let start=allDates.reduce((a,b)=>a<b?a:b),end=allDates.reduce((a,b)=>a>b?a:b);
  start=add(start,-((date(start).getUTCDay()+6)%7));end=add(end,6-((date(end).getUTCDay()+6)%7));
  const days=Array.from({length:diff(start,end)+1},(_,i)=>add(start,i));
  const conflicts=[];
  for(const day of days){const active=phases.filter(p=>['post','guest'].includes(p.dept)&&between(day,p.start,p.end));if(active.length>1)conflicts.push({date:day,streams:active.length,labels:active.map(p=>p.label)});}
  const maxStreams=Math.max(1,...conflicts.map(c=>c.streams));
  return {inputs:o,editDays,videos,phases,releases,guests,start,end,days,roomEnd,mainUpload,mainPost,maxStreams,conflicts,fakeFlex:add(o.fakeUpload,1)};
 }
 const api={date,iso,add,diff,between,build};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StokesTimeline=api;
})(typeof window!=='undefined'?window:this);
