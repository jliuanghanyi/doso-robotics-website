let comparisonDifferencesOnly = false;
let comparisonResizeObserver = null;
function renderSite(options = {}) {
comparisonResizeObserver?.disconnect();
comparisonResizeObserver = null;
function icon(i){const paths=[`<path d="M4 20V12h4v8m2 0V7h4v13m2 0V3h4v17M2 21h20"/>`,`<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>`,`<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10L3 7m9 5 9-5m-9 5v10"/>`,`<path d="m9 3 1-2h4l1 2 3 2 2 0 2 4-1 2v3l1 2-2 4h-2l-3 2-1 1h-4l-1-1-3-2H4l-2-4 1-2v-3L2 9l2-4h2Z"/><circle cx="12" cy="12" r="4"/>`,`<circle cx="18" cy="4" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="20" r="3"/><path d="m8 10 7-4M8 14l7 4"/>`];return `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[i]}</svg>`}
const ROOT = options.root || document.documentElement.dataset.root || './';
const EN = options.en ?? (document.documentElement.lang === 'en' || new URLSearchParams(location.search).get('lang') === 'en');
const t = (zh,en) => EN ? en : zh;
const requestedPage = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index';
const route = options.page || document.documentElement.dataset.page || (requestedPage.includes('.') ? requestedPage : requestedPage + '.html');
const url = (page) => {
  const [pathAndQuery, hash] = page.split('#');
  const [path, query] = pathAndQuery.split('?');
  const params = new URLSearchParams(query || '');
  params.set('lang', EN ? 'en' : 'zh');
  return ROOT + (EN ? 'en/' : '') + path + '?' + params + (hash ? '#'+hash : '');
};
const languageUrl = en => {
  const params = new URLSearchParams(location.search);
  params.set('lang', en ? 'en' : 'zh');
  return ROOT + (en ? 'en/' : '') + route + '?' + params + location.hash;
};
const A = ROOT + 'assets/';
// Reference artwork is displayed through independent, precisely bounded image windows.
// All typography, cards, diagrams, navigation and controls are native HTML/CSS.
function crop(file,x,y,w,h,alt,cls='') {
 return `<div class="art ${cls}" style="aspect-ratio:${w}/${h}"><img src="${A+file}" alt="${alt}" style="width:${1672/w*100}%;left:${-x/w*100}%;top:0;transform:translateY(${-y/941*100}%)" loading="lazy"></div>`;
}
// Standalone artwork avoids magnifying tiny crops from complete design screenshots.
function hdArt(file,alt,ratio='1.9',eager=false){
 return `<div class="art hd-art" style="aspect-ratio:${ratio}"><img src="${A+file}" alt="${alt}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}></div>`;
}
const products = [
 {id:'orix',name:'Orix',title:t('教育开发入门平台','Education & development'),desc:t('面向高校、科研机构与开发者，<br>提供灵活、可靠的四足机器人平台。','A flexible, reliable platform for universities, researchers and developers.'),weight:'15 kg',size:'70 × 31 × 40 cm',spec:['8–10 kg','2–4 h','3.7 m/s'],box:[582,588,292,244]},
 {id:'thunder',name:'Thunder',title:t('复杂地形巡检平台','Complex-terrain inspection'),desc:t('面向复杂地形巡检，<br>支持外设扩展与二次开发。','A platform for complex-terrain inspection, with support for external devices and custom development.'),weight:'38 kg',size:'100 × 47 × 58 cm',spec:['25–30 kg','3–5 h','3.7 m/s'],box:[568,251,306,271]},
 {id:'titan',name:'Titan',title:t('重载科研平台','Heavy-duty research'),desc:t('面向科研与行业应用，提供更大载荷<br>与更强扩展性的通用机器人平台。','An extensible robot platform for larger payloads, research and industry.'),weight:'60 kg',size:'110 × 50 × 70 cm',spec:['40–60 kg','8 h','5 m/s'],box:[998,552,286,285]},
 {id:'explorer',name:'Explorer',title:t('智能作业旗舰平台','Intelligent operations flagship'),desc:t('面向智能巡检方案，连接导航、<br>异常识别、任务编排与远程运维。','An inspection platform connecting navigation, anomaly detection, task scheduling and remote operations.'),weight:'38 kg',size:'100 × 47 × 58 cm',spec:['25–30 kg','3–5 h','3.7 m/s'],box:[995,249,324,269]}
];
// Orix/Explorer retain supplied artwork; Thunder/Titan use transparent, AI-restored presentation assets.
// Original company artwork is retained; see docs/product-images-r19.md for provenance and limits.
function robotArt(p,fleet=false){
 const original=p.id==='orix'?{file:'orix-original-r10.png',box:[0,82,625,530],width:625,height:670}:p.id==='explorer'?{file:'explorer-source-r10.jpg',box:[510,210,600,436],width:1672,height:941}:{file:`${p.id}-restored-r19.webp`,box:[0,0,1254,1254],width:1254,height:1254};
 // Fleet-only framing removes unequal transparent margins without changing product cards.
 const fleetBoxes={orix:[30,100,580,492],thunder:[36,118,1218,1097],titan:[81,66,1066,1132],explorer:[525,216,580,428]};
 const [left,top,width,height]=fleet?fleetBoxes[p.id]:original.box;
 return `<div class="art real-robot robot-${p.id}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${p.name} ${t('机器人','robot')}"><svg width="${width}" height="${height}" overflow="hidden"><image href="${A+original.file}" x="${-left}" y="${-top}" width="${original.width}" height="${original.height}"/></svg></svg></div>`;
}
function formatSpec(value){
 const match=value.match(/^([0-9][0-9.× –-]*?)\s*(kg|h|m\/s|cm|°)$/u);
 if(!match)return value;
 return `<span class="spec-value"><span class="spec-number">${match[1]}</span>${match[2]==='°'?'':' '}<span class="spec-unit">${match[2]}</span></span>`;
}
const stats = p => `<dl class="stats">${p.spec.map((s,i)=>`<div><dt>${formatSpec(s)}</dt><dd>${[t('载荷','Payload'),t('续航时间','Runtime'),t('最大速度','Max speed')][i]}</dd></div>`).join('')}</dl>`;
function productComparison(){
 const focus=[t('课程实验、算法开发与轻量科研','Coursework, algorithm development and light research'),t('能源、交通与工业现场的复杂地形巡检','Complex-terrain inspection in energy, transport and industry'),t('较大载荷的科研与扩展设备搭载','Research with heavier payloads and additional equipment'),t('自主导航、识别、任务编排与远程运维','Navigation, recognition, task scheduling and remote operations')];
 const rows=[
  [t('适用任务','Task focus'),focus],
  [t('载荷','Payload'),products.map(p=>p.spec[0]),true],
  [t('续航时间','Runtime'),products.map(p=>p.spec[1]),true],
  [t('最大速度','Max speed'),products.map(p=>p.spec[2]),true],
  [t('机身重量','Robot weight'),products.map(p=>p.weight),true],
  [t('尺寸（长 × 宽 × 高）','Dimensions (L × W × H)'),products.map(p=>p.size),true],
  [t('最大爬坡角度','Max slope'),['40°','45°','45°','45°'],true],
  [t('可上台阶高度','Step height'),[t('请咨询确认','Please contact us to confirm'),'25 cm','25 cm','25 cm'],true,0],
  [t('开发支持','Development support'),products.map(()=>t('外设扩展与二次开发','External devices and custom development'))]
 ];
 const tableRows=rows.map(([label,values,numeric,unconfirmed])=>{
  const different=new Set(values).size>1;
  const counts=values.map(value=>values.filter(v=>v===value).length);
  const commonCount=Math.max(...counts);
  return `<tr data-comparison-row data-different="${different}"${comparisonDifferencesOnly&&!different?' hidden':''}><th scope="row">${label}</th>${values.map((value,i)=>`<td${i===unconfirmed?' class="comparison-unconfirmed"':numeric&&different&&(commonCount===1||counts[i]<commonCount)?' class="comparison-difference"':''}>${numeric?formatSpec(value):value}</td>`).join('')}</tr>`;
 }).join('');
 return `<section class="section comparison" id="compare"><div class="section-heading"><p class="eyebrow">COMPARE PLATFORMS</p><h2>${t('先看任务，再对比参数。','Start with your task. Compare the specifications.')}</h2><p class="lead">${t('教学开发看 Orix，复杂地形看 Thunder，重载科研看 Titan，一体化巡检看 Explorer。','Explore Orix for education, Thunder for complex terrain, Titan for heavier payloads and Explorer for integrated inspection.')}</p></div><div class="comparison-toolbar"><p id="comparison-status" role="status" aria-live="polite"></p><label class="comparison-toggle"><input id="comparison-differences" type="checkbox" role="switch" aria-controls="comparison-table"${comparisonDifferencesOnly?' checked':''}><span class="comparison-switch" aria-hidden="true"></span><span>${t('仅看差异','Only show differences')}</span></label></div><p class="comparison-hint" id="comparison-hint" hidden>${t('左右滑动表格，查看四款平台。','Scroll horizontally to compare all four platforms.')}</p><div class="comparison-scroll" role="region" aria-label="${t('四款机器人参数对比','Four-platform specification comparison')}" tabindex="0"><table id="comparison-table"><caption class="sr-only">${t('大算机器人选型对比','DOSO robot selection comparison')}</caption><thead><tr><th scope="col">${t('对比项目','Specification')}</th>${products.map(p=>`<th scope="col">${p.name}<small>${p.title}</small></th>`).join('')}</tr></thead><tbody>${tableRows}<tr><th scope="row">${t('产品详情','Product details')}</th>${products.map(p=>`<td><button class="text-link" data-product="${p.id}" aria-label="${t('查看','Explore')} ${p.name}">${t('查看详情','View details')} ↗</button></td>`).join('')}</tr></tbody></table></div><aside class="comparison-note"><strong>${t('Thunder 与 Explorer，怎么选？','Thunder or Explorer?')}</strong><p>${t('需要复杂地形通行与灵活扩展，选 Thunder；需要自主导航、识别、任务编排与远程运维的一体化巡检方案，选 Explorer。两款平台的尺寸、重量、载荷、续航与速度一致，选型重点在任务流程、传感器和软件配置。','Choose Thunder for complex terrain and flexible expansion. Choose Explorer for an integrated inspection solution with navigation, recognition, task scheduling and remote operations. Both share the same dimensions, weight, payload, runtime and speed; choose around your workflow, sensors and software configuration.')}</p></aside><div class="comparison-cta"><div><h3>${t('不确定哪款适合你的任务？','Not sure which robot fits your task?')}</h3><p>${t('整理场景、载荷与作业要求，明确选型需求。','Outline your site, payload and workflow to clarify what you need.')}</p></div>${btn(t('咨询选型','Get selection advice'),'contact.html')}</div></section>`;
}
const btn = (text,href,secondary=false) => `<a class="button ${secondary?'secondary':''}" href="${url(href)}">${text}<span aria-hidden="true">↗</span></a>`;
function header(){return `<header class="header site-header ${route==='index.html'?'home-header':''}"><a class="brand" href="${url('index.html')}" aria-label="${t('大算机器人首页','DOSO Home')}"><img src="${A}logo-blue.png" alt="DOSO robotics"></a><button class="menu-toggle" aria-expanded="false" aria-controls="nav" aria-label="${t('打开导航','Open navigation')}">☰</button><nav id="nav" aria-label="${t('主导航','Main navigation')}"><div class="product-nav"><a class="${route==='products.html'?'active':''}" href="${url('products.html')}">${t('产品','Products')}</a><div class="dropdown">${products.map(p=>`<a href="${url('products.html')}#${p.id}"><strong>${p.name}</strong><small>${p.title}</small></a>`).join('')}</div></div><a class="${route==='solutions.html'?'active':''}" href="${url('solutions.html')}">${t('解决方案','Solutions')}</a><a class="${route==='technology.html'?'active':''}" href="${url('technology.html')}">${t('技术','Technology')}</a><a class="${route==='about.html'?'active':''}" href="${url('about.html')}">${t('关于大算机器人','About DOSO')}</a><a class="mobile-nav-demo" href="${url('contact.html')}">${t('准备需求单','Prepare a brief')} <span aria-hidden="true">↗</span></a></nav><div class="header-actions"><div class="language" aria-label="Language"><a href="${languageUrl(false)}" class="${!EN?'selected':''}" lang="zh" data-language="zh" aria-label="切换为中文">中</a><a href="${languageUrl(true)}" class="${EN?'selected':''}" lang="en" data-language="en" aria-label="Switch to English">EN</a></div>${btn(t('准备需求单','Prepare a brief'),'contact.html')}</div></header>`}
function footer(){return `<footer><a href="${url('index.html')}"><img src="${A}logo-blue.png" alt="DOSO robotics"></a><p>${t('让机器人理解任务，进入真实世界。','Intelligent robots for real-world tasks.')}</p><div><a href="${url('products.html')}">${t('产品','Products')}</a><a href="${url('technology.html')}">${t('技术','Technology')}</a><a href="${url('contact.html')}">${t('产品需求单','Project brief')}</a></div><small>© 2026 DOSO ROBOTICS</small></footer>`}
function matrix(){
 const summaries=[
  [t('教育开发','Education & development'),t('面向高校与开发者，支持课程实验与算法开发。','For universities and developers working on coursework and algorithms.')],
  [t('复杂地形巡检','Complex-terrain inspection'),t('面向复杂现场巡检，支持外设扩展与二次开发。','For complex inspection sites, with device expansion and custom development.')],
  [t('重载科研','Heavy-duty research'),t('更大载荷与扩展空间，支持科研及设备搭载。','More payload and expansion capacity for research and additional equipment.')],
  [t('智能巡检','Intelligent inspection'),t('连接导航、异常识别、任务编排与远程运维。','Connect navigation, anomaly detection, task scheduling and remote operations.')]
 ];
 return `<section class="catalog-intro" id="products"><div><p class="eyebrow">ROBOT PLATFORMS</p><h1>${t('找到适合任务的机器人。','Find the right robot for your task.')}</h1></div><div class="catalog-intro-detail"><p>${t('四款平台，从教育开发到现场巡检，按任务需求选择。','Four platforms for education, research and field inspection.')}</p><a class="text-link catalog-compare-link" href="#compare">${t('对比产品参数','Compare specifications')} <span aria-hidden="true">↓</span></a></div></section><section class="catalog-products" aria-label="${t('产品介绍','Our robots')}"><div class="catalog-grid">${products.map((p,i)=>`<article class="catalog-card" id="${p.id}"><button class="catalog-art" data-product="${p.id}" aria-label="${t('了解','Explore')} ${p.name}">${robotArt(p,true).replace('<svg viewBox','<svg preserveAspectRatio="xMidYMax meet" viewBox')}</button><div class="catalog-card-copy"><div class="catalog-name"><h2>${p.name}</h2><h3>${summaries[i][0]}</h3></div><p>${summaries[i][1]}</p>${stats(p)}<button class="text-link" data-product="${p.id}">${t('了解产品','Explore product')} <span aria-hidden="true">↗</span></button></div></article>`).join('')}</div></section>`;
}
function catalogApplications(){
 const applications=[
  [t('工业巡检','Industrial inspection'),t('能源设施 · 工业园区','Energy facilities · Industrial sites'),'scene-1.png',0],
  [t('应急作业','Emergency operations'),t('复杂环境 · 任务探索','Complex environments · Field tasks'),'scene-2.png',1],
  [t('科研教育','Research & education'),t('高校实验 · 开发平台','University labs · Development'),'scene-3.png',2],
  [t('系统集成','System integration'),t('设备扩展 · 方案协同','Device integration · Solutions'),'scene-4.png',3]
 ];
 return `<section class="catalog-applications" id="applications"><div class="catalog-app-intro"><p class="eyebrow">APPLICATION SCENARIOS</p><h2>${t('多场景应用，<br>走进真实世界。','Built for tasks<br>in the real world.')}</h2><p>${t('围绕科研教育、工业巡检与复杂现场，按任务组合机器人、传感器与软件能力。','Combine robots, sensors and software for research, industrial inspection and complex field tasks.')}</p>${btn(t('探索解决方案','Explore solutions'),'solutions.html')}</div><div class="catalog-scene-grid">${applications.map(a=>`<a class="catalog-scene" href="${url('solutions.html#scene-'+a[3])}"><img src="${A+a[2]}" alt="" loading="lazy"><div><h3>${a[0]}</h3><p>${a[1]}</p></div><span aria-hidden="true">↗</span></a>`).join('')}<p class="catalog-scene-note">${t('应用场景图片为示意。','Application images are illustrative.')}</p></div></section>`;
}
function companyOverview(){
 return `<section class="editorial-section company-overview company-compact" id="company"><div><p class="eyebrow">${t('大算机器人','DOSO ROBOTICS')}</p><h2>${t('专注四足机器人<br>与智能系统','Quadruped robots.<br>Intelligent systems.')}</h2></div><div class="company-summary"><p>${t('围绕工业巡检、应急作业与教育科研，协同研发机械、电控、运动控制、感知算法与软件平台。从机器人本体到现场任务，提供开发、验证与部署支持。','We develop mechanics, electronics, motion control, perception and software for inspection, emergency operations, education and research. From robot hardware to field tasks, we support development, validation and deployment.')}</p><a class="text-link" href="${url('about.html')}">${t('认识大算机器人','Meet DOSO Robotics')} <span aria-hidden="true">↗</span></a></div></section>`;
}
function platformOverview(){
 const groups=[
  [t('机器人平台','Robot platforms'),'Orix · Thunder · Titan · Explorer',t('面向教育开发、巡检与重载科研，按任务选择本体与扩展设备。','Choose a platform and additional equipment for education, inspection or heavy-duty research.')],
  [t('开发与任务系统','Development & task systems'),'ROS · SDK · API',t('连接传感器扩展、感知与导航，支持任务编排和数据记录。','Connect sensors, perception and navigation with task scheduling and data logging.')],
  [t('场景交付','Application & deployment'),t('教育科研 · 巡检运维 · 园区安防','Education · Inspection · Site security'),t('围绕复杂地形与现场任务，提供方案设计、验证、部署支持与运维服务。','Configure, validate and deploy around real tasks and complex terrain, with ongoing operations support.')]
 ];
 return `<section class="editorial-section platform-overview" id="platform"><div class="platform-intro"><div><p class="eyebrow">ONE INTEGRATED PLATFORM</p><h2>${t('机器人、软件与应用，协同工作。','Hardware and software, built to work together.')}</h2></div><div class="platform-summary"><p>${t('从机器人本体与开发接口，到任务系统、场景模块和部署服务，按项目需求组合配置。','Combine robot hardware, development interfaces, task software, application modules and deployment support around your project.')}</p>${btn(t('探索技术平台','Explore the technology'),'technology.html')}</div></div><div class="platform-groups">${groups.map(g=>`<article><h3>${g[0]}</h3><p class="platform-keywords">${g[1]}</p><p>${g[2]}</p></article>`).join('')}</div></section>`;
}
function homeApplications(){return `<section class="editorial-section home-applications" id="applications"><div class="editorial-heading"><p class="eyebrow">BUILT AROUND THE TASK</p><h2>${t('从教学开发，到自主巡检。','From learning and development to autonomous inspection.')}</h2></div><div class="application-pair"><a href="${url('solutions.html#education')}"><figure class="application-art application-education">${robotArt(products[0],true)}<figcaption>Orix</figcaption></figure><small class="scene-label">${t('场景示意','Illustrative scene')}</small><div><small>EDUCATION</small><h3>${t('用 Orix 开展课程与实机开发','Teach and build with Orix')}</h3><p>${t('结合开放 SDK、ROS 支持、仿真环境与课程内容，开展实验、项目开发和应用验证。','Use SDK and ROS support, simulation and course materials for experiments, development projects and application testing.')}</p><span>${t('了解教育科研方案','Explore education')} ↗</span></div></a><a href="${url('solutions.html#inspection')}"><figure class="application-art application-inspection">${robotArt(products[3],true)}<figcaption>Explorer</figcaption></figure><small class="scene-label">${t('场景示意','Illustrative scene')}</small><div><small>INSPECTION</small><h3>${t('用 Explorer 管理巡检与远程运维','Manage inspections with Explorer')}</h3><p>${t('围绕巡检路线与任务，结合自主导航、异常识别、告警和远程监控。','Plan inspection routes and tasks with autonomous navigation, anomaly detection, alerts and remote monitoring.')}</p><span>${t('了解智能巡检方案','Explore inspection')} ↗</span></div></a></div></section>`}
function productGateway(){return `<section class="editorial-section fleet-showcase" id="products"><div class="fleet-heading"><div class="fleet-copy"><p class="eyebrow">ROBOT PLATFORMS</p><h2>${t('多种形态，<br>走进真实场景<em>。</em>','Different forms.<br>Real-world tasks<em>.</em>')}</h2><p>${t('以机器人为载体，连接任务、环境与智能。','Connecting tasks, environments and intelligence through robotics.')}</p></div><div class="fleet-action">${btn(t('探索机器人平台','Explore robot platforms'),'products.html')}</div></div><div class="fleet-models">${products.map(p=>`<a class="fleet-model fleet-${p.id}" href="${url('products.html#'+p.id)}" aria-label="${t('了解','Explore')} ${p.name}">${robotArt(p,true).replace('role="img"','preserveAspectRatio="xMidYMax meet" role="img"')}<span class="fleet-name">${p.name}<span aria-hidden="true"> ↗</span></span></a>`).join('')}</div></section>`}
function homeVision(){return `<section class="home-vision"><div class="home-vision-heading"><p class="eyebrow">OUR VISION</p><h2>${t('理解任务，适应环境，<br>自主执行<em>。</em>','Understand the task.<br>Adapt and act autonomously<em>.</em>')}</h2></div><div class="home-vision-action"><p>${t('让每一个行业、每一种场景，都能拥有真正走进现场的智能机器人。','Bring intelligent robots into the real-world settings of every industry.')}</p>${btn(t('准备需求单','Prepare a brief'),'contact.html')}</div></section>`}
function visionCta(){return `<section class="vision-band"><p class="eyebrow">OUR VISION</p><h2>${t('理解任务，适应环境，自主执行。','Understand the task. Adapt to the environment. Act autonomously.')}</h2><p>${t('让每一个行业、每一种场景，都能拥有真正走进现场的智能机器人。','Bring intelligent robots into the real-world settings of every industry.')}</p>${btn(t('准备需求单','Prepare a brief'),'contact.html')}</section>`}
function companyAbout(){
const disciplines=[[t('机械与电控','Mechanics & electronics'),t('机械结构、关节驱动、电源系统与通信总线。','Mechanical structures, joint drives, power systems and communication buses.')],[t('运动控制','Motion control'),t('步态控制、姿态稳定、状态估计与地形适应。','Gait control, posture stability, state estimation and terrain adaptation.')],[t('感知算法','Perception algorithms'),t('视觉感知、传感器融合、障碍识别与环境理解。','Vision, sensor fusion, obstacle recognition and environment understanding.')],[t('软件平台','Software platform'),t('ROS、SDK、API、仿真平台与数据接口。','ROS, SDKs, APIs, simulation platforms and data interfaces.')]];
return `<section class="editorial-section company-masthead"><div class="company-hero"><div class="company-hero-copy"><p class="eyebrow">ABOUT / DOSO ROBOTICS</p><h1>${t('大算机器人<br><em>真实世界机器人智能体</em>','DOSO Robotics<br><em>Intelligent robots for the real world</em>')}</h1></div><figure class="company-landscape"><svg viewBox="0 0 817 388" role="img" aria-label="${t('机器人与山湖环境的品牌场景示意','Brand illustration of a robot in a mountain and lake setting')}"><image href="${A}about-landscape-hd-r18.webp" width="817" height="388" preserveAspectRatio="xMidYMid slice"/></svg><figcaption>${t('机器人场景示意','Robotics concept illustration')}</figcaption></figure></div><div class="company-position"><p>${t('专注四足机器人产品与智能系统解决方案。围绕工业巡检、应急作业与科研教育，提供从机器人本体、开放开发到场景部署的一体化能力。','We develop quadruped robots and intelligent system solutions. Our integrated platform connects robot hardware and open development with deployment in inspection, emergency operations, research and education.')}</p></div></section><section class="editorial-section company-engineering" id="engineering"><div class="editorial-heading reference-heading"><div><p class="eyebrow">FULL-STACK ENGINEERING</p><h2>${t('从硬件到软件，<br>自主构建技术底座。','Built in-house.<br>From hardware to software.')}</h2></div><p class="lead">${t('机械、电控、运动控制、感知算法与软件平台协同研发，支持持续迭代与场景复制。','Mechanical, electronic, motion-control, perception and software development work together to support iteration and repeatable deployments.')}</p></div><div class="discipline-grid">${disciplines.map((d,i)=>`<article><h3>${d[0]}</h3><p>${d[1]}</p></article>`).join('')}</div></section><section class="editorial-section growth-story" id="field-learning"><div class="editorial-heading"><p class="eyebrow">LEARNING FROM THE FIELD</p><h2>${t('进入现场，<br>是持续进化的开始。','In the field,<br>we keep improving.')}</h2></div><div class="growth-flow"><div class="growth-columns">${[[t('机器人本体','Robot hardware'),t('以多层级产品平台进入教育科研、工业巡检、园区安防与复杂地形，承接真实任务。','Bring a range of robot platforms to research, inspection, site security and complex terrain to execute real tasks.')],[t('算力与数据','Compute & data'),t('连接边缘算力、真机场景数据与模型迭代，让现场反馈推动机器人能力提升。','Connect edge compute, real-robot data and model iteration so field feedback improves capability.')],[t('场景与应用','Scenarios & applications'),t('积累任务数据与行业经验，形成可部署、可迭代、可复制的垂直行业产品。','Build task data and domain knowledge into industry products that can be deployed, refined and replicated.')]].map((a,i)=>`<article><h3>${a[0]}</h3><p>${a[1]}</p></article>`).join('')}</div><div class="feedback-line"><span>${t('现场反馈 · 持续迭代','Field feedback · Continuous improvement')}</span></div></div></section><section class="editorial-section delivery-position"><div class="delivery-copy"><p class="eyebrow">FROM PRODUCT TO DELIVERY</p><h2>${t('从任务配置，到现场部署。','From task setup to field deployment.')}</h2><p class="lead">${t('面向工厂、园区、仓储与矿区的巡检需求，围绕任务模板、远程运维与数据记录设计方案，并逐步探索多机协同。','Design inspection solutions for factories, campuses, warehouses and mining sites around task templates, remote operations and data records, with fleet coordination as a development direction.')}</p>${btn(t('了解场景解决方案','Explore application solutions'),'solutions.html')}</div><figure class="company-simulation">${hdArt('technology-hero-hd-r18.webp',t('机器人仿真与数据系统示意','Robot simulation and data system illustration'),'832/395')}<figcaption>${t('仿真与数据系统示意','Simulation and data concept')}</figcaption></figure></section>${visionCta()}`;
}
function detailedSolutions(){
const entries=[{id:'education',p:products[0],k:'EDUCATION & RESEARCH',title:t('一套平台，串联教学、开发与验证。','One platform for learning, development and validation.'),intro:t('针对硬件、开发资源与课程之间的断层，将机器人本体、开放 SDK、仿真环境、课程内容与实机开发连接起来。','Bridge gaps between hardware, development resources and coursework by connecting robots, an open SDK, simulation and real-world development.'),features:[[t('轻量友好','Accessible hardware'),t('适合教育、开发与轻量科研，降低上手门槛。','Designed for education, development and lightweight research.')],[t('开放开发','Open development'),t('开放接口、SDK 与 ROS 支持，方便二次开发和扩展。','Open interfaces, SDKs and ROS support for development and extensions.')],[t('课程体系','Coursework'),t('覆盖机器人本体、ROS、SLAM、AI 与具身智能开发。','Cover hardware, ROS, SLAM, AI and embodied intelligence.')],[t('学生共创','Student collaboration'),t('连接课堂、竞赛、项目实践与开发者社区。','Connect classes, competitions, projects and developer communities.')]],scenario:2},{id:'inspection',p:products[3],k:'INTELLIGENT INSPECTION',title:t('统一管理巡检路线、任务与记录。','Manage inspection routes, tasks and results.'),intro:t('面向人工数据不连续、定制集成成本高和交付难复制的问题，以持续采集、异常发现、任务闭环与远程运维连接整个巡检流程。','Address fragmented manual data, costly integration and hard-to-repeat delivery with continuous collection, anomaly detection, task workflows and remote operations.'),features:[[t('自主巡检','Autonomous inspection'),t('自主导航、定点到达与自动回充。','Autonomous navigation, waypoint arrival and automatic recharging.')],[t('智能识别','Intelligent recognition'),t('面向仪表、热异常、设备状态与环境异常。','Identify meter readings, thermal anomalies, equipment states and environmental anomalies.')],[t('任务编排','Task scheduling'),t('配置路线、巡检点、周期与动作的统一任务流程。','Configure routes, inspection points, schedules and actions in a unified workflow.')],[t('远程运维','Remote operations'),t('状态监控、异常告警、远程接管与数据回溯。','Monitor status, receive alerts, take remote control and review historical data.')]],scenario:0}];
return `<section class="editorial-section solution-details"><div class="editorial-heading"><p class="eyebrow">APPLICATION PLATFORMS</p><h2>${t('让平台能力落到具体工作里。','Put platform capabilities to work.')}</h2></div>${entries.map(e=>`<article class="solution-detail" id="${e.id}"><div class="solution-robot">${robotArt(e.p)}<strong>${e.p.name}</strong><span>${e.p.title}</span></div><div class="solution-detail-copy"><p class="eyebrow">${e.k}</p><h2>${e.title}</h2><p class="lead">${e.intro}</p><div class="solution-feature-grid">${e.features.map(f=>`<section><h3>${f[0]}</h3><p>${f[1]}</p></section>`).join('')}</div>${btn(t('整理场景需求','Prepare an application brief'),'contact.html?product='+e.p.id+'&scenario='+e.scenario)}</div></article>`).join('')}</section>`;
}
function simulationWorkflow(){const steps=[[t('真实场景扫描','Capture the real site'),t('激光、相机与 IMU 采集，为场景重建提供输入。','Collect LiDAR, camera and IMU data for reconstruction.')],[t('3DGS / NeRF 重建','3DGS / NeRF reconstruction'),t('将采集信息转化为厘米级几何与真实纹理。','Reconstruct centimeter-scale geometry and realistic textures.')],[t('世界模型扩展','World-model expansion'),t('扩展布局、材质、光照与天气，生成更多可训练场景。','Vary layouts, materials, lighting and weather to create training scenarios.')],[t('物理仿真引擎','Physics simulation'),t('接入 MuJoCo / PhysX，模拟接触、动力学与传感器。','Use MuJoCo / PhysX for contact, dynamics and sensor simulation.')],[t('机器人训练与验证','Robot training & validation'),t('围绕强化学习、任务规划与巡检策略开展迭代验证。','Iteratively validate reinforcement learning, task planning and inspection policies.')]];
return `<section class="editorial-section simulation-workflow" id="simulation-workflow"><div class="simulation-banner"><div class="editorial-heading"><p class="eyebrow">FROM REALITY TO SIMULATION</p><h2>${t('把真实场景，<br>变成可反复验证的世界。','From a real site<br>to a world you can test.')}</h2><p class="lead">${t('用场景重建与世界模型生成高保真仿真环境，<br>形成可复用的数字资产，降低机器人训练与部署成本。','Create high-fidelity simulation environments with reconstruction and world models. Reuse digital assets for more efficient training and deployment.')}</p></div></div><div class="simulation-content"><ol class="simulation-steps">${steps.map((s,i)=>`<li><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol><div class="simulation-result"><strong>${t('可复用的数字资产','Reusable digital assets')}</strong><ul>${[[t('高保真场景','High-fidelity scenes')],[t('可训练任务集','Trainable task sets')],[t('可验证安全边界','Verifiable safety limits')],[t('可持续扩展的数据闭环','An evolving data loop')]].map(s=>`<li>${s[0]}</li>`).join('')}</ul></div></div></section>`}

function home(){return `<section class="hero"><div class="hero-bg"></div><div class="hero-copy"><p class="hero-kicker">DOSO ROBOTICS /<br>INTELLIGENT MOBILE SYSTEMS</p><div class="accent-line"></div><h1>${t('让机器人理解任务，<br><em>进入真实世界。</em>','Intelligent robots.<br><em>Built for real-world tasks.</em>')}</h1><p class="lead">${t('面向巡检与教育科研，提供机器人本体、<br>开发工具和仿真验证环境。','Robot platforms, development tools and simulation environments for inspection, education and research.')}</p><div class="actions">${btn(t('探索产品','Explore products'),'products.html')}${btn(t('准备需求单','Prepare a brief'),'contact.html',true)}</div></div><a class="scroll-cue" href="#company" aria-label="${t('向下了解公司','Discover the company')}"><i></i><span>⌄</span></a><div class="hero-caption"><small>PRODUCT SYSTEM</small></div></section>${companyOverview()}${platformOverview()}${homeApplications()}${productGateway()}${homeVision()}`}
const chain = [
 [t('机器人本体','Robot hardware'),t('进入真实现场的可靠执行平台','A reliable platform for real-world execution'),[57,547,345,181]],
 [t('3D 世界生成','3D world generation'),t('构建可重复验证的环境','Build repeatable validation environments'),[469,551,328,177]],
 [t('物理仿真与模型训练','Simulation & model training'),t('在虚拟任务中迭代策略','Iterate strategies in virtual tasks'),[872,550,345,175]],
 [t('真实任务数据','Real-world task data'),t('回流并推动产品能力升级','Feed task data back to improve capability'),[1280,544,338,178]]
];
function tech(){return `<section class="tech-screen"><div class="tech-hero"><div class="tech-visual">${hdArt('technology-hero-hd-r18.webp',t('数字孪生与机器人仿真场景示意','Digital twin and robot simulation illustration'),'1057/400',true)}</div><div class="tech-copy"><p class="eyebrow">TECHNOLOGY</p><h1>${t('先在世界里验证，<br>再让机器人进入现场。','Test in simulation.<br>Deploy in the real world.')}</h1><p class="lead">${t('从机器人本体、3D 世界生成和物理仿真，到真实任务数据回流，<br>能力持续形成闭环。','From hardware, 3D worlds and simulation to returning task data, capabilities continuously improve.')}</p></div></div><div class="chain">${chain.map((c,i)=>`<article class="chain-card" id="capability-${i}">${i===0?robotArt(products[3]):hdArt(['','world-hd-r18.webp','simulation-hd-r18.webp','task-data-hd-r18.webp'][i],c[0])}<h2>${c[0]}</h2><p>${c[1]}</p>${i<3?'<span class="chain-arrow" aria-hidden="true">→</span>':''}</article>`).join('')}</div></section>${architecture()}${simulationWorkflow()}`}
const layers = [
 ['04',t('行业应用层','Industry applications'),t('面向真实场景的<br>行业解决方案','Solutions for real-world industries'),[t('工业巡检','Inspection'),t('应急作业','Emergency'),t('科研教育','Research'),t('系统集成','Integration')],302,93],
 ['03',t('智能系统层','Intelligent systems'),t('多模态感知与<br>任务闭环控制','Multimodal perception and task control'),[t('感知','Perception'),t('规划','Planning'),t('决策','Decision'),t('控制','Control')],461,70],
 ['02',t('仿真与数据层','Simulation & data'),t('构建可验证、<br>可迭代的训练与评测体系','Verifiable, iterative training and evaluation'),['3D '+t('世界生成','worlds'),t('物理仿真','Simulation'),t('模型训练','Training'),t('数据回流','Data feedback')],598,72],
 ['01',t('机器人本体层','Robot hardware'),t('高可靠的硬件平台<br>与基础运动能力','Reliable hardware and fundamental mobility'),['Orix','Thunder','Titan','Explorer'],743,76]
];
const fly = [[t('进入现场','Enter the field'),'▥'],[t('沉淀任务数据','Collect task data'),'▤'],[t('模型迭代优化','Improve models'),'◇'],[t('本体能力升级','Upgrade hardware'),'⚙'],[t('复制到更多行业','Deploy more widely'),'♧']];
function flywheelConnections(){
 const point=angle=>{const radians=angle*Math.PI/180;return [500+350*Math.cos(radians),500+350*Math.sin(radians)].map(n=>n.toFixed(2)).join(' ')};
 const arcs=Array.from({length:5},(_,i)=>{const start=-90+i*72+24,end=-90+(i+1)*72-24;return `<path d="M ${point(start)} A 350 350 0 0 1 ${point(end)}" marker-end="url(#flywheel-arrowhead)"/>`}).join('');
 return `<svg class="wheel-orbit" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false"><defs><marker id="flywheel-arrowhead" viewBox="0 0 26 26" markerWidth="26" markerHeight="26" refX="20" refY="13" orient="auto" markerUnits="userSpaceOnUse"><path d="M 5 4 L 20 13 L 5 22" fill="none" stroke="#1765e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><g fill="none" stroke="#6b9ff1" stroke-width="4" stroke-linecap="round">${arcs}</g></svg>`;
}
function architecture(){return `<section class="architecture section" id="architecture"><div class="section-heading"><p class="eyebrow">SYSTEM ARCHITECTURE</p><h2>${t('从底层本体，到行业应用，形成完整技术闭环。','A complete system, from hardware to industry.')}</h2><p class="lead">${t('每一层能力都与真实任务相连，并在部署中持续迭代。','Every layer connects to real tasks and improves with deployment.')}</p></div><div class="architecture-layout"><div class="layers">${layers.map((l,li)=>`<div class="layer"><div class="layer-label"><div><h3>${l[1]}</h3><p>${l[2]}</p></div></div><div class="layer-shelf">${l[3].map((name,i)=>`<a class="layer-tile" href="${li===3?url('products.html')+'#'+products[i].id:li===0?url('solutions.html')+'#scene-'+i:url('technology.html')+'#capability-'+(li===1?2:[1,2,2,3][i])}">${li===3?robotArt(products[i]):li===0?hdArt('scene-'+(i+1)+'.png',name,'153/93'):hdArt((li===1?['perception','planning','decision','control']:['world','simulation','training','feedback'])[i]+'-hd-r18.webp',name,'153/'+l[5])}<strong>${name}</strong></a>`).join('')}</div></div>`).join('')}</div><div class="flywheel" id="flywheel"><h2>${t('数据飞轮','Data flywheel')}</h2><p>${t('真实任务数据持续回流，推动模型、本体与行业应用的迭代升级。','Real-world task data keeps improving models, hardware and industry applications.')}</p><div class="wheel">${flywheelConnections()}<div class="wheel-center"><span>${icon(0)}</span><strong>${t('持续进化<br>创造更大价值','Keep evolving.<br>Create more value.')}</strong></div>${fly.map((f,i)=>`<button class="wheel-node node-${i} ${i===0?'current':''}" data-step="${i}" aria-pressed="${i===0}"><span class="wheel-icon">${icon(i)}</span><strong>${f[0]}</strong></button>`).join('')}</div><p class="fly-caption" aria-live="polite">${t('围绕现场环境与任务目标，验证机器人能力。','Validate robotic capabilities against site conditions and task goals.')}</p></div></div></section>`}
function about(){return companyAbout()}
function solutions(){
const names=[t('工业巡检','Industrial inspection'),t('应急作业','Emergency operations'),t('科研教育','Research & education'),t('系统集成','System integration')];
const desc=[t('自主导航、异常识别、任务编排与远程运维。','Autonomous navigation, anomaly detection, task scheduling and remote operations.'),t('进入高风险、难抵达、信息不足的现场。','Access high-risk and hard-to-reach sites with limited information.'),t('连接课程实验、算法验证、竞赛与学生共创。','Connect coursework, algorithm validation, competitions and student collaboration.'),t('开放接口、载荷适配与一体化交付支持。','Open interfaces, payload adaptation and integrated delivery support.')];
const stages=[[t('需求梳理','Define'),t('明确环境、任务、数据与运维要求。','Define environment, task, data and operational requirements.')],[t('场景验证','Validate'),t('用仿真和真机验证关键任务链路。','Validate critical tasks in simulation and on real robots.')],[t('方案配置','Configure'),t('确定平台、传感器和系统配置。','Select the platform, sensors and system configuration.')],[t('联调部署','Deploy'),t('完成接口、任务与现场环境联调。','Integrate interfaces, tasks and the site environment.')],[t('持续迭代','Improve'),t('让任务数据进入产品和模型迭代。','Use task data to improve products and models.')]];
return `<section class="solution-hero section"><div><p class="eyebrow">SOLUTIONS</p><h1>${t('围绕现场任务，<br>配置机器人方案。','Configure your solution<br>around the task.')}</h1><p class="lead">${t('根据环境、巡检流程、数据要求与运维方式，确定机器人平台、传感器和任务系统。','Choose the robot platform, sensors and task software around your site, workflow, data and operations.')}</p>${btn(t('整理方案需求','Prepare a solution brief'),'contact.html')}</div><figure class="solution-hero-image"><img src="${A}scene-1.png" alt="${names[0]}"><figcaption>${t('场景示意','Illustrative scene')}</figcaption></figure></section><section class="section solutions"><div class="section-heading"><p class="eyebrow">REAL-WORLD SCENARIOS</p><h2>${t('面向四类应用场景。','Explore four application areas.')}</h2><p class="lead">${t('从工业巡检、应急作业、教育科研到系统集成，按任务需要了解方案组成。','Explore inspection, emergency operations, education and research, and systems integration.')}</p></div><div class="solutions-grid">${names.map((n,i)=>`<article id="scene-${i}"><img src="${A}scene-${i+1}.png" alt="${n}" loading="lazy"><small class="solution-scene-label">${t('场景示意','Illustrative scene')}</small><div><h2>${n}</h2><p>${desc[i]}</p>${btn(t('整理方案需求','Prepare a solution brief'),'contact.html?scenario='+i)}</div></article>`).join('')}</div></section>${detailedSolutions()}<section class="section delivery-section" id="delivery"><div class="reference-heading"><div><p class="eyebrow">DELIVERY</p><h2>${t('从需求验证<span>，</span><br>到现场部署<span>。</span>','From validation<br>to deployment<span>.</span>')}</h2></div><p class="lead">${t('围绕真实任务，逐步验证、配置与部署。','Validate, configure and deploy around a real task.')}</p></div><ol class="delivery-timeline">${stages.map((v,i)=>`<li><span class="delivery-number">${i+1}</span><h3>${v[0]}</h3><p>${v[1]}</p></li>`).join('')}</ol></section><section class="delivery-cta"><h2>${t('带上你的任务，<br>我们一起做场景验证<span>。</span>','Bring your task.<br>Let’s validate it together<span>.</span>')}</h2>${btn(t('准备需求单','Prepare a brief'),'contact.html')}</section>`;
}
function contact(){return `<section class="section contact"><div><p class="eyebrow">LET’S BUILD SOMETHING REAL</p><h1>${t('整理产品与场景需求。','Prepare your project brief.')}</h1><p class="lead">${t('填写应用场景、关注产品与联系方式，生成一份可下载的需求单。','Describe your application, product interests and contact details to create a downloadable brief.')}</p><p class="contact-note">${t('本页尚未开通在线提交。需求单仅供下载，不会自动发送或预约。','Online submission is not yet available. This form downloads a brief; it does not send a request or book a demo.')}</p></div><form id="demo-form"><h2>${t('产品与方案需求单','Product and solution brief')}</h2><label>${t('姓名','Name')}<input name="name" autocomplete="name" required maxlength="80"></label><label>${t('公司 / 机构','Company / institution')}<input name="company" autocomplete="organization" required maxlength="120"></label><label>${t('邮箱或电话','Email or phone')}<input name="contact" required maxlength="120"></label><label>${t('关注产品','Product of interest')}<select name="product"><option value="">${t('暂不确定，请协助选型','Help me choose')}</option>${products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></label><label>${t('任务与场景','Task and scenario')}<textarea name="task" rows="4" required maxlength="2000" placeholder="${t('例如：工业园区巡检、设备识别、科研开发……','Describe your task and environment…')}"></textarea></label><button class="button" type="submit">${t('生成并下载需求单','Download your brief')} <span>↓</span></button><p id="form-status" role="status"></p></form></section>`}
document.documentElement.lang=EN?'en':'zh-CN';
document.documentElement.dataset.page=route;
document.documentElement.dataset.version='20261022-r36';
const pageTitles={'index.html':t('首页','Home'),'products.html':t('产品矩阵','Product matrix'),'technology.html':t('技术能力与系统架构','Technology & architecture'),'about.html':t('关于大算机器人','About DOSO'),'solutions.html':t('解决方案','Solutions'),'contact.html':t('产品与方案需求单','Prepare a project brief')};
const metadata=typeof SITE_METADATA!=='undefined'?SITE_METADATA[route.replace('.html','')][EN?'en':'zh']:null;
document.title=metadata?.title||'DOSO Robotics｜'+pageTitles[route];
document.body.className='page-'+(route.replace('.html',''))+(EN?' english':'');
document.getElementById('app').innerHTML = header()+`<main id="main">${({'index.html':home,'products.html':()=>matrix()+productComparison()+catalogApplications(),'technology.html':tech,'about.html':about,'solutions.html':solutions,'contact.html':contact}[route]||home)()}</main>`+footer()+`<button class="back-to-top" type="button" hidden aria-label="${t('返回顶部','Back to top')}" title="${t('返回顶部','Back to top')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14M12 20V8m-6 6 6-6 6 6"/></svg><span>${t('返回顶部','Back to top')}</span></button><dialog id="product-dialog"><button class="close-dialog" aria-label="${t('关闭','Close')}">×</button><div id="product-detail"></div></dialog>`;
document.querySelector('.menu-toggle').addEventListener('click',e=>setNavigationOpen(e.currentTarget.getAttribute('aria-expanded')!=='true'));
// The same metadata is pre-rendered for crawlers and refreshed after in-page navigation.
if(metadata){
 const canonical=SITE_ORIGIN+'/'+(EN?'en/':'')+route;
 const values={'meta[name="description"]':metadata.description,'meta[property="og:title"]':metadata.title,'meta[property="og:description"]':metadata.description,'meta[property="og:url"]':canonical,'meta[property="og:locale"]':EN?'en_US':'zh_CN','meta[property="og:locale:alternate"]':EN?'zh_CN':'en_US','meta[property="og:image:alt"]':t('大算机器人轮足机器人','DOSO Robotics wheeled quadruped robot'),'meta[name="twitter:title"]':metadata.title,'meta[name="twitter:description"]':metadata.description};
 for(const [selector,value] of Object.entries(values))document.querySelector(selector)?.setAttribute('content',value);
 document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonical);
 for(const [language,prefix] of [['zh-CN',''],['en','en/'],['x-default','']])document.querySelector(`link[hreflang="${language}"]`)?.setAttribute('href',SITE_ORIGIN+'/'+prefix+route);
}
const comparisonToggle=document.getElementById('comparison-differences');
if(comparisonToggle){
 const syncComparison=()=>{
  comparisonDifferencesOnly=comparisonToggle.checked;
  const rows=[...document.querySelectorAll('[data-comparison-row]')];
  rows.forEach(row=>{row.hidden=comparisonDifferencesOnly&&row.dataset.different==='false';});
  const visible=rows.filter(row=>!row.hidden).length;
  const hidden=rows.length-visible;
  document.getElementById('comparison-status').textContent=comparisonDifferencesOnly
   ? t(`显示 ${visible} 项差异${hidden?`，已收起 ${hidden} 项共同能力`:'，当前各项均有差异'}。`,`${visible} differences shown${hidden?`; ${hidden} shared ${hidden===1?'feature':'features'} hidden`:'. All features differ'}.`)
   : t(`显示全部 ${rows.length} 项，浅蓝突出差异参数。`,`All ${rows.length} features shown. Blue highlights distinct specifications.`);
  syncComparisonOverflow();
 };
 comparisonToggle.addEventListener('change',syncComparison);
 syncComparison();
 if(typeof ResizeObserver!=='undefined'){
  comparisonResizeObserver=new ResizeObserver(syncComparisonOverflow);
  comparisonResizeObserver.observe(document.querySelector('.comparison-scroll'));
  comparisonResizeObserver.observe(document.getElementById('comparison-table'));
 }
 requestAnimationFrame(syncComparisonOverflow);
}
const dialog=document.getElementById('product-dialog');
document.querySelectorAll('[data-product]').forEach(b=>b.addEventListener('click',()=>{const p=products.find(p=>p.id===b.dataset.product);document.getElementById('product-detail').innerHTML=`${robotArt(p)}<div><p class="eyebrow">DOSO / ${p.name.toUpperCase()}</p><h2>${p.name}</h2><h3>${p.title}</h3><p>${p.desc}</p>${stats(p)}<dl class="robot-specs"><div><dt>${t('机身重量','Robot weight')}</dt><dd>${formatSpec(p.weight)}</dd></div><div><dt>${t('尺寸','Dimensions')}</dt><dd>${formatSpec(p.size)}</dd></div></dl><p class="fineprint">${t('载荷与机身重量分别列示。请根据任务需求确认产品配置与适用条件。','Payload and robot weight are listed separately. Confirm the configuration and operating conditions for your task.')}</p>${btn(t('整理该产品需求','Prepare a product brief'),'contact.html?product='+p.id)}</div>`;dialog.showModal()}));
document.querySelector('.close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
const flyDesc=[t('围绕现场环境与任务目标，验证机器人能力。','Validate capability against the site and task.'),t('沉淀运行状态、传感信息与任务结果。','Collect state, sensor information and task outcomes.'),t('利用任务反馈，持续训练与优化模型。','Train and improve models with task feedback.'),t('让验证结果反馈到硬件与运动能力。','Apply validation results to hardware and mobility.'),t('将经过验证的方案复制到更多行业。','Bring validated solutions to more industries.')];
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-step]').forEach(n=>{n.classList.remove('current');n.setAttribute('aria-pressed','false')});b.classList.add('current');b.setAttribute('aria-pressed','true');document.querySelector('.fly-caption').textContent=flyDesc[+b.dataset.step]});
document.getElementById('demo-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);const text=`${t('大算机器人','DOSO Robotics')} — ${t('产品与方案需求单','Project brief')}\n\n${[...data].map(([k,v])=>`${({name:t('姓名','Name'),company:t('机构','Company'),contact:t('联系方式','Contact'),product:t('关注产品','Product'),task:t('任务与场景','Task')})[k]}: ${k==='product'?(products.find(p=>p.id===v)?.name||t('暂不确定','Help me choose')):v}`).join('\n\n')}\n\n${t('本需求单仅供下载，尚未发送，也未形成预约。','This downloaded brief has not been sent and does not constitute a booking.')}`;const blob=new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='DOSO-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);document.getElementById('form-status').textContent=t('需求单已生成并下载，尚未发送给大算机器人。','Your brief has been downloaded. It has not been sent to DOSO.')});
const contactForm=document.getElementById('demo-form');
if(contactForm){const params=new URLSearchParams(location.search);const selected=params.get('product');if(products.some(p=>p.id===selected))contactForm.elements.product.value=selected;const scenario=params.get('scenario');if(/^[0-3]$/.test(scenario||''))contactForm.elements.task.value=[t('工业巡检','Industrial inspection'),t('应急作业','Emergency operations'),t('科研教育','Research & education'),t('系统集成','System integration')][+scenario];}
if(location.hash){requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());}





}

