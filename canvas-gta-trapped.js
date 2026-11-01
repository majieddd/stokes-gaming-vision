(() => {
 'use strict';
 const data = window.STOKES_CANVAS;
 const group = data.groups.find(g => g.id === 'launch-gta6');
 if (!group) throw new Error('Missing GTA completion idea');
 const cards = [
  {
    "id": "L01-K",
    "title": "Trapped Until We Beat GTA 6",
    "originalTitle": "Trapped Until We Beat GTA 6",
    "fixedTitle": false,
    "variant": "L01-K · Locked inside the gaming room",
    "preview": "gta-trapped-thumbnails/locked-gaming-room-preview.webp",
    "full": "gta-trapped-thumbnails/locked-gaming-room.png",
    "alt": "The twins play GTA in a messy enclosed gaming room beside a red door secured with a large bolt and padlock.",
    "summary": "The twins play GTA in a messy enclosed gaming room beside a red door secured with a large bolt and padlock.",
    "meta": "New trapped-room concept · Cutaway room + locked exit",
    "channel": "Stokes Twins Gaming",
    "formatName": "I Survived 100 Hours in GTA",
    "brief": "episode-details.html#idea-launch-gta6",
    "composition": "Cutaway room + locked exit",
    "comparison": "Locked inside the gaming room",
    "references": [],
    "shortlisted": false,
    "artworkStatus": "AI-generated thumbnail concept · November 1, 2026",
    "trappedRoomConcept": true,
    "updatedPlan": true,
    "launchSlot": 3,
    "collectionKind": "episode",
    "sharedReviewPending": true
  },
  {
    "id": "L01-L",
    "title": "Trapped Inside GTA 6 Until We Beat It",
    "originalTitle": "Trapped Inside GTA 6 Until We Beat It",
    "fixedTitle": false,
    "variant": "L01-L · Hour 1 vs 100 hours — faces",
    "preview": "gta-trapped-thumbnails/hour-1-vs-100-faces-preview.webp",
    "full": "gta-trapped-thumbnails/hour-1-vs-100-faces.png",
    "alt": "Vertical split: a cheerful, clean-shaven twin at HOUR 1; the other twin at 100 HOURS with deep eye bags, patchy stubble, messy hair and a cluttered gaming room.",
    "summary": "Vertical split: a cheerful, clean-shaven twin at HOUR 1; the other twin at 100 HOURS with deep eye bags, patchy stubble, messy hair and a cluttered gaming room.",
    "meta": "New trapped-room concept · Vertical split + facial transformation",
    "channel": "Stokes Twins Gaming",
    "formatName": "I Survived 100 Hours in GTA",
    "brief": "episode-details.html#idea-launch-gta6",
    "composition": "Vertical split + facial transformation",
    "comparison": "Hour 1 vs 100 hours — faces",
    "references": [],
    "shortlisted": false,
    "artworkStatus": "AI-generated thumbnail concept · November 1, 2026",
    "trappedRoomConcept": true,
    "updatedPlan": true,
    "launchSlot": 3,
    "collectionKind": "episode",
    "sharedReviewPending": true
  },
  {
    "id": "L01-M",
    "title": "Trapped Until We Beat GTA 6",
    "originalTitle": "Trapped Until We Beat GTA 6",
    "fixedTitle": false,
    "variant": "L01-M · The door will not open",
    "preview": "gta-trapped-thumbnails/no-exit-door-preview.webp",
    "full": "gta-trapped-thumbnails/no-exit-door.png",
    "alt": "One twin pulls at the bolted red exit while the other keeps playing GTA amid pizza boxes, cans and wrappers.",
    "summary": "One twin pulls at the bolted red exit while the other keeps playing GTA amid pizza boxes, cans and wrappers.",
    "meta": "New trapped-room concept · Locked door foreground + gameplay depth",
    "channel": "Stokes Twins Gaming",
    "formatName": "I Survived 100 Hours in GTA",
    "brief": "episode-details.html#idea-launch-gta6",
    "composition": "Locked door foreground + gameplay depth",
    "comparison": "The door will not open",
    "references": [],
    "shortlisted": false,
    "artworkStatus": "AI-generated thumbnail concept · November 1, 2026",
    "trappedRoomConcept": true,
    "updatedPlan": true,
    "launchSlot": 3,
    "collectionKind": "episode",
    "sharedReviewPending": true
  },
  {
    "id": "L01-N",
    "title": "Trapped Inside GTA 6 Until We Beat It",
    "originalTitle": "Trapped Inside GTA 6 Until We Beat It",
    "fixedTitle": false,
    "variant": "L01-N · Hour 1 vs 100 hours — room collapse",
    "preview": "gta-trapped-thumbnails/hour-1-vs-100-room-preview.webp",
    "full": "gta-trapped-thumbnails/hour-1-vs-100-room.png",
    "alt": "Matched gaming-room split: an immaculate, cheerful HOUR 1 setup versus a wrecked 100 HOURS room with an exhausted, unshaven twin.",
    "summary": "Matched gaming-room split: an immaculate, cheerful HOUR 1 setup versus a wrecked 100 HOURS room with an exhausted, unshaven twin.",
    "meta": "New trapped-room concept · Matched room split + escalating mess",
    "channel": "Stokes Twins Gaming",
    "formatName": "I Survived 100 Hours in GTA",
    "brief": "episode-details.html#idea-launch-gta6",
    "composition": "Matched room split + escalating mess",
    "comparison": "Hour 1 vs 100 hours — room collapse",
    "references": [],
    "shortlisted": false,
    "artworkStatus": "AI-generated thumbnail concept · November 1, 2026",
    "trappedRoomConcept": true,
    "updatedPlan": true,
    "launchSlot": 3,
    "collectionKind": "episode",
    "sharedReviewPending": true
  },
  {
    "id": "L01-O",
    "title": "Trapped Until We Beat GTA 6",
    "originalTitle": "Trapped Until We Beat GTA 6",
    "fixedTitle": false,
    "variant": "L01-O · Gaming behind a locked room window",
    "preview": "gta-trapped-thumbnails/locked-room-window-preview.webp",
    "full": "gta-trapped-thumbnails/locked-room-window.png",
    "alt": "Two exhausted twins remain at their GTA setup behind a room observation window and a locked red door.",
    "summary": "Two exhausted twins remain at their GTA setup behind a room observation window and a locked red door.",
    "meta": "New trapped-room concept · Framed confinement + exhausted twin pair",
    "channel": "Stokes Twins Gaming",
    "formatName": "I Survived 100 Hours in GTA",
    "brief": "episode-details.html#idea-launch-gta6",
    "composition": "Framed confinement + exhausted twin pair",
    "comparison": "Gaming behind a locked room window",
    "references": [],
    "shortlisted": false,
    "artworkStatus": "AI-generated thumbnail concept · November 1, 2026",
    "trappedRoomConcept": true,
    "updatedPlan": true,
    "launchSlot": 3,
    "collectionKind": "episode",
    "sharedReviewPending": true
  }
];
 const existingIds = new Set(group.cards.map(c => c.id));
 const briefMap = window.STOKES_BRIEF_MAP ??= {};
 const briefId = briefMap[group.cards[0]?.id] || 'idea-launch-gta6';
 group.cards.unshift(...cards.filter(c => !existingIds.has(c.id)));
 for (const card of cards) briefMap[card.id] = briefId;
 group.titleOptions = [...new Set([
  ...(group.titleOptions || []),
  'Trapped Until We Beat GTA 6',
  'Trapped Inside GTA 6 Until We Beat It'
 ])];
 group.label = group.cards.length + ' thumbnail options';
 const note = 'Five new trapped-room options lead this idea, including two Hour 1 / 100 Hours split-screen concepts. ';
 if (!group.description.startsWith(note)) group.description = note + group.description;
 const railNote = document.querySelector('.rail-note');
 if (railNote) railNote.textContent = railNote.textContent.replace(/\d+ concept options/, data.groups.reduce((total, g) => total + g.cards.length, 0) + ' concept options');
})();
