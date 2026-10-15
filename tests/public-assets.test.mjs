import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';

test('published dashboard contains only the public overview and upgrade notice',async()=>{
  const root=new URL('../public/dashboard/',import.meta.url);
  async function files(directory,prefix='') {
    const result=[];
    for(const item of await readdir(directory,{withFileTypes:true})) {
      if(item.isDirectory())result.push(...await files(new URL(item.name+'/',directory),prefix+item.name+'/'));
      else result.push(prefix+item.name);
    }
    return result;
  }
  assert.deepEqual((await files(root)).sort(),['assets/app.css','assets/landing.css','assets/landing.js','assets/live.css','assets/public-landing.css','assets/variants.css','console.html'].sort());
  const html=await readFile(new URL('console.html',root),'utf8'),js=await readFile(new URL('assets/landing.js',root),'utf8');
  assert.ok(js.includes('系统升级中，敬请期待'));
  assert.doesNotMatch(html+js,/workspace\.html|\/api\/auth|\/v1\/display|EMAIL_MOCK_CODE|123456|localStorage|sessionStorage/);
});
