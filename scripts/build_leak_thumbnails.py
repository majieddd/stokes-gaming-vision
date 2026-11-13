"""Build the November GTA prank concepts without changing earlier cards."""
import hashlib
import json
import pathlib
import shutil
import zipfile
from PIL import Image, ImageDraw, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'leak-thumbnails'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    plan = json.loads((OUT / 'creative-directions.json').read_text())
    sources = json.loads((OUT / 'generated-sources.local.json').read_text())
    research = json.loads((OUT / 'research.json').read_text())
    entries, cards = [], []
    for concept in plan['concepts']:
        ident = concept['id']
        source = pathlib.Path(sources[ident])
        original = OUT / 'originals' / (ident + '.png')
        original.parent.mkdir(exist_ok=True)
        shutil.copyfile(source, original)
        image = Image.open(original).convert('RGB')
        full, preview = OUT / (ident + '.jpg'), OUT / (ident + '.webp')
        # Preserve the complete generated composition; pad the tiny ratio difference.
        export = ImageOps.pad(image, (1280, 720), method=Image.Resampling.LANCZOS, color='#111111')
        export.save(full, quality=95, optimize=True)
        export.resize((640, 360), Image.Resampling.LANCZOS).save(preview, quality=89, method=6)
        entry = {**concept, 'ideaId': 'idea-launch-gta-prank', 'title': plan['title'],
                 'full': str(full.relative_to(ROOT)), 'preview': str(preview.relative_to(ROOT)),
                 'original': str(original.relative_to(ROOT)), 'width': 1280, 'height': 720,
                 'sourceWidth': image.width, 'sourceHeight': image.height,
                 'sha256': digest(full), 'preview_sha256': digest(preview),
                 'original_sha256': digest(original)}
        entries.append(entry)
        rationale = ('Influint application: ' + concept['viewerQuestion'] +
                     ' One distinct visual question, clear focal hierarchy, separated subjects and complementary title/image information. '
                     'These are creative hypotheses, not measured CTR gains. ')
        scope = ('Staged-prank packaging proposal, not authentic leaked footage. '
                 'Props, game scenes and effects must be produced and matched to the actual episode before use.')
        cards.append({'id': ident, 'title': plan['title'],
                      'variant': f"LEAK {concept['number']:02d} · {concept['name']}",
                      'preview': entry['preview'], 'full': entry['full'], 'alt': concept['scene'],
                      'summary': concept['viewerQuestion'] + ' ' + scope,
                      'meta': 'New GTA prank concept · ' + concept['composition'],
                      'formatName': plan['title'], 'brief': 'episode-details.html#L03',
                      'composition': concept['composition'], 'comparison': concept['scene'] + ' ' + rationale + scope,
                      'references': research['canvasReferences'], 'shortlisted': False,
                      'artworkStatus': 'AI-generated staged-prank concept · November 13, 2026',
                      'leakRefresh': True, 'launchSlot': 2, 'collectionKind': 'episode'})
    manifest = {k: v for k, v in plan.items() if k != 'concepts'}
    manifest.update({'total': len(entries), 'entries': entries, 'research': 'leak-thumbnails/research.json'})
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    module = """// Twenty independently generated GTA prank concepts. Earlier art and review IDs stay intact.
(()=>{const data=window.STOKES_CANVAS,group=data?.groups.find(g=>g.id==='launch-gta-prank');if(!group)return;
const additions=CARDS;
const ids=new Set(additions.map(c=>c.id));group.cards=[...additions,...group.cards.filter(c=>!ids.has(c.id))];
group.label=group.cards.length+' thumbnail options';
group.description='20 new staged-prank packaging concepts: secret discoveries, forbidden access, version comparisons and last-copy stakes. Each includes a distinct viewer question and composition rationale. All ten earlier concepts and their reviews remain available.';
data.initialMetrics??={};for(const card of additions)data.initialMetrics[card.id]??={likes:0,reactions:0,comments:0,time:0};
if(typeof document!=='undefined'){const note=document.querySelector('.rail-note');if(note)note.textContent='20 new I Found The Leaked GTA 6 concepts join 19 recent World’s Greatest Video Game concepts. All 350 thumbnails support shared reactions and comments.';}
})();
""".replace('CARDS', json.dumps(cards, ensure_ascii=False, separators=(',', ':')))
    (ROOT / 'canvas-leak-thumbnails.js').write_text(module)
    sheet = Image.new('RGB', (1280, 5 * 205), '#10171e')
    draw = ImageDraw.Draw(sheet)
    for index, entry in enumerate(entries):
        x, y = (index % 4) * 320, (index // 4) * 205
        tile = Image.open(ROOT / entry['full']).resize((320, 180), Image.Resampling.LANCZOS)
        sheet.paste(tile, (x, y))
        draw.text((x + 8, y + 184), f"{index + 1:02d}  {entry['name']}", fill='white')
    sheet.save(OUT / 'contact-sheet.jpg', quality=94)
    with zipfile.ZipFile(OUT / 'gta-leak-20-concepts.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for name in ['manifest.json', 'creative-directions.json', 'research.json', 'contact-sheet.jpg']:
            archive.write(OUT / name, name)
        for entry in entries:
            archive.write(ROOT / entry['full'], pathlib.Path(entry['full']).name)
    print(f'Built {len(entries)} concepts, canvas cards, contact sheet and download archive.')


if __name__ == '__main__':
    build()
