'use strict';
/* Prototipo navegable. Todo es local y simulado: no hay servidor, pagos ni IA reales. */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const eur = (n) => (Math.round(n * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Azar con semilla (para que los datos de ejemplo sean siempre los mismos) ---------- */
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- Fechas ---------- */
const AHORA = new Date();
const HOY = new Date(AHORA.getFullYear(), AHORA.getMonth(), AHORA.getDate());
const MIN_AHORA = AHORA.getHours() * 60 + AHORA.getMinutes();
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const kF = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deK = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const minH = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const fLarga = (d) => d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
const fCorta = (d) => d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '').replace(/\./g, '');
const esHoy = (d) => kF(d) === kF(HOY);
function fRel(d) {
  const dif = Math.round((d - HOY) / 864e5);
  if (dif === 0) return 'Hoy';
  if (dif === 1) return 'Mañana';
  return mayus(fCorta(d));
}

/* ---------- Iconos ---------- */
const ICON = {
  atras: '<path d="M15 18l-6-6 6-6"/>',
  sig: '<path d="M9 18l6-6-6-6"/>',
  cerrar: '<path d="M18 6L6 18M6 6l12 12"/>',
  play: '<path d="M7.5 4.8v14.4L19.5 12z" fill="currentColor" stroke="none"/>',
  estrella: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none"/>',
  corazon: '<path d="M12 20s-7-4.4-9-9.1C1.7 7.6 3.9 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.2 0 5.4 3.1 4.1 6.4-2 4.7-9 9.1-9 9.1z"/>',
  compartir: '<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  agenda: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M7.5 17h6"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  explorar: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  inspiracion: '<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/>',
  grafico: '<path d="M3.5 20.5h17M6.5 16.5v-4M11.5 16.5v-9M16.5 16.5v-6"/>',
  caja: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="2.6"/><path d="M6.5 9.5h.01M17.5 15.5h.01"/>',
  producto: '<path d="M9.5 3h5M10.5 3v3.2C8.4 7 7 8.9 7 11.3V19a2 2 0 002 2h6a2 2 0 002-2v-7.7c0-2.4-1.4-4.3-3.5-5.1V3"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  chispa: '<path d="M12 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  enviar: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  campana: '<path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0"/>',
  tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  tienda: '<path d="M4.5 10v10h15V10M3 4.5h18l-1 4.5a2.8 2.8 0 01-5.3.6 2.9 2.9 0 01-5.4 0A2.8 2.8 0 014 9z"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  repetir: '<path d="M4 12a8 8 0 0113.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 01-13.7 5.7L4 15.5M4 20v-4.5h4.5"/>',
  papelera: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a2 2 0 002 1.5h6a2 2 0 002-1.5L18 7M9 7V4.5h6V7"/>',
  escudo: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>',
  mensaje: '<path d="M4 19.5l1.3-3.8A8 8 0 1112 20a8 8 0 01-3.8-1z"/>',
  sube: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  baja: '<path d="M12 5v14M18 13l-6 6-6-6"/>',
  alerta: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  equipo: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c1.7.8 2.9 2.6 3.5 5.2"/>',
  camara: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  megafono: '<path d="M4 10v4h3l7 4.5V5.5L7 10z"/><path d="M17.5 9a4 4 0 010 6M7 14l1.2 5h2.3L10 14.8"/>',
  subir: '<path d="M12 16V4M7 9l5-5 5 5M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4"/>',
  comentario: '<path d="M20 12a8 8 0 01-11.6 7.1L4 20l1-4.2A8 8 0 1120 12z"/>',
  pin2: '<path d="M14.5 4l5.5 5.5-3 1-3.5 3.5.5 4-2 1-3-3L5 20l-1-1 4.5-4.5-3-3 1-2 4 .5L14 6.5z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  luna: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  euro: '<path d="M17 6.5A7 7 0 007.5 12a7 7 0 009.5 5.5M4.5 10.5h8M4.5 13.5h8"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const estrellas = (n) => `<span class="estrellas">${Array.from({ length: 5 }, (_, i) => `<svg class="ic ic-s" viewBox="0 0 24 24" style="opacity:${i < n ? 1 : 0.2}">${ICON.estrella}</svg>`).join('')}</span>`;
const orbe = (cls = '') => `<span class="orbe ${cls}">${ic('chispa')}</span>`;
function prodIc(p) {
  const c = p.tono;
  const formas = {
    tarro: `<rect x="7" y="7" width="18" height="5" rx="1.6" fill="${c}"/><rect x="8" y="12.5" width="16" height="12.5" rx="3" fill="${c}" opacity=".55"/>`,
    bote: `<rect x="13" y="3" width="6" height="5" rx="1.2" fill="${c}"/><rect x="10" y="8.5" width="12" height="19.5" rx="3" fill="${c}" opacity=".55"/>`,
    gotero: `<rect x="14" y="2.5" width="4" height="7" rx="1.5" fill="${c}"/><rect x="11" y="9.5" width="10" height="18.5" rx="3" fill="${c}" opacity=".55"/>`,
    peine: `<rect x="4" y="9" width="24" height="5" rx="2" fill="${c}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${5.2 + i * 2.8}" y="14.5" width="1.4" height="8" rx=".7" fill="${c}" opacity=".6"/>`).join('')}`,
  };
  return `<span class="prod-ic"><svg viewBox="0 0 32 32" aria-hidden="true">${formas[p.forma] || formas.tarro}</svg></span>`;
}

/* ---------- Estado ---------- */
const S = {
  modo: 'cliente',
  vista: 'explorar',
  historial: [],
  cat: 'todo',
  tabFicha: 'servicios',
  filtroRes: 'todas',
  buscaRes: '',
  resenas: [],
  reserva: null,
  mesOff: 0,
  citas: [],
  pasadas: [
    { servicio: 'combo', pro: 'javi', fecha: addD(HOY, -28), hora: '18:00' },
    { servicio: 'corte', pro: 'adri', fecha: addD(HOY, -63), hora: '11:30' },
  ],
  extra: {},
  espera: [],
  agendaDia: 0,
  ticket: { pro: 'javi', items: {}, metodo: 'tarjeta' },
  cajaTab: 'servicios',
  periodo: 'mes',
  productos: PRODUCTOS.map((p) => ({ ...p })),
  ventas: [],
  guiaVista: false,
  vacaciones: [],
  muro: [],
  subidos: [],
  likes: {},
  tema: 'oscuro',
};
{
  const lunes = addD(HOY, (8 - HOY.getDay()) % 7 || 7);
  S.vacaciones.push({ pro: 'javi', desde: lunes, hasta: addD(lunes, 5) });
  S.muro = [
    { id: 'm1', autor: 'pro', pro: 'javi', nombre: 'Javi', texto: `Me voy de vacaciones del ${fLarga(lunes)} al ${fLarga(addD(lunes, 5))}. Adri os atiende con normalidad. ¡A la vuelta, más y mejor! 💈`, fecha: addD(HOY, -2), fijado: true, respuestas: [{ nombre: 'Curro', texto: '¡Disfruta, crack! Te pido cita a la vuelta.' }], likes: 24 },
    { id: 'm2', autor: 'negocio', nombre: NEGOCIOS[0].nombre, texto: 'Nuevo en el estudio: aceite de barba. Pregúntanos en tu próxima cita y te dejamos probarlo.', fecha: addD(HOY, -5), img: IMG + 'g-productos-900.webp', respuestas: [], likes: 31 },
    { id: 'm3', autor: 'cliente', nombre: 'Pablo', texto: '¿Puedo ir con mi hijo y que nos cortéis a la vez?', fecha: addD(HOY, -6), respuestas: [{ nombre: 'Adri', negocio: true, texto: 'Claro: reserva dos citas a la misma hora, una con Javi y otra conmigo.' }], likes: 5 },
    { id: 'm4', autor: 'cliente', nombre: 'Álvaro', texto: 'Recién salido de las manos de Adri 🔥', fecha: addD(HOY, -9), img: IMG + 'obras/carmesi.webp', respuestas: [], likes: 47 },
  ];
}
const enVacaciones = (p, d) => S.vacaciones.some((v) => v.pro === p && d >= v.desde && d <= v.hasta);
function haceCuanto(d) {
  const dias = Math.round((HOY - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  return fCorta(d);
}
const nuevaReserva = () => ({ paso: 0, servicio: null, pro: null, fecha: null, hora: null, pago: 'local', nota: '' });
S.reserva = nuevaReserva();
const serv = (id) => SERVICIOS.find((s) => s.id === id);
const pro = (id) => EQUIPO.find((p) => p.id === id);
const prod = (id) => S.productos.find((p) => p.id === id);

/* ---------- Disponibilidad (misma fuente para el cliente y la agenda del negocio) ---------- */
const cacheBase = new Map();
function libresBase(p, d) {
  const k = p + kF(d);
  if (cacheBase.has(k)) return cacheBase.get(k);
  const r = rng(hash(k));
  const x = r();
  let n;
  if (x < 0.13) n = 0;
  else if (x < 0.38) n = 1 + Math.floor(r() * 3);
  else if (x < 0.68) n = 4 + Math.floor(r() * 4);
  else n = 8 + Math.floor(r() * 5);
  const orden = HORAS.map((h) => [r(), h]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
  const set = new Set(orden.slice(0, n));
  cacheBase.set(k, set);
  return set;
}
function libres(p, d) {
  if (!p) p = 'any';
  if (d.getDay() === 0 || d < HOY) return [];
  if (p === 'any') return [...new Set([...libres('javi', d), ...libres('adri', d)])].sort((a, b) => minH(a) - minH(b));
  if (enVacaciones(p, d)) return [];
  const base = libresBase(p, d);
  const k = kF(d);
  return HORAS.filter((h) => base.has(h) && !S.extra[`${k}|${p}|${h}`] && !(esHoy(d) && minH(h) <= MIN_AHORA + 15));
}
function nivel(p, d) {
  if (d < HOY) return 'pasado';
  if (d.getDay() === 0) return 'cerrado';
  if (esHoy(d) && MIN_AHORA > minH(HORAS[HORAS.length - 1])) return 'pasado';
  const n = libres(p, d).length;
  if (n === 0) return 'completo';
  if (n <= 3) return 'poca';
  if (n <= 7) return 'media';
  return 'alta';
}
function proLibre(f, h) { return ['javi', 'adri'].find((p) => libres(p, f).includes(h)); }
function proximoHueco(p = 'any') {
  for (let i = 0; i < 30; i++) {
    const d = addD(HOY, i);
    const l = libres(p, d);
    if (l.length) return { fecha: d, hora: l[0], pro: p === 'any' ? proLibre(d, l[0]) : p };
  }
  return null;
}
const PESOS = [['corte', 30], ['combo', 22], ['degradado', 18], ['barba', 10], ['largo', 6], ['nino', 5], ['senior', 4], ['mechas', 3], ['color', 2]];
function elegirServicio(x) { let acc = 0; const tot = 100; for (const [id, w] of PESOS) { acc += w; if (x * tot < acc) return serv(id); } return serv('corte'); }
function citaGenerada(p, d, h) {
  const r = rng(hash(p + kF(d) + h));
  return { servicio: elegirServicio(r()), cliente: CLIENTES[Math.floor(r() * CLIENTES.length)], online: r() < 0.3 };
}

/* ---------- Ventas de ejemplo (2 años) para las estadísticas ---------- */
function generarVentas() {
  const ventas = [];
  for (let off = 730; off >= 0; off--) {
    const d = addD(HOY, -off);
    if (d.getDay() === 0) continue;
    const k = kF(d);
    for (const p of EQUIPO) {
      const base = libresBase(p.id, d);
      const tks = [];
      HORAS.forEach((h) => {
        if (base.has(h)) return;
        if (off === 0 && minH(h) + 30 > MIN_AHORA) return;
        const r = rng(hash(p.id + k + h));
        const s = elegirServicio(r());
        r(); r();
        if (off > 365 && r() < 0.12) return; // el año pasado se trabajó algo menos
        const m = r();
        const tk = `${k}${p.id}${h}`;
        tks.push(tk);
        ventas.push({ t: +d + minH(h) * 6e4, pro: p.id, tipo: 's', id: s.id, precio: s.precio, metodo: m < 0.55 ? 'tarjeta' : m < 0.82 ? 'efectivo' : 'bizum', com: (s.precio * p.comisionServicios) / 100, tk });
      });
      const r = rng(hash('prod' + p.id + k));
      const np = Math.floor(r() * r() * 4);
      for (let i = 0; i < np && tks.length; i++) {
        const pr = PRODUCTOS[Math.floor(r() * PRODUCTOS.length)];
        const tk = tks[Math.floor(r() * tks.length)];
        const v = ventas.find((x) => x.tk === tk);
        ventas.push({ t: v.t, pro: p.id, tipo: 'p', id: pr.id, precio: pr.precio, metodo: v.metodo, com: p.propietario ? 0 : (pr.precio * pr.comision) / 100, tk });
      }
    }
  }
  return ventas;
}

/* ---------- Navegación ---------- */
const VISTAS = {};
let limpiezas = [];
function ir(vista, { dir = 'adelante', reset = false } = {}) {
  if (reset) S.historial = [];
  else if (S.vista !== vista) S.historial.push(S.vista);
  S.vista = vista;
  render(dir);
}
function volver() {
  const v = S.historial.pop() || (S.modo === 'cliente' ? 'inicio' : 'agenda');
  S.vista = v;
  render('atras');
}
function render(dir, { mantenerScroll = false } = {}) {
  const cont = $('#vista');
  const viejo = $('.view', cont);
  const top = mantenerScroll && viejo ? viejo.scrollTop : 0;
  limpiezas.forEach((f) => f());
  limpiezas = [];
  const def = VISTAS[S.vista];
  const [scroll, fijo = ''] = def.html();
  const capa = document.createElement('div');
  capa.className = 'capa';
  capa.innerHTML = `<div class="view ${def.clase || ''}">${scroll}</div>${fijo}`;
  cont.replaceChildren(capa);
  const view = $('.view', capa);
  if (top) view.scrollTop = top;
  if (dir && !reducido) {
    const x = dir === 'atras' ? -24 : dir === 'fundido' ? 0 : 24;
    capa.animate([{ opacity: 0, transform: `translateX(${x}px)` }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }
  pintarTabbar(def.tabbar !== false);
  observarVideos(capa);
  if (def.montar) def.montar(capa);
}

/* Vídeos: se cargan y reproducen solo cuando se ven */
let io;
function observarVideos(root) {
  if (io) io.disconnect();
  io = new IntersectionObserver((entradas) => {
    entradas.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else v.pause();
    });
  }, { threshold: 0.2 });
  $$('video[data-auto]', root).forEach((v) => io.observe(v));
}
function encenderVideo(v, on) {
  if (!v) return;
  if (on) {
    if (!v.src) v.src = v.dataset.src;
    v.currentTime = 0;
    v.addEventListener('playing', () => v.classList.add('listo'), { once: true });
    v.play().catch(() => {});
  } else {
    v.classList.remove('listo');
    v.pause();
  }
}

/* ---------- Barra inferior ---------- */
function pintarTabbar(visible) {
  const tb = $('#tabbar');
  const items = S.modo === 'cliente'
    ? [['inicio', 'Inicio', 'casa'], ['explorar', 'Explorar', 'buscar'], ['inspiracion', 'Feed', 'inspiracion'], ['citas', 'Citas', 'calendario'], ['perfil', 'Perfil', 'usuario']]
    : [['agenda', 'Calendario', 'agenda'], ['clientes', 'Clientes', 'equipo'], ['ia'], ['caja', 'Caja', 'caja'], ['ajustes', 'Ajustes', 'ajustes']];
  const actual = VISTAS[S.vista]?.padre || S.vista;
  tb.innerHTML = items.map(([v, txt, icono]) => v === 'ia'
    ? `<button class="tab tab--orbe" data-a="ia" aria-label="Asistente IA">${orbe()}</button>`
    : `<button class="tab" data-a="tab" data-v="${v}" ${actual === v ? 'aria-current="page"' : ''}>${ic(icono)}<span>${txt}</span></button>`).join('');
  tb.classList.toggle('oculta', !visible);
  tb.classList.toggle('tabbar--4', S.modo === 'cliente');
}

/* ---------- Toast ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.innerHTML = `${ic('check')}<span>${msg}</span>`;
  t.style.bottom = $('#tabbar').classList.contains('oculta') ? '118px' : '';
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 3000);
}

/* =====================================================================
   VISTAS DEL CLIENTE
   ===================================================================== */
/* ---------- Ficha del negocio ---------- */
VISTAS.negocio = {
  clase: 'view--full view--sinnav',
  tabbar: false,
  html() {
    const n = NEGOCIOS[0];
    const ph = proximoHueco();
    const tabs = [['servicios', 'Servicios'], ['muro', 'Muro'], ['equipo', 'Equipo'], ['trabajos', 'Trabajos'], ['resenas', 'Reseñas'], ['info', 'Info']];
    return [`
      <div class="ficha-hero">
        <img src="${n.portada}" alt="">
        <video data-auto data-src="${n.video}" muted loop playsinline preload="none"></video>
        <div class="ficha-hero__bar">
          <button class="icon-btn icon-btn--glass" data-a="volver" aria-label="Volver">${ic('atras')}</button>
          <div>
            <button class="icon-btn icon-btn--glass" data-a="toast" data-t="Enlace copiado para compartir" aria-label="Compartir">${ic('compartir')}</button>
            <button class="icon-btn icon-btn--glass" data-a="toast" data-t="Guardado en favoritos" aria-label="Favorito">${ic('corazon')}</button>
          </div>
        </div>
        <button class="trailer-btn" data-a="trailer"><span class="trailer-btn__play">${ic('play')}</span>Ver tráiler <small>· 25 s</small></button>
      </div>
      <div class="ficha-info">
        <div class="ficha-logo"><img src="${n.logo}" alt=""></div>
        <h1>${n.nombre}</h1>
        <div class="ficha-meta">${estrellas(5)}<b>5,0</b><span>(${n.totalResenas} reseñas)</span><i class="sep"></i><span>${n.tipo}</span><i class="sep"></i><span>${fDist(n)}</span></div>
        <div class="ficha-meta">${ic('pin', 'ic-s')}${n.direccion}</div>
        <div class="ventajas">
          <span class="pill">${ic('chispa', 'ic-s')}IA 24/7</span>
          <span class="pill">${ic('tarjeta', 'ic-s')}Pago en la app</span>
          <span class="pill">${ic('lista', 'ic-s')}Lista de espera</span>
        </div>
      </div>
      <div class="pad avisos-ficha">${avisosReserva()}</div>
      ${ph ? `<div class="hueco-rapido"><span class="punto"></span><div><b>Próximo hueco: ${fRel(ph.fecha).toLowerCase()} · ${ph.hora}</b><small>con ${pro(ph.pro).nombre} · reserva en 2 toques</small></div><button class="btn btn--sm btn--primary" data-a="hueco-rapido" data-f="${kF(ph.fecha)}" data-h="${ph.hora}" data-p="${ph.pro}">Reservar</button></div>` : ''}
      <div class="tabs"><div class="tabs__lista" role="tablist">
        ${tabs.map(([id, t]) => `<button role="tab" data-a="tab-ficha" data-t="${id}" aria-selected="${S.tabFicha === id}">${t}</button>`).join('')}
        <i class="tabs__ind"></i>
      </div></div>
      <div class="panel" id="panel">${panelFicha()}</div>`,
    `<div class="cta-fija">
        <button class="icon-btn" style="width:54px;height:54px" data-a="ia" aria-label="Preguntar a la IA">${orbe('orbe--sm')}</button>
        <button class="btn btn--primary" data-a="reservar">Reservar cita</button>
      </div>`];
  },
  montar(capa) {
    moverIndicador(capa);
    if (S.tabFicha === 'resenas') montarResenas(capa);
  },
};
function moverIndicador(capa = document) {
  const b = $('.tabs__lista [aria-selected="true"]', capa);
  const ind = $('.tabs__ind', capa);
  if (!b || !ind) return;
  ind.style.width = b.offsetWidth + 'px';
  ind.style.transform = `translateX(${b.offsetLeft}px)`;
}
function panelFicha() {
  switch (S.tabFicha) {
    case 'servicios':
      return SERVICIOS.map((s) => `
        <button class="serv-fila" data-a="reservar" data-s="${s.id}">
          <span class="serv-fila__img"><img src="${s.img}" alt="" loading="lazy">${s.video ? `<video data-auto data-src="${s.video}" muted loop playsinline preload="none"></video><span class="vid-ic">${ic('play', 'ic-s')}</span>` : ''}</span>
          <span class="serv-fila__txt"><b>${s.nombre}</b><p>${s.desc}</p><small>${ic('reloj', 'ic-s')}${s.min} min${s.tag ? ` · ${s.tag}` : ''}</small></span>
          <span class="serv-fila__precio"><b>${eur(s.precio)}</b><span class="mas">${ic('mas', 'ic-s')}</span></span>
        </button>`).join('');
    case 'equipo':
      return `<div class="equipo-grid">${EQUIPO.map((p) => `
        <button class="miembro" data-a="reservar" data-p="${p.id}">
          <img src="${p.img}" alt="${p.completo}"><video data-auto data-src="${p.video}" muted loop playsinline preload="none"></video>
          <div><b>${p.completo}</b><small>${p.rol}</small></div>
        </button>`).join('')}</div>
        <p class="muted small" style="margin-top:14px;line-height:1.5">Cada profesional tiene su vídeo de presentación, sus trabajos y sus propias reseñas.</p>`;
    case 'trabajos':
      return `<div class="trabajos-grid">${TRABAJOS.map((t, i) => `
        <button class="trabajo" data-a="inspiracion" data-i="${i}">
          <img src="${t.img}" alt="${t.titulo}" loading="lazy"><video data-auto data-src="${t.video}" muted loop playsinline preload="none"></video>
          <span>${t.titulo}</span>
        </button>`).join('')}</div>`;
    case 'resenas':
      return htmlResenas();
    case 'muro':
      return htmlMuro();
    case 'info':
      return `<div class="info-lista">
        <div>${ic('pin')}<span>${NEGOCIOS[0].direccion}<br><button class="link" data-a="toast" data-t="Se abriría Google Maps / Apple Maps">Cómo llegar ›</button></span></div>
        <div>${ic('reloj')}<div class="horario"><span>Lunes a sábado</span><b>10:00–14:00 · 17:00–21:00</b><span>Domingo</span><b>Cerrado</b><span class="faint small">Horario de ejemplo</span></div></div>
        <div>${ic('tarjeta')}<span>Tarjeta, Apple Pay, Google Pay, Bizum y efectivo</span></div>
        <div>${ic('escudo')}<span>Cancelación gratis hasta 4 h antes. Si no vienes sin avisar, se cobra la señal.</span></div>
      </div>`;
  }
  return '';
}

/* Reseñas con filtros y resumen IA */
function htmlResenas() {
  const R = S.resenas;
  if (!R.length) return '<p class="vacio">Cargando reseñas…</p>';
  const dist = [5, 4, 3, 2, 1].map((e) => [e, R.filter((r) => r.estrellas === e).length]);
  const cuenta = (re) => R.filter((r) => re.test(norm(r.texto))).length;
  const trato = cuenta(/trato/), prof = cuenta(/profesional/), recom = cuenta(/recomiend|top|mejor/);
  const filtros = [['todas', 'Todas'], ['javi', 'Javi'], ['adri', 'Adri'], ['5', '5 ★'], ['4', '4 ★ o menos'], ['foto', 'Con foto']];
  return `
    <div class="resumen-res">
      <div class="resumen-res__nota"><b>5,0</b>${estrellas(5)}<br><small>${NEGOCIOS[0].totalResenas} reseñas</small></div>
      <div class="barras-res">${dist.map(([e, n]) => `<div><span>${e}</span><i style="--p:${Math.round((n / R.length) * 100)}%"></i><span>${Math.round((n / R.length) * 100)}%</span></div>`).join('')}</div>
    </div>
    <div class="ia-resumen">${orbe('orbe--sm')}<p><b>Resumen de la IA:</b> de las últimas ${R.length} reseñas, ${trato} hablan del <b>trato</b>, ${prof} de la <b>profesionalidad</b> y ${recom} lo <b>recomiendan</b> sin dudar.</p></div>
    <label class="busca-res">${ic('buscar')}<input id="busca-res" type="search" placeholder="Buscar en reseñas (ej. «trato»)" value="${esc(S.buscaRes)}"></label>
    <div class="chips" role="group" aria-label="Filtrar reseñas">${filtros.map(([id, t]) => `<button class="chip" data-a="res-filtro" data-f="${id}" aria-pressed="${S.filtroRes === id}">${t}</button>`).join('')}</div>
    <div id="lista-res">${listaResenas()}</div>`;
}
function listaResenas() {
  const f = S.filtroRes;
  const q = norm(S.buscaRes.trim());
  if (f === 'foto') return `<div class="vacio">${ic('camara')}Aún no hay reseñas con foto.<br>En ${MARCA} el cliente podrá subir la foto o el vídeo de su corte al valorar.</div>`;
  const lista = S.resenas.filter((r) => (f === 'todas' || (f === 'javi' && r.barbero === 'Javi') || (f === 'adri' && r.barbero === 'Adri') || (f === '5' && r.estrellas === 5) || (f === '4' && r.estrellas <= 4)) && (!q || norm(r.texto).includes(q)));
  if (!lista.length) return `<div class="vacio">${ic('buscar')}Ninguna reseña coincide con ese filtro.</div>`;
  const resaltar = (t) => {
    const s = esc(t);
    if (!q) return s;
    const i = norm(s).indexOf(q);
    return i < 0 ? s : `${s.slice(0, i)}<mark>${s.slice(i, i + q.length)}</mark>${s.slice(i + q.length)}`;
  };
  return lista.slice(0, 30).map((r, i) => `
    <article class="resena" style="animation-delay:${Math.min(i, 8) * 35}ms">
      <div class="resena__cab"><span class="resena__ini">${esc(r.nombre.charAt(0))}</span><div><b>${esc(r.nombre)}</b><small>Le atendió ${esc(r.barbero)} · ${fCorta(deK(r.fecha))}</small></div>${estrellas(r.estrellas)}</div>
      <p>${resaltar(r.texto)}</p>
    </article>`).join('');
}
function montarResenas(capa) {
  const inp = $('#busca-res', capa);
  if (!inp) return;
  inp.addEventListener('input', () => { S.buscaRes = inp.value; $('#lista-res').innerHTML = listaResenas(); });
}

/* ---------- Reserva: lo primero es el calendario ---------- */
const PASOS = ['Día y hora', 'Servicio', 'Profesional', 'Confirmar'];
const quienCal = () => S.reserva.pro || 'any';
VISTAS.reserva = {
  clase: 'view--sinnav',
  tabbar: false,
  html() {
    return [`<div class="reserva-cuerpo" id="paso">${htmlPaso()}</div>`,
      `<header class="reserva-cab">
        <div class="reserva-cab__fila">
          <button class="icon-btn" data-a="paso-atras" aria-label="Atrás">${ic('atras')}</button>
          <div><small id="paso-n">Paso ${S.reserva.paso + 1} de 4</small><b id="paso-t">${PASOS[S.reserva.paso]}</b></div>
          <button class="guia-btn" data-a="ia">${orbe('orbe--sm')}Ayuda</button>
        </div>
        <div class="progreso">${PASOS.map((_, i) => `<i class="${i <= S.reserva.paso ? 'on' : ''}"></i>`).join('')}</div>
      </header>
      <footer class="reserva-pie" id="pie">${htmlPie()}</footer>`];
  },
  montar(capa) {
    montarPaso();
    if (!S.guiaVista) {
      S.guiaVista = true;
      const g = document.createElement('div');
      g.className = 'globo-guia';
      g.textContent = `Soy ${MARCA_T} 👋 Te acompaño en cada paso. Si te atascas, toca «Ayuda».`;
      capa.appendChild(g);
      const fuera = () => { g.classList.add('sale'); setTimeout(() => g.remove(), 220); };
      const t = setTimeout(fuera, 4800);
      g.addEventListener('click', () => { clearTimeout(t); fuera(); });
      limpiezas.push(() => clearTimeout(t));
    }
  },
};
function irPaso(n, dir = 'adelante') {
  const R = S.reserva;
  R.paso = n;
  if (n === 2 && !R.pro) R.pro = 'any';
  $('#paso').innerHTML = htmlPaso(dir);
  $('.view').scrollTop = 0;
  $('#paso-n').textContent = `Paso ${n + 1} de 4`;
  $('#paso-t').textContent = PASOS[n];
  $$('.progreso i').forEach((el, i) => el.classList.toggle('on', i <= n));
  pintarPie();
  montarPaso();
}
function avisosReserva() {
  const fijados = S.muro.filter((m) => m.fijado);
  if (!fijados.length) return '';
  return fijados.map((m) => `<button class="aviso" data-a="ver-muro">
    <span class="aviso__ic">${ic('megafono')}</span>
    <span class="aviso__txt"><small>Aviso de ${esc(m.nombre)} · ${haceCuanto(m.fecha)}</small>${esc(m.texto)}</span>
  </button>`).join('');
}
function htmlPaso(dir = 'adelante') {
  const R = S.reserva;
  const d = `class="paso" data-dir="${dir}"`;
  if (R.paso === 0) {
    const quien = quienCal() === 'any' ? 'todo el equipo' : pro(R.pro).nombre;
    return `<section ${d}>
      <h2>¿Cuándo te viene bien?</h2>
      <p class="muted">Elige día y hora. Los colores muestran la disponibilidad de ${quien}.</p>
      ${avisosReserva()}
      <div class="cal" id="cal">${htmlCal()}</div>
      <div id="horas">${htmlHoras()}</div>
    </section>`;
  }
  if (R.paso === 1) {
    return `<section ${d}>
      <h2>¿Qué te vas a hacer?</h2>
      <p class="muted">Toca un servicio y verás cómo queda en vídeo.</p>
      <button class="consejo" data-a="ia" data-q="¿Qué me recomiendas?">${orbe('orbe--sm')}<span>¿No sabes cuál elegir? <b>Cuéntamelo y te recomiendo uno.</b></span></button>
      <div class="serv-grid ${R.servicio ? 'hay-sel' : ''}">${SERVICIOS.map((s) => `
        <button class="serv-card ${R.servicio === s.id ? 'on' : ''}" data-a="serv-sel" data-s="${s.id}" aria-pressed="${R.servicio === s.id}">
          <img src="${s.img}" alt="" loading="lazy">${s.video ? `<video data-src="${s.video}" muted loop playsinline preload="none"></video>` : ''}
          ${s.tag ? `<span class="pill pill--glass tag">${s.tag}</span>` : ''}
          <span class="check">${ic('check')}</span>
          <span class="serv-card__txt"><b>${s.nombre}</b><small><span>${s.min} min</span><b>${eur(s.precio)}</b></small></span>
        </button>`).join('')}</div>
    </section>`;
  }
  if (R.paso === 2) {
    const f = deK(R.fecha);
    return `<section ${d}>
      <h2>¿Con quién?</h2>
      <p class="muted">${mayus(fRel(f).toLowerCase())} a las ${R.hora}. ¿No conoces a nadie? Deja «Sin preferencia» y listo.</p>
      <div class="pro-grid ${R.pro && R.pro !== 'any' ? 'hay-sel' : ''}">${EQUIPO.map((p) => {
        const vac = enVacaciones(p.id, f);
        const libre = libres(p.id, f).includes(R.hora);
        const nRes = S.resenas.filter((r) => r.barbero === p.nombre).length;
        return `<button class="pro-card ${R.pro === p.id ? 'on' : ''} ${libre ? '' : 'ocupado'}" data-a="pro-sel" data-p="${p.id}" aria-pressed="${R.pro === p.id}" ${libre ? '' : 'disabled'}>
          <span class="pro-card__halo"></span>
          <span class="pro-card__foto"><img src="${p.img}" alt="${p.completo}"><video data-src="${p.video}" muted loop playsinline preload="none"></video>
            <span class="check">${ic('check')}</span>
            ${libre ? '' : `<span class="pill pill--glass tag">${vac ? 'De vacaciones' : 'Ocupado'}</span>`}
            <span class="pro-card__nombre"><b>${p.nombre}</b><small>${p.rol}</small></span>
          </span>
          <span class="pro-card__datos"><span>${ic('estrella', 'ic-s')} <b>5,0</b>${nRes ? ` · ${nRes} reseñas recientes` : ''}</span><span>${libre ? `<b>Libre a las ${R.hora}</b>` : vac ? 'De vacaciones ese día' : 'Ocupado a esa hora'}</span></span>
        </button>`;
      }).join('')}</div>
      <button class="sin-pref ${R.pro === 'any' ? 'on' : ''}" data-a="pro-sel" data-p="any">
        <span class="sin-pref__ic">${ic('equipo')}</span>
        <div><b>Sin preferencia</b><small>Te atiende quien esté libre a esa hora</small></div>
        <span class="radio"></span>
      </button>
    </section>`;
  }
  const s = serv(R.servicio);
  const quien = R.pro === 'any' ? proLibre(deK(R.fecha), R.hora) || 'javi' : R.pro;
  const p = pro(quien);
  const f = deK(R.fecha);
  return `<section ${d}>
    <h2>Revisa y confirma</h2>
    <p class="muted">Un último vistazo. Puedes cambiarla luego desde «Citas».</p>
    ${htmlResumen(s, p, f, R.hora)}
    <div class="seccion-t" style="margin-top:24px"><h2>¿Cómo quieres pagar?</h2></div>
    <div class="pagos">
      ${[['local', 'Pagar en el local', 'No se cobra nada ahora'], ['ahora', `Pagar ahora · ${eur(s.precio)}`, 'Y te olvidas al salir'], ['senal', 'Dejar señal de 5 €', 'Se descuenta del total']].map(([id, t, sub]) => `
        <button class="pago ${R.pago === id ? 'on' : ''}" data-a="pago" data-m="${id}">
          <div><b>${t}</b><small>${sub}</small>${id !== 'local' ? '<div class="metodos"><span class="metodo"> Pay</span><span class="metodo">G Pay</span><span class="metodo metodo--osc">Tarjeta</span><span class="metodo metodo--osc">Bizum</span></div>' : ''}</div>
          <span class="radio"></span>
        </button>`).join('')}
    </div>
    <div class="seccion-t" style="margin-top:24px"><h2>¿Algo que debamos saber?</h2></div>
    <textarea class="nota-campo" id="nota" placeholder="Opcional. Ej.: «quiero dejarlo igual que la última vez»">${esc(R.nota)}</textarea>
    <p class="politica">${ic('escudo', 'ic-s')}<span>Cancelación gratis hasta 4 h antes. Te recordamos la cita por WhatsApp 24 h antes.</span></p>
  </section>`;
}
function htmlResumen(s, p, f, hora) {
  return `<div class="resumen">
    <div class="resumen__top"><img src="${s.img}" alt=""><div><b>${s.nombre}</b><small>${NEGOCIOS[0].nombre}</small></div></div>
    <div class="resumen__filas">
      <div>${ic('calendario', 'ic-s')}<span>Día</span><b>${mayus(fLarga(f))}</b></div>
      <div>${ic('reloj', 'ic-s')}<span>Hora</span><b>${hora} · ${s.min} min</b></div>
      <div><img src="${p.img}" alt=""><span>Profesional</span><b>${p.completo}</b></div>
      <div>${ic('euro', 'ic-s')}<span>Total</span><b>${eur(s.precio)}</b></div>
    </div>
  </div>`;
}
function montarPaso() {
  const R = S.reserva;
  if (R.paso === 1 && R.servicio) encenderVideo($('.serv-card.on video'), true);
  if (R.paso === 2 && R.pro && R.pro !== 'any') encenderVideo($('.pro-card.on video'), true);
  if (R.paso === 3) $('#nota').addEventListener('input', (e) => { R.nota = e.target.value; });
}
function htmlPie() {
  const R = S.reserva;
  const s = R.servicio && serv(R.servicio);
  const partes = [];
  if (R.fecha && R.hora) partes.push(`${fRel(deK(R.fecha))} ${R.hora}`);
  if (s) partes.push(`${s.nombre} · ${s.min} min`);
  if (R.pro && R.paso >= 2) partes.push(R.pro === 'any' ? 'Sin preferencia' : pro(R.pro).nombre);
  const listo = [!!(R.fecha && R.hora), !!R.servicio, !!R.pro, true][R.paso];
  const txt = R.paso === 3 ? 'Confirmar cita' : 'Continuar';
  const cab = s ? eur(s.precio) : R.hora ? `${fRel(deK(R.fecha))} · ${R.hora}` : 'Elige día y hora';
  return `<div class="reserva-pie__txt"><b>${cab}</b><small>${partes.join(' · ') || 'Sin compromiso: no se cobra nada todavía'}</small></div>
    <button class="btn btn--primary" data-a="${R.paso === 3 ? 'confirmar' : 'paso-sig'}" ${listo ? '' : 'disabled'}><span class="btn__txt">${txt}</span></button>`;
}
const pintarPie = () => { const p = $('#pie'); if (p) p.innerHTML = htmlPie(); };

function htmlCal() {
  const R = S.reserva;
  const base = new Date(HOY.getFullYear(), HOY.getMonth() + S.mesOff, 1);
  const titulo = mayus(base.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
  const hueco = (base.getDay() + 6) % 7;
  const total = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  let celdas = '<span></span>'.repeat(hueco);
  for (let i = 1; i <= total; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), i);
    const n = nivel(quienCal(), d);
    const k = kF(d);
    const off = n === 'pasado' || n === 'cerrado';
    const etiqueta = { alta: 'mucha disponibilidad', media: 'disponibilidad media', poca: 'poca disponibilidad', completo: 'completo', cerrado: 'cerrado', pasado: 'no disponible' }[n];
    celdas += `<button class="dia ${esHoy(d) ? 'hoy' : ''} ${R.fecha === k ? 'on' : ''}" data-a="dia" data-f="${k}" data-n="${n}" ${off ? 'disabled' : ''} aria-label="${i}, ${etiqueta}"><span>${i}</span><i></i></button>`;
  }
  return `<div class="cal__cab"><b>${titulo}</b><div>
      <button class="icon-btn" data-a="mes" data-d="-1" ${S.mesOff <= 0 ? 'disabled style="opacity:.3"' : ''} aria-label="Mes anterior">${ic('atras', 'ic-s')}</button>
      <button class="icon-btn" data-a="mes" data-d="1" ${S.mesOff >= 2 ? 'disabled style="opacity:.3"' : ''} aria-label="Mes siguiente">${ic('sig', 'ic-s')}</button>
    </div></div>
    <div class="cal__dias">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((x) => `<span>${x}</span>`).join('')}</div>
    <div class="cal__grid">${celdas}</div>
    <div class="leyenda"><span><i style="background:var(--verde)"></i>Mucha</span><span><i style="background:var(--ambar)"></i>Media</span><span><i style="background:var(--rojo)"></i>Poca</span><span><i style="background:var(--surface-3)"></i>Completo</span></div>`;
}
function htmlHoras() {
  const R = S.reserva;
  const q = quienCal();
  if (!R.fecha) {
    const ph = proximoHueco(q);
    return ph ? sugerenciaHTML(ph, 'Toca un día del calendario o coge el primer hueco:') : '';
  }
  const f = deK(R.fecha);
  const l = libres(q, f);
  if (!l.length) {
    const ph = proximoHueco(q);
    return `<div class="horas-t"><b>${fLarga(f)}</b></div>
      <div class="espera"><b>Este día está completo</b><p>Apúntate a la lista de espera y te avisamos al momento si alguien cancela.</p>
        <button class="btn btn--sm btn--primary" data-a="espera">${ic('lista', 'ic-s')}Unirme a la lista de espera</button></div>
      ${ph ? sugerenciaHTML(ph, 'O coge el primer hueco libre:') : ''}`;
  }
  const man = l.filter((h) => minH(h) < 15 * 60);
  const tar = l.filter((h) => minH(h) >= 15 * 60);
  const btns = (arr) => `<div class="horas">${arr.map((h, i) => `<button class="hora ${R.hora === h ? 'on' : ''}" data-a="hora" data-h="${h}" style="animation-delay:${i * 25}ms">${h}</button>`).join('')}</div>`;
  return `<div class="horas-t"><b>${fLarga(f)}</b><span class="faint small">${l.length} huecos</span></div>
    ${man.length ? `<p class="franja">Mañana</p>${btns(man)}` : ''}
    ${tar.length ? `<p class="franja">Tarde</p>${btns(tar)}` : ''}
    <button class="espera-link" data-a="espera">${ic('lista', 'ic-s')}¿No te encaja ninguna hora? Lista de espera</button>`;
}
function sugerenciaHTML(ph, txt) {
  return `<button class="sugerencia" data-a="sugerencia" data-f="${kF(ph.fecha)}" data-h="${ph.hora}">${orbe('orbe--sm')}<div>${txt}<br><b>${fRel(ph.fecha)} a las ${ph.hora}</b></div>${ic('sig')}</button>`;
}

/* ---------- Éxito, citas y perfil ---------- */
VISTAS.exito = {
  clase: 'view--sinnav',
  tabbar: false,
  html() {
    const c = S.citas[S.citas.length - 1];
    const s = serv(c.servicio), p = pro(c.pro), f = deK(c.fecha);
    return [`<div class="exito">
      <div class="exito__sello"><svg class="ic" viewBox="0 0 24 24">${ICON.check}</svg></div>
      <h1>¡Cita confirmada!</h1>
      <p>Te esperamos el ${fLarga(f)} a las ${c.hora}.<br>Te lo recordaremos por WhatsApp 24 h antes.</p>
      ${htmlResumen(s, p, f, c.hora)}
      <div class="exito__acciones">
        <button class="btn btn--primary btn--block" data-a="tab" data-v="citas">Ver mis citas</button>
        <button class="btn btn--ghost btn--block" data-a="toast" data-t="Añadida a tu calendario">${ic('calendario', 'ic-s')}Añadir al calendario</button>
      </div>
    </div>`];
  },
};

/* =====================================================================
   VISTAS DEL NEGOCIO
   ===================================================================== */
function segTema() {
  return segmento([['oscuro', 'Oscuro'], ['claro', 'Claro']], S.tema, 'tema').replace('data-seg', 'data-seg data-seg-tema');
}
function negCab() { return bizCab(); }
function segmento(opciones, actual, accion) {
  const i = Math.max(0, opciones.findIndex(([id]) => id === actual));
  return `<div class="segmento" data-seg>
    <span class="segmento__pill" style="width:calc((100% - 8px) / ${opciones.length});transform:translateX(${i * 100}%)"></span>
    ${opciones.map(([id, t], j) => `<button data-a="${accion}" data-v="${id}" data-j="${j}" aria-pressed="${id === actual}">${t}</button>`).join('')}
  </div>`;
}
function moverSegmento(btn) {
  const seg = btn.closest('[data-seg]');
  $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', b === btn));
  $('.segmento__pill', seg).style.transform = `translateX(${btn.dataset.j * 100}%)`;
}

/* Caja */
const ventasEntre = (a, b) => S.ventas.filter((v) => v.t >= a && v.t < b);
VISTAS.caja = {
  html() {
    const hoyV = ventasEntre(+HOY, +addD(HOY, 1));
    const tot = (m) => hoyV.filter((v) => !m || v.metodo === m).reduce((a, v) => a + v.precio, 0);
    const T = S.ticket;
    return [`${negCab()}<div class="neg-titulo"><h1>Caja</h1></div>
      <div class="caja-hoy">
        <span class="eyebrow">Caja de hoy · ${new Set(hoyV.map((v) => v.tk)).size} tickets</span>
        <div class="caja-hoy__cifra">${eur(tot())}</div>
        <div class="caja-hoy__desglose"><div><b>${eur(tot('tarjeta'))}</b><small>Tarjeta</small></div><div><b>${eur(tot('efectivo'))}</b><small>Efectivo</small></div><div><b>${eur(tot('bizum'))}</b><small>Bizum</small></div></div>
      </div>
      <div class="bloque-t">Nuevo ticket<small>¿Quién lo cobra?</small></div>
      <div class="pros-sel">${EQUIPO.map((p) => `<button class="chip" data-a="caja-pro" data-p="${p.id}" aria-pressed="${T.pro === p.id}"><img src="${p.img}" alt="">${p.nombre}</button>`).join('')}</div>
      <div class="pad">${segmento([['servicios', 'Servicios'], ['productos', 'Productos']], S.cajaTab, 'caja-tab')}</div>
      <div class="items-grid" id="items">${htmlItems()}</div>
      <div id="ticket">${htmlTicket()}</div>`];
  },
};
function htmlItems() {
  const T = S.ticket;
  const lista = S.cajaTab === 'servicios' ? SERVICIOS.map((s) => ['s:' + s.id, s.nombre, s.precio, `${s.min} min`]) : S.productos.map((p) => ['p:' + p.id, p.nombre, p.precio, `${p.stock} en stock · ${p.comision}%`]);
  return lista.map(([id, n, pr, sub]) => `<button class="item ${T.items[id] ? 'on' : ''}" data-a="caja-item" data-id="${id}"><b>${n}</b><small>${eur(pr)} · ${sub}</small>${T.items[id] ? `<span class="cuenta-b">${T.items[id]}</span>` : ''}</button>`).join('');
}
function lineasTicket() {
  return Object.entries(S.ticket.items).map(([id, q]) => {
    const [tipo, x] = id.split(':');
    const o = tipo === 's' ? serv(x) : prod(x);
    return { id, tipo, o, q, total: o.precio * q };
  });
}
function htmlTicket() {
  const L = lineasTicket();
  if (!L.length) return `<p class="vacio" style="padding:22px var(--pad)">Toca servicios o productos para añadirlos al ticket.</p>`;
  const total = L.reduce((a, l) => a + l.total, 0);
  const p = pro(S.ticket.pro);
  const com = L.reduce((a, l) => a + (p.propietario ? 0 : l.tipo === 's' ? (l.total * p.comisionServicios) / 100 : (l.total * l.o.comision) / 100), 0);
  return `<div class="ticket">
    ${L.map((l) => `<div class="ticket__fila"><span>${l.q > 1 ? `${l.q} × ` : ''}${l.o.nombre}<small>${l.tipo === 's' ? 'Servicio' : 'Producto'}</small></span><b>${eur(l.total)}</b><button class="icon-btn" data-a="caja-menos" data-id="${l.id}" aria-label="Quitar uno">${ic('menos', 'ic-s')}</button></div>`).join('')}
    <div class="ticket__total"><span class="muted">Total</span><b>${eur(total)}</b></div>
    <p class="faint small" style="margin-top:4px">${p.propietario ? `${p.nombre} es propietario: sin comisión` : `Comisión para ${p.nombre}: ${eur(com)}`}</p>
    ${segmento([['tarjeta', 'Tarjeta'], ['efectivo', 'Efectivo'], ['bizum', 'Bizum']], S.ticket.metodo, 'caja-metodo')}
    <button class="btn btn--primary btn--block" style="margin-top:14px" data-a="cobrar">Cobrar ${eur(total)}</button>
  </div>`;
}
const pintarCaja = () => { $('#items').innerHTML = htmlItems(); $('#ticket').innerHTML = htmlTicket(); };

/* Estadísticas */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function periodo(p) {
  const fin = Date.now() + 1;
  if (p === 'dia') {
    const ini = +HOY;
    const cubos = Array.from({ length: 11 }, (_, i) => ({ a: ini + (10 + i) * 36e5, b: ini + (11 + i) * 36e5, et: `${10 + i}h`, largo: `De ${10 + i}:00 a ${11 + i}:00` }));
    return { ini, fin, previo: [ini - 7 * 864e5, fin - 7 * 864e5], cubos, titulo: 'Facturación de hoy', vs: `vs. el ${HOY.toLocaleDateString('es-ES', { weekday: 'long' })} pasado` };
  }
  if (p === 'semana') {
    const lunes = addD(HOY, -((HOY.getDay() + 6) % 7));
    const cubos = Array.from({ length: 7 }, (_, i) => { const d = addD(lunes, i); return { a: +d, b: +addD(d, 1), et: ['L', 'M', 'X', 'J', 'V', 'S', 'D'][i], largo: mayus(fCorta(d)) }; });
    return { ini: +lunes, fin, previo: [+lunes - 7 * 864e5, fin - 7 * 864e5], cubos, titulo: 'Facturación esta semana', vs: 'vs. la semana pasada' };
  }
  if (p === 'mes') {
    const ini = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
    const dias = new Date(HOY.getFullYear(), HOY.getMonth() + 1, 0).getDate();
    const cubos = Array.from({ length: dias }, (_, i) => { const d = addD(ini, i); return { a: +d, b: +addD(d, 1), et: [1, 5, 10, 15, 20, 25, 30].includes(i + 1) ? String(i + 1) : '', largo: mayus(fCorta(d)) }; });
    const pIni = new Date(HOY.getFullYear(), HOY.getMonth() - 1, 1);
    const pFin = new Date(HOY.getFullYear(), HOY.getMonth() - 1, HOY.getDate() + 1);
    return { ini: +ini, fin, previo: [+pIni, +pFin], cubos, titulo: `Facturación de ${HOY.toLocaleDateString('es-ES', { month: 'long' })}`, vs: `vs. ${pIni.toLocaleDateString('es-ES', { month: 'long' })} (mismos días)` };
  }
  const ini = new Date(HOY.getFullYear(), 0, 1);
  const cubos = Array.from({ length: 12 }, (_, i) => ({ a: +new Date(HOY.getFullYear(), i, 1), b: +new Date(HOY.getFullYear(), i + 1, 1), et: MESES[i].charAt(0).toUpperCase(), largo: mayus(new Date(2000, i, 1).toLocaleDateString('es-ES', { month: 'long' })) }));
  return { ini: +ini, fin, previo: [+new Date(HOY.getFullYear() - 1, 0, 1), +new Date(HOY.getFullYear() - 1, HOY.getMonth(), HOY.getDate() + 1)], cubos, titulo: `Facturación de ${HOY.getFullYear()}`, vs: `vs. ${HOY.getFullYear() - 1} a estas alturas` };
}
function resumenVentas(vs) {
  const serv_ = vs.filter((v) => v.tipo === 's');
  const prods = vs.filter((v) => v.tipo === 'p');
  const total = vs.reduce((a, v) => a + v.precio, 0);
  return { total, citas: serv_.length, ticket: serv_.length ? total / new Set(vs.map((v) => v.tk)).size : 0, uds: prods.length, com: vs.reduce((a, v) => a + v.com, 0) };
}
function delta(a, b, bueno = true) {
  if (!b) return '';
  const d = ((a - b) / b) * 100;
  const sube = d >= 0;
  return `<span class="delta ${sube === bueno ? 'delta--sube' : 'delta--baja'}">${ic(sube ? 'sube' : 'baja', 'ic-s')}${sube ? '+' : ''}${d.toFixed(0)} %</span>`;
}
VISTAS.stats = {
  padre: 'ajustes',
  html() {
    const P = periodo(S.periodo);
    const act = ventasEntre(P.ini, P.fin);
    const prev = ventasEntre(...P.previo);
    const A = resumenVentas(act), B = resumenVentas(prev);
    const porPro = EQUIPO.map((p) => {
      const v = act.filter((x) => x.pro === p.id);
      const s = v.filter((x) => x.tipo === 's').reduce((a, x) => a + x.precio, 0);
      const pr = v.filter((x) => x.tipo === 'p').reduce((a, x) => a + x.precio, 0);
      return { p, s, pr, total: s + pr, com: v.reduce((a, x) => a + x.com, 0), n: v.filter((x) => x.tipo === 's').length };
    });
    const conteo = (tipo) => {
      const m = new Map();
      act.filter((v) => v.tipo === tipo).forEach((v) => { const e = m.get(v.id) || { n: 0, eur: 0, por: {} }; e.n++; e.eur += v.precio; e.por[v.pro] = (e.por[v.pro] || 0) + 1; m.set(v.id, e); });
      return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
    };
    const topS = conteo('s').slice(0, 5), topP = conteo('p');
    const maxS = topS[0]?.[1].n || 1, maxP = topP[0]?.[1].n || 1;
    return [`${negCab()}<div class="neg-titulo"><h1>Estadísticas</h1></div>
      <div class="pad">${segmento([['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes'], ['anio', 'Año']], S.periodo, 'periodo')}</div>
      <div class="hero-cifra"><small>${P.titulo}</small><b>${eur(Math.round(A.total))}</b>${delta(A.total, B.total)} <span class="faint small">${P.vs}</span></div>
      <div class="grafico" id="grafico" role="img" aria-label="${P.titulo}"></div>
      <div class="kpis">
        <div class="kpi"><small>Citas atendidas</small><b>${A.citas}</b>${delta(A.citas, B.citas)}</div>
        <div class="kpi"><small>Ticket medio</small><b>${eur(Math.round(A.ticket * 10) / 10)}</b>${delta(A.ticket, B.ticket)}</div>
        <div class="kpi"><small>Productos vendidos</small><b>${A.uds}</b>${delta(A.uds, B.uds)}</div>
        <div class="kpi"><small>Comisiones a pagar</small><b>${eur(Math.round(A.com))}</b><span class="faint small">servicios + productos</span></div>
      </div>
      <div class="bloque-t">Por profesional</div>
      <div class="leyenda-mini"><span><i></i>Servicios</span><span><i class="b"></i>Productos</span></div>
      ${porPro.map(({ p, s, pr, total, com, n }) => `<div class="pro-stat">
        <div class="pro-stat__cab"><img src="${p.img}" alt=""><div><b>${p.completo}</b><small>${n} citas · ${p.propietario ? 'propietario' : `${p.comisionServicios}% en servicios`}</small></div><span class="pro-stat__total">${eur(Math.round(total))}</span></div>
        <div class="pro-stat__barra"><i style="width:${total ? (s / total) * 100 : 0}%"></i><i style="width:${total ? (pr / total) * 100 : 0}%"></i></div>
        <div class="pro-stat__nums"><span><b>${eur(Math.round(s))}</b>servicios</span><span><b>${eur(Math.round(pr))}</b>productos</span><span><b>${p.propietario ? '—' : eur(Math.round(com))}</b>comisión</span></div>
      </div>`).join('')}
      <div class="bloque-t">Servicios más pedidos</div>
      <div class="ranking">${topS.length ? topS.map(([id, e]) => `<div><span>${serv(id).nombre}<small>${eur(e.eur)}</small></span><b>${e.n}</b><i style="--p:${(e.n / maxS) * 100}%"></i></div>`).join('') : '<p class="vacio">Aún sin datos en este periodo.</p>'}</div>
      <div class="bloque-t">Productos vendidos</div>
      <div class="ranking">${topP.length ? topP.map(([id, e]) => `<div><span>${prod(id).nombre}<small>${EQUIPO.map((p) => `${p.nombre} ${e.por[p.id] || 0}`).join(' · ')}</small></span><b>${e.n} uds</b><i style="--p:${(e.n / maxP) * 100}%"></i></div>`).join('') : '<p class="vacio">Aún sin ventas de productos en este periodo.</p>'}</div>`];
  },
  montar(capa) {
    const P = periodo(S.periodo);
    const cubos = P.cubos.map((c) => ({ ...c, valor: ventasEntre(c.a, Math.min(c.b, P.fin)).reduce((a, v) => a + v.precio, 0), actual: Date.now() >= c.a && Date.now() < c.b }));
    dibujarGrafico($('#grafico', capa), cubos);
  },
};
function dibujarGrafico(el, cubos) {
  const W = el.clientWidth - 20, H = 170, pB = 20, pT = 8, pL = 36;
  const maxV = Math.max(...cubos.map((c) => c.valor), 1);
  const paso = Math.pow(10, Math.floor(Math.log10(maxV)));
  const max = Math.ceil(maxV / (paso / 2)) * (paso / 2);
  const band = (W - pL) / cubos.length;
  const bw = Math.min(24, band * 0.64);
  const alto = H - pB - pT;
  const corto = (v) => (v >= 1000 ? `${(v / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} k` : String(Math.round(v)));
  let svg = '';
  [0, 0.5, 1].forEach((f) => { const y = pT + alto * (1 - f); svg += `<line class="rejilla" x1="${pL}" x2="${W}" y1="${y}" y2="${y}"/><text x="0" y="${y + 3}">${corto(max * f)} €</text>`; });
  cubos.forEach((c, i) => {
    const x = pL + i * band + (band - bw) / 2;
    const h = (c.valor / max) * alto;
    const yb = pT + alto;
    if (h > 0.5) {
      const r = Math.min(4, h, bw / 2);
      const y = yb - h;
      svg += `<path class="barra ${c.actual ? 'actual' : ''}" data-i="${i}" d="M${x},${yb}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw - r}Q${x + bw},${y} ${x + bw},${y + r}V${yb}Z"/>`;
    }
    if (c.et) svg += `<text x="${pL + i * band + band / 2}" y="${H - 4}" text-anchor="middle">${c.et}</text>`;
    svg += `<rect class="hit" data-i="${i}" x="${pL + i * band}" y="${pT}" width="${band}" height="${alto}"/>`;
  });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svg}</svg><div class="tip"></div>`;
  const tip = $('.tip', el);
  const mostrar = (i) => {
    const c = cubos[i];
    $$('.barra', el).forEach((b) => b.classList.toggle('hover', b.dataset.i === String(i)));
    const x = 10 + pL + i * band + band / 2;
    const y = 14 + pT + alto - (c.valor / max) * alto - 6;
    tip.innerHTML = `${eur(Math.round(c.valor))}<small>${c.largo}</small>`;
    tip.style.left = Math.min(Math.max(x, 50), el.clientWidth - 50) + 'px';
    tip.style.top = y + 'px';
    tip.classList.add('on');
  };
  $$('.hit', el).forEach((r) => {
    r.addEventListener('pointerenter', () => mostrar(+r.dataset.i));
    r.addEventListener('click', () => mostrar(+r.dataset.i));
  });
  el.addEventListener('pointerleave', () => { tip.classList.remove('on'); $$('.barra', el).forEach((b) => b.classList.remove('hover')); });
}

/* Productos */
VISTAS.productos = {
  padre: 'ajustes',
  html() {
    return [`${negCab()}<div class="neg-titulo"><h1>Productos</h1><button class="btn btn--sm btn--primary" data-a="prod-nuevo">${ic('mas', 'ic-s')}Añadir</button></div>
      <p class="muted small pad" style="margin:8px 0 6px;line-height:1.5">La comisión es el % que se lleva quien lo vende. Se calcula sola en cada cobro.</p>
      ${S.productos.map((p) => `<button class="prod" data-a="prod-edit" data-id="${p.id}">${prodIc(p)}<div class="t"><b>${esc(p.nombre)}</b><small>${p.stock < 5 ? `<span class="stock-bajo">${ic('alerta', 'ic-s')}Quedan ${p.stock}</span>` : `${p.stock} en stock`}<i class="sep"></i>Comisión ${p.comision}%</small></div><div class="precio"><b>${eur(p.precio)}</b></div></button>`).join('')}`];
  },
};
function formProducto(p) {
  const nuevo = !p;
  p = p || { id: 'nuevo', nombre: '', precio: 15, stock: 10, comision: 10 };
  return `<div class="form-hoja">
    <div class="campo"><label for="f-nombre">Nombre</label><input type="text" id="f-nombre" value="${esc(p.nombre)}" placeholder="Ej.: Spray fijador"></div>
    <div class="campo"><label for="f-precio">Precio de venta <b id="v-precio">${eur(p.precio)}</b></label><input type="range" id="f-precio" min="3" max="60" value="${p.precio}"></div>
    <div class="campo"><label for="f-com">Comisión para quien lo vende <b id="v-com">${p.comision}%</b></label><input type="range" id="f-com" min="0" max="40" value="${p.comision}"></div>
    <div class="campo"><label for="f-stock">Stock <b id="v-stock">${p.stock} uds</b></label><input type="range" id="f-stock" min="0" max="60" value="${p.stock}"></div>
    <p class="nota-com" id="nota-com"></p>
    <button class="btn btn--primary btn--block" data-a="prod-guardar" data-id="${nuevo ? '' : p.id}">${nuevo ? 'Añadir producto' : 'Guardar cambios'}</button>
  </div>`;
}
function montarFormProducto() {
  const upd = () => {
    const pr = +$('#f-precio').value, c = +$('#f-com').value, st = +$('#f-stock').value;
    $('#v-precio').textContent = eur(pr);
    $('#v-com').textContent = c + '%';
    $('#v-stock').textContent = st + ' uds';
    $('#nota-com').innerHTML = `Por cada unidad que venda Adri, se lleva <b>${eur((pr * c) / 100)}</b>. Lo verás sumado en Estadísticas → Por profesional.`;
  };
  ['#f-precio', '#f-com', '#f-stock'].forEach((s) => $(s).addEventListener('input', upd));
  upd();
}

/* =====================================================================
   HOJAS INFERIORES (IA y genérica)
   ===================================================================== */
let hojaAbierta = null;
function abrirHoja(id) {
  hojaAbierta = $(id);
  $('#velo').classList.add('on');
  hojaAbierta.classList.add('on');
}
function cerrarHoja() {
  if (!hojaAbierta) return;
  hojaAbierta.classList.remove('on');
  hojaAbierta.style.transform = '';
  $('#velo').classList.remove('on');
  hojaAbierta = null;
}
function hojaGenerica(titulo, sub, cuerpo) {
  const h = $('#hoja-gen');
  h.innerHTML = `<div class="hoja__asa"><i></i></div><div class="hoja__cab"><div><b>${titulo}</b>${sub ? `<span class="muted small">${sub}</span>` : ''}</div><button class="icon-btn" data-a="cerrar-hoja" aria-label="Cerrar">${ic('cerrar')}</button></div><div style="overflow-y:auto;padding-bottom:28px">${cuerpo}</div>`;
  abrirHoja('#hoja-gen');
}
/* Arrastrar hacia abajo para cerrar (con velocidad, como en iOS) */
function arrastrable(hoja) {
  let y0 = 0, t0 = 0, dy = 0, activo = false;
  hoja.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.hoja__asa, .hoja__cab') || e.target.closest('button')) return;
    activo = true; y0 = e.clientY; t0 = performance.now(); dy = 0;
    hoja.classList.add('arrastrando');
    hoja.setPointerCapture(e.pointerId);
  });
  hoja.addEventListener('pointermove', (e) => {
    if (!activo) return;
    dy = e.clientY - y0;
    const y = dy > 0 ? dy : -Math.sqrt(-dy) * 2;
    hoja.style.transform = `translateY(${y}px)`;
  });
  const fin = () => {
    if (!activo) return;
    activo = false;
    hoja.classList.remove('arrastrando');
    const v = dy / (performance.now() - t0);
    if (dy > 120 || v > 0.5) cerrarHoja();
    else hoja.style.transform = '';
  };
  hoja.addEventListener('pointerup', fin);
  hoja.addEventListener('pointercancel', fin);
}

