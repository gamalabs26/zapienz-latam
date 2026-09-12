/* ═══════════════════════════════════════════════════════════
   ZAPIENZ · movimiento
   Todo lo que se mueve corre sobre transform/opacity y dentro de
   un solo rAF. Si el sistema pide menos movimiento, no arranca.
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';

const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
const tacto  = window.matchMedia('(hover: none)');
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lim = (v, a, b) => v < a ? a : v > b ? b : v;

/* ── entrada del hero ─────────────────────────────────────── */
$$('[data-anim]').forEach(el => {
  el.style.setProperty('--retraso', (el.dataset.anim - 1) * 0.09 + 's');
});
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('cargado')));
$('#anio').textContent = new Date().getFullYear();

/* ── revelado al entrar en cuadro ─────────────────────────── */
const verRev = new IntersectionObserver((entradas) => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.style.setProperty('--retraso', ((el.dataset.esc || 0) * 0.08) + 's');
    el.classList.add('es-visible');
    verRev.unobserve(el);
  });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
$$('.rev').forEach(el => verRev.observe(el));

/* ── contadores ───────────────────────────────────────────── */
const verNum = new IntersectionObserver((entradas) => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, fin = +el.dataset.contar;
    verNum.unobserve(el);
    if (quieto.matches) { el.textContent = fin; return; }
    const dur = 1100, t0 = performance.now();
    const paso = (t) => {
      const p = lim((t - t0) / dur, 0, 1);
      el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}, { threshold: 0.6 });
$$('[data-contar]').forEach(el => verNum.observe(el));

/* ── muro: las portadas reales del catálogo, en 3 profundidades ── */
const PORTADAS = ['arte-pensar','hablame-bonito','quiet','sociedad-cansancio','factfulness',
  'atrevete','cinco-segundos','cerebro-manda','mujeres-poder','aprende-rapido','minimalismo',
  'tiende-cama','pensamiento-lateral','bullshit-jobs','buena-suerte','tercera-ola'];

const repartos = { a: PORTADAS.slice(0, 6), b: PORTADAS.slice(6, 11), c: PORTADAS.slice(11) };
$$('.muro__fila').forEach(fila => {
  const lote = repartos[fila.dataset.fila] || PORTADAS;
  // se duplica para que la deriva cierre en bucle exacto (-50%)
  fila.innerHTML = [...lote, ...lote].map(n =>
    `<img src="assets/portadas/${n}.webp" alt="" width="340" height="510" loading="lazy" decoding="async">`
  ).join('');
});

/* ── el hero elige su corte segun el viewport ─────────────── */
/* 16:9 en escritorio, 9:16 en telefono: son dos corridas distintas,
   no un recorte. El atributo media de <source> no funciona dentro de
   <video>, asi que la eleccion se hace aqui, antes de pedir bytes. */
(() => {
  const v = document.getElementById('heroVideo');
  if (!v) return;
  const ancho = window.matchMedia('(min-width: 768px)').matches;
  const puedeWebm = v.canPlayType('video/webm; codecs="vp9"');
  const poster = ancho ? 'assets/img/hero-poster.jpg' : 'assets/img/hero-poster-916.jpg';
  const src = ancho
    ? (puedeWebm ? v.dataset.anchoWebm : v.dataset.anchoMp4)
    : v.dataset.altoMp4;
  v.poster = poster;
  v.src = src;
  v.load();
})();

/* ── un solo lazo para todo lo que depende del scroll ─────── */
const capas = $$('.muro__capa');
const heroVideo = $('#heroVideo');
const heroMedia = $('#heroMedia');
const nav = $('#nav');
const peli = $('#proceso');
const peliPista = $('#peliPista');
const peliVideo = $('#peliVideo');
const peliBarra = $('#peliBarra');
const pasos = $$('.peli__paso');

let durPeli = 0;
const leerDur = () => { if (!durPeli && peliVideo.duration) durPeli = peliVideo.duration; };
peliVideo.addEventListener('loadedmetadata', leerDur);
peliVideo.addEventListener('durationchange', leerDur);

let pedido = false, alto = window.innerHeight;
const marcar = () => { if (!pedido) { pedido = true; requestAnimationFrame(pintar); } };

