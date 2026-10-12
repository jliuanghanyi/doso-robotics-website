"""Check built language routes, fragments, assets and reference specifications."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re

ROOT=Path(__file__).resolve().parents[1]/'dist'
PAGES=('index','products','solutions','technology','about','contact')
class Page(HTMLParser):
    def __init__(self,filename):
        super().__init__();self.filename=filename;self.ids=set();self.links=[];self.assets=[];self.text=[];self.attrs={}
        self.feed(filename.read_text(encoding='utf-8'))
    def handle_starttag(self,tag,attributes):
        a=dict(attributes)
        if tag=='html':self.attrs=a
        if 'id' in a:self.ids.add(a['id'])
        if tag=='a':self.links.append(a.get('href',''))
        if tag in ('img','script') and a.get('src'):self.assets.append(a['src'])
        if tag=='image' and a.get('href'):self.assets.append(a['href'])
        if tag=='link' and a.get('rel')=='stylesheet':self.assets.append(a['href'])
    def handle_data(self,data):self.text.append(data)

docs={}
for prefix in ('','en/'):
    for name in PAGES:
        f=(ROOT/(prefix+name+'.html')).resolve();page=Page(f);docs[f]=page
        assert page.attrs['data-page']==name+'.html'
        assert page.attrs['lang']==('en' if prefix else 'zh-CN')
        assert 'main' in page.ids
        assert any('/en/' in '/'+link for link in page.links)
        if prefix:assert not re.search('[\u4e00-\u9fff]',''.join(page.text).replace('中','')),f'Untranslated text: {f}'
        scripts=[a for a in page.assets if a.endswith('.js')]
        assert len(scripts)==1 and re.search(r'app\.[0-9a-f]{12}\.js$',scripts[0]),'Script must have content fingerprint'
        assert any(re.search(r'styles\.[0-9a-f]{12}\.css$',a) for a in page.assets)

links=assets=0
for f,page in docs.items():
    for ref in page.links+page.assets:
        u=urlsplit(ref)
        assert not u.scheme and not u.netloc, f'Unexpected external resource: {ref}'
        target=(f.parent/unquote(u.path)).resolve() if u.path else f
        assert target.is_relative_to(ROOT.resolve()) and target.is_file(),f'Missing target: {f} -> {ref}'
        assert target.stat().st_size>0
        if u.fragment:assert u.fragment in docs[target].ids,f'Missing anchor: {ref}'
    links+=len(page.links);assets+=len(page.assets)
    if f.stem == 'products':
        body=''.join(page.text)
        for value in ('Orix','Thunder','Titan','Explorer','8–10 kg','25–30 kg','40–60 kg','2–4 h','3–5 h','8 h','3.7 m/s','5 m/s'):assert value in body,value
print(f'PASS: {len(docs)} localized documents, {links} links, {assets} asset references, fingerprints, anchors, product specifications.')