/* ---------- Asistente IA (simulado) ---------- */
let ctxIA = '';
function contextoIA() {
  if (S.modo === 'negocio') return 'negocio';
  if (S.vista === 'reserva') return 'paso' + S.reserva.paso;
  return S.vista;
}
function abrirIA({ foco = false, pregunta = '' } = {}) {
  const ctx = contextoIA();
  if (ctx !== ctxIA) {
    ctxIA = ctx;
    const [txt, chips] = saludoIA(ctx);
    escribirIA(txt, { chips, rapido: true });
  }
  abrirHoja('#hoja-ia');
  if (pregunta) setTimeout(() => enviarIA(pregunta), 380);
  else if (foco && matchMedia('(pointer: fine)').matches) setTimeout(() => $('#ia-input').focus(), 420);
}
function saludoIA(ctx) {
  const pasos = {
    paso0: ['<b>Paso 1 de 4</b>: elige día y hora. En el calendario, <b>verde</b> = muchos huecos, <b>amarillo</b> = algunos, <b>rojo</b> = muy pocos. Los tachados están completos: puedes apuntarte a la lista de espera. Arriba verás los avisos del negocio.', ['El primer hueco libre', '¿Qué es la lista de espera?']],
    paso1: ['<b>Paso 2 de 4</b>: elige qué te vas a hacer. Si no lo tienes claro, cuéntame cómo llevas el pelo y te recomiendo.', ['¿Qué me recomiendas?', '¿Cuánto cuesta un degradado?']],
    paso2: ['<b>Paso 3 de 4</b>: elige quién te atiende. Solo puedes tocar a quien está libre a la hora que elegiste. Si no conoces a nadie, deja <b>«Sin preferencia»</b>.', ['¿Qué diferencia hay entre Javi y Adri?']],
    paso3: ['<b>Último paso</b>: revisa tu cita y elige cómo pagar. Si eliges «Pagar en el estudio» no se cobra nada ahora.', ['¿Puedo cancelar luego?', '¿Puedo pagar con Bizum?']],
  };
  if (pasos[ctx]) return pasos[ctx];
  if (ctx === 'negocio') return ['Modo negocio. Pregúntame por la caja, las comisiones o los huecos libres y te lo calculo al momento.', ['¿Cuánto llevamos hoy?', '¿Quién ha vendido más productos este mes?', 'Comisiones del mes', 'Huecos libres mañana']];
  if (ctx === 'negocio' || ctx === 'citas') return ['¿Quieres cambiar o cancelar una cita? Dímelo y lo hago por ti.', ['Cambiar mi cita', '¿Puedo cancelar?']];
  return [`¡Hola! Soy <b>${MARCA_T}</b>. Dime qué quieres hacerte y cuándo, y te busco hueco. Por ejemplo: <i>«corte y barba el viernes por la tarde»</i>.`, ['Corte y barba el viernes por la tarde', 'El primer hueco con Javi', '¿Hay alguien de vacaciones?', '¿Qué me recomiendas?']];
}
function burbuja(html, quien) {
  const b = document.createElement('div');
  b.className = `msg msg--${quien}`;
  b.innerHTML = html;
  $('#ia-cuerpo').appendChild(b);
  return b;
}
function bajarChat() { const c = $('#ia-cuerpo'); c.scrollTo({ top: c.scrollHeight, behavior: reducido ? 'auto' : 'smooth' }); }
function escribirIA(html, { chips = [], opciones = '', rapido = false } = {}) {
  const cuerpo = $('#ia-cuerpo');
  $$('.sugeridas', cuerpo).forEach((x) => x.remove());
  const poner = () => {
    burbuja(html, 'ia');
    if (opciones) { const o = document.createElement('div'); o.className = 'opciones-ia'; o.innerHTML = opciones; cuerpo.appendChild(o); }
    if (chips.length) { const c = document.createElement('div'); c.className = 'sugeridas'; c.innerHTML = chips.map((t) => `<button class="chip" data-a="ia-chip" data-q="${esc(t)}">${esc(t)}</button>`).join(''); cuerpo.appendChild(c); }
    bajarChat();
  };
  if (rapido) return poner();
  const e = document.createElement('div');
  e.className = 'escribiendo';
  e.innerHTML = '<i></i><i></i><i></i>';
  cuerpo.appendChild(e);
  bajarChat();
  setTimeout(() => { e.remove(); poner(); }, 650 + Math.random() * 450);
}
function enviarIA(texto) {
  texto = texto.trim();
  if (!texto) return;
  $$('.sugeridas', $('#ia-cuerpo')).forEach((x) => x.remove());
  burbuja(esc(texto), 'yo');
  bajarChat();
  const [html, extra] = S.modo === 'negocio' ? respuestaNegocio(norm(texto)) : respuestaCliente(norm(texto));
  escribirIA(html, extra);
}
const DIAS_N = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const SERV_KW = [['combo', /corte y barba|corte \+ barba|pelo y barba|combo|completo/], ['mechas', /mecha/], ['color', /color|tinte|cambio de look/], ['nino', /nino|hijo|peque/], ['senior', /mayor|60|jubilad/], ['largo', /largo|melena|hidrat/], ['degradado', /degradado|fade|repas/], ['barba', /barba/], ['corte', /corte|pelar|cortar|pelo/]];
function interpretar(t) {
  const q = { dias: [], franja: null, pro: null, servicio: null, desde: null };
  if (/\bhoy\b|esta tarde|ahora/.test(t)) q.dias.push(HOY);
  if (/pasado manana/.test(t)) q.dias.push(addD(HOY, 2));
  else if (/\bmanana\b/.test(t) && !/(por|de|en) la manana/.test(t.replace(/^.*?\bmanana\b/, ''))) {
    if (!/(por|de|en) la manana/.test(t) || /\bmanana\b.*\bmanana\b/.test(t)) q.dias.push(addD(HOY, 1));
  }
  DIAS_N.forEach((n, i) => { if (new RegExp('\\b' + n).test(t)) { let off = (i - HOY.getDay() + 7) % 7; if (off === 0 && !libres('any', HOY).length) off = 7; q.dias.push(addD(HOY, off)); } });
  if (/fin de semana|finde/.test(t)) q.dias.push(addD(HOY, (6 - HOY.getDay() + 7) % 7 || 7));
  if (/semana que viene|proxima semana/.test(t)) { const l = addD(HOY, 7 - ((HOY.getDay() + 6) % 7)); for (let i = 0; i < 6; i++) q.dias.push(addD(l, i)); }
  if (/tarde/.test(t)) q.franja = 'tarde';
  else if (/(por|de|en) la manana|temprano|mananita/.test(t)) q.franja = 'manana';
  const h = t.match(/a las (\d{1,2})(?:[:.](\d{2}))?/);
  if (h) { let x = +h[1]; if (x < 10) x += 12; q.desde = x * 60 + (+h[2] || 0); }
  if (/javi/.test(t)) q.pro = 'javi';
  if (/adri/.test(t)) q.pro = 'adri';
  for (const [id, re] of SERV_KW) if (re.test(t)) { q.servicio = id; break; }
  return q;
}
function buscarHuecos(q, max = 3) {
  const pros = q.pro ? [q.pro] : ['javi', 'adri'];
  const dias = q.dias.length ? q.dias : Array.from({ length: 21 }, (_, i) => addD(HOY, i));
  const out = [];
  for (const d of dias) {
    for (const h of HORAS) {
      if (q.franja === 'tarde' && minH(h) < 15 * 60) continue;
      if (q.franja === 'manana' && minH(h) >= 15 * 60) continue;
      if (q.desde && minH(h) < q.desde) continue;
      for (const p of pros) {
        if (libres(p, d).includes(h) && !out.some((o) => kF(o.fecha) === kF(d) && o.pro === p && Math.abs(minH(o.hora) - minH(h)) < 60)) out.push({ fecha: d, hora: h, pro: p });
        if (out.length >= max) return out;
      }
    }
  }
  return out;
}
function opcionesHuecos(lista, sId) {
  const s = serv(sId);
  return lista.map((o) => `<button class="op-ia" data-a="ia-slot" data-s="${sId}" data-p="${o.pro}" data-f="${kF(o.fecha)}" data-h="${o.hora}"><img src="${pro(o.pro).img}" alt=""><div><b>${fRel(o.fecha)} · ${o.hora}</b><small>con ${pro(o.pro).nombre} · ${s.nombre} · ${eur(s.precio)}</small></div>${ic('sig')}</button>`).join('');
}
const RECOMIENDA = {
  'lo llevo corto y quiero repasarlo': 'degradado', 'quiero corte y barba': 'combo', 'tengo el pelo largo': 'largo', 'quiero un cambio de look': 'color',
};
function respuestaCliente(t) {
  if (RECOMIENDA[t]) {
    const s = serv(RECOMIENDA[t]);
    return [`Te recomiendo <b>${s.nombre}</b> (${s.min} min · ${eur(s.precio)}): ${s.desc.charAt(0).toLowerCase() + s.desc.slice(1)}`, { opciones: `<button class="op-ia" data-a="ia-serv" data-s="${s.id}"><img src="${s.img}" alt=""><div><b>Elegir ${s.nombre}</b><small>Y pasamos a elegir profesional</small></div>${ic('sig')}</button>`, chips: ['Ver otros servicios'] }];
  }
  if (/recomiend|no se|que me hago|duda|aconsej|cual elijo|ver otros/.test(t)) {
    return ['Claro. ¿Cómo lo llevas ahora y qué buscas?', { chips: ['Lo llevo corto y quiero repasarlo', 'Quiero corte y barba', 'Tengo el pelo largo', 'Quiero un cambio de look'] }];
  }
  if (/vacacion|cerrad|aviso|abierto/.test(t)) {
    const v = S.vacaciones.filter((x) => x.hasta >= HOY);
    return [v.length ? `Ojo: ${v.map((x) => `<b>${pro(x.pro).nombre}</b> está de vacaciones del ${fLarga(x.desde)} al ${fLarga(x.hasta)}`).join('; ')}. Esos días no aparecen sus huecos, pero el resto del equipo atiende normal.` : 'No hay vacaciones ni cierres anunciados. ¡Todo el equipo está disponible!', { chips: ['El primer hueco libre'] }];
  }
  if (/lista de espera|espera/.test(t)) return ['Si el día que quieres está completo, te apuntas a la <b>lista de espera</b>. Si alguien cancela, te avisamos al instante y el hueco es para quien confirme primero.', { chips: ['El primer hueco libre'] }];
  if (/cancel|anular|cambiar|mover/.test(t)) return ['Puedes cambiar o cancelar gratis hasta <b>4 horas antes</b>, desde «Citas» o pidiéndomelo a mí. El hueco se ofrece a la lista de espera automáticamente.', { opciones: `<button class="op-ia" data-a="ia-ir" data-v="citas">${ic('calendario')}<div><b>Ir a mis citas</b></div>${ic('sig')}</button>` }];
  if (/pag|bizum|tarjeta|efectivo|apple|google/.test(t)) return ['Puedes pagar <b>en el estudio</b> (no se cobra nada ahora), <b>pagar ya</b> desde la app con Apple Pay, Google Pay, tarjeta o Bizum, o dejar una <b>señal de 5 €</b>.', {}];
  if (/donde|direcc|llegar|aparc|ubica|esta sublime/.test(t)) return [`Sublime Barber Studio está en <b>${NEGOCIOS[0].direccion}</b>, a ${fDist(NEGOCIOS[0])} de ti.`, { chips: ['El primer hueco libre'] }];
  if (/diferencia|quien es|javi y adri/.test(t)) return ['<b>Javi</b> es el fundador, con 10 años de oficio. <b>Adri</b> es barbero del estudio. Los dos tienen 5,0 en reseñas: en su ficha puedes ver su vídeo y sus trabajos.', { chips: ['¿Quién tiene antes hueco?'] }];
  const q = interpretar(t);
  const pideHueco = q.dias.length || q.franja || q.pro || q.desde || /hueco|cita|reserv|libre|antes|primer|quiero|tiene antes/.test(t);
  if (/precio|cuesta|cuanto|vale/.test(t) && !pideHueco) {
    if (q.servicio) { const s = serv(q.servicio); return [`El <b>${s.nombre}</b> cuesta <b>${eur(s.precio)}</b> y dura unos ${s.min} min.`, { chips: [`Reservar ${s.nombre.toLowerCase()}`] }]; }
    return [`Estos son los más pedidos:<ul>${SERVICIOS.slice(0, 5).map((s) => `<li>${s.nombre}: <b>${eur(s.precio)}</b></li>`).join('')}</ul>`, { chips: ['¿Qué me recomiendas?'] }];
  }
  if (pideHueco || q.servicio) {
    const sId = q.servicio || (S.reserva.servicio || 'corte');
    const lista = buscarHuecos(q);
    if (!lista.length) return ['Ese día no queda ningún hueco 😕. Puedo apuntarte a la <b>lista de espera</b> o buscarte el primer hueco libre.', { chips: ['El primer hueco libre', '¿Qué es la lista de espera?'] }];
    const cuando = q.dias.length === 1 ? ` para el ${fLarga(q.dias[0])}` : '';
    const aviso = q.servicio ? '' : ` (te lo busco para <b>${serv(sId).nombre.toLowerCase()}</b>; si es otro servicio, dímelo)`;
    return [`Tengo estos huecos${cuando}${aviso}. Toca uno y te lo dejo listo para confirmar:`, { opciones: opcionesHuecos(lista, sId) }];
  }
  if (/hola|buenas|hey/.test(t)) return ['¡Hola! ¿Qué te apetece hacerte y cuándo te viene bien?', { chips: ['Corte y barba el viernes por la tarde', '¿Qué me recomiendas?'] }];
  return ['En este prototipo entiendo unas cuantas cosas (pedir cita, precios, recomendaciones, pagos…). En la app real aquí responde una <b>IA de verdad</b>, entrenada con los servicios, horarios y normas de cada negocio.', { chips: ['Corte y barba el viernes por la tarde', '¿Qué me recomiendas?'] }];
}
function respuestaNegocio(t) {
  const mesIni = +new Date(HOY.getFullYear(), HOY.getMonth(), 1);
  if (/hoy|caja|llevamos|factur|ganado/.test(t)) {
    const v = ventasEntre(+HOY, +addD(HOY, 1));
    const r = resumenVentas(v);
    const porPro = EQUIPO.map((p) => `${p.nombre} ${eur(v.filter((x) => x.pro === p.id).reduce((a, x) => a + x.precio, 0))}`).join(' · ');
    let pend = 0;
    if (HOY.getDay() !== 0) EQUIPO.forEach((p) => HORAS.forEach((h) => { if (minH(h) + 30 > MIN_AHORA && !libresBase(p.id, HOY).has(h)) pend += citaGenerada(p.id, HOY, h).servicio.precio; }));
    return [`Hoy lleváis <b>${eur(r.total)}</b>: ${r.citas} servicios y ${r.uds} productos.<br>${porPro}.<br>Quedan <b>${eur(pend)}</b> por cobrar en las citas que faltan.`, { chips: ['Comisiones del mes', 'Huecos libres mañana'] }];
  }
  if (/producto|vendido|vende/.test(t)) {
    const v = ventasEntre(mesIni, Date.now() + 1).filter((x) => x.tipo === 'p');
    const porPro = EQUIPO.map((p) => [p, v.filter((x) => x.pro === p.id).length]).sort((a, b) => b[1] - a[1]);
    const m = new Map(); v.forEach((x) => m.set(x.id, (m.get(x.id) || 0) + 1));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
    return [`Este mes se han vendido <b>${v.length} productos</b>. Quien más vende es <b>${porPro[0][0].nombre}</b> (${porPro[0][1]} uds). El más vendido: <b>${top ? prod(top[0]).nombre : '—'}</b>${top ? ` (${top[1]} uds)` : ''}.`, { chips: ['Comisiones del mes'] }];
  }
  if (/comision|nomina|pagar a/.test(t)) {
    const v = ventasEntre(mesIni, Date.now() + 1);
    return [`Comisiones de este mes:<ul>${EQUIPO.map((p) => `<li>${p.nombre}: <b>${p.propietario ? 'propietario, sin comisión' : eur(Math.round(v.filter((x) => x.pro === p.id).reduce((a, x) => a + x.com, 0)))}</b></li>`).join('')}</ul>`, { opciones: `<button class="op-ia" data-a="ia-ir" data-v="stats">${ic('grafico')}<div><b>Ver estadísticas</b></div>${ic('sig')}</button>` }];
  }
  if (/hueco|libre|manana/.test(t)) {
    const d = addD(HOY, HOY.getDay() === 6 ? 2 : 1);
    return [`Huecos libres el ${fLarga(d)}:<ul>${EQUIPO.map((p) => `<li>${p.nombre}: ${libres(p.id, d).join(', ') || 'completo'}</li>`).join('')}</ul>Si quieres, aviso a la lista de espera.`, {}];
  }
  return ['En el prototipo te respondo sobre caja, productos, comisiones y huecos libres. En la app real podrás preguntarle cualquier cosa a tu negocio.', { chips: ['¿Cuánto llevamos hoy?', 'Comisiones del mes'] }];
}