function setNavigationOpen(open, restoreFocus=false) {
  const toggle=document.querySelector('.menu-toggle');
  if(!toggle)return;
  const en=document.documentElement.lang==='en';
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?(en?'Close navigation':'关闭导航'):(en?'Open navigation':'打开导航'));
  document.querySelector('.header').classList.toggle('menu-open',open);
  syncBackToTop();
  if(restoreFocus)toggle.focus();
}

function syncComparisonOverflow() {
 const scroller=document.querySelector('.comparison-scroll');
 const hint=document.getElementById('comparison-hint');
 if(!scroller||!hint)return;
 const overflowing=scroller.scrollWidth>scroller.clientWidth+1;
 hint.hidden=!overflowing;
 if(overflowing)scroller.setAttribute('aria-describedby','comparison-hint');
 else scroller.removeAttribute('aria-describedby');
}

function syncBackToTop() {
  const button=document.querySelector('.back-to-top');
  if(!button)return;
  const scrollRange=document.documentElement.scrollHeight-window.innerHeight;
  const threshold=Math.min(300,Math.max(24,scrollRange*.25));
  button.hidden=window.scrollY<=threshold||!!document.querySelector('.header.menu-open');
  const footer=document.querySelector('footer');
  const footerOffset=footer?Math.max(0,window.innerHeight-footer.getBoundingClientRect().top):0;
  button.style.setProperty('--footer-offset',`${Math.ceil(footerOffset)}px`);
}