function pintar() {
  pedido = false;
  const y = window.scrollY;

  nav.classList.toggle('es-solido', y > 40);

  /* hero: el video deriva más lento que la página (profundidad 1) */
  if (!quieto.matches && heroMedia && y < alto * 1.3) {
    const p = y / alto;
    heroVideo.style.transform = `scale(${1.06 + p * 0.05}) translate3d(0, ${p * 12}%, 0)`;
  }

  /* muro: tres profundidades distintas (2, 3) */
  if (!quieto.matches && capas.length) {
    const caja = capas[0].parentElement.getBoundingClientRect();
    if (caja.bottom > -200 && caja.top < alto + 200) {
      const avance = (alto - caja.top) / (alto + caja.height);
      capas.forEach(capa => {
        capa.style.transform = `translate3d(0, ${((avance - 0.5) * -900 * +capa.dataset.prof).toFixed(2)}px, 0)`;
      });
    }
  }

  /* scrollytelling: el scroll es la cabeza lectora del video */
  if (peli && !quieto.matches) {
    const caja = peli.getBoundingClientRect();
    const total = peli.offsetHeight - peliPista.offsetHeight;
    if (caja.top <= 0 && caja.bottom >= alto) {
      const p = lim(-caja.top / total, 0, 1);
      leerDur();
      if (durPeli) {
        const t = p * (durPeli - 0.05);
        if (Math.abs(peliVideo.currentTime - t) > 0.03) peliVideo.currentTime = t;
      }
      peliBarra.style.transform = `scaleX(${p.toFixed(4)})`;
      const activo = lim(Math.floor(p * pasos.length), 0, pasos.length - 1);
      pasos.forEach((el, i) => el.classList.toggle('es-visible', i === activo));
    } else if (caja.top > 0) {
      pasos.forEach((el, i) => el.classList.toggle('es-visible', i === 0));
    }
  }
}

/* el video del scroll solo se descarga cuando la sección se acerca */
if (peli && !quieto.matches) {
  new IntersectionObserver((e, obs) => {
    if (!e[0].isIntersecting) return;
    peliVideo.preload = 'auto';
    if (peliVideo.readyState < 2) peliVideo.load();
    obs.disconnect();
  }, { rootMargin: '120% 0px' }).observe(peli);
} else if (peliVideo) {
  peliVideo.preload = 'metadata';
  peliVideo.load();
  pasos.forEach(el => el.classList.add('es-visible'));
}

window.addEventListener('scroll', marcar, { passive: true });
window.addEventListener('resize', () => { alto = window.innerHeight; marcar(); }, { passive: true });
marcar();

/* ── el mouse destapa el video bajo el velo ───────────────── */
const foco = $('#heroFoco');
if (foco && !quieto.matches && !tacto.matches) {
  let mx = 50, my = 50, fx = 50, fy = 50, vivo = false;
  const hero = $('.hero');
  hero.addEventListener('pointermove', (e) => {
    const c = hero.getBoundingClientRect();
    mx = ((e.clientX - c.left) / c.width) * 100;
    my = ((e.clientY - c.top) / c.height) * 100;
    if (!vivo) { vivo = true; seguir(); }
  }, { passive: true });
  const seguir = () => {
    fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
    foco.style.setProperty('--mx', fx.toFixed(2) + '%');
    foco.style.setProperty('--my', fy.toFixed(2) + '%');
    if (Math.abs(mx - fx) > 0.05 || Math.abs(my - fy) > 0.05) requestAnimationFrame(seguir);
    else vivo = false;
  };
}

/* ── botones imantados ────────────────────────────────────── */
if (!quieto.matches && !tacto.matches) {
  $$('[data-iman]').forEach(btn => {
    let dentro = false;
    btn.addEventListener('pointerenter', () => { dentro = true; });
    btn.addEventListener('pointermove', (e) => {
      if (!dentro) return;
      const c = btn.getBoundingClientRect();
      const dx = (e.clientX - (c.left + c.width / 2)) * 0.26;
      const dy = (e.clientY - (c.top + c.height / 2)) * 0.34;
      btn.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    }, { passive: true });
    btn.addEventListener('pointerleave', () => { dentro = false; btn.style.transform = ''; });
  });
}

/* ── el hero no gasta batería fuera de cuadro ─────────────── */
if (heroVideo) {
  new IntersectionObserver((e) => {
    if (quieto.matches) { heroVideo.pause(); return; }
    e[0].isIntersecting ? heroVideo.play().catch(() => {}) : heroVideo.pause();
  }, { threshold: 0.05 }).observe(heroVideo);
  if (quieto.matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
}

})();