/* ---------- Tráiler e Inspiración (visor de vídeo vertical tipo historias) ---------- */
const TR = { segs: [], i: 0, raf: 0, hold: 0, retenido: false, cta: null };
function abrirVisor(segs, origen, { titulo, sub, ctaTexto, onCta, inicio = 0 }) {
  const el = $('#trailer');
  const sr = $('#screen').getBoundingClientRect();
  if (origen) {
    const r = origen.getBoundingClientRect();
    el.style.setProperty('--cx', r.left + r.width / 2 - sr.left + 'px');
    el.style.setProperty('--cy', r.top + r.height / 2 - sr.top + 'px');
  }
  TR.segs = segs; TR.cta = onCta;
  el.innerHTML = `<img class="poster" alt=""><video playsinline muted preload="auto"></video>
    <div class="trailer__barras">${segs.map(() => '<i><b></b></i>').join('')}</div>
    <div class="trailer__cab"><span class="ficha-logo"><img src="${NEGOCIOS[0].logo}" alt=""></span><div>${titulo}<small>${sub}</small></div><button class="icon-btn icon-btn--glass" data-a="visor-cerrar" aria-label="Cerrar">${ic('cerrar')}</button></div>
    <div class="trailer__zonas"><button data-a="visor-prev" aria-label="Anterior"></button><button data-a="visor-sig" aria-label="Siguiente"></button></div>
    <div class="trailer__txt"><small></small><h2></h2></div>
    <div class="trailer__pie"><button class="btn btn--primary" data-a="visor-cta">${ctaTexto}</button></div>`;
  el.hidden = false;
  el.classList.remove('cerrando');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
  const zonas = $('.trailer__zonas', el);
  zonas.addEventListener('pointerdown', () => { TR.hold = setTimeout(() => { TR.retenido = true; $('#trailer video').pause(); }, 220); });
  const soltar = () => { clearTimeout(TR.hold); if (TR.retenido) { $('#trailer video').play().catch(() => {}); setTimeout(() => (TR.retenido = false), 30); } };
  zonas.addEventListener('pointerup', soltar);
  zonas.addEventListener('pointerleave', soltar);
  segVisor(inicio);
}
function segVisor(i) {
  const el = $('#trailer');
  if (el.hidden) return;
  TR.i = i;
  const s = TR.segs[i];
  const v = $('video', el);
  const poster = $('.poster', el);
  el.style.background = s.fondo || '#000';
  el.classList.toggle('modo-texto', !!s.texto);
  poster.hidden = !s.poster;
  if (s.poster) poster.src = s.poster;
  if (s.video) { v.hidden = false; v.src = s.video; v.play().catch(() => {}); }
  else { v.pause(); v.removeAttribute('src'); v.hidden = true; }
  $$('.trailer__barras b', el).forEach((b, j) => (b.style.transform = `scaleX(${j < i ? 1 : 0})`));
  const txt = $('.trailer__txt', el);
  $('small', txt).textContent = s.kicker;
  $('h2', txt).textContent = s.titulo;
  txt.classList.toggle('largo', s.titulo.length > 34);
  txt.classList.remove('cambia'); void txt.offsetWidth; txt.classList.add('cambia');
  cancelAnimationFrame(TR.raf);
  const barra = $$('.trailer__barras b', el)[i];
  let pasado = 0, ultimo = performance.now();
  const tick = (ahora) => {
    if (!TR.retenido) pasado += ahora - ultimo;
    ultimo = ahora;
    let p;
    if (s.video) { const dur = Math.min(v.duration || 5, 5.5); p = Math.min(v.currentTime / dur, 1); if (v.ended) p = 1; }
    else p = Math.min(pasado / 5000, 1);
    barra.style.transform = `scaleX(${p})`;
    if (p >= 1) {
      if (TR.i < TR.segs.length - 1) return segVisor(TR.i + 1);
      v.pause();
      return;
    }
    TR.raf = requestAnimationFrame(tick);
  };
  TR.raf = requestAnimationFrame(tick);
}
function cerrarVisor() {
  const el = $('#trailer');
  if (el.hidden) return;
  cancelAnimationFrame(TR.raf);
  el.classList.remove('on');
  el.classList.add('cerrando');
  setTimeout(() => { el.hidden = true; el.innerHTML = ''; el.classList.remove('cerrando'); }, 400);
}
function abrirTrailer(origen) {
  abrirVisor(TRAILER, origen, { titulo: NEGOCIOS[0].nombre, sub: 'Tráiler · 25 s', ctaTexto: 'Reservar cita', onCta: () => { cerrarVisor(); empezarReserva({}); } });
}
function abrirInspiracion(origen, inicio = 0) {
  const segs = TRABAJOS.map((t) => ({ video: t.video, poster: t.img, kicker: t.pro ? `Por ${pro(t.pro).nombre} · ${NEGOCIOS[0].nombre}` : NEGOCIOS[0].nombre, titulo: t.titulo, pro: t.pro }));
  abrirVisor(segs, origen, { titulo: 'Feed', sub: 'Cortes en vídeo cerca de ti', ctaTexto: 'Quiero este estilo', inicio, onCta: () => { const p = TR.segs[TR.i].pro; cerrarVisor(); empezarReserva({ servicio: 'corte', pro: p || null }); } });
}

