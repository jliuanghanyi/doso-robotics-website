from pathlib import Path
import re
root=Path(__file__).parent
p=root/'dist/app.js'
s=p.read_text(encoding='utf-8-sig')
s=s.replace("${crop('product-source.jpg',a[1],a[2],a[3],a[4],'')}","<img class=\"task-photo\" src=\"assets/scene-${a[5]==='orix'?3:a[5]==='thunder'?1:2}.png\" alt=\"\">")
s=s.replace('[469,523,328,205]','[469,551,328,177]').replace('[872,535,345,190]','[872,550,345,175]')
icon='''function icon(i){const paths=[`<path d="M4 20V12h4v8m2 0V7h4v13m2 0V3h4v17M2 21h20"/>`,`<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>`,`<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10L3 7m9 5 9-5m-9 5v10"/>`,`<path d="m9 3 1-2h4l1 2 3 2 2 0 2 4-1 2v3l1 2-2 4h-2l-3 2-1 1h-4l-1-1-3-2H4l-2-4 1-2v-3L2 9l2-4h2Z"/><circle cx="12" cy="12" r="4"/>`,`<circle cx="18" cy="4" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="20" r="3"/><path d="m8 10 7-4M8 14l7 4"/>`];return `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[i]}</svg>`}
'''
s=icon+s
s=s.replace('<span>▥</span><strong>','<span>${icon(0)}</span><strong>').replace('<span class="wheel-icon">${f[1]}</span>','<span class="wheel-icon">${icon(i)}</span>')
s=s.replace('<h1>${t(\'四款平台，覆盖不同任务边界。\',\'Four platforms. Different task boundaries.\')}</h1>', '<h2 class="matrix-title">${t(\'四款平台，覆盖不同任务边界。\',\'Four platforms. Different task boundaries.\')}</h2>')
p.write_text(s,encoding='utf-8')
css=root/'dist/styles.css'
with css.open('a',encoding='utf-8') as f:f.write('''
.matrix-title{font-size:clamp(30px,3.3vw,60px);line-height:1.26;letter-spacing:-.045em}.task-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.72)}.wheel-icon svg{width:30px;height:30px;display:block}.wheel-center svg{width:34px;height:34px;display:block}.chain-card .art{aspect-ratio:1.9!important}.layer-label{padding-left:.5vw;padding-right:.4vw}.layer-label p{font-size:clamp(10px,.88vw,16px)}
@media(max-width:760px){.hero h1{font-size:34px;letter-spacing:-.055em;text-wrap:initial}.hero-copy{left:22px;right:22px}.product-card{min-height:485px}.product-copy{width:100%;min-height:0;height:auto;padding:22px 20px}.product-copy>p{font-size:13px;line-height:1.5;max-width:95%}.product-copy h3{font-size:17px}.product-copy .stats{margin:10px 0}.product-copy .stats dt{font-size:17px}.product-copy .stats>div{padding:0 16px}.product-copy .stats>div:first-child{padding-left:0}.product-copy .text-link{margin-top:8px}.product-art{top:auto;bottom:0;height:210px;width:100%;z-index:-1}.product-art .art{width:100%;right:0;bottom:0;height:auto!important}.product-art:after{background:linear-gradient(#fcfdff,transparent 25%)}.dark .product-art:after{background:linear-gradient(#061e46,transparent 25%)}.tech-hero{height:405px}.about-hero{height:480px}.matrix-title{font-size:31px}.layer-label p{font-size:11px}.layer-label{padding:0 5px 10px}}
''')
titles={'index':'让机器人理解任务，进入真实世界','products':'产品矩阵','technology':'技术能力与系统架构','about':'关于 DOSO','solutions':'解决方案','contact':'联系与演示需求'}
for file,title in titles.items():
 p=root/f'dist/{file}.html'
 s=p.read_text(encoding='utf-8-sig')
 s=re.sub(r'<title>.*?</title>',f'<title>DOSO Robotics｜{title}</title>',s)
 if file!='index':s=s.replace('<link rel="preload" href="assets/hero-clean.png" as="image">','')
 p.write_text(s,encoding='utf-8')
