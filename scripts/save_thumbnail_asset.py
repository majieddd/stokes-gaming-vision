"""Encode generated artwork for the canvas; preserve its complete composition."""
import hashlib,json,pathlib,sys
from PIL import Image

root=pathlib.Path(__file__).resolve().parents[1]
entry_id,source=sys.argv[1:3]
plan=json.loads((root/'thumbnail-lab/creative-directions.json').read_text())
entry=next(e for e in plan['entries'] if e['id']==entry_id)
src=pathlib.Path(source)
image=Image.open(src).convert('RGB')
dest=root/entry['file'];dest.parent.mkdir(parents=True,exist_ok=True)
pending=dest.with_suffix('.pending.jpg')
image.save(pending,format='JPEG',quality=94,optimize=True)
preview=dest.with_name(dest.stem+'-preview.webp')
pending_preview=preview.with_suffix('.pending.webp')
small=image.copy();small.thumbnail((632,356));small.save(pending_preview,format='WEBP',quality=88,method=4)
pending.replace(dest);pending_preview.replace(preview)
record={'id':entry_id,'source':str(src),'full':entry['file'],'preview':str(preview.relative_to(root)),'width':image.width,'height':image.height,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest()}
with (root/'thumbnail-lab/generated-assets.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
print(json.dumps({'id':entry_id,'full':record['full'],'bytes':dest.stat().st_size,'previewBytes':preview.stat().st_size}))