/* =====================================================================
   ACCIONES
   ===================================================================== */
function empezarReserva({ servicio = null, pro: p = null, fecha = null, hora = null }) {
  S.reserva = { ...nuevaReserva(), servicio, pro: p, fecha, hora };
  S.mesOff = 0;
  S.reserva.paso = fecha && hora && servicio && p ? 3 : 0;
  if (S.reserva.paso === 0) autoDia();
  ir('reserva');
}
function autoDia() {
  const R = S.reserva;
  if (R.fecha && libres(quienCal(), deK(R.fecha)).length) return;
  const ph = proximoHueco(quienCal());
  R.fecha = ph ? kF(ph.fecha) : null;
  R.hora = null;
  if (ph) S.mesOff = (ph.fecha.getFullYear() - HOY.getFullYear()) * 12 + ph.fecha.getMonth() - HOY.getMonth();
}
function setModo(m, { forzar = false } = {}) {
  const cambia = S.modo !== m;
  if (!cambia && !forzar) return;
  S.modo = m;
  ctxIA = '';
  $('#ia-cuerpo').innerHTML = '';
  const sw = $('#modo');
  if (sw) { sw.dataset.modo = m; $$('button', sw).forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === m)); }
  cerrarHoja();
  cerrarVisor();
  S.vista = m === 'cliente' ? (S.logueado ? 'inicio' : 'login') : 'agenda';
  S.historial = [];
  render(null);
  if (cambia || forzar) splash(m);
  if (m === 'cliente' && S.logueado && S.ajustes?.faceid) setTimeout(() => faceId(), reducido ? 350 : 900);
  if (!document.body.dataset.app) try { history.replaceState(null, '', m === 'negocio' ? '?app=business' : '?app=clientes'); } catch {}
}
/* Fondo con vida: aurora de color con los tonos del orbe, moviéndose despacio */
const AURORA = '<div class="aurora" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
function splash(m) {
  const el = $('#splash');
  el.innerHTML = `${AURORA}<div class="splash__marca">${LOGO}${m === 'negocio' ? '<small>Business</small>' : ''}</div>`;
  el.hidden = false;
  el.classList.remove('sale');
  clearTimeout(splash.t);
  splash.t = setTimeout(() => { el.classList.add('sale'); splash.t = setTimeout(() => (el.hidden = true), 380); }, reducido ? 300 : 1900);
}

