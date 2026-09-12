const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe';
const URL = process.argv[2] || 'http://localhost:4321/';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell',
    args: ['--autoplay-policy=no-user-gesture-required','--no-sandbox'] });
  const res = {};
  for (const vp of [{w:1440,h:900,n:'escritorio'},{w:390,h:844,n:'telefono',mobile:true}]) {
    const page = await browser.newPage();
    await page.setViewport({width:vp.w,height:vp.h,isMobile:!!vp.mobile,hasTouch:!!vp.mobile,deviceScaleFactor:1});
    const errs=[], fallos=[];
    page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
    page.on('response', r => { if (r.status()>=400) fallos.push(r.status()+' '+r.url()); });
    let bytes=0, peticiones=0;
    page.on('response', async r => { peticiones++; try{ const h=r.headers()['content-length']; if(h) bytes+=+h; }catch{} });
    const t0=Date.now();
    await page.goto(URL, { waitUntil:'networkidle2', timeout:60000 });
    const carga = Date.now()-t0;
    await new Promise(r=>setTimeout(r,2500));

    const hero = await page.evaluate(() => {
      const v=document.querySelector('#heroVideo');
      return {src:(v.currentSrc||'').split('/').pop(), t:+v.currentTime.toFixed(2), pausado:v.paused,
              w:v.videoWidth, h:v.videoHeight, poster:!!v.poster};
    });
    await new Promise(r=>setTimeout(r,1200));
    const heroT2 = await page.evaluate(() => +document.querySelector('#heroVideo').currentTime.toFixed(2));

    const puntos=[];
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto'});
    for (const y of [1900, 2600, 3400, 3900, 5300]) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await new Promise(r=>setTimeout(r,500));
      puntos.push(await page.evaluate(() => {
        const v=document.querySelector('#peliVideo');
        return { y:scrollY, scrub:+v.currentTime.toFixed(2),
          capas:[...document.querySelectorAll('.muro__capa')].map(c=>{
            const m=(c.style.transform||'').match(/,\s*(-?[\d.]+)px/); return m?+(+m[1]).toFixed(2):null;}),
          paso:[...document.querySelectorAll('.peli__paso')].findIndex(e=>e.classList.contains('es-visible')) };
      }));
    }
    const enlaces = await page.evaluate(()=>[...document.querySelectorAll('a[href^="http"],a[href^="mailto"]')].map(a=>a.href));
    res[vp.n]={carga, peticiones, kb:Math.round(bytes/1024), hero, heroT2, puntos,
               errores:errs, fallos, enlaces:[...new Set(enlaces)]};
    await page.close();
  }
  // reduced motion
  const p3 = await browser.newPage();
  await p3.setViewport({width:1440,height:900});
  await p3.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p3.goto(URL,{waitUntil:'networkidle2'});
  await new Promise(r=>setTimeout(r,1500));
  await p3.evaluate(()=>window.scrollTo(0,5300));
  await new Promise(r=>setTimeout(r,800));
  res.reducido = await p3.evaluate(()=>({
    heroPausado: document.querySelector('#heroVideo').paused,
    capas:[...document.querySelectorAll('.muro__capa')].map(c=>c.style.transform||'sin-transform'),
    pasosVisibles:[...document.querySelectorAll('.peli__paso')].filter(e=>e.classList.contains('es-visible')).length,
    textoVisible:getComputedStyle(document.querySelector('.titular')).opacity
  }));
  await browser.close();
  console.log(JSON.stringify(res,null,1));
})();
