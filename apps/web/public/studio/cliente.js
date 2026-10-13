'use strict';
/* IMAGO Clientes: registro, inicio, explorar (lista y mapa), citas y perfil */

Object.assign(ICON, {
  casa: '<path d="M3.5 10.5L12 4l8.5 6.5V20a1 1 0 01-1 1H15v-6H9v6H4.5a1 1 0 01-1-1z"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  whatsapp: '<path d="M4 20l1.3-3.8A8 8 0 1112 20a8 8 0 01-3.8-1z"/><path d="M9 8.5c0 3 2.5 6 5.5 6.5l1-1.5-2-1-1 .8a4 4 0 01-2.3-2.3l.8-1-1-2z" fill="currentColor" stroke="none"/>',
  sms: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  bloquear: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  confianza: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  qr: '<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h2.5v2.5M20.5 14.5v.01M14.5 20.5h6M20.5 17.5v3"/>',
  copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8"/>',
  regalo: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-4-5-1.5S10 8 12 8zm0 0c1.5-3 5-4 5-1.5S14 8 12 8z"/>',
  soporte: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
  documento: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  recibo: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  mapa: '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
  ordenar: '<path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5"/>',
  diana: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  cara: '<path d="M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16"/><path d="M9 9.5v1M15 9.5v1M12 9.5v4h-1M9.5 16c1.5 1 3.5 1 5 0"/>',
  salir: '<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 8l-4 4 4 4M6 12h10"/>',
  idioma: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z"/>',
  candado: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/>',
  nota: '<path d="M5 3h10l4 4v14H5z"/><path d="M9 13l2 2 4-4"/>',
  guardar: '<path d="M6.5 3.5h11a1 1 0 011 1V21L12 16.5 5.5 21V4.5a1 1 0 011-1z"/>',
});
const ICON_CAT = {
  barberia: ICON.tijeras || '<circle cx="6" cy="6.5" r="2.8"/><circle cx="6" cy="17.5" r="2.8"/><path d="M8.2 8.2L20 18M8.2 15.8L20 6"/>',
  peluqueria: '<path d="M3 8.5A4.5 4.5 0 017.5 4H15l5 2v5l-5 2H7.5A4.5 4.5 0 013 8.5z"/><circle cx="8" cy="8.5" r="1.5"/><path d="M10.5 13l-1 7h3.5l1-7"/>',
  unas: '<path d="M10 3h4v5h-4zM8.5 8h7l1.5 3v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z"/>',
  depilacion: '<path d="M6 21l7.5-7.5M13.5 13.5l5-5a2.1 2.1 0 00-3-3l-5 5z"/><path d="M4 10c1-1 2-1 3 0"/>',
  masaje: '<path d="M7 12V6.5a1.5 1.5 0 013 0V11M10 10V4.5a1.5 1.5 0 013 0V11M13 10.5V6a1.5 1.5 0 013 0v6.5c0 4-2.5 7.5-6 7.5-3 0-4.5-2-6-4.5L2.5 13A1.5 1.5 0 015 11.5L7 14"/>',
  facial: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01M9 15c1.5 1 4.5 1 6 0"/><path d="M18 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
  cejas: '<path d="M3 8c3-2.5 6-3 9-2"/><path d="M2 14.5S6 9.5 12 9.5s10 5 10 5-4 5-10 5-10-5-10-5z"/><circle cx="12" cy="14.5" r="2.5"/>',
  maquillaje: '<path d="M9 21h6v-8H9zM10 13V7.5L14 4v9"/>',
  spa: '<path d="M12 20c-4 0-8-2-9.5-6 3.5 0 6.5 1.3 9.5 4 3-2.7 6-4 9.5-4-1.5 4-5.5 6-9.5 6z"/><path d="M12 18c-2-2-3-5-3-8.5 1.2 0 2.4.8 3 2 .6-1.2 1.8-2 3-2 0 3.5-1 6.5-3 8.5z"/>',
  salud: '<path d="M12 20s-7-4.4-9-9.1C1.7 7.6 3.9 4.5 7.1 4.5c2 0 3.4 1.1 4.9 2.9 1.5-1.8 2.9-2.9 4.9-2.9 3.2 0 5.4 3.1 4.1 6.4"/><path d="M3.5 12.5h4l2-3 3 6 2-3h6"/>',
  fitness: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  tatuajes: '<path d="M15 4l5 5M13.5 5.5l5 5L9 20H4v-5z"/><path d="M8 12l4 4"/>',
  piercing: '<circle cx="12" cy="14" r="6"/><circle cx="12" cy="6" r="2"/>',
  dental: '<path d="M7.5 3.5C5 3.5 3.5 5.5 3.5 8c0 3 1.5 4.5 2 7 .5 3 1 5.5 2.5 5.5S10 17 12 17s2.5 3.5 4 3.5 2-2.5 2.5-5.5c.5-2.5 2-4 2-7 0-2.5-1.5-4.5-4-4.5-2 0-3 1-4.5 1s-2.5-1-4.5-1z"/>',
  medicina: '<path d="M18 2.5l3.5 3.5M16.5 6l3-3M19 8.5L10.5 17l-3.5-3.5L15.5 5M9 11l3.5 3.5M6 18l-3 3"/>',
  trenzas: '<path d="M9 3c0 3 6 3 6 6s-6 3-6 6 6 3 6 6M15 3c0 3-6 3-6 6s6 3 6 6-6 3-6 6"/>',
  perros: '<circle cx="6.5" cy="10.5" r="1.8"/><circle cx="17.5" cy="10.5" r="1.8"/><circle cx="9.5" cy="6" r="1.8"/><circle cx="14.5" cy="6" r="1.8"/><path d="M12 12c-3 0-5.5 3.5-5.5 5.5 0 1.5 1 2.5 2.5 2.5 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.5 0 2.5-1 2.5-2.5 0-2-2.5-5.5-5.5-5.5z"/>',
};
const icCat = (id) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICON_CAT[id]}</svg>`;

Object.assign(S, {
  logueado: false,
  busca: '',
  filtro: 'todo',
  orden: 'recomendado',
  modoExplorar: 'lista',
  recientes: ['Degradado', 'Sublime Barber Studio', 'Uñas semipermanentes'],
  favoritos: ['sublime', 'raiz'],
  notiCli: [],
  leidasCli: 0,
  sobreMi: { pelo: 'Ondulado', piel: ['Piel sensible'], nota: 'Me gusta el degradado bajo y no muy corto arriba. Barba perfilada.' },
  ajustes: { faceid: true, wa: true, sms: false, push: true, recAntes: '24', notiAvisos: true, notiOfertas: false, notiReseñas: true, perfilPublico: true },
});

const neg = (id) => NEGOCIOS.find((n) => n.id === id);
const distancia = (n) => { const R = 6371, r = Math.PI / 180; const dLa = (n.lat - UBI.lat) * r, dLo = (n.lng - UBI.lng) * r; const x = Math.sin(dLa / 2) ** 2 + Math.cos(UBI.lat * r) * Math.cos(n.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const fDist = (n) => { const d = distancia(n); return d < 1 ? `${Math.round(d * 100) * 10} m` : `${d.toFixed(1).replace('.', ',')} km`; };
const nota = (n) => n.nota.toFixed(1).replace('.', ',');
function proximoTxt(n) { if (!n.real) return n.proximo; const ph = proximoHueco(); return ph ? `${fRel(ph.fecha)} · ${ph.hora}` : 'Sin huecos'; }
function arteNegocio(n, cls = '') {
  if (n.real) return `<img class="${cls}" src="${n.portada}" alt="">`;
  return `<span class="arte ${cls}" style="background:radial-gradient(120% 90% at 30% 20%, ${n.tono[0]}, ${n.tono[1]})"><span>${n.nombre.charAt(0)}</span></span>`;
}
function resumenIA(n) {
  if (!n.real) return n.resumen;
  const R = S.resenas;
  if (!R.length) return 'Los clientes destacan el trato y la profesionalidad del equipo.';
  const c = (re) => R.filter((r) => re.test(norm(r.texto))).length;
  return `De las últimas ${R.length} reseñas, ${c(/trato/)} destacan el trato y ${c(/profesional/)} la profesionalidad. Recomiendan a Javi y a Adri por igual.`;
}

/* ---------- Registro / entrada ---------- */
/* Fondo de la entrada: gente contenta en distintos sectores (fotos de Unsplash, licencia gratuita) */
const FOTOS_LOGIN = ['1560869631-e5f8d16b43d4', '1635273051937-a0ddef9573b6', '1772322586649-fc11154e76b9', '1706795033728-9232ef548a16', '1597595735781-6a57fb8e3e3d', '1650803075918-efbee311735d', '1753260283382-a7b5d362af85', '1580421383874-7e60f05f64b4']
  .map((id) => `https://images.unsplash.com/photo-${id}?w=900&h=1600&fit=crop&crop=faces&q=70&auto=format`);