const A = {
  tab: (b) => { if (S.vista !== b.dataset.v) ir(b.dataset.v, { reset: true, dir: 'fundido' }); else $('.view')?.scrollTo({ top: 0, behavior: 'smooth' }); },
  volver,
  negocio: () => { S.tabFicha = 'servicios'; ir('negocio'); },
  'negocio-ej': (b) => toast(`${b.dataset.n} es un negocio de ejemplo: en el prototipo solo está montada la ficha de Sublime`),
  toast: (b) => toast(b.dataset.t),
  trailer: (b) => abrirTrailer(b),
  inspiracion: (b) => abrirInspiracion(b, +(b.dataset.i || 0)),
  'visor-cerrar': cerrarVisor,
  'visor-prev': () => { if (!TR.retenido) segVisor(Math.max(0, TR.i - 1)); },
  'visor-sig': () => { if (!TR.retenido && TR.i < TR.segs.length - 1) segVisor(TR.i + 1); },
  'visor-cta': () => TR.cta && TR.cta(),
  'tab-ficha': (b) => {
    S.tabFicha = b.dataset.t;
    $$('[data-a="tab-ficha"]').forEach((x) => x.setAttribute('aria-selected', x === b));
    moverIndicador();
    const panel = $('#panel');
    panel.innerHTML = panelFicha();
    panel.classList.remove('panel-anim'); void panel.offsetWidth; panel.classList.add('panel-anim');
    observarVideos($('#vista'));
    if (S.tabFicha === 'resenas') montarResenas(document);
    const tabs = $('.tabs');
    const view = $('.view');
    if (view.scrollTop > tabs.offsetTop) view.scrollTo({ top: tabs.offsetTop, behavior: 'smooth' });
  },
  'res-filtro': (b) => { S.filtroRes = b.dataset.f; $$('[data-a="res-filtro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#lista-res').innerHTML = listaResenas(); },
  reservar: (b) => empezarReserva({ servicio: b.dataset.s || null, pro: b.dataset.p || null }),
  'hueco-rapido': (b) => empezarReserva({ servicio: 'corte', pro: b.dataset.p, fecha: b.dataset.f, hora: b.dataset.h }),
  repetir: (b) => empezarReserva({ servicio: b.dataset.s, pro: b.dataset.p }),
  'serv-sel': (b) => {
    const R = S.reserva;
    R.servicio = b.dataset.s;
    $$('.serv-card').forEach((c) => { const on = c === b; if (c.classList.contains('on') !== on) encenderVideo($('video', c), on); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    $('.serv-grid').classList.add('hay-sel');
    pintarPie();
  },
  'pro-sel': (b) => {
    const R = S.reserva;
    R.pro = b.dataset.p;
    $$('.pro-card').forEach((c) => { const on = c === b; if (c.classList.contains('on') !== on) encenderVideo($('video', c), on); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    $('.pro-grid').classList.toggle('hay-sel', R.pro !== 'any');
    $('.sin-pref').classList.toggle('on', R.pro === 'any');
    pintarPie();
  },
  'paso-sig': () => irPaso(S.reserva.paso + 1),
  'paso-atras': () => { const R = S.reserva; if (R.paso === 0) volver(); else irPaso(R.paso - 1, 'atras'); },
  mes: (b) => { S.mesOff += +b.dataset.d; $('#cal').innerHTML = htmlCal(); },
  dia: (b) => {
    const R = S.reserva;
    R.fecha = b.dataset.f;
    R.hora = null;
    $$('.dia').forEach((d) => d.classList.toggle('on', d === b));
    $('#horas').innerHTML = htmlHoras();
    pintarPie();
  },
  hora: (b) => {
    S.reserva.hora = b.dataset.h;
    $$('.hora').forEach((h) => h.classList.toggle('on', h === b));
    pintarPie();
    const pie = $('#pie .btn');
    pie?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
  },
  sugerencia: (b) => {
    const R = S.reserva;
    R.fecha = b.dataset.f; R.hora = b.dataset.h;
    const d = deK(R.fecha);
    S.mesOff = (d.getFullYear() - HOY.getFullYear()) * 12 + d.getMonth() - HOY.getMonth();
    $('#cal').innerHTML = htmlCal();
    $('#horas').innerHTML = htmlHoras();
    pintarPie();
  },
  espera: () => {
    const R = S.reserva;
    const f = R.fecha ? deK(R.fecha) : HOY;
    S.espera.push({ fecha: R.fecha, pro: R.pro });
    toast(`Estás en la lista de espera del ${fLarga(f)}. Te avisamos si se libera un hueco.`);
  },
  pago: (b) => { S.reserva.pago = b.dataset.m; $$('.pago').forEach((p) => p.classList.toggle('on', p === b)); },
  confirmar: (b) => {
    const R = S.reserva;
    b.disabled = true;
    b.classList.add('cargando');
    b.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>');
    const quien = R.pro === 'any' ? proLibre(deK(R.fecha), R.hora) || 'javi' : R.pro;
    setTimeout(() => {
      S.extra[`${R.fecha}|${quien}|${R.hora}`] = { servicio: R.servicio, pago: R.pago };
      S.citas.push({ servicio: R.servicio, pro: quien, fecha: R.fecha, hora: R.hora, pago: R.pago });
      S.historial = [];
      S.vista = 'exito';
      render('fundido');
    }, R.pago === 'local' ? 700 : 1200);
  },
  'cita-cancelar': (b) => {
    const c = S.citas[+b.dataset.i];
    c.cancelada = true;
    delete S.extra[`${c.fecha}|${c.pro}|${c.hora}`];
    render(null, { mantenerScroll: true });
    toast('Cita cancelada. Hemos avisado a la lista de espera de ese día.');
  },
  'cita-cambiar': (b) => {
    const c = S.citas[+b.dataset.i];
    c.cancelada = true;
    delete S.extra[`${c.fecha}|${c.pro}|${c.hora}`];
    empezarReserva({ servicio: c.servicio, pro: c.pro });
  },
  modo: (b) => setModo(b.dataset.m),
  ia: (b) => abrirIA({ foco: !!b.dataset.foco, pregunta: b.dataset.q || '' }),
  'ia-chip': (b) => enviarIA(b.dataset.q.startsWith('Reservar ') ? b.dataset.q.replace('Reservar ', 'Quiero ') + ' cuanto antes' : b.dataset.q),
  'ia-serv': (b) => {
    cerrarHoja();
    if (S.vista === 'reserva') { S.reserva.servicio = b.dataset.s; if (S.reserva.paso === 1) setTimeout(() => irPaso(2), 250); else if (S.reserva.paso === 0) toast(`Apuntado: ${serv(b.dataset.s).nombre}. Ahora elige día y hora.`); }
    else setTimeout(() => empezarReserva({ servicio: b.dataset.s }), 250);
  },
  'ia-slot': (b) => {
    cerrarHoja();
    burbuja('Perfecto, te lo dejo listo para confirmar.', 'ia');
    setTimeout(() => { S.historial = []; empezarReserva({ servicio: b.dataset.s, pro: b.dataset.p, fecha: b.dataset.f, hora: b.dataset.h }); }, 250);
  },
  'ia-ir': (b) => { cerrarHoja(); setTimeout(() => ir(b.dataset.v, { reset: true, dir: 'fundido' }), 200); },
  'cerrar-hoja': cerrarHoja,
  'agenda-dia': (b) => { S.agendaDia = +b.dataset.i; render(null, { mantenerScroll: false }); },
  slot: (b) => {
    const d = S.agendaFecha || HOY;
    const k = kF(d);
    const p = pro(b.dataset.p);
    const h = b.dataset.h;
    const extra = S.extra[`${k}|${p.id}|${h}`];
    if (!extra && libresBase(p.id, d).has(h)) {
      hojaGenerica(`Hueco libre · ${h}`, `${p.nombre} · ${fLarga(d)}`, `<div class="form-hoja"><p class="muted small" style="line-height:1.5">Hay ${S.espera.length || 3} personas en lista de espera para esta semana.</p><button class="btn btn--primary btn--block" data-a="toast" data-t="Aviso enviado a la lista de espera por WhatsApp">${ic('mensaje', 'ic-s')}Avisar a la lista de espera</button><button class="btn btn--ghost btn--block" data-a="toast" data-t="Hora bloqueada">Bloquear esta hora</button></div>`);
      return;
    }
    const c = extra ? { servicio: extra.titulo ? { ...serv(extra.servicio), nombre: extra.titulo, min: extra.min, precio: extra.cont ? (S.extra[`${k}|${p.id}|${extra.inicio}`] || S.extra[`${k}|${p.id}|${HORAS.filter((x) => minH(x) <= minH(extra.inicio)).pop()}`] || extra).precio : extra.precio } : serv(extra.servicio), cliente: extra.cliente || 'Tú (demo)', online: extra.pago !== 'local' } : citaGenerada(p.id, d, h);
    hojaGenerica(c.cliente, `${extra?.inicio || h}${extra?.titulo ? `–${hm(minH(extra.inicio) + extra.min)}` : ''} · ${c.servicio.nombre} · con ${p.nombre}`, `<div class="form-hoja">
      <div class="resumen__filas" style="border-radius:18px;background:var(--surface-2)">
        <div>${ic('euro', 'ic-s')}<span>Importe</span><b>${eur(c.servicio.precio)}</b></div>
        <div>${ic('tarjeta', 'ic-s')}<span>Pago</span><b>${c.online ? 'Pagada en la app' : 'Paga en el local'}</b></div>
        <div>${ic('repetir', 'ic-s')}<span>Visitas</span><b>${3 + (hash(c.cliente) % 9)} este año</b></div>
      </div>
      ${c.online ? '' : `<button class="btn btn--primary btn--block" data-a="cobrar-cita" data-p="${p.id}" data-s="${c.servicio.id}">${ic('caja', 'ic-s')}Cobrar ahora</button>`}
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Mensaje enviado por WhatsApp">${ic('mensaje', 'ic-s')}Escribir por WhatsApp</button>
    </div>`);
  },
  'cobrar-cita': (b) => { cerrarHoja(); S.ticket = { pro: b.dataset.p, items: { ['s:' + b.dataset.s]: 1 }, metodo: 'tarjeta' }; S.cajaTab = 'productos'; setTimeout(() => ir('caja', { reset: true, dir: 'fundido' }), 200); },
  'caja-pro': (b) => { S.ticket.pro = b.dataset.p; $$('[data-a="caja-pro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#ticket').innerHTML = htmlTicket(); },
  'caja-tab': (b) => { S.cajaTab = b.dataset.v; moverSegmento(b); $('#items').innerHTML = htmlItems(); },
  'caja-item': (b) => { const T = S.ticket; T.items[b.dataset.id] = (T.items[b.dataset.id] || 0) + 1; pintarCaja(); },
  'caja-menos': (b) => { const T = S.ticket; if (--T.items[b.dataset.id] <= 0) delete T.items[b.dataset.id]; pintarCaja(); },
  'caja-metodo': (b) => { S.ticket.metodo = b.dataset.v; moverSegmento(b); },
  cobrar: () => {
    const T = S.ticket;
    const p = pro(T.pro);
    const L = lineasTicket();
    const tk = 'caja' + Date.now();
    const total = L.reduce((a, l) => a + l.total, 0);
    L.forEach((l) => { for (let i = 0; i < l.q; i++) S.ventas.push({ t: Date.now(), pro: T.pro, tipo: l.tipo, id: l.o.id, precio: l.o.precio, metodo: T.metodo, com: p.propietario ? 0 : l.tipo === 's' ? (l.o.precio * p.comisionServicios) / 100 : (l.o.precio * l.o.comision) / 100, tk }); if (l.tipo === 'p') l.o.stock = Math.max(0, l.o.stock - l.q); });
    S.ticket = { pro: T.pro, items: {}, metodo: T.metodo };
    render(null, { mantenerScroll: true });
    toast(`Cobrado ${eur(total)} con ${T.metodo}. Ya cuenta en Estadísticas.`);
  },
  periodo: (b) => { S.periodo = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'prod-edit': (b) => { const p = prod(b.dataset.id); hojaGenerica(p.nombre, 'Editar producto', formProducto(p)); montarFormProducto(); },
  'prod-nuevo': () => { hojaGenerica('Nuevo producto', 'Aparecerá en la Caja al momento', formProducto(null)); montarFormProducto(); },
  'prod-guardar': (b) => {
    const datos = { nombre: $('#f-nombre').value.trim() || 'Producto nuevo', precio: +$('#f-precio').value, comision: +$('#f-com').value, stock: +$('#f-stock').value };
    if (b.dataset.id) Object.assign(prod(b.dataset.id), datos);
    else S.productos.push({ id: 'p' + Date.now(), forma: 'bote', tono: '#c9b8e0', ...datos });
    cerrarHoja();
    render(null, { mantenerScroll: true });
    toast(b.dataset.id ? 'Producto actualizado' : 'Producto añadido. Ya puedes cobrarlo en Caja.');
  },
  demo: (b) => DEMOS[b.dataset.d](),
  publicar: () => abrirPublicar(),
};

/* Atajos del panel lateral («Prueba esto») */
const DEMOS = {};
function abrirApp(m, vista, opts) {
  if (m === 'cliente' && vista !== 'login') S.logueado = true;
  if (S.modo !== m) setModo(m);
  if (vista && S.vista !== vista) ir(vista, { reset: true, dir: 'fundido', ...opts });
}
Object.assign(DEMOS, {
  registro: () => { S.logueado = false; abrirApp('cliente', 'login'); },
  inicio: () => abrirApp('cliente', 'inicio'),
  mapa: () => { S.modoExplorar = 'mapa'; abrirApp('cliente', 'explorar'); if (S.vista === 'explorar') render(null); },
  buscar: () => { S.modoExplorar = 'lista'; S.focoBusca = true; abrirApp('cliente', 'explorar'); if (S.vista === 'explorar') render(null); },
  trailer: () => { abrirApp('cliente', 'inicio'); S.tabFicha = 'servicios'; ir('negocio'); setTimeout(() => abrirTrailer($('.trailer-btn')), 450); },
  calendario: () => { abrirApp('cliente', 'inicio'); S.historial = ['inicio', 'negocio']; empezarReserva({}); },
  barbero: () => { abrirApp('cliente', 'inicio'); S.historial = ['inicio', 'negocio']; empezarReserva({ servicio: 'corte' }); const ph = proximoHueco('adri'); S.reserva.fecha = kF(ph.fecha); S.reserva.hora = ph.hora; irPaso(2); },
  ia: () => { abrirApp('cliente', 'inicio'); setTimeout(() => abrirIA({ pregunta: 'Corte y barba el viernes por la tarde' }), 200); },
  muro: () => { abrirApp('cliente', 'inicio'); S.tabFicha = 'muro'; ir('negocio'); setTimeout(() => { const t = $('.tabs'); $('.view').scrollTo({ top: t.offsetTop, behavior: 'smooth' }); }, 400); },
  inspiracion: () => abrirApp('cliente', 'inspiracion'),
  preguntas: () => { abrirApp('cliente', 'inicio'); A['rehacer-prefs'](); },
  citas: () => abrirApp('cliente', 'citas'),
  perfil: () => abrirApp('cliente', 'perfil'),
  agenda: () => { S.agendaModo = 'dia'; S.agendaFecha = HOY; abrirApp('negocio', 'agenda'); render(null); },
  semana: () => { S.agendaModo = 'semana'; abrirApp('negocio', 'agenda'); render(null); },
  mes: () => { S.agendaModo = 'mes'; abrirApp('negocio', 'agenda'); render(null); },
  espera: () => { abrirApp('negocio', 'agenda'); ir('espera'); },
  miPerfil: () => { abrirApp('negocio', 'ajustes'); S.perfilSel = 'javi'; ir('mi-perfil'); },
  agendaIA: () => { abrirApp('negocio', 'ajustes'); ir('agenda-ia'); },
  suscripcion: () => { abrirApp('negocio', 'ajustes'); ir('suscripcion'); },
  marketing: () => { abrirApp('negocio', 'ajustes'); ir('marketing'); },
  galeria: () => { abrirApp('negocio', 'ajustes'); ir('galeria'); },
  avisosBiz: () => { abrirApp('negocio', 'agenda'); ir('avisos-biz'); },
  clientes: () => abrirApp('negocio', 'clientes'),
  ficha: () => { abrirApp('negocio', 'clientes'); S.clienteSel = clientesDB().find((c) => c.first).id; ir('cliente'); },
  ajustes: () => abrirApp('negocio', 'ajustes'),
  recordatorios: () => { abrirApp('negocio', 'ajustes'); ir('recordatorios'); },
  recompensas: () => { abrirApp('negocio', 'ajustes'); ir('recompensas'); },
  caja: () => { S.ticket = { pro: 'adri', items: { 's:combo': 1, 'p:cera': 1 }, metodo: 'tarjeta' }; abrirApp('negocio', 'caja'); render(null); },
  stats: () => { abrirApp('negocio', 'ajustes'); ir('stats'); },
  publicar: () => { abrirApp('negocio', 'agenda'); setTimeout(abrirPublicar, 300); },
});

/* =====================================================================
   COMUNIDAD: muro del negocio, Inspiración (reels + stories), subidas y moderación
   ===================================================================== */

/* Filtro de texto (en la app real lo hace una IA; aquí, una lista básica) */
const PROHIBIDAS = ['puta', 'puto', 'mierda', 'gilipollas', 'cabron', 'imbecil', 'idiota', 'subnormal', 'maricon', 'zorra', 'polla', 'cono', 'follar', 'porno', 'sexo', 'desnud', 'tetas', 'nazi', 'matar', 'capullo', 'estafa', 'basura'];
function moderarTexto(t) {
  const n = norm(t || '');
  if (PROHIBIDAS.some((w) => new RegExp('\\b' + w).test(n))) return { ok: false, motivo: 'Tiene lenguaje ofensivo o sexual.' };
  if (/https?:\/\/|www\.|\.(com|es|net)\b/.test(n)) return { ok: false, motivo: 'No se permiten enlaces.' };
  if (/(\d[\s.-]?){9,}/.test(n)) return { ok: false, motivo: 'No compartas teléfonos en público.' };
  return { ok: true };
}

/* ---------- Muro del negocio ---------- */
function avatarPost(m) {
  if (m.autor === 'negocio') return `<span class="post__av post__av--neg"><img src="${NEGOCIOS[0].logo}" alt=""></span>`;
  if (m.autor === 'pro') return `<img class="post__av" src="${pro(m.pro).img}" alt="">`;
  return `<span class="post__av">${esc(m.nombre.charAt(0))}</span>`;
}
function htmlPost(m) {
  const insignia = m.autor === 'negocio' ? 'Negocio' : m.autor === 'pro' ? 'Profesional' : '';
  const like = S.likes[m.id];
  return `<article class="post ${m.revisando ? 'revisando' : ''}" data-post="${m.id}">
    <div class="post__cab">${avatarPost(m)}<div><b>${esc(m.nombre)}</b>${insignia ? `<span class="insignia">${insignia}</span>` : ''}<small>${m.revisando ? 'Revisando…' : haceCuanto(m.fecha)}</small></div>${m.fijado ? `<span class="pill">${ic('pin2', 'ic-s')}Fijado</span>` : ''}</div>
    <p>${esc(m.texto)}</p>
    ${m.img ? `<img class="post__img" src="${m.img}" alt="" loading="lazy">` : ''}
    <div class="post__acc">
      <button data-a="like" data-id="${m.id}" aria-pressed="${!!like}">${ic('corazon')}${m.likes + (like ? 1 : 0)}</button>
      <button data-a="responder" data-id="${m.id}">${ic('comentario')}Responder${m.respuestas.length ? ` · ${m.respuestas.length}` : ''}</button>
    </div>
    ${m.respuestas.length ? `<div class="post__resp">${m.respuestas.map((r) => `<div><b>${esc(r.nombre)}</b>${r.negocio ? '<span class="insignia">Negocio</span>' : ''} ${esc(r.texto)}</div>`).join('')}</div>` : ''}
  </article>`;
}
function htmlMuro() {
  const orden = [...S.muro].sort((a, b) => (b.fijado - a.fijado) || (b.fecha - a.fecha));
  const resp = S.respondiendo && S.muro.find((m) => m.id === S.respondiendo);
  return `<form class="muro-form" id="muro-form">
      <span class="post__av">T</span>
      <input id="muro-input" type="text" maxlength="280" placeholder="${resp ? `Responder a ${esc(resp.nombre)}…` : 'Escribe a la comunidad de Sublime…'}" autocomplete="off">
      <button class="icon-btn" type="submit" aria-label="Publicar">${ic('enviar')}</button>
    </form>
    <p class="muro-nota">${ic('escudo', 'ic-s')}Cada mensaje se revisa antes de publicarse: nada de insultos, contenido sexual, enlaces ni teléfonos.</p>
    <div id="lista-muro">${orden.map(htmlPost).join('')}</div>`;
}
const pintarMuro = () => { const p = $('#panel'); if (p && S.tabFicha === 'muro') p.innerHTML = htmlMuro(); };
function publicarMuro(texto) {
  const v = moderarTexto(texto);
  if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
  if (S.respondiendo) {
    S.muro.find((m) => m.id === S.respondiendo).respuestas.push({ nombre: 'Tú', texto });
    S.respondiendo = null;
    pintarMuro();
    return toast('Respuesta publicada');
  }
  const post = { id: 'u' + Date.now(), autor: 'cliente', nombre: 'Tú', texto, fecha: new Date(), respuestas: [], likes: 0, revisando: true };
  S.muro.push(post);
  pintarMuro();
  setTimeout(() => { post.revisando = false; pintarMuro(); toast('Publicado en el muro'); }, 1300);
}

/* ---------- Stories de tus negocios favoritos ---------- */
function stories() {
  const sub = {
    id: 'sublime', nombre: 'Sublime', logo: NEGOCIOS[0].logo,
    segs: [
      ...S.muro.filter((m) => m.story !== false && (m.autor !== 'cliente') && (m.fijado || m.storyNueva)).map((m) => ({ poster: m.autor === 'pro' ? pro(m.pro).img2 : IMG + 'estudio-900.webp', kicker: `${m.nombre} · ${haceCuanto(m.fecha)}`, titulo: m.texto, texto: true })),
      { video: VID + 'obras/espiral.mp4', poster: IMG + 'obras/espiral.webp', kicker: 'Nuevo trabajo de Javi', titulo: 'Espiral' },
      { poster: IMG + 'g-productos-900.webp', kicker: 'Sublime · hace 5 días', titulo: 'Nuevo en el estudio: aceite de barba. Pídenos probarlo.', texto: true },
    ],
  };
  const ej = (id, nombre, tono, kicker, titulo) => ({ id, nombre, tono, segs: [{ fondo: `radial-gradient(120% 90% at 30% 20%, ${tono[0]}, ${tono[1]})`, kicker, titulo, texto: true }] });
  return [sub,
    ej('raiz', 'Raíz', NEGOCIOS[1].tono, 'Raíz Estudio · ejemplo', 'Esta semana, mechas con un 15 % de descuento.'),
    ej('nacar', 'Nácar', NEGOCIOS[4].tono, 'Nácar Estética · ejemplo', 'Quedan 2 huecos el sábado. ¡Corre!'),
    ej('kinesis', 'Kinésis', NEGOCIOS[2].tono, 'Kinésis Fisio · ejemplo', 'Consejo: levántate y estira 5 minutos cada hora.')];
}
function abrirStory(id, origen) {
  const st = stories().find((x) => x.id === id);
  S.vistas = { ...(S.vistas || {}), [id]: true };
  abrirVisor(st.segs, origen, { titulo: st.id === 'sublime' ? NEGOCIOS[0].nombre : st.nombre, sub: 'Story', ctaTexto: 'Reservar cita', onCta: () => { cerrarVisor(); if (id === 'sublime') { S.historial = ['inspiracion']; empezarReserva({}); } else toast('Negocio de ejemplo'); } });
  setTimeout(() => $(`.story[data-id="${id}"]`)?.classList.add('vista'), 600);
}

/* ---------- Inspiración: reels a pantalla completa ---------- */
function reels() {
  const negocio = TRABAJOS.map((t) => ({ id: 'r-' + t.id, video: t.video, img: t.img, pro: t.pro, texto: `«${t.titulo}». Nuevo trabajo en el estudio.` }));
  const extra = [
    { id: 'p1', video: VID + 'obras/rizo-indomito.mp4', img: IMG + 'obras/rizo-indomito.webp', pro: 'adri', texto: 'Rizos definidos con textura. Corte a tijera.' },
    { id: 'p2', video: VID + 'obras/claroscuro.mp4', img: IMG + 'obras/claroscuro.webp', pro: 'javi', texto: 'Cambio de look para una boda.' },
  ];
  const [a, b, ...resto] = negocio;
  return [...S.subidos, a, extra[0], b, extra[1], ...resto];
}
function htmlReel(r) {
  const p = r.pro ? pro(r.pro) : null;
  const guardado = (S.guardados || []).includes(r.id);
  return `<section class="reel" data-id="${r.id}">
    ${r.img ? `<img class="reel__img" src="${r.img}" alt="">` : ''}
    ${r.video ? `<video data-auto data-src="${r.video}" muted loop playsinline preload="none"></video>` : ''}
    <div class="reel__acc">
      <button data-a="toast" data-t="Se abriría el menú de compartir: WhatsApp, Instagram, copiar enlace…">${ic('compartir')}<span>Enviar</span></button>
      <button data-a="guardar-reel" data-id="${r.id}" aria-pressed="${guardado}">${ic('guardar')}<span>${guardado ? 'Guardado' : 'Guardar'}</span></button>
    </div>
    <div class="reel__info">
      <div class="reel__autor">${p ? `<img src="${p.img}" alt="">` : `<span class="reel__logo"><img src="${NEGOCIOS[0].logo}" alt=""></span>`}<span><b>${p ? p.completo : NEGOCIOS[0].nombre}</b><small>${p ? `${p.rol.split(' · ')[0]} en ` : ''}${esc(r.negocio || NEGOCIOS[0].nombre)}</small></span></div>
      <p>${esc(r.texto)}</p>
    </div>
  </section>`;
}
VISTAS.inspiracion = {
  clase: 'view--reels',
  html() {
    const st = stories();
    return [reels().map(htmlReel).join(''),
      `<div class="reels-cab">
        <div class="reels-cab__fila"><h1>Feed</h1></div>
        <div class="stories">${st.map((x) => `<button class="story ${(S.vistas || {})[x.id] ? 'vista' : ''}" data-a="story" data-id="${x.id}">
          <span class="story__aro"><span class="story__av" style="${x.tono ? `background:radial-gradient(120% 90% at 30% 20%, ${x.tono[0]}, ${x.tono[1]})` : ''}">${x.logo ? `<img src="${x.logo}" alt="">` : esc(x.nombre.charAt(0))}</span></span>
          <small>${esc(x.nombre)}</small></button>`).join('')}</div>
      </div>`];
  },
};

/* ---------- Subir contenido (con revisión) ---------- */
function abrirSubida() {
  S.subida = { url: null, tipo: null, negocio: 'sublime', pro: null, mala: false };
  hojaGenerica('Subir al Feed', 'Fotos o vídeos de tu corte, peinado o tratamiento', `<div class="form-hoja">
    <label class="subida-zona" id="zona">
      <input type="file" id="f-archivo" accept="image/*,video/*" hidden>
      <span id="zona-prev">${ic('subir')}<b>Elige una foto o vídeo</b><small>Máximo 60 segundos</small></span>
    </label>
    <button class="link" data-a="subida-ejemplo" style="align-self:center">o usa un vídeo de ejemplo</button>
    <div class="campo"><label>¿Dónde te lo hicieron?</label><div class="chips">${[['sublime', NEGOCIOS[0].nombre], ['raiz', 'Raíz Estudio'], ['nacar', 'Nácar Estética']].map(([id, n]) => `<button type="button" class="chip" data-a="subida-neg" data-v="${id}" aria-pressed="${id === 'sublime'}">${n}</button>`).join('')}</div></div>
    <div class="campo" id="campo-pro"><label>¿Quién te atendió?</label><div class="chips">${[...EQUIPO.map((p) => [p.id, p.nombre]), ['', 'No lo sé']].map(([id, n]) => `<button type="button" class="chip" data-a="subida-pro" data-v="${id}" aria-pressed="false">${n}</button>`).join('')}</div></div>
    <div class="campo"><label for="f-texto">Texto</label><input type="text" id="f-texto" maxlength="150" placeholder="Ej.: Mi degradado de hoy 🔥"></div>
    <ul class="normas">
      <li>${ic('check', 'ic-s')}Solo cortes, peinados, estética, uñas o tratamientos</li>
      <li>${ic('cerrar', 'ic-s')}Nada de desnudos, contenido sexual, violencia ni insultos</li>
      <li>${ic('check', 'ic-s')}Etiqueta el negocio donde te lo hicieron</li>
    </ul>
    <label class="check-l"><input type="checkbox" id="f-ok"> Es mío y quien sale en él ha dado permiso</label>
    <button type="button" class="chip demo-mala" data-a="subida-mala" aria-pressed="false">Probar: simular contenido no permitido</button>
    <button class="btn btn--primary btn--block" data-a="subida-publicar">Publicar</button>
  </div>`);
  $('#f-archivo').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    S.subida.url = URL.createObjectURL(f);
    S.subida.tipo = f.type.startsWith('video') ? 'video' : 'imagen';
    pintarPrevia();
  });
}
function pintarPrevia() {
  const s = S.subida;
  $('#zona-prev').innerHTML = s.tipo === 'video' ? `<video src="${s.url}" muted loop playsinline autoplay></video>` : `<img src="${s.url}" alt="">`;
  $('#zona').classList.add('llena');
}
function revisarSubida() {
  const s = S.subida;
  const texto = $('#f-texto').value.trim();
  const vt = moderarTexto(texto);
  const checks = [
    ['Sin desnudos ni contenido sexual', !s.mala, 'La IA ha detectado contenido sexual o desnudos.'],
    ['Sin violencia ni odio', true],
    ['Es de imagen, belleza o bienestar', true],
    ['Texto respetuoso', vt.ok, vt.motivo],
    ['Etiquetado al negocio correcto', !!s.negocio],
  ];
  const cuerpo = $('#hoja-gen .form-hoja');
  cuerpo.innerHTML = `<div class="moderacion">${orbe()}<h3>Revisando tu contenido…</h3><p class="muted small">Tarda unos segundos</p>
    <ul class="chks">${checks.map(([t]) => `<li><span class="chk"></span>${t}</li>`).join('')}</ul><div id="mod-fin"></div></div>`;
  const lis = $$('.chks li', cuerpo);
  let i = 0;
  const paso = () => {
    const [, ok, motivo] = checks[i];
    lis[i].classList.add(ok ? 'ok' : 'mal');
    $('.chk', lis[i]).innerHTML = ic(ok ? 'check' : 'cerrar', 'ic-s');
    if (!ok) return terminar(false, motivo);
    if (++i < checks.length) setTimeout(paso, 480);
    else terminar(true);
  };
  const terminar = (ok, motivo) => {
    lis.forEach((li) => { if (!li.classList.contains('ok') && !li.classList.contains('mal')) li.classList.add('saltado'); });
    $('.moderacion h3', cuerpo).textContent = ok ? '¡Publicado!' : 'No se ha publicado';
    $('.moderacion > p', cuerpo).textContent = ok ? 'Ya está en el Feed. El negocio puede destacarlo en su perfil.' : motivo;
    $('.moderacion', cuerpo).classList.add(ok ? 'aprobado' : 'rechazado');
    if (ok) {
      const neg = NEGOCIOS.find((n) => n.id === s.negocio);
      S.subidos.unshift({ id: 'up' + Date.now(), video: s.tipo === 'video' ? s.url : null, img: s.tipo === 'imagen' ? s.url : s.poster || null, autor: 'tu_perfil', cliente: true, pro: s.negocio === 'sublime' ? s.pro : null, negocio: neg.nombre, texto: texto || 'Mi nuevo look', likes: 0, coms: 0 });
    }
    $('#mod-fin').innerHTML = `<button class="btn btn--primary btn--block" data-a="${ok ? 'subida-ver' : 'cerrar-hoja'}">${ok ? 'Ver en el Feed' : 'Entendido'}</button>`;
  };
  setTimeout(paso, 700);
}

/* ---------- El negocio publica avisos, vacaciones y stories ---------- */
function abrirPublicar() {
  S.pub = { tipo: 'aviso', pro: 'adri' };
  const lunes = addD(HOY, (8 - HOY.getDay()) % 7 || 7);
  hojaGenerica('Publicar en el muro', 'Lo verá todo el que entre a reservar', `<div class="form-hoja">
    ${segmento([['aviso', 'Aviso'], ['vacaciones', 'Vacaciones'], ['promo', 'Promo']], 'aviso', 'pub-tipo')}
    <div class="campo" id="pub-vac" hidden>
      <label>¿Quién se va?</label>
      <div class="chips">${EQUIPO.map((p) => `<button type="button" class="chip" data-a="pub-pro" data-v="${p.id}" aria-pressed="${p.id === 'adri'}">${p.nombre}</button>`).join('')}</div>
      <div class="fechas"><label>Desde<input type="date" id="p-desde" value="${kF(addD(lunes, 7))}"></label><label>Hasta<input type="date" id="p-hasta" value="${kF(addD(lunes, 11))}"></label></div>
      <p class="muted small">Esos días se bloquean solos en el calendario de reservas.</p>
    </div>
    <div class="campo"><label for="p-texto">Mensaje</label><textarea class="nota-campo" id="p-texto" placeholder="Ej.: El sábado abrimos solo por la mañana."></textarea></div>
    <label class="check-l"><input type="checkbox" id="p-fijar" checked> Fijar arriba y mostrarlo al reservar</label>
    <label class="check-l"><input type="checkbox" id="p-story" checked> Publicarlo también en stories</label>
    <button class="btn btn--primary btn--block" data-a="pub-enviar">${ic('megafono', 'ic-s')}Publicar</button>
  </div>`);
}

Object.assign(A, {
  'ver-muro': () => {
    if (S.vista === 'negocio') { $('[data-a="tab-ficha"][data-t="muro"]').click(); $('.view').scrollTo({ top: $('.tabs').offsetTop, behavior: 'smooth' }); return; }
    hojaGenerica('Avisos del negocio', NEGOCIOS[0].nombre, `<div class="pad">${S.muro.filter((m) => m.fijado).map(htmlPost).join('')}</div>`);
  },
  like: (b) => {
    const id = b.dataset.id;
    S.likes[id] = !S.likes[id];
    b.setAttribute('aria-pressed', S.likes[id]);
    const n = $('span', b) || b.lastChild;
    const v = parseInt(n.textContent, 10) + (S.likes[id] ? 1 : -1);
    n.textContent = v;
    if (S.likes[id] && !reducido) b.firstElementChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  },
  responder: (b) => { S.respondiendo = b.dataset.id; pintarMuro(); $('#muro-input').focus(); },
  story: (b) => abrirStory(b.dataset.id, b),
  subir: abrirSubida,
  'reel-reservar': (b) => { S.historial = ['inspiracion']; S.reserva = nuevaReserva(); empezarReserva({ servicio: 'corte', pro: b.dataset.p || null }); },
  'subida-ejemplo': () => { Object.assign(S.subida, { url: VID + 'obras/horizonte.mp4', tipo: 'video', poster: IMG + 'obras/horizonte.webp' }); pintarPrevia(); },
  'subida-neg': (b) => { S.subida.negocio = b.dataset.v; $$('[data-a="subida-neg"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#campo-pro').hidden = b.dataset.v !== 'sublime'; },
  'subida-pro': (b) => { S.subida.pro = b.dataset.v || null; $$('[data-a="subida-pro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'subida-mala': (b) => { S.subida.mala = !S.subida.mala; b.setAttribute('aria-pressed', S.subida.mala); },
  'subida-publicar': () => {
    if (!S.subida.url) return toast('Elige primero una foto o un vídeo');
    if (!$('#f-ok').checked) return toast('Confirma que el contenido es tuyo y tienes permiso');
    revisarSubida();
  },
  'subida-ver': () => { cerrarHoja(); ir('inspiracion', { reset: true, dir: 'fundido' }); },
  'pub-tipo': (b) => { S.pub.tipo = b.dataset.v; moverSegmento(b); $('#pub-vac').hidden = b.dataset.v !== 'vacaciones'; $('#p-texto').placeholder = { aviso: 'Ej.: El sábado abrimos solo por la mañana.', vacaciones: 'Ej.: Me voy unos días a descansar. ¡A la vuelta, con más ganas!', promo: 'Ej.: Este mes, corte + barba por 16 €.' }[b.dataset.v]; },
  'pub-pro': (b) => { S.pub.pro = b.dataset.v; $$('[data-a="pub-pro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'pub-enviar': () => {
    const P = S.pub;
    let texto = $('#p-texto').value.trim();
    const vac = P.tipo === 'vacaciones';
    let desde, hasta;
    if (vac) {
      desde = deK($('#p-desde').value); hasta = deK($('#p-hasta').value);
      if (!(hasta >= desde)) return toast('Revisa las fechas');
      if (!texto) texto = `${pro(P.pro).nombre} estará de vacaciones del ${fLarga(desde)} al ${fLarga(hasta)}.`;
    }
    if (!texto) return toast('Escribe el mensaje');
    const v = moderarTexto(texto);
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    if (vac) S.vacaciones.push({ pro: P.pro, desde, hasta });
    S.muro.push({ id: 'n' + Date.now(), autor: vac ? 'pro' : 'negocio', pro: vac ? P.pro : null, nombre: vac ? pro(P.pro).nombre : NEGOCIOS[0].nombre, texto, fecha: new Date(), fijado: $('#p-fijar').checked, storyNueva: $('#p-story').checked, story: $('#p-story').checked, respuestas: [], likes: 0 });
    cerrarHoja();
    render(null, { mantenerScroll: true });
    toast(vac ? 'Publicado. Esos días ya aparecen bloqueados al reservar.' : 'Publicado en el muro y en stories');
  },
  tema: (b) => ponerTema(b.dataset.v),
});
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'muro-form') return;
  e.preventDefault();
  const i = $('#muro-input');
  const t = i.value.trim();
  if (!t) return;
  i.value = '';
  publicarMuro(t);
});

/* ---------- Tema claro / oscuro ---------- */
function ponerTema(t) {
  S.tema = t;
  document.documentElement.dataset.theme = t === 'claro' ? 'light' : 'dark';
  try { localStorage.setItem('tema', t); } catch {}
  $$('[data-a="tema"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === t));
  $$('[data-seg-tema]').forEach((seg) => { const b = $(`[data-v="${t}"]`, seg); if (b) $('.segmento__pill', seg).style.transform = `translateX(${b.dataset.j * 100}%)`; });
  document.querySelector('meta[name="theme-color"]').content = t === 'claro' ? '#f6f4f0' : '#09090b';
  if (S.vista === 'stats') render(null, { mantenerScroll: true });
}
{
  let t = null;
  try { t = localStorage.getItem('tema'); } catch {}
  ponerTema(t || (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro'));
}

