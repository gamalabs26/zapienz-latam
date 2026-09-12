/* Servidor local de verificacion: soporta Range, que es lo que el navegador
   necesita para hacer seek dentro de un <video>. Sin Range no hay scrub. */
const http=require('http'),fs=require('fs'),p=require('path');
const RAIZ=__dirname;
const T={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8',
'.mp4':'video/mp4','.webm':'video/webm','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp',
'.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.txt':'text/plain',
'.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{
  let f=decodeURIComponent(q.url.split('?')[0]); if(f==='/')f='/index.html';
  const fp=p.join(RAIZ,f);
  fs.stat(fp,(e,st)=>{
    if(e||!st.isFile()){ r.writeHead(404,{'Content-Type':'text/html;charset=utf-8'});
      return fs.createReadStream(p.join(RAIZ,'404.html')).pipe(r); }
    const tipo=T[p.extname(fp)]||'application/octet-stream';
    const rango=q.headers.range;
    if(rango){
      const m=/bytes=(\d*)-(\d*)/.exec(rango);
      const ini=m[1]?+m[1]:0, fin=m[2]?+m[2]:st.size-1;
      r.writeHead(206,{'Content-Type':tipo,'Accept-Ranges':'bytes',
        'Content-Range':`bytes ${ini}-${fin}/${st.size}`,'Content-Length':fin-ini+1});
      return fs.createReadStream(fp,{start:ini,end:fin}).pipe(r);
    }
    r.writeHead(200,{'Content-Type':tipo,'Accept-Ranges':'bytes','Content-Length':st.size});
    fs.createReadStream(fp).pipe(r);
  });
}).listen(4321,()=>console.log('servidor 4321 con Range'));