VISTAS.login = {
  clase: 'view--full view--sinnav',
  tabbar: false,
  html() {
    const b = (id, txt, icono) => `<button class="btn btn--block login__btn login__btn--${id}" data-a="login" data-v="${id}">${icono}<span class="btn__txt">${txt}</span></button>`;
    return [`<div class="login">
      <div class="login__fotos" aria-hidden="true">${FOTOS_LOGIN.map((f, i) => `<img src="${f}" alt="" style="animation-delay:${i * 5}s" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>
      ${AURORA}
      <div class="login__cuerpo">
        <div class="login__marca">${LOGO}</div>
        <p class="login__lema">Reserva en tu barbería, peluquería o centro favorito. Con vídeo, comunidad y una IA que te guía.</p>
        <div class="login__btns">
          ${b('apple', 'Continuar con Apple', '<svg class="ic" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.8-1-2.8-4.3zM14 5.3c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>')}
          ${b('google', 'Continuar con Google', '<svg class="ic" viewBox="0 0 24 24"><path fill="#4285F4" stroke="none" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" stroke="none" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z"/><path fill="#FBBC05" stroke="none" d="M6.4 14a6 6 0 010-3.9V7.5H3.1a10 10 0 000 9z"/><path fill="#EA4335" stroke="none" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z"/></svg>')}
          ${b('facebook', 'Continuar con Facebook', '<svg class="ic" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4A20 20 0 0014.3 4c-2.2 0-3.7 1.3-3.7 3.8v2.7H8v3h2.6V21z"/></svg>')}
          ${b('instagram', 'Continuar con Instagram', '<svg class="ic" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/></svg>')}
          ${b('email', 'Teléfono o email', ic('correo'))}
        </div>
        <button class="link login__saltar" data-a="login" data-v="invitado">Explorar sin cuenta</button>
        <p class="login__legal">Al continuar aceptas los Términos y la Política de privacidad.</p>
      </div>
    </div>`];
  },
};

/* ---------- Inicio ---------- */
const FRASES = ['corte y barba el viernes por la tarde', 'una barbería cerca con hueco hoy', 'masaje para la espalda esta semana', 'uñas para el sábado por la mañana', '¿qué corte me recomiendas?'];
function proximaCita() {
  return S.citas.filter((c) => !c.cancelada && +deK(c.fecha) + minH(c.hora) * 6e4 > Date.now()).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0];
}
function campanaCli() {
  const n = notisCliente().length - S.leidasCli;
  return `<button class="icon-btn campana" data-a="tab" data-v="avisos" aria-label="Notificaciones">${ic('campana')}${n > 0 ? `<i class="badge">${n}</i>` : ''}</button>`;
}
function tarjetaNegocio(n, extra = '', razon = '') {
  return `<button class="neg-card" data-a="${n.real ? 'negocio' : 'negocio-ej'}" data-n="${esc(n.nombre)}">
    <span class="neg-card__img">${arteNegocio(n)}${extra}</span>
    <b>${n.nombre}</b>
    <small>${ic('estrella', 'ic-s')}${nota(n)} · ${n.tipo} · ${fDist(n)}</small>
    ${razon ? `<small class="razon">${ic('chispa', 'ic-s')}${razon}</small>` : ''}
  </button>`;
}
VISTAS.inicio = {
  html() {
    const pc = proximaCita();
    const favs = S.favoritos.map(neg);
    const recos = NEGOCIOS.map((n) => ({ n, a: afinidad(n) })).sort((x, y) => y.a.p - x.a.p).slice(0, 5);
    return [`
      <div class="topbar"><span class="marca">${LOGO}</span>${campanaCli()}</div>
      <button class="buscador" data-a="buscar" aria-label="Buscar servicio o negocio">
        ${orbe('orbe--sm')}
        <span class="buscador__txt"><span class="faint">Busca o pídeselo a la IA:</span> <b id="frase"></b><i class="cursor"></i></span>
      </button>
      <div class="cats" role="list">${CATEGORIAS.map((c) => `<button class="cat" role="listitem" data-a="cat" data-c="${c.id}"><span class="cat__ic">${icCat(c.id)}</span><small>${c.nombre}</small></button>`).join('')}</div>
      ${pc ? (() => { const s = serv(pc.servicio), p = pro(pc.pro); return `<div class="seccion-t pad"><h2>Tu próxima cita</h2></div>
        <button class="proxima" data-a="tab" data-v="citas"><img src="${p.img}" alt=""><div><b>${s.nombre} con ${p.nombre}</b><small>${mayus(fLarga(deK(pc.fecha)))} · ${pc.hora}</small></div>${ic('sig')}</button>`; })() : ''}
      <div class="seccion-t pad"><h2>Tus favoritos</h2><button data-a="tab" data-v="explorar">Ver todo</button></div>
      <div class="fila-scroll">${favs.map((n) => tarjetaNegocio(n, `<span class="pill pill--glass"><i class="punto"></i>${proximoTxt(n)}</span>`)).join('')}</div>
      <div class="seccion-t pad"><h2>Ofertas especiales</h2></div>
      <div class="fila-scroll">${OFERTAS.map((o) => { const n = neg(o.neg); return `<button class="oferta" data-a="negocio-ej" data-n="${esc(n.nombre)}" style="background:radial-gradient(130% 100% at 0% 0%, ${n.tono[0]}, ${n.tono[1]})"><span class="pill pill--glass">Oferta</span><b>${o.titulo}</b><small>${n.nombre} · ${o.sub}</small></button>`; }).join('')}</div>
      <div class="seccion-t pad"><h2>Recomendados para ti</h2><button data-a="rehacer-prefs">${S.prefs ? 'Según tus gustos' : 'Personalizar'}</button></div>
      <div class="fila-scroll">${recos.map(({ n, a }) => tarjetaNegocio(n, `<span class="pill pill--glass afin">${a.p} % para ti</span>`, a.razones[0])).join('')}</div>
      <div class="seccion-t pad"><h2>Cerca de ti</h2><button data-a="ver-mapa">Abrir mapa</button></div>
      <button class="mapa-mini" data-a="ver-mapa" aria-label="Abrir el mapa"><div id="mapa-mini"></div><span class="pill pill--glass">${ic('pin', 'ic-s')}${NEGOCIOS.length} negocios a menos de 2 km</span></button>
      <p class="faint small pad" style="margin-top:14px">Excepto Sublime, los negocios son de ejemplo.</p>`];
  },
  montar(capa) {
    let i = 0, j = 0, borrando = false;
    const el = $('#frase', capa);
    const iv = setInterval(() => {
      const f = FRASES[i];
      if (!borrando) { j++; if (j > f.length + 18) borrando = true; }
      else { j -= 2; if (j <= 0) { borrando = false; j = 0; i = (i + 1) % FRASES.length; } }
      el.textContent = f.slice(0, Math.min(j, f.length));
    }, 55);
    limpiezas.push(() => clearInterval(iv));
    crearMapa($('#mapa-mini', capa), { mini: true });
  },
};

/* ---------- Explorar: búsqueda, filtros, orden y mapa ---------- */
const FILTROS = [['todo', 'Todo'], ['corte', 'Corte de pelo'], ['barba', 'Barba'], ['color', 'Color'], ['manicura', 'Manicura'], ['depilacion', 'Depilación'], ['masaje', 'Masaje'], ['facial', 'Facial'], ['tatuaje', 'Tatuaje'], ['perros', 'Perros']];
const ORDENES = [['recomendado', 'Recomendado'], ['cerca', 'Más cerca'], ['valorado', 'Mejor valorado'], ['barato', 'Más barato'], ['medio', 'Precio medio']];
function resultados() {
  const q = norm(S.busca.trim());
  let l = NEGOCIOS.filter((n) => (S.filtro === 'todo' || n.cat === S.filtro || n.tags.includes(S.filtro)) && (!q || norm(`${n.nombre} ${n.tipo} ${n.tags.join(' ')}`).includes(q) || (n.real && SERVICIOS.some((s) => norm(s.nombre).includes(q)))));
  const o = S.orden;
  l.sort((a, b) => o === 'cerca' ? distancia(a) - distancia(b) : o === 'valorado' ? b.nota - a.nota || b.totalResenas - a.totalResenas : o === 'barato' ? a.precioDesde - b.precioDesde : o === 'medio' ? a.precioMedio - b.precioMedio : (b.nota * 10 - distancia(b) * 2) - (a.nota * 10 - distancia(a) * 2));
  return l;
}
function htmlResultados() {
  const l = resultados();
  const q = S.busca.trim();
  let h = '';
  if (q.length > 3) h += `<button class="pregunta-ia" data-a="ia" data-q="${esc(q)}">${orbe('orbe--sm')}<span>Preguntar a la IA: <b>«${esc(q)}»</b></span>${ic('sig')}</button>`;
  if (!l.length) return h + `<div class="vacio">${ic('buscar')}No hay resultados. Prueba con otro filtro o pregúntale a la IA.</div>`;
  return h + l.map((n) => `<button class="res" data-a="${n.real ? 'negocio' : 'negocio-ej'}" data-n="${esc(n.nombre)}">
    <span class="res__img">${arteNegocio(n)}</span>
    <span class="res__txt"><b>${n.nombre}</b><small>${estrellas(Math.round(n.nota))} <span>${nota(n)} (${n.totalResenas})</span></small><small>${n.tipo} · ${fDist(n)} · desde ${eur(n.precioDesde)}</small><span class="pill"><i class="punto"></i>${proximoTxt(n)}</span></span>
    ${S.favoritos.includes(n.id) ? `<span class="res__fav">${ic('corazon')}</span>` : ''}
  </button>`).join('');
}
VISTAS.explorar = {
  html() {
    const ordenTxt = ORDENES.find(([id]) => id === S.orden)[1];
    return [`
      <div class="explorar-cab">
        <label class="busca-res busca-grande">${ic('buscar')}<input id="busca" type="search" placeholder="Servicio, negocio o barrio" value="${esc(S.busca)}" autocomplete="off"></label>
        <div class="pad" style="padding:0">${segmento([['lista', 'Lista'], ['mapa', 'Mapa']], S.modoExplorar, 'modo-explorar')}</div>
      </div>
      ${S.modoExplorar === 'lista' ? `
        <div class="pad">
          <button class="cerca" data-a="cerca-mi">${ic('diana')}<span><b>Cerca de mí</b><small>San Jerónimo, Sevilla</small></span>${ic('sig', 'ic-s')}</button>
          ${!S.busca ? `<p class="franja">Recientes</p><div class="recientes">${S.recientes.map((r) => `<button data-a="reciente" data-q="${esc(r)}">${ic('reloj', 'ic-s')}${esc(r)}</button>`).join('')}</div>` : ''}
          <p class="franja">Filtros</p>
          <div class="chips" role="group" aria-label="Filtros">${FILTROS.map(([id, t]) => `<button class="chip" data-a="filtro" data-v="${id}" aria-pressed="${S.filtro === id}">${t}</button>`).join('')}</div>
          <div class="orden-fila"><span class="faint small" id="n-res"></span><button class="chip" data-a="ordenar">${ic('ordenar', 'ic-s')}${ordenTxt}</button></div>
          <div id="resultados">${htmlResultados()}</div>
        </div>` : `<div class="mapa-grande"><div id="mapa"></div><div class="mapa-card" id="mapa-card" hidden></div></div>`}`];
  },
  montar(capa) {
    const inp = $('#busca', capa);
    const pintar = () => { const r = $('#resultados'); if (r) { r.innerHTML = htmlResultados(); $('#n-res').textContent = `${resultados().length} resultados`; } };
    inp.addEventListener('input', () => { S.busca = inp.value; pintar(); });
    inp.addEventListener('change', () => { const v = inp.value.trim(); if (v && !S.recientes.includes(v)) S.recientes = [v, ...S.recientes].slice(0, 5); });
    if (S.focoBusca) { S.focoBusca = false; setTimeout(() => inp.focus(), 350); }
    pintar();
    if (S.modoExplorar === 'mapa') crearMapa($('#mapa', capa), {});
  },
};

/* Mapa (Leaflet + OpenStreetMap). Pins con la nota y miniatura con fotos que se funden y resumen IA. */
function crearMapa(el, { mini = false }) {
  if (!el) return;
  if (typeof L === 'undefined') { el.innerHTML = '<div class="vacio">El mapa necesita conexión a internet.</div>'; return; }
  const mapa = L.map(el, { zoomControl: false, attributionControl: !mini, dragging: !mini, scrollWheelZoom: !mini, doubleClickZoom: !mini, touchZoom: !mini, keyboard: !mini, tap: false, fadeAnimation: !mini, zoomAnimation: !mini, markerZoomAnimation: !mini }).setView([UBI.lat - 0.004, UBI.lng], mini ? 14 : 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(mapa);
  L.marker([UBI.lat, UBI.lng], { icon: L.divIcon({ className: '', html: '<span class="yo-pin"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false }).addTo(mapa);
  NEGOCIOS.filter((n) => S.filtro === 'todo' || mini || n.cat === S.filtro || n.tags.includes(S.filtro)).forEach((n) => {
    const m = L.marker([n.lat, n.lng], { icon: L.divIcon({ className: '', html: `<span class="pin ${n.real ? 'pin--real' : ''}">${ICON.estrella.replace('<path', '<svg viewBox="0 0 24 24" class="ic"><path').replace('/>', '/></svg>')}${nota(n)}</span>`, iconSize: null, iconAnchor: [28, 16] }) }).addTo(mapa);
    if (!mini) m.on('click', () => { abrirMiniatura(n); mapa.panTo([n.lat - 0.002, n.lng], { animate: true }); $$('.pin').forEach((p) => p.classList.remove('on')); m.getElement().querySelector('.pin').classList.add('on'); });
  });
  setTimeout(() => { try { if (el.isConnected) mapa.invalidateSize(); } catch {} }, 60);
  limpiezas.push(() => { clearInterval(abrirMiniatura.t); try { mapa.off(); mapa.remove(); } catch {} });
}
function abrirMiniatura(n) {
  const c = $('#mapa-card');
  if (!c) return;
  const fotos = n.real ? n.fotos : [0, 1, 2];
  c.innerHTML = `<div class="mapa-card__fotos">${fotos.map((f, i) => n.real ? `<img src="${f}" alt="" class="${i === 0 ? 'on' : ''}">` : `<span class="arte ${i === 0 ? 'on' : ''}" style="background:radial-gradient(120% 90% at ${20 + i * 30}% ${20 + i * 20}%, ${n.tono[0]}, ${n.tono[1]})"><span>${n.nombre.charAt(0)}</span></span>`).join('')}
      <button class="icon-btn icon-btn--glass" data-a="cerrar-mini" aria-label="Cerrar">${ic('cerrar', 'ic-s')}</button></div>
    <div class="mapa-card__txt">
      <b>${n.nombre}</b>
      <small>${estrellas(Math.round(n.nota))} ${nota(n)} (${n.totalResenas}) · ${n.tipo} · ${fDist(n)}</small>
      <p class="mapa-card__ia">${orbe('orbe--sm')}<span><b>Resumen IA:</b> ${resumenIA(n)}</span></p>
      <div class="mapa-card__btns"><button class="btn btn--sm btn--ghost" data-a="${n.real ? 'negocio' : 'negocio-ej'}" data-n="${esc(n.nombre)}">Ver negocio</button><button class="btn btn--sm btn--primary" data-a="${n.real ? 'reservar' : 'negocio-ej'}" data-n="${esc(n.nombre)}">Reservar</button></div>
    </div>`;
  c.hidden = false;
  c.classList.remove('on'); void c.offsetWidth; c.classList.add('on');
  clearInterval(abrirMiniatura.t);
  let i = 0;
  abrirMiniatura.t = setInterval(() => {
    const els = $$('.mapa-card__fotos > :not(button)', c);
    if (!els.length) return clearInterval(abrirMiniatura.t);
    els[i].classList.remove('on'); i = (i + 1) % els.length; els[i].classList.add('on');
  }, 2600);
}

/* ---------- Citas ---------- */
VISTAS.citas = {
  html() {
    const prox = S.citas.filter((c) => !c.cancelada).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    let h = `<div class="neg-titulo"><h1>Mis citas</h1><button class="btn btn--sm btn--primary" data-a="tab" data-v="explorar">${ic('mas', 'ic-s')}Reservar</button></div>`;
    if (prox.length) {
      h += prox.map((c, i) => {
        const s = serv(c.servicio), p = pro(c.pro), f = deK(c.fecha);
        const ms = +f + minH(c.hora) * 6e4 - Date.now();
        const dd = Math.max(0, Math.floor(ms / 864e5)), hh = Math.max(0, Math.floor((ms % 864e5) / 36e5)), mm = Math.max(0, Math.floor((ms % 36e5) / 6e4));
        return `<article class="cita-card">
          <div class="cita-card__img"><img src="${s.img}" alt=""><span class="pill pill--glass"><i class="punto"></i>Confirmada${c.pago !== 'local' ? ' · Pagada' : ''}</span></div>
          <div class="cita-card__body">
            <h3>${s.nombre}</h3>
            <p>con ${p.nombre} · ${NEGOCIOS[0].nombre}<br>${mayus(fLarga(f))} · ${c.hora}</p>
            ${i === 0 ? `<div class="cuenta"><div><b>${dd}</b><small>días</small></div><div><b>${hh}</b><small>horas</small></div><div><b>${mm}</b><small>min</small></div></div>` : ''}
            <div class="cita-acciones">
              <button data-a="toast" data-t="Se abriría el mapa con la ruta">${ic('pin')}Cómo llegar</button>
              <button data-a="cita-cambiar" data-i="${S.citas.indexOf(c)}">${ic('calendario')}Cambiar</button>
              <button data-a="cita-cancelar" data-i="${S.citas.indexOf(c)}">${ic('cerrar')}Cancelar</button>
            </div>
          </div>
        </article>`;
      }).join('');
    } else {
      h += `<div class="vacio" style="padding:36px 20px 8px">${ic('calendario')}No tienes citas próximas.</div>`;
    }
    h += `<div class="seccion-t pad"><h2>Anteriores</h2></div><div class="pad pasadas">${S.pasadas.map((c, i) => {
      const s = serv(c.servicio), p = pro(c.pro);
      return `<article class="pasada-card">
        <img class="pasada-card__fondo" src="${NEGOCIOS[0].fotos[(i + 1) % NEGOCIOS[0].fotos.length]}" alt="">
        <div class="pasada-card__info">
          <img class="pasada-card__pro" src="${p.img}" alt="${p.nombre}">
          <div><b>${p.nombre}</b><small>${s.nombre} · ${mayus(fCorta(c.fecha))} · ${eur(s.precio)}</small></div>
        </div>
        <div class="pasada-card__btns">
          <button class="btn btn--sm reel__cta" data-a="repetir" data-s="${c.servicio}" data-p="${c.pro}">${ic('repetir', 'ic-s')}Reservar de nuevo</button>
          <button class="btn btn--sm subir-btn" data-a="ver-pasada" data-i="${i}">Detalle</button>
        </div>
      </article>`;
    }).join('')}</div>`;
    return [h];
  },
};

/* ---------- Notificaciones del cliente ---------- */
function notisCliente() {
  const base = [
    { ic: 'megafono', t: `<b>Sublime Barber Studio</b> ha publicado: Javi estará de vacaciones la semana que viene.`, cuando: 'hace 2 días', ir: 'muro' },
    { ic: 'regalo', t: '<b>The Fade Club</b> te ofrece un 20 % en tu primera visita.', cuando: 'hace 3 días' },
    { ic: 'estrella', t: '¿Qué tal tu último corte con <b>Javi</b>? Déjale una reseña.', cuando: 'hace 4 semanas' },
  ];
  return [...S.notiCli, ...base];
}
VISTAS.avisos = {
  padre: 'inicio',
  html() {
    const l = notisCliente();
    const nuevas = l.length - S.leidasCli;
    return [`<div class="topbar"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><b>Notificaciones</b><span style="width:40px"></span></div>
      <div class="pad">${l.map((x, i) => `<button class="noti ${i < nuevas ? 'nueva' : ''}" ${x.ir ? `data-a="noti-ir" data-v="${x.ir}"` : ''}><span class="noti__ic">${ic(x.ic)}</span><span><span>${x.t}</span><small>${x.cuando}</small></span></button>`).join('')}</div>`];
  },
  montar() { S.leidasCli = notisCliente().length; },
};

/* ---------- Perfil ---------- */
const PELOS = ['Liso', 'Ondulado', 'Rizado', 'Afro', 'Poco pelo'];
const PIELES = ['Piel sensible', 'Alergias', 'Caspa', 'Cuero cabelludo graso'];
function sw(clave, etiqueta, sub = '') {
  return `<div class="ajuste"><span><b>${etiqueta}</b>${sub ? `<small>${sub}</small>` : ''}</span><button class="switch" role="switch" aria-checked="${!!S.ajustes[clave]}" data-a="switch" data-k="${clave}" aria-label="${etiqueta}"></button></div>`;
}
VISTAS.perfil = {
  html() {
    const sm = S.sobreMi;
    const fila = (a, icono, t, sub = '') => `<button data-a="${a}">${ic(icono)}<span>${t}${sub ? `<small>${sub}</small>` : ''}</span>${ic('sig', 'ic-s')}</button>`;
    return [`<div class="perfil-cab"><span class="avatar avatar--sil">${ic('usuario')}</span><h2 style="font-size:24px">${YO.nombre}</h2><p class="muted small">${S.citas.length + S.pasadas.length} citas · cliente desde 2024</p></div>
      <button class="sobre-mi" data-a="perfil-sobre">
        <span class="eyebrow">Sobre mí · lo ven tus profesionales</span>
        <span class="sobre-mi__chips"><span class="pill">${sm.pelo}</span>${sm.piel.map((p) => `<span class="pill">${p}</span>`).join('')}</span>
        <p>${esc(sm.nota)}</p>
        <span class="link">Editar ${ic('editar', 'ic-s')}</span>
      </button>
      <div class="lista-op">
        ${fila('rehacer-prefs', 'chispa', 'Mis preferencias', S.prefs ? resumenPrefs() : 'Responde 6 preguntas y la IA te recomienda')}
        ${fila('perfil-datos', 'usuario', 'Datos de la cuenta', `${YO.tel} · ${YO.email}`)}
        ${fila('perfil-pagos', 'tarjeta', 'Pagos', 'Visa •••• 4242 · Apple Pay')}
        ${fila('perfil-recordatorios', 'reloj', 'Recordatorios', S.ajustes.wa ? 'WhatsApp, 24 h antes' : 'Desactivados')}
        ${fila('perfil-notis', 'campana', 'Notificaciones')}
        ${fila('perfil-resenas', 'estrella', 'Mis reseñas', '2 reseñas')}
      </div>
      <div class="lista-op">
        ${fila('perfil-privacidad', 'candado', 'Privacidad y seguridad', S.ajustes.faceid ? 'Face ID activado' : 'Face ID desactivado')}
        ${fila('perfil-app', 'ajustes', 'Ajustes de la app', `Tema ${S.tema}`)}
        ${fila('perfil-soporte', 'soporte', 'Ayuda y soporte')}
        <button data-a="salir">${ic('salir')}<span>Cerrar sesión</span></button>
      </div>
      `];
  },
};
function hojaSobreMi() {
  const sm = S.sobreMi;
  hojaGenerica('Sobre mí', 'Lo verán los profesionales donde reserves', `<div class="form-hoja">
    <div class="campo"><label>Tipo de pelo</label><div class="chips">${PELOS.map((p) => `<button type="button" class="chip" data-a="sm-pelo" data-v="${p}" aria-pressed="${sm.pelo === p}">${p}</button>`).join('')}</div></div>
    <div class="campo"><label>Piel y cuero cabelludo</label><div class="chips">${PIELES.map((p) => `<button type="button" class="chip" data-a="sm-piel" data-v="${p}" aria-pressed="${sm.piel.includes(p)}">${p}</button>`).join('')}</div></div>
    <div class="campo"><label for="sm-nota">Cómo te gusta</label><textarea class="nota-campo" id="sm-nota" maxlength="240">${esc(sm.nota)}</textarea></div>
    <button class="btn btn--primary btn--block" data-a="sm-guardar">Guardar</button>
  </div>`);
}

/* ---------- Acciones del cliente ---------- */
Object.assign(A, {
  login: (b) => {
    if (b.dataset.v === 'invitado') { S.logueado = true; ir('inicio', { reset: true, dir: 'fundido' }); ofrecerCuestionario(); return; }
    b.classList.add('cargando');
    b.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>');
    setTimeout(() => { S.logueado = true; ir('inicio', { reset: true, dir: 'fundido' }); ofrecerCuestionario(); toast(`Hola, ${YO.nombre.split(' ')[0]}. Sesión iniciada con ${{ apple: 'Apple', google: 'Google', facebook: 'Facebook', instagram: 'Instagram', email: 'tu email' }[b.dataset.v]}`); }, 800);
  },
  salir: () => { S.logueado = false; ir('login', { reset: true, dir: 'fundido' }); },
  buscar: () => { S.focoBusca = true; S.modoExplorar = 'lista'; ir('explorar', { reset: true, dir: 'fundido' }); },
  cat: (b) => { const c = b.dataset.c; S.filtro = FILTROS.some(([id]) => id === c) ? c : (NEGOCIOS.some((n) => n.cat === c) ? c : 'todo'); S.busca = ''; S.modoExplorar = 'lista'; ir('explorar', { reset: true, dir: 'fundido' }); if (S.filtro === 'todo') toast(`Aún no hay negocios de ${CATEGORIAS.find((x) => x.id === c).nombre.toLowerCase()} en el prototipo`); },
  'ver-mapa': () => { S.modoExplorar = 'mapa'; ir('explorar', { reset: true, dir: 'fundido' }); },
  'modo-explorar': (b) => { S.modoExplorar = b.dataset.v; moverSegmento(b); setTimeout(() => render(null), 180); },
  'cerca-mi': () => { S.orden = 'cerca'; S.busca = ''; render(null, { mantenerScroll: true }); toast('Ordenado por distancia desde tu ubicación'); },
  reciente: (b) => { S.busca = b.dataset.q; render(null); },
  filtro: (b) => { S.filtro = b.dataset.v; $$('[data-a="filtro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#resultados').innerHTML = htmlResultados(); $('#n-res').textContent = `${resultados().length} resultados`; },
  ordenar: () => hojaGenerica('Ordenar por', '', `<div class="form-hoja">${ORDENES.map(([id, t]) => `<button class="pago ${S.orden === id ? 'on' : ''}" data-a="orden" data-v="${id}"><div><b>${t}</b></div><span class="radio"></span></button>`).join('')}</div>`),
  orden: (b) => { S.orden = b.dataset.v; cerrarHoja(); render(null, { mantenerScroll: true }); },
  'cerrar-mini': () => { const c = $('#mapa-card'); c.classList.remove('on'); clearInterval(abrirMiniatura.t); setTimeout(() => (c.hidden = true), 250); $$('.pin').forEach((p) => p.classList.remove('on')); },
  'noti-ir': (b) => { if (b.dataset.v === 'muro') { S.tabFicha = 'muro'; ir('negocio'); } },
  'ver-pasada': (b) => {
    const c = S.pasadas[+b.dataset.i], s = serv(c.servicio), p = pro(c.pro);
    hojaGenerica(s.nombre, `${NEGOCIOS[0].nombre} · ${mayus(fCorta(c.fecha))}`, `<div class="form-hoja">${htmlResumen(s, p, c.fecha, c.hora)}
      <button class="btn btn--primary btn--block" data-a="repetir" data-s="${c.servicio}" data-p="${c.pro}">${ic('repetir', 'ic-s')}Reservar lo mismo</button>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Gracias. Tu reseña pasará el filtro de la IA antes de publicarse">${ic('estrella', 'ic-s')}Valorar la visita</button></div>`);
  },
  switch: (b) => { const k = b.dataset.k; S.ajustes[k] = !S.ajustes[k]; b.setAttribute('aria-checked', S.ajustes[k]); if (k === 'faceid' && S.ajustes[k]) faceId('Face ID activado'); },
  'perfil-sobre': hojaSobreMi,
  'sm-pelo': (b) => { S.sobreMi.pelo = b.dataset.v; $$('[data-a="sm-pelo"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'sm-piel': (b) => { const l = S.sobreMi.piel, v = b.dataset.v; S.sobreMi.piel = l.includes(v) ? l.filter((x) => x !== v) : [...l, v]; b.setAttribute('aria-pressed', S.sobreMi.piel.includes(v)); },
  'sm-guardar': () => { S.sobreMi.nota = $('#sm-nota').value.trim(); cerrarHoja(); render(null, { mantenerScroll: true }); toast('Guardado. Tus profesionales lo verán en tu ficha.'); },
  'perfil-datos': () => hojaGenerica('Datos de la cuenta', '', `<div class="form-hoja">
    ${[['Nombre', YO.nombre], ['Teléfono', YO.tel], ['Email', YO.email], ['Dirección', YO.direccion]].map(([l, v]) => `<div class="campo"><label>${l}</label><input type="text" value="${esc(v)}"></div>`).join('')}
    <div class="campo"><label>Cuentas conectadas</label><div class="chips"><span class="chip">Apple ✓</span><span class="chip">Google</span><span class="chip">Instagram</span></div></div>
    <button class="btn btn--primary btn--block" data-a="guardar-hoja">Guardar</button></div>`),
  'perfil-pagos': () => hojaGenerica('Pagos', 'Tus datos de pago los guarda la pasarela, nunca la app', `<div class="form-hoja">
    <div class="pago on"><div><b>Visa •••• 4242</b><small>Predeterminada · caduca 08/29</small></div><span class="radio"></span></div>
    <div class="pago"><div><b>Apple Pay</b><small>Conectado</small></div><span class="radio"></span></div>
    <div class="pago"><div><b>Bizum</b><small>${YO.tel}</small></div><span class="radio"></span></div>
    <button class="btn btn--ghost btn--block" data-a="toast" data-t="Se abriría el formulario seguro de la pasarela de pago">${ic('mas', 'ic-s')}Añadir tarjeta</button></div>`),
  'perfil-recordatorios': () => hojaGenerica('Recordatorios', 'Para que no se te pase ninguna cita', `<div class="form-hoja">${sw('wa', 'Por WhatsApp', 'Te escribimos el día antes')}${sw('sms', 'Por SMS')}${sw('push', 'Notificación en el móvil')}
    ${segmento([['24', '24 h antes'], ['2', '2 h antes'], ['ambos', 'Los dos']], S.ajustes.recAntes, 'rec-antes')}</div>`),
  'rec-antes': (b) => { S.ajustes.recAntes = b.dataset.v; moverSegmento(b); },
  'perfil-notis': () => hojaGenerica('Notificaciones', '', `<div class="form-hoja">${sw('notiAvisos', 'Avisos de mis negocios', 'Vacaciones, cierres, cambios de horario')}${sw('notiOfertas', 'Ofertas')}${sw('notiReseñas', 'Recordarme valorar')}</div>`),
  'perfil-resenas': () => hojaGenerica('Mis reseñas', '', `<div class="pad">${[['Sublime Barber Studio', 5, 'Corte perfecto, como siempre. Javi es un crack.', 28], ['Sublime Barber Studio', 5, 'Adri me dejó el degradado increíble.', 63]].map(([n, e, t, d]) => `<article class="resena"><div class="resena__cab"><span class="resena__ini">${n.charAt(0)}</span><div><b>${n}</b><small>${fCorta(addD(HOY, -d))}</small></div>${estrellas(e)}</div><p>${t}</p></article>`).join('')}</div>`),
  'perfil-privacidad': () => hojaGenerica('Privacidad y seguridad', '', `<div class="form-hoja">${sw('faceid', 'Entrar con Face ID', 'Al abrir la app')}${sw('perfilPublico', 'Perfil visible en el Feed', 'Tus vídeos y tu nombre de usuario')}
    <button class="btn btn--ghost btn--block" data-a="toast" data-t="Te enviaremos un archivo con todos tus datos">Descargar mis datos</button>
    <button class="btn btn--ghost btn--block" data-a="toast" data-t="En la app real se pediría confirmación">Eliminar mi cuenta</button></div>`),
  'perfil-app': () => hojaGenerica('Ajustes de la app', '', `<div class="form-hoja"><div class="campo"><label>Apariencia</label>${segTema()}</div><div class="ajuste"><span><b>Idioma</b><small>Español</small></span>${ic('idioma')}</div></div>`),
  'perfil-soporte': () => { cerrarHoja(); abrirIA({ pregunta: '' }); },
  'guardar-hoja': () => { cerrarHoja(); toast('Guardado'); },
});

/* Face ID simulado al abrir la app */
function faceId(msg = '') {
  const el = $('#faceid');
  el.innerHTML = `<div class="faceid__caja"><span class="faceid__ic">${ic('cara')}</span><small>Face ID</small></div>`;
  el.hidden = false;
  el.classList.remove('ok');
  setTimeout(() => el.classList.add('ok'), 650);
  setTimeout(() => { el.hidden = true; if (msg) toast(msg); }, 1150);
}

/* =====================================================================
   Primera vez: preguntas con IA para recomendarte tu sitio ideal
   ===================================================================== */
const PREGUNTAS = [
  { id: 'busca', t: '¿Qué sueles reservar?', sub: 'Elige todo lo que quieras', multi: true, ops: [['barberia', 'Barbería'], ['peluqueria', 'Peluquería'], ['estetica', 'Uñas y estética'], ['masaje', 'Masajes y spa'], ['salud', 'Fisio y salud'], ['tatuajes', 'Tatuajes y piercing']] },
  { id: 'prioridad', t: '¿Qué es lo que más valoras?', ops: [['rapido', 'Que no haya esperas'], ['atencion', 'Que me dediquen tiempo'], ['precio', 'Un buen precio'], ['valorado', 'Lo mejor valorado']] },
  { id: 'cerca', t: '¿Hasta dónde te mueves?', ops: [['cerca', 'Lo más cerca posible'], ['2km', 'Hasta 2 km'], ['igual', 'Me da igual si es el mejor']] },
];
const BUSCA_CAT = { barberia: ['barberia'], peluqueria: ['peluqueria'], estetica: ['unas', 'facial'], masaje: ['salud', 'spa'], salud: ['salud'], tatuajes: ['tatuajes'] };
const COMENTA = { rapido: 'Anotado: priorizo sitios con huecos rápidos.', atencion: 'Perfecto: busco sitios que te dediquen tiempo.', precio: 'Entendido: miraré la relación calidad-precio.', valorado: 'Genial: te enseño los que mejor puntúa la gente.' };
function afinidad(n) {
  const p = S.prefs;
  let s = 60;
  const r = [];
  if (!p) return { p: Math.round(70 + (n.nota - 4.5) * 40 - distancia(n) * 4), razones: [] };
  if (p.busca?.length) { const cats = p.busca.flatMap((b) => BUSCA_CAT[b] || []); if (cats.includes(n.cat) || (p.busca.includes('masaje') && n.tags.includes('masaje'))) s += 15; else s -= 30; }
  if (p.prioridad === 'rapido') { if (n.espera === 'rapida') { s += 14; r.push('Sin esperas'); } else if (n.espera === 'tranquila') s -= 6; }
  if (p.prioridad === 'atencion' && n.atencion >= 3) { s += 14; r.push('Te dedican tiempo'); }
  if (p.prioridad === 'precio') { if (n.precioMedio <= 15) { s += 14; r.push('Buen precio'); } else if (n.precioMedio > 30) s -= 10; }
  if (p.prioridad === 'valorado') { s += (n.nota - 4.7) * 60; if (n.nota >= 4.9) r.push(`${nota(n)} ★ en reseñas`); }
  const d = distancia(n);
  if (p.cerca === 'cerca') { s -= d * 12; if (d < 0.8) r.push('Muy cerca de ti'); }
  else if (p.cerca === '2km') s -= d > 2 ? 25 : d * 3;
  else s += (n.nota - 4.5) * 20;
  s += (n.nota - 4.5) * 15;
  if (!r.length) r.push(`${nota(n)} ★ en reseñas`);
  return { p: Math.max(30, Math.min(98, Math.round(s))), razones: r };
}
function resumenPrefs() {
  const p = S.prefs, t = (id, v) => PREGUNTAS.find((q) => q.id === id).ops.find(([k]) => k === v)?.[1];
  return [t('prioridad', p.prioridad), t('cerca', p.cerca)].filter(Boolean).join(' · ');
}
function ofrecerCuestionario() {
  if (S.prefs) return;
  setTimeout(() => { if (S.vista === 'inicio' && !S.prefs) abrirCuestionario(); }, 1500);
}
function abrirCuestionario() {
  S.q = 0;
  S.borrador = { ...(S.prefs || {}) };
  hojaGenerica('Tu sitio ideal', '3 preguntas rápidas y te recomendamos sitios', '<div id="cuest"></div>');
  pintarCuestionario();
}
function pintarCuestionario(dir = 'adelante') {
  const el = $('#cuest');
  if (!el) return;
  if (S.q >= PREGUNTAS.length) {
    S.prefs = { ...S.borrador };
    const top = NEGOCIOS.map((n) => ({ n, a: afinidad(n) })).sort((x, y) => y.a.p - x.a.p).slice(0, 3);
    el.innerHTML = `<div class="form-hoja"><div class="moderacion"><span class="preg__ic">${ic('diana')}</span><h3>Buscando tu sitio ideal…</h3><ul class="chks"><li><span class="chk"></span>Comparando ${NEGOCIOS.length} negocios cerca</li><li><span class="chk"></span>Leyendo sus reseñas</li><li><span class="chk"></span>Cruzándolo con tus gustos</li></ul></div>
      <div id="cuest-fin" hidden>${top.map(({ n, a }, i) => `<button class="match" data-a="${n.real ? 'cuest-ver' : 'negocio-ej'}" data-n="${esc(n.nombre)}"><span class="match__img">${arteNegocio(n)}</span><span class="match__txt"><b>${n.nombre}</b>${i === 0 ? '<span class="match__top">Tu mejor opción</span>' : ''}<small>${n.tipo} · ${fDist(n)}</small><span class="match__razones">${a.razones.slice(0, 2).map((x) => `<span class="pill">${x}</span>`).join('')}</span></span><span class="match__p">${a.p}<small>%</small></span></button>`).join('')}
      <button class="btn btn--primary btn--block" data-a="cuest-fin">Ver mis recomendaciones</button></div></div>`;
    const lis = $$('.chks li', el);
    lis.forEach((li, i) => setTimeout(() => { li.classList.add('ok'); $('.chk', li).innerHTML = ic('check', 'ic-s'); }, 350 + i * 420));
    setTimeout(() => { const f = $('#cuest-fin'); if (f) { f.hidden = false; f.classList.add('panel-anim'); } }, 350 + lis.length * 420);
    return;
  }
  const q = PREGUNTAS[S.q];
  const v = S.borrador[q.id];
  const sel = (k) => (q.multi ? (v || []).includes(k) : v === k);
  el.innerHTML = `<div class="form-hoja paso" data-dir="${dir}">
    <div class="progreso" style="grid-template-columns:repeat(${PREGUNTAS.length},1fr);margin:0">${PREGUNTAS.map((_, i) => `<i class="${i <= S.q ? 'on' : ''}"></i>`).join('')}</div>
    <div class="preg__ia"><span class="preg__ic">${ic('diana')}</span><div>${S.comentario && S.q ? `<small>${esc(S.comentario)}</small>` : ''}<h2>${q.t}</h2>${q.sub ? `<p class="muted small">${q.sub}</p>` : ''}</div></div>
    <div class="preg__ops">${q.ops.map(([k, t], i) => `<button class="preg__op ${sel(k) ? 'on' : ''}" data-a="preg-op" data-v="${k}" style="animation-delay:${i * 35}ms"><span>${t}</span><span class="radio"></span></button>`).join('')}</div>
    <div class="cuest-pie">${S.q ? '<button class="btn btn--ghost" data-a="preg-atras">Atrás</button>' : '<button class="btn btn--ghost" data-a="cerrar-hoja">Ahora no</button>'}${q.multi ? `<button class="btn btn--primary" data-a="preg-sig" ${(v || []).length ? '' : 'disabled'}>Siguiente</button>` : ''}</div>
  </div>`;
}
Object.assign(A, {
  'preg-op': (b) => {
    const q = PREGUNTAS[S.q], k = b.dataset.v;
    if (q.multi) {
      const l = S.borrador[q.id] || [];
      S.borrador[q.id] = l.includes(k) ? l.filter((x) => x !== k) : [...l, k];
      b.classList.toggle('on');
      $('[data-a="preg-sig"]').disabled = !S.borrador[q.id].length;
      return;
    }
    S.borrador[q.id] = k;
    $$('.preg__op').forEach((x) => x.classList.toggle('on', x === b));
    S.comentario = COMENTA[k] || 'Anotado.';
    setTimeout(() => { S.q++; pintarCuestionario(); }, 240);
  },
  'preg-sig': () => { S.comentario = 'Anotado.'; S.q++; pintarCuestionario(); },
  'preg-atras': () => { if (S.q > 0) { S.q--; pintarCuestionario('atras'); } },
  'cuest-fin': () => { cerrarHoja(); if (S.vista === 'inicio') render(null, { mantenerScroll: true }); toast('Listo: tus recomendaciones ya están personalizadas'); },
  'cuest-ver': () => { cerrarHoja(); S.tabFicha = 'servicios'; ir('negocio'); },
  'rehacer-prefs': () => abrirCuestionario(),
  'guardar-reel': (b) => {
    S.guardados = S.guardados || [];
    const id = b.dataset.id, on = !S.guardados.includes(id);
    S.guardados = on ? [...S.guardados, id] : S.guardados.filter((x) => x !== id);
    b.setAttribute('aria-pressed', on);
    $('span', b).textContent = on ? 'Guardado' : 'Guardar';
    if (on && !reducido) b.firstElementChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    toast(on ? 'Guardado en tus inspiraciones' : 'Quitado de guardados');
  },
});
