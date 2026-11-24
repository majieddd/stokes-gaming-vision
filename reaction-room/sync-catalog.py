from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parent
catalog = json.loads((root / 'catalog.json').read_text())
assert catalog.get('schema') == 1 and catalog.get('entries')
payload = json.dumps(catalog, indent=2).replace('<', '\\u003c')
index = root / 'index.html'
html, count = re.subn(
    r'(<script id="initial-catalog" type="application/json">)[\s\S]*?(</script>)',
    lambda match: match[1] + payload + match[2],
    index.read_text(),
)
assert count == 1
for name in ['reaction-room.js', 'reaction-room.css']:
    digest = hashlib.sha256((root / name).read_bytes()).hexdigest()[:12]
    html = re.sub(re.escape(name) + r'\?v=[a-zA-Z0-9_-]+', name + '?v=' + digest, html)
index.write_text(html)
print('Updated embedded catalog and asset versions.')
