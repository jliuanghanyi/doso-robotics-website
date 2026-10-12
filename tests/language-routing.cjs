const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8');
const context={URL,URLSearchParams};
vm.runInNewContext(code.slice(0,code.indexOf("if (typeof __BUILD__")),context);
let count=0;
for(const prefix of ['/', '/preview/']){
  const base=new URL(prefix,'https://doso.test');
  for(const page of ['index','products','solutions','technology','about','contact']){
    for(const [path,preference,expected] of [
      [page+'.html','en',true],
      [page+'.html','zh',false],
      ['en/'+page+'.html','zh',true],
      [page+'.html?lang=en','zh',true],
      ['en/'+page+'.html?lang=zh','en',false],
      [page+'/?lang=en','zh',true],
      ['en/'+page+'/?product=orix#main','zh',true],
      [page+'.html?lang=zh&scenario=0#main','en',false]
    ]){
      const result=context.resolveSiteRoute(new URL(path,base),base,preference);
      assert.equal(result.page,page+'.html');assert.equal(result.en,expected,path);count++;
    }
  }
  assert.equal(context.resolveSiteRoute(new URL('https://other.test/products.html'),base,'en'),null);
}
console.log(`PASS ${count} language routing cases: explicit choice, saved preference, query/path conflict, normalized URL, subdirectory and anchors.`);
