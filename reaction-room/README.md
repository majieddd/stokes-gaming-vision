# Stokes Reaction Room

Standalone GitHub Pages reaction library. All video groups are included in the
page, so a Sheets connection is never required to browse or play footage.

The library currently contains 10 videos across 8 tests: 6 supplied YouTube
videos and 4 prepared reaction cuts. The two police-escape shots stay together;
the two drowning comparisons stay together. Original source and creator links
are shown beside the player. Photo and circled-map panels and cue sheets are
included locally. No extra text is added to the videos.

`catalog.json` is the authored, published footage catalog. It contains video
links and filming context, not a live mirror of private recording flags.
Recording status remains outside this public page. Private Drive links and the filming sheet URL are not included.

To add footage, update `catalog.json` and run `python sync-catalog.py` from this
directory. Commit the catalog and regenerated index together. If JavaScript or
CSS changes, bump their cache query in `index.html`.

The **Check for new footage** button reloads the catalog without using the
browser cache. If checking fails, the current footage stays available. A full
page reload uses the embedded catalog and preserves `?clip=ID&video=2` links.

This directory is deployed by the repository's existing GitHub Pages setup.
The video files remain at their original public media hosts; they are not
stored in Git or copied into the page.
