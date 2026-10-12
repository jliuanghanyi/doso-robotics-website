const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const dist=path.join(__dirname,'dist');
const code=fs.readFileSync(path.join(dist,'app.js'),'utf8');
const {createHash}=require('node:crypto');
const fingerprint=(source,ext)=>{const name=`${ext==='js'?'app':'styles'}.${createHash('sha256').update(source).digest('hex').slice(0,12)}.${ext}`;fs.writeFileSync(path.join(dist,name),source);return name;};
const appAsset=fingerprint(code,'js');
const cssAsset=fingerprint(fs.readFileSync(path.join(dist,'styles.css'),'utf8'),'css');
const pages={index:['让机器人理解任务，进入真实世界','Robotics for the real world'],products:['产品矩阵','Product matrix'],technology:['技术能力与系统架构','Technology & architecture'],about:['关于 DOSO','About DOSO'],solutions:['解决方案','Solutions'],contact:['联系与演示需求','Contact & demo']};
const stop=Symbol('rendered');
function render(page,en,pathname='/'){
 let html='';
 const root=en?'../':'./';
 const document={documentElement:{lang:en?'en':'zh-CN',dataset:{page:page+'.html',root}},body:{},getElementById(id){assert.equal(id,'app');return {set innerHTML(value){html=value;throw stop}}}};
 try{vm.runInNewContext(code,{__BUILD__:true,document,location:{pathname,search:'',hash:''},URLSearchParams});}catch(e){if(e!==stop)throw e;}
 assert.ok(html.includes('<main id="main">'));
 return {html,body:document.body.className,root};
}
for(const [page,titles] of Object.entries(pages))for(const en of [false,true]){
 const {html,body,root}=render(page,en);
 assert.equal(html,render(page,en,'/'+(en?'en/':'')+page).html,'Page identity must not depend on hosting URL normalization');
 const target=path.join(dist,en?'en':'',page+'.html');fs.mkdirSync(path.dirname(target),{recursive:true});
 const doc=`<!doctype html>\n<html lang="${en?'en':'zh-CN'}" data-page="${page}.html" data-root="${root}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${en?'DOSO Robotics: robot platforms, simulation and real-world task intelligence.':'DOSO Robotics 大算机器人：机器人平台、仿真与真实任务智能。'}"><title>DOSO Robotics｜${titles[en?1:0]}</title><link rel="stylesheet" href="${root}${cssAsset}"><script src="${root}${appAsset}" defer></script></head><body class="${body}"><a href="#main" class="skip">${en?'Skip to main content':'跳转至主要内容'}</a><div id="app">${html}</div></body></html>\n`;
 fs.writeFileSync(target,doc);
 const expectedLangLink=en?`${root}${page}.html?lang=zh`:`${root}en/${page}.html?lang=en`;
 assert.ok(html.includes(`href="${expectedLangLink}"`));
 if(page!=='index')assert.ok(!html.includes('class="hero"'),'Only the homepage may render the homepage hero');
 if(en)assert.ok(!/[\u4e00-\u9fff]/.test(html.replace(/aria-label="切换为中文"/g,'').replace(/>中</g,'><')),'English page should not retain Chinese interface copy');
 console.log(`PASS ${en?'en/':''}${page}.html: distinct pre-rendered page, explicit language link, normalized URL safe`);
}
for(const lang of ['','en/']){
 const bodies=Object.keys(pages).map(p=>fs.readFileSync(path.join(dist,lang,p+'.html'),'utf8'));
 assert.equal(new Set(bodies).size,6);
}