// URL language is explicit; a saved preference is used only for unmarked URLs.
function resolveSiteRoute(target, base, preferredLanguage='zh') {
  if(target.origin!==base.origin || !target.pathname.startsWith(base.pathname))return null;
  const parts=target.pathname.slice(base.pathname.length).replace(/^\/+|\/+$/g,'').split('/');
  const englishPath=parts[0]==='en';if(englishPath)parts.shift();
  if(parts.length>1)return null;
  const page=(parts[0]||'index').replace(/\.html$/,'');
  if(!['index','products','technology','about','solutions','contact'].includes(page))return null;
  const explicit=target.searchParams.get('lang');
  const en=explicit==='en'||(explicit!=='zh'&&(englishPath||preferredLanguage==='en'));
  return {page:page+'.html',en,root:base.href};
}

if (typeof __BUILD__ !== 'undefined') {
  renderSite();
} else {
  // Asset location is stable even if hosting normalizes page URLs.
  const base = document.currentScript?.src ? new URL('.',document.currentScript.src) : new URL(document.documentElement.dataset.root || './',location.href);
  let preferredLanguage=document.documentElement.lang==='en'?'en':'zh';
  try { const saved=localStorage.getItem('doso-language');if(saved==='en'||saved==='zh')preferredLanguage=saved; } catch {}
  const readRoute=target=>resolveSiteRoute(target,base,preferredLanguage);
  let state=readRoute(new URL(location.href))||{page:document.documentElement.dataset.page,en:preferredLanguage==='en',root:base.href};
  const canonical=(next,target)=>{const result=new URL((next.en?'en/':'')+next.page,base);result.search=target.search;result.searchParams.set('lang',next.en?'en':'zh');result.hash=target.hash;return result;};
  function show(next,keepScroll=false) {
    const y=window.scrollY;
    const form=document.getElementById('demo-form');
    const draft=form&&state.page===next.page?Object.fromEntries(new FormData(form)):null;
    state=next;preferredLanguage=state.en?'en':'zh';
    try{localStorage.setItem('doso-language',preferredLanguage);}catch{}
    renderSite(state);
    if(draft){const restored=document.getElementById('demo-form');for(const [key,value] of Object.entries(draft))if(restored.elements[key])restored.elements[key].value=value;}
    const skip=document.querySelector('.skip');if(skip)skip.textContent=state.en?'Skip to main content':'跳转至主要内容';
    if(keepScroll)window.scrollTo(0,y);else if(!location.hash)window.scrollTo(0,0);
    requestAnimationFrame(syncBackToTop);
  }
  if(location.protocol!=='file:'){const initial=canonical(state,new URL(location.href));history.replaceState({},'',initial.pathname+initial.search+initial.hash);}
  show(state);
  window.addEventListener('scroll',syncBackToTop,{passive:true});
  window.addEventListener('resize',syncBackToTop);
  window.addEventListener('resize',syncComparisonOverflow);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.header.menu-open'))setNavigationOpen(false,true);});
  document.addEventListener('click',event=>{
    if(!event.target.closest('.header'))setNavigationOpen(false);
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(event.target.closest('.back-to-top')){
      event.preventDefault();
      if(location.hash){
        history.replaceState({},'',location.pathname+location.search);
        document.querySelectorAll('[data-language]').forEach(link=>{const target=new URL(link.href);target.hash='';link.href=target.href;});
      }
      document.querySelector('.header .brand')?.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      return;
    }
    const link=event.target.closest('a[href]');
    if(!link||link.hasAttribute('download')||link.target)return;
    const target=new URL(link.href,location.href);const next=readRoute(target);if(!next)return;
    if(link.dataset.language){next.en=link.dataset.language==='en';target.searchParams.set('lang',next.en?'en':'zh');}
    if(!link.dataset.language&&target.pathname===location.pathname&&target.search===location.search&&target.hash)return;
    event.preventDefault();
    const destination=canonical(next,target);
    if(location.protocol==='file:'){location.href=destination.href;return;}
    if(destination.href!==location.href)history.pushState({},'',destination.pathname+destination.search+destination.hash);
    show(next,!!link.dataset.language);
  });
  window.addEventListener('popstate',()=>{const target=new URL(location.href);const next=readRoute(target);if(next){const destination=canonical(next,target);history.replaceState({},'',destination.pathname+destination.search+destination.hash);show(next);}});
}

