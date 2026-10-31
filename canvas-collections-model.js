(function(root){
 'use strict';
 const seeds=[
  {id:'pitch-cities',title:'I Played GTA in Every GTA City',groups:['launch-gta-cities','10']},
  {id:'pitch-car',title:'Win This Race, Keep Your Car',groups:['launch-keep-car']},
  {id:'pitch-rooms',title:'I Built Secret Rooms in Every Video Game',groups:['launch-secret-rooms','03','04']},
  {id:'pitch-hunters',title:'I Escaped 100 Hunters in GTA',groups:['02']},
  {id:'pitch-disasters',title:'We Survived GTA’s Deadliest Disasters',groups:['05'],titles:['Every minute another disaster happens in GTA']},
  {id:'pitch-life',title:'I Let GTA Control My Life for 24 Hours',groups:['07']},
  {id:'pitch-experiments',title:'Can 10,000 Cars Stop a Train in GTA?',groups:['09'],note:'Experiments'},
  {id:'pitch-killer',title:'100 Players Versus One Secret Killer',groups:['11'],note:'100-player pitch with new crowd and hidden-killer concepts; earlier whodunit art retained.'},
  {id:'pitch-course',title:'We Built the Most Impossible Obstacle Course in GTA',groups:['14']},
  {id:'pitch-steal',title:'Anything You Steal in GTA You Keep',groups:['15','17'],note:'New theft-specific options plus the related original prize concepts.'},
  {id:'pitch-prison',title:'I Created the World’s Most Secure Prison in GTA',groups:['16'],note:'Build-focused pitch; the original prison-escape concepts and titles remain available.'},
  {id:'pitch-minecraft-halo',title:'100 Minecrafters vs 100 Halo Players',groups:['new-minecraft-halo'],note:'Stokes Twins main-channel pitch · gaming communities compete in a large team challenge.'},
  {id:'pitch-civilizations',title:'I Simulated Every Video Game Civilization',groups:['new-civilizations'],note:'Stokes Twins main-channel pitch · top players build competing game civilizations.'}
 ];
 function catalog(groups){const claimed=new Set(seeds.flatMap(s=>s.groups)),byId=new Map(groups.map(g=>[g.id,g]));return [...seeds,...groups.filter(g=>!claimed.has(g.id)).map(g=>({id:'idea-'+g.id,title:g.name,groups:[g.id]}))].map(s=>{const source=s.groups.map(id=>byId.get(id)).filter(Boolean);return {...s,sourceGroups:source,cards:source.flatMap(g=>g.cards),titles:[...new Set([s.title,...(s.titles||[]),...source.flatMap(g=>[g.name,...(g.titleOptions||[]),...g.cards.map(c=>c.title)])])]};});}
 function defaults(ideas){return {version:1,updatedAt:null,collections:[{id:'pitch',name:'Videos to pitch',ideaIds:seeds.map(s=>s.id)},{id:'backlog',name:'Idea bank',ideaIds:ideas.filter(i=>!seeds.some(s=>s.id===i.id)).map(i=>i.id)}],titles:{},selectedTitles:{}};}
 function validate(raw,ideas){if(!raw||raw.version!==1||!Array.isArray(raw.collections)||raw.collections.length>100)throw Error('Choose a version 1 Stokes collection backup.');const known=new Map(ideas.map(i=>[i.id,i])),seen=new Set(),ids=new Set();const collections=raw.collections.map(c=>{if(typeof c.id!=='string'||!/^[a-z0-9-]{1,100}$/.test(c.id)||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>80||!Array.isArray(c.ideaIds))throw Error('The collection backup has invalid names or IDs.');ids.add(c.id);const ideaIds=[];for(const id of c.ideaIds){if(known.has(id)&&!seen.has(id)){seen.add(id);ideaIds.push(id);}}return {id:c.id,name:c.name.trim(),ideaIds};});if(!ids.has('pitch'))collections.unshift({id:'pitch',name:'Videos to pitch',ideaIds:[]});if(!ids.has('backlog'))collections.push({id:'backlog',name:'Idea bank',ideaIds:[]});for(const idea of ideas.filter(i=>!seen.has(i.id))){const target=seeds.some(s=>s.id===idea.id)?'pitch':'backlog';collections.find(c=>c.id===target).ideaIds.push(idea.id);}const titles={},selectedTitles={};for(const i of ideas){const t=raw.titles?.[i.id];if(Array.isArray(t))titles[i.id]=[...new Set(t.filter(t=>typeof t==='string'&&t.trim()&&t.length<=240).slice(0,100).map(t=>t.trim()))];const selected=raw.selectedTitles?.[i.id];if(typeof selected==='string'&&[...i.titles,...(titles[i.id]||[])].includes(selected))selectedTitles[i.id]=selected;}return {version:1,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:null,collections,titles,selectedTitles};}
 const api={seeds,catalog,defaults,validate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StokesCollectionsModel=api;
})(typeof window!=='undefined'?window:this);
