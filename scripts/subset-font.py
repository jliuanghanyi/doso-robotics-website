"""Subset the official Noto Sans SC variable font for this site's current copy.

Usage: python scripts/subset-font.py /path/to/NotoSansSC-variable.ttf
Requires fonttools[woff]. Keep the upstream OFL.txt beside the generated WOFF2.
"""
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
text = (root / 'dist/app.js').read_text(encoding='utf-8')
text += (root / 'site-metadata.json').read_text(encoding='utf-8')
characters = set(range(0x20, 0x7F)) | {ord(c) for c in text if ord(c) >= 0xA0}
font = TTFont(source)
available = font.getBestCmap()
options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=characters)
subsetter.subset(font)
target = root / 'dist/assets/fonts/noto-sans-sc-site-r21.woff2'
target.parent.mkdir(parents=True, exist_ok=True)
font.flavor = 'woff2'
font.save(target)
missing = sorted(c for c in characters if c not in available)
print(f'{target.name}: {target.stat().st_size:,} bytes; {len(characters)} requested characters')
print('System fallback characters:', ' '.join(f'U+{c:04X}' for c in missing))
