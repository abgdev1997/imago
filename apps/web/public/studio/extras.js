'use strict';
/* Funciones extra (10/10/2026):
   1 «Vuelve a tu corte» · 2 Ofertas en huecos flojos · 3 Recepcionista IA · 4 Bonos y suscripciones · 5 Tarjetas regalo
   6 Propinas y cobro con el móvil · 7 Ficha técnica, antes/después y consentimientos · 8 Reservar desde Google e Instagram
   9 Idiomas · 10 Chat cliente–negocio. Todo simulado en el prototipo. */

Object.assign(ICON, {
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  firma: '<path d="M3 18c3-1 4-6 6-6s1 5 3 5 3-4 5-4 2 2 4 2"/><path d="M3 21h18"/>',
  tap: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 18.5h4"/><path d="M20.5 8a6 6 0 010 6M22.5 6a9 9 0 010 10" opacity=".6"/>',
  google: '<path d="M20.5 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h4.8a4.1 4.1 0 01-1.8 2.7v2.2h2.9c1.7-1.6 2.6-3.9 2.6-6.5z"/><path d="M12 21c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3.9v2.3A9 9 0 0012 21z"/><path d="M6.9 13.7a5.4 5.4 0 010-3.4V8H3.9a9 9 0 000 8z"/><path d="M12 6.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 003.9 8l3 2.3C7.6 8.1 9.6 6.6 12 6.6z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
});

Object.assign(S, {
  flash: null,
  bonos: [
    { id: 'club', nombre: 'Club Sublime', tipo: 'suscripcion', precio: 25, incluye: '2 cortes al mes', servicios: ['corte', 'degradado', 'combo'], usos: 2, socios: 23 },
    { id: 'b5', nombre: 'Bono 5 cortes', tipo: 'bono', precio: 60, incluye: '5 cortes de pelo (ahorras 10 €)', servicios: ['corte', 'degradado'], usos: 5, vendidos: 14 },
    { id: 'barba4', nombre: 'Bono barba x4', tipo: 'bono', precio: 28, incluye: '4 diseños de barba (ahorras 4 €)', servicios: ['barba'], usos: 4, vendidos: 9 },
  ],
  misBonos: [],
  regalos: [{ codigo: 'SUB-7Q2K', importe: 30, de: 'Pablo', para: YO.nombre, mensaje: '¡Feliz cumple, crack!', recibido: true, canjeado: false }],
  canales: { google: false, instagram: false },
  idioma: 'es',
  chats: {
    sublime: [
      { de: 'negocio', quien: 'Javi', t: '¡Hola Marcos! Gracias por venir el otro día 🙌', cuando: 'hace 4 semanas' },
      { de: 'yo', t: '¡A vosotros! Quedó genial', cuando: 'hace 4 semanas' },
    ],
  },
  noLeidosCli: 1,
  fichas: {},
});
Object.assign(S.ajustes, { bizVuelve: true, bizVuelveCada: 'ia', bizFlash: true, bizFlashUmbral: '50', bizFlashPct: '15', bizRecWA: true, bizRecIG: true, bizRecVoz: false, propinas: true, tap: true });

/* Ayudas */
const conMarco = (html, ancla, extra, despues = false) => (html.includes(ancla) ? html.replace(ancla, despues ? ancla + extra : extra + ancla) : html);
const envolver = (obj, clave, fn) => { const orig = obj[clave]; obj[clave] = function (...a) { return fn.call(this, orig.bind(this), ...a); }; };
function diaFlojo() {
  for (let i = 1; i < 8; i++) {
    const d = addD(HOY, i);
    const o = ocupacion(d, EQUIPO);
    if (o && o.total && o.pct <= +S.ajustes.bizFlashUmbral) return { d, o };
  }
  return null;
}
const enFlash = (fecha, hora) => S.flash && S.flash.fecha === fecha && (S.flash.franja === 'todo' || (S.flash.franja === 'manana' ? minH(hora) < 15 * 60 : minH(hora) >= 15 * 60));

/* =====================================================================
   1 · «Vuelve a tu corte» (cliente + negocio)
   ===================================================================== */
function sugerenciaVuelta() {
  const u = S.pasadas[0];
  if (!u) return null;
  const dias = Math.round((HOY - u.fecha) / 864e5);
  if (dias < 21) return null;
  const ph = proximoHueco(u.pro);
  return ph ? { ...u, dias, ph } : null;
}
envolver(VISTAS.inicio, 'html', function (orig) {
  const [a, b] = orig();
  let h = a;
  const v = sugerenciaVuelta();
  if (v && !S.citas.some((c) => !c.cancelada)) {
    const s = serv(v.servicio), p = pro(v.pro);
    h = conMarco(h, '<div class="seccion-t pad"><h2>Tus favoritos</h2>', `<div class="vuelve"><img src="${p.img}" alt=""><div><small>${orbe('orbe--sm')} Ya te toca</small><b>Hace ${Math.round(v.dias / 7)} semanas de tu ${s.nombre.toLowerCase()} con ${p.nombre}</b><span>${p.nombre} tiene hueco ${fRel(v.ph.fecha).toLowerCase()} a las ${v.ph.hora}</span></div>
      <button class="btn btn--sm btn--primary" data-a="rebook" data-s="${v.servicio}" data-p="${v.pro}" data-f="${kF(v.ph.fecha)}" data-h="${v.ph.hora}">Reservar</button></div>`);
  }
  if (S.flash) {
    const d = deK(S.flash.fecha);
    h = h.replace(/(<h2>Ofertas especiales<\/h2><\/div>\s*<div class="fila-scroll">)/, `$1<button class="oferta oferta--flash" data-a="flash-reservar"><span class="pill pill--glass">Solo ${fRel(d).toLowerCase()}</span><b>−${S.flash.pct} % en Sublime</b><small>${S.flash.franja === 'manana' ? 'Por la mañana' : S.flash.franja === 'tarde' ? 'Por la tarde' : 'Todo el día'} · ${mayus(fCorta(d))}</small></button>`);
  }
  return [h, b];
});
{
  const orig = notisCliente;
  notisCliente = () => {
    const l = orig();
    const v = sugerenciaVuelta();
    if (v) l.splice(S.notiCli.length, 0, { ic: 'repetir', t: `Hace ${Math.round(v.dias / 7)} semanas de tu corte con <b>${pro(v.pro).nombre}</b>. Tiene hueco ${fRel(v.ph.fecha).toLowerCase()} a las ${v.ph.hora}.`, cuando: 'hoy', ir: 'rebook' });
    return l;
  };
}

/* =====================================================================
   2 · Ofertas para los huecos flojos (desde el calendario)
   ===================================================================== */
envolver(VISTAS.agenda, 'html', function (orig) {
  const [a] = orig();
  if (!S.ajustes.bizFlash || S.flash) return [a];
  const f = diaFlojo();
  if (!f) return [a];
  return [a.replace(/(<div class="chips cal-pros">[\s\S]*?<\/div>)/, `$1<button class="ia-aviso" data-a="flash-abrir" data-f="${kF(f.d)}">${orbe('orbe--sm')}<span><b>${mayus(fRel(f.d).toLowerCase() === 'mañana' ? 'Mañana' : fLarga(f.d))} va al ${f.o.pct} %</b><small>La IA propone una oferta del −${S.ajustes.bizFlashPct} % para llenar los huecos</small></span>${ic('sig', 'ic-s')}</button>`)];
});
function abrirFlash(fecha) {
  const d = deK(fecha);
  S.borradorFlash = { fecha, pct: S.ajustes.bizFlashPct, franja: 'todo' };
  const libresN = EQUIPO.reduce((a, p) => a + libres(p.id, d).length, 0);
  hojaGenerica('Oferta para huecos libres', `${mayus(fLarga(d))} · ${libresN} huecos libres`, `<div class="form-hoja">
    <div class="campo"><label>Descuento</label>${segmento([['10', '−10 %'], ['15', '−15 %'], ['20', '−20 %'], ['25', '−25 %']], S.ajustes.bizFlashPct, 'flash-pct')}</div>
    <div class="campo"><label>¿Qué horas?</label>${segmento([['todo', 'Todo el día'], ['manana', 'Mañana'], ['tarde', 'Tarde']], 'todo', 'flash-franja')}</div>
    <div class="campo"><label>¿A quién se lo mandamos?</label><div class="chips"><span class="chip" aria-pressed="true">Lista de espera</span><span class="chip" aria-pressed="true">Clientes que suelen venir</span><span class="chip" aria-pressed="true">Gente cerca en IMAGO</span></div></div>
    <p class="nota-com">${orbe('orbe--sm')} Saldrá en «Ofertas especiales» de IMAGO y los huecos se marcarán con el descuento al reservar.</p>
    <button class="btn btn--primary btn--block" data-a="flash-lanzar">Lanzar oferta</button></div>`);
}

/* =====================================================================
   3 · Recepcionista IA (WhatsApp, Instagram y llamadas)
   ===================================================================== */
VISTAS.recepcionista = { padre: 'ajustes', html() {
  const t = (k, l, d) => `<div class="ajuste"><span><b>${l}</b><small>${d}</small></span><button class="switch" role="switch" aria-checked="${!!S.ajustes[k]}" data-a="switch" data-k="${k}" aria-label="${l}"></button></div>`;
  return sub('Recepcionista IA', `<div class="pad form-hoja" style="padding-top:0">
    ${t('bizRecWA', 'WhatsApp', 'Contesta y reserva en tu número del negocio')}${t('bizRecIG', 'Instagram', 'Responde los mensajes directos')}${t('bizRecVoz', 'Llamadas (beta)', 'Coge el teléfono cuando estás cortando')}
    <div class="campo"><label>Qué puede hacer</label><div class="chips">${['Reservar', 'Cambiar citas', 'Cancelar', 'Precios', 'Horarios', 'Cómo llegar', 'Lista de espera'].map((x) => `<span class="chip" aria-pressed="true">${x}</span>`).join('')}</div></div>
    <div class="campo"><label>Así habla con tus clientes</label><div class="wa" id="wa-demo"></div></div>
    <button class="btn btn--ghost btn--block" data-a="recep-demo">${ic('play', 'ic-s')}Ver otra conversación</button>
    <div class="kpis" style="padding:0"><div class="kpi"><small>Conversaciones esta semana</small><b>27</b></div><div class="kpi"><small>Citas reservadas por la IA</small><b>19</b></div></div>
    <p class="faint small">Datos de ejemplo. Si la IA no sabe algo, te pasa la conversación.</p></div>`, 'Contesta por ti a cualquier hora, con tus servicios, precios y huecos reales.');
}, montar() { demoRecepcion(); } };
function demoRecepcion() {
  const el = $('#wa-demo');
  if (!el) return;
  const h = buscarHuecos({ dias: [addD(HOY, (5 - HOY.getDay() + 7) % 7 || 7)], franja: 'tarde', pro: null, servicio: null, desde: null }, 2);
  const op = h.map((x) => `${x.hora} con ${pro(x.pro).nombre}`).join(' o ');
  const guion = [
    ['cli', '¿Tenéis hueco el viernes por la tarde para corte y barba?'],
    ['ia', h.length ? `¡Hola! 👋 Sí, el ${fLarga(h[0].fecha)} tengo ${op}. Corte + barba son 18 € y 45 min. ¿Cuál te viene mejor?` : 'Ese día está completo. ¿Te apunto a la lista de espera?'],
    ['cli', h[1] ? h[1].hora : 'Vale'],
    ['ia', `Hecho ✅ Te he reservado ${h[1] ? `a las ${h[1].hora} con ${pro(h[1].pro).nombre}` : 'en la lista de espera'}. Te recordaré la cita el día antes. ¡Hasta el viernes!`],
  ];
  el.innerHTML = '';
  guion.forEach(([q, t], i) => setTimeout(() => { if (!el.isConnected) return; el.insertAdjacentHTML('beforeend', `<div class="wa__burbuja ${q === 'cli' ? 'wa__burbuja--cli' : ''}">${q === 'ia' ? '<b class="wa__ia">IA · Sublime</b>' : ''}${t}<small>${q === 'ia' ? '✓✓' : ''}</small></div>`); }, 300 + i * 900));
}

/* =====================================================================
   4 · Bonos y suscripciones  ·  5 · Tarjetas regalo
   ===================================================================== */
VISTAS.bonos = { padre: 'ajustes', html() {
  const mrr = S.bonos.filter((b) => b.tipo === 'suscripcion').reduce((a, b) => a + b.precio * b.socios, 0);
  return sub('Bonos y suscripciones', `<div class="kpis"><div class="kpi"><small>Ingresos fijos al mes</small><b>${eur(mrr)}</b></div><div class="kpi"><small>Bonos vendidos</small><b>${S.bonos.reduce((a, b) => a + (b.vendidos || 0), 0)}</b></div></div>
    <div class="pad">${S.bonos.map((b) => `<div class="bono"><span class="bono__tipo">${b.tipo === 'suscripcion' ? 'Suscripción' : 'Bono'}</span><b>${b.nombre}</b><small>${b.incluye}</small><span class="bono__pie"><b>${eur(b.precio)}${b.tipo === 'suscripcion' ? '/mes' : ''}</b><small>${b.tipo === 'suscripcion' ? `${b.socios} socios` : `${b.vendidos} vendidos`}</small></span></div>`).join('')}
    <button class="btn btn--primary btn--block" style="margin-top:6px" data-a="bono-nuevo">${ic('mas', 'ic-s')}Crear bono o suscripción</button></div>`, 'Ingresos fijos cada mes y clientes que vuelven. Se compran desde vuestra ficha en IMAGO.');
} };
VISTAS.regalos = { padre: 'ajustes', html() {
  return sub('Tarjetas regalo', `<div class="kpis"><div class="kpi"><small>Vendidas este mes</small><b>12</b></div><div class="kpi"><small>Pendiente de canjear</small><b>${eur(340)}</b></div></div>
    <div class="pad form-hoja" style="padding-top:12px"><div class="campo"><label>Canjear una tarjeta</label><div class="fila-input"><input type="text" id="canje" placeholder="Código, ej.: SUB-7Q2K" autocomplete="off"><button class="btn btn--sm btn--primary" data-a="regalo-canjear">Canjear</button></div></div>
    <p class="franja">Últimas vendidas</p>
    ${[['Lucía M.', 'para Álvaro', 30], ['Pablo R.', 'para Marcos S.', 30], ['Carmen D.', 'Corte + barba', 18]].map(([q, p, e]) => `<div class="factura"><span><b>${q}</b><small>${p}</small></span><b>${eur(e)}</b></div>`).join('')}
    <p class="faint small">Las venden en Navidad, Día del Padre y cumpleaños. Se compran en vuestra ficha y se envían por WhatsApp.</p></div>`);
} };
function abrirBonosCliente() {
  hojaGenerica('Bonos y Club Sublime', 'Ahorra y no te preocupes de pagar cada vez', `<div class="form-hoja">${S.bonos.map((b) => {
    const mio = S.misBonos.find((m) => m.id === b.id);
    return `<div class="bono"><span class="bono__tipo">${b.tipo === 'suscripcion' ? 'Suscripción mensual' : 'Bono'}</span><b>${b.nombre}</b><small>${b.incluye}</small><span class="bono__pie"><b>${eur(b.precio)}${b.tipo === 'suscripcion' ? '/mes' : ''}</b>${mio ? `<span class="pill">Tuyo · quedan ${mio.quedan}</span>` : `<button class="btn btn--sm btn--primary" data-a="bono-comprar" data-id="${b.id}">${b.tipo === 'suscripcion' ? 'Unirme' : 'Comprar'}</button>`}</span></div>`;
  }).join('')}<p class="faint small">Pago simulado. En la app real se cobra con la pasarela y la suscripción se renueva sola.</p></div>`);
}
function abrirRegalo() {
  S.regaloB = { importe: 30, diseno: 'neon' };
  hojaGenerica('Regalar Sublime', 'Una tarjeta regalo que llega por WhatsApp', `<div class="form-hoja">
    <div class="tarjeta-regalo tr--neon" id="tr-prev"><span class="marca">${LOGO}</span><b id="tr-imp">30 €</b><small>Sublime Barber Studio</small><em id="tr-para">Para: —</em></div>
    <div class="campo"><label>Importe</label>${segmento([['20', '20 €'], ['30', '30 €'], ['50', '50 €'], ['18', 'Corte + barba']], '30', 'regalo-imp')}</div>
    <div class="campo"><label>Diseño</label>${segmento([['neon', 'Neón'], ['clasica', 'Clásica'], ['minimal', 'Minimal']], 'neon', 'regalo-dis')}</div>
    <div class="campo"><label>¿Para quién?</label><input type="text" id="tr-nombre" placeholder="Nombre" autocomplete="off"></div>
    <div class="campo"><label>Mensaje</label><input type="text" id="tr-msg" placeholder="¡Feliz cumpleaños!" autocomplete="off"></div>
    <button class="btn btn--primary btn--block" data-a="regalo-enviar">${ic('regalo', 'ic-s')}Pagar y enviar por WhatsApp</button></div>`);
  $('#tr-nombre').addEventListener('input', (e) => ($('#tr-para').textContent = `Para: ${e.target.value || '—'}`));
}

/* =====================================================================
   Ficha del negocio: Mensaje · Regalar · Bonos  (cliente)
   ===================================================================== */
envolver(VISTAS.negocio, 'html', function (orig) {
  const [a, b] = orig();
  return [conMarco(a, '<div class="tabs"><div class="tabs__lista"', `<div class="acciones-ficha pad">
    <button data-a="chat-abrir">${ic('chat')}<span>Mensaje</span></button>
    <button data-a="regalo-abrir">${ic('regalo')}<span>Regalar</span></button>
    <button data-a="bonos-cliente">${ic('recibo')}<span>Bonos y Club</span></button>
  </div>`), b];
});

/* Reserva: bono, oferta en huecos, consentimiento firmado */
const necesitaFirma = (sId) => ['color', 'mechas'].includes(sId);
{
  const origHoras = htmlHoras;
  htmlHoras = () => {
    const R = S.reserva;
    let h = origHoras();
    if (R.fecha && S.flash && S.flash.fecha === R.fecha) h = h.replace(/<button class="hora([^"]*)" data-a="hora" data-h="(\d\d:\d\d)"([^>]*)>(\d\d:\d\d)<\/button>/g, (m, cls, hora, resto, txt) => (enFlash(R.fecha, hora) ? `<button class="hora hora--flash${cls}" data-a="hora" data-h="${hora}"${resto}>${txt}<i>−${S.flash.pct}%</i></button>` : m));
    return h;
  };
  const origPaso = htmlPaso;
  htmlPaso = (dir) => {
    let h = origPaso(dir);
    const R = S.reserva;
    if (R.paso !== 3) return h;
    const s = serv(R.servicio);
    const bono = S.misBonos.find((m) => m.quedan > 0 && S.bonos.find((b) => b.id === m.id).servicios.includes(R.servicio));
    if (bono) h = conMarco(h, '<div class="pagos">', `<button class="pago ${R.pago === 'bono' ? 'on' : ''}" data-a="pago" data-m="bono"><div><b>Usar mi ${S.bonos.find((b) => b.id === bono.id).nombre}</b><small>Te quedan ${bono.quedan} · no pagas nada</small></div><span class="radio"></span></button>`, true);
    if (R.fecha && R.hora && enFlash(R.fecha, R.hora)) h = conMarco(h, '<div class="pagos">', `<p class="flash-nota">${ic('regalo', 'ic-s')} Oferta del −${S.flash.pct} %: pagas <b>${eur(Math.round(s.precio * (100 - S.flash.pct)) / 100)}</b> en vez de ${eur(s.precio)}</p>`);
    if (necesitaFirma(R.servicio)) h = conMarco(h, '<p class="politica">', `<div class="seccion-t" style="margin-top:24px"><h2>Consentimiento</h2></div>
      <p class="muted small" style="line-height:1.5">Para el color te pedimos confirmar que no tienes alergias conocidas a tintes y aceptar la prueba de sensibilidad.</p>
      <div class="firma"><canvas id="firma"></canvas><span class="firma__ph">${ic('firma')} Firma aquí con el dedo</span><button class="link" data-a="firma-borrar">Borrar</button></div>`);
    return h;
  };
  const origMontar = montarPaso;
  montarPaso = () => { origMontar(); const c = $('#firma'); if (c) padFirma(c); };
}
function padFirma(c) {
  const ctx = c.getContext('2d');
  const dpr = devicePixelRatio || 1;
  c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
  ctx.scale(dpr, dpr); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--fg') || '#fff';
  let dibujando = false;
  const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  c.addEventListener('pointerdown', (e) => { dibujando = true; c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); c.parentElement.classList.add('firmada'); S.reserva.firmado = true; });
  c.addEventListener('pointermove', (e) => { if (!dibujando) return; ctx.lineTo(...pos(e)); ctx.stroke(); });
  c.addEventListener('pointerup', () => (dibujando = false));
}

/* =====================================================================
   6 · Propinas y cobro con el móvil (Caja)
   ===================================================================== */
function abrirCobro() {
  const L = lineasTicket();
  if (!L.length) return;
  const total = L.reduce((a, l) => a + l.total, 0);
  S.cobro = { total, propina: 0, metodo: S.ticket.metodo };
  const p = pro(S.ticket.pro);
  hojaGenerica(`Cobrar ${eur(total)}`, `Atiende ${p.nombre}`, `<div class="form-hoja" id="cobro">
    <div class="campo"><label>¿Propina para ${p.nombre}? <span class="faint">(se la enseñas al cliente)</span></label>${segmento([['0', 'Sin propina'], ['1', '1 €'], ['2', '2 €'], ['10p', '10 %']], '0', 'propina')}</div>
    <div class="campo"><label>Forma de pago</label><div class="metodos-cobro">
      ${[['tap', 'tap', 'Con el móvil'], ['tarjeta', 'tarjeta', 'Datáfono'], ['efectivo', 'euro', 'Efectivo'], ['bizum', 'telefono', 'Bizum'], ['regalo', 'regalo', 'Tarjeta regalo']].map(([id, icono, t]) => `<button class="${S.cobro.metodo === id ? 'on' : ''}" data-a="cobro-metodo" data-v="${id}">${ic(icono)}<span>${t}</span></button>`).join('')}
    </div></div>
    <button class="btn btn--primary btn--block" data-a="cobro-ok" id="cobro-btn">Cobrar ${eur(total)}</button></div>`);
}
const totalCobro = () => S.cobro.total + S.cobro.propina;
function cerrarCobro() {
  const C = S.cobro, T = S.ticket;
  T.metodo = C.metodo === 'tap' ? 'tarjeta' : C.metodo === 'regalo' ? 'tarjeta' : C.metodo;
  const tk = 'caja' + Date.now();
  if (C.propina) S.ventas.push({ t: Date.now(), pro: T.pro, tipo: 't', id: 'propina', precio: C.propina, metodo: T.metodo, com: C.propina, tk });
  cerrarHoja();
  cobrarTicket();
  if (C.propina) toast(`Cobrado ${eur(totalCobro())} (${eur(C.propina)} de propina para ${pro(T.pro).nombre})`);
}

/* =====================================================================
   7 · Ficha técnica, antes/después y consentimientos (negocio)
   ===================================================================== */
function fichaTecnica(c) {
  if (S.fichas[c.id]) return S.fichas[c.id];
  const r = rng(hash('ficha' + c.id));
  const notas = c.first ? [] : [
    { fecha: addD(HOY, -Math.floor(20 + r() * 30)), pro: c.proFav, texto: ['Máquina 0,5 en laterales, tijera arriba 4 cm. Le gusta con textura.', 'Degradado bajo con navaja. Barba perfilada al 3.', 'Corte clásico con raya al lado. Pide poco volumen arriba.'][Math.floor(r() * 3)], antes: IMG + 'obras/claroscuro.webp', despues: IMG + 'obras/' + ['espiral', 'oleo', 'horizonte'][Math.floor(r() * 3)] + '.webp' },
  ];
  S.fichas[c.id] = { notas, consent: [{ t: 'Protección de datos (RGPD)', ok: true, fecha: c.desde }, { t: 'Color y tintes (alergias)', ok: !c.first && r() < 0.5, fecha: c.desde }] };
  return S.fichas[c.id];
}
envolver(VISTAS.cliente, 'html', function (orig) {
  const [a] = orig();
  const c = clientesDB().find((x) => x.id === S.clienteSel);
  const f = fichaTecnica(c);
  const bloque = `<div class="bloque-t">Ficha técnica<small><button class="link" data-a="ficha-nota">${ic('mas', 'ic-s')}Añadir</button></small></div>
    <div class="pad">${f.notas.length ? f.notas.map((n) => `<div class="ficha-nota"><small>${mayus(fCorta(n.fecha))} · ${pro(n.pro).nombre}</small><p>${esc(n.texto)}</p>${n.antes ? `<div class="antes-despues" data-a="antes-despues" data-antes="${n.antes}" data-despues="${n.despues}"><img src="${n.antes}" alt=""><img src="${n.despues}" alt=""><span>Antes</span><span>Después</span></div>` : ''}</div>`).join('') : '<p class="muted small">Sin notas todavía. Apunta cómo le dejas el corte y sube la foto del antes y el después.</p>'}</div>
    <div class="bloque-t">Consentimientos</div>
    <div class="pad">${f.consent.map((x, i) => `<div class="factura"><span><b>${x.t}</b><small>${x.ok ? `Firmado · ${fCorta(x.fecha)}` : 'Pendiente'}</small></span>${x.ok ? `<span class="estado estado--ok">${ic('check', 'ic-s')}Firmado</span>` : `<button class="btn btn--sm btn--ghost" data-a="consent-enviar" data-i="${i}">Enviar para firmar</button>`}</div>`).join('')}</div>`;
  return [conMarco(a, '<div class="bloque-t">Próximas citas', bloque)];
});

/* =====================================================================
   8 · Reservar desde Google e Instagram (+ botón para tu web)
   ===================================================================== */
VISTAS.canales = { padre: 'ajustes', html() {
  const C = S.canales;
  return sub('Google e Instagram', `<div class="pad">
    <div class="canal"><span class="canal__ic canal__ic--g">${ic('google')}</span><span><b>Reservar con Google</b><small>Botón «Reservar» en Google Maps y en el buscador</small></span>${C.google ? '<span class="estado estado--ok">Conectado</span>' : '<button class="btn btn--sm btn--primary" data-a="canal" data-v="google">Conectar</button>'}</div>
    ${C.google ? `<div class="maps-mock"><b>Sublime Barber Studio</b><small>5,0 ★★★★★ (291) · Barbería</small><span class="maps-mock__btns"><i>Cómo llegar</i><i class="on">Reservar</i><i>Llamar</i></span></div>` : ''}
    <div class="canal"><span class="canal__ic canal__ic--ig">${ic('instagram')}</span><span><b>Botón en Instagram</b><small>«Reservar» en tu perfil y en tus stories</small></span>${C.instagram ? '<span class="estado estado--ok">Conectado</span>' : '<button class="btn btn--sm btn--primary" data-a="canal" data-v="instagram">Conectar</button>'}</div>
    ${C.instagram ? `<div class="ig-mock"><span class="ig-mock__av"><img src="${NEGOCIOS[0].logo}" alt=""></span><b>sublimebarberstudio</b><span class="maps-mock__btns"><i>Seguir</i><i>Mensaje</i><i class="on">Reservar</i></span></div>` : ''}
    <div class="canal"><span class="canal__ic">${ic('copiar')}</span><span><b>Botón para tu web</b><small>Pega este código y reservan sin salir de tu web</small></span><button class="btn btn--sm btn--ghost" data-a="copiar-codigo">Copiar</button></div>
    <pre class="codigo">&lt;script src="https://imagocitas.com/boton.js" data-negocio="sublime"&gt;&lt;/script&gt;</pre>
    <p class="faint small">Simulado. En la app real se conecta con tu cuenta de Google Business e Instagram.</p></div>`, 'Que te reserven desde donde ya te buscan.');
} };

/* =====================================================================
   10 · Chat cliente–negocio
   ===================================================================== */
const CHATS_BIZ = [
  { id: 'yo', nombre: YO.nombre, sub: () => (S.chats.sublime.at(-1)?.t || ''), cuando: () => S.chats.sublime.at(-1)?.cuando || '' },
  { id: 'c-hugo', nombre: 'Hugo García', sub: () => '¿Puedo llevar una foto del corte que quiero?', cuando: () => 'hace 10 min', pendiente: true },
  { id: 'c-pablo', nombre: 'Pablo Romero', sub: () => 'Perfecto, gracias!', cuando: () => 'ayer' },
];
VISTAS.mensajes = { padre: 'inicio', html() {
  const ult = S.chats.sublime.at(-1);
  return [`<div class="topbar"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><b>Mensajes</b><span style="width:40px"></span></div>
    <div class="pad"><button class="conv" data-a="chat-abrir"><span class="conv__av"><img src="${NEGOCIOS[0].logo}" alt=""></span><span><b>${NEGOCIOS[0].nombre}</b><small>${esc(ult?.t || '')}</small></span><small>${ult?.cuando || ''}</small>${S.noLeidosCli ? `<i class="badge badge--rel">${S.noLeidosCli}</i>` : ''}</button>
    <p class="vacio" style="padding-top:20px">Escribe a cualquier negocio desde su ficha.</p></div>`];
} };
function htmlChat(lista, yoSoy) {
  return lista.map((m) => `<div class="msg ${m.de === yoSoy ? 'msg--yo' : 'msg--ia'}">${m.de !== yoSoy && m.quien ? `<b class="msg__quien">${esc(m.quien)}</b>` : ''}${esc(m.t)}</div>`).join('');
}
VISTAS.chat = { padre: 'inicio', tabbar: false, clase: 'view--sinnav', html() {
  S.noLeidosCli = 0;
  return [`<div class="chat-cab"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><span class="conv__av"><img src="${NEGOCIOS[0].logo}" alt=""></span><span><b>${NEGOCIOS[0].nombre}</b><small>Suele responder en 10 min</small></span></div>
    <div class="chat" id="chat">${htmlChat(S.chats.sublime, 'yo')}</div>`,
  `<form class="chat-input" id="chat-form" data-quien="yo"><input id="chat-txt" type="text" placeholder="Escribe un mensaje…" autocomplete="off"><button class="icon-btn" type="submit" aria-label="Enviar">${ic('enviar')}</button></form>`];
}, montar(capa) { const v = $('.view', capa); v.scrollTop = v.scrollHeight; } };
VISTAS.bandeja = { padre: 'clientes', html() {
  return sub('Mensajes', `<div class="pad">${CHATS_BIZ.map((c) => `<button class="conv" data-a="chat-biz" data-id="${c.id}"><span class="sil">${ic('usuario')}</span><span><b>${esc(c.nombre)}</b><small>${esc(c.sub())}</small></span><small>${c.cuando()}</small>${c.pendiente ? '<i class="badge badge--rel">1</i>' : ''}</button>`).join('')}</div>`, 'Los mensajes de tus clientes desde IMAGO, separados de tu WhatsApp personal. La IA te sugiere la respuesta.');
} };
VISTAS['chat-biz'] = { padre: 'clientes', tabbar: false, clase: 'view--sinnav', html() {
  const c = CHATS_BIZ.find((x) => x.id === S.chatSel);
  const lista = c.id === 'yo' ? S.chats.sublime : [{ de: 'yo', t: c.sub() }];
  const ultimo = lista.at(-1);
  const h = buscarHuecos({ dias: [], franja: null, pro: null, servicio: null, desde: null }, 1)[0];
  const sugeridas = ultimo && ultimo.de === 'yo' ? [
    /foto/i.test(ultimo.t) ? '¡Claro! Tráela o mándala por aquí y lo vemos juntos.' : '¡Hola! Ahora mismo te ayudo.',
    h ? `Tenemos hueco ${fRel(h.fecha).toLowerCase()} a las ${h.hora} con ${pro(h.pro).nombre}. ¿Te lo reservo?` : 'Te apunto a la lista de espera.',
  ] : [];
  return [`<div class="chat-cab"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><span class="sil">${ic('usuario')}</span><span><b>${esc(c.nombre)}</b><small>Cliente</small></span></div>
    <div class="chat" id="chat">${htmlChat(lista.map((m) => ({ ...m, de: m.de === 'yo' ? 'cliente' : 'negocio' })), 'negocio')}</div>`,
  `<div class="chat-pie">${sugeridas.length ? `<div class="sugeridas sugeridas--ia">${orbe('orbe--sm')}${sugeridas.map((t) => `<button class="chip" data-a="chat-sug" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
    <form class="chat-input" id="chat-form" data-quien="negocio"><input id="chat-txt" type="text" placeholder="Responder…" autocomplete="off"><button class="icon-btn" type="submit" aria-label="Enviar">${ic('enviar')}</button></form></div>`];
}, montar(capa) { const v = $('.view', capa); v.scrollTop = v.scrollHeight; } };
function enviarChat(texto, quien) {
  texto = texto.trim();
  if (!texto) return;
  const v = moderarTexto(texto);
  if (!v.ok) return toast(`No se ha enviado: ${v.motivo}`);
  if (quien === 'negocio' && S.chatSel !== 'yo') { toast('Respuesta enviada (simulado)'); return volver(); }
  S.chats.sublime.push({ de: quien === 'yo' ? 'yo' : 'negocio', quien: quien === 'yo' ? '' : 'Javi', t: texto, cuando: 'ahora' });
  if (quien === 'yo') {
    S.notiBiz.unshift({ tipo: 'mensaje', t: `<b>${YO.nombre}</b> os ha escrito: «${esc(texto.slice(0, 60))}»`, cuando: 'ahora' });
    render(null);
    setTimeout(() => {
      if (S.vista !== 'chat') return;
      S.chats.sublime.push({ de: 'negocio', quien: 'Javi', t: '¡Recibido! En un rato te contesto 👍', cuando: 'ahora' });
      render(null);
    }, 1400);
  } else {
    S.noLeidosCli++;
    S.notiCli.unshift({ ic: 'chat', t: `<b>Javi</b> te ha respondido: «${esc(texto.slice(0, 60))}»`, cuando: 'ahora' });
    render(null);
  }
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'chat-form') return;
  e.preventDefault();
  enviarChat($('#chat-txt').value, e.target.dataset.quien);
});
{
  const orig = campanaCli;
  campanaCli = () => `<span class="topbar__acc"><button class="icon-btn campana" data-a="tab" data-v="mensajes" aria-label="Mensajes">${ic('chat')}${S.noLeidosCli ? `<i class="badge">${S.noLeidosCli}</i>` : ''}</button>${orig()}</span>`;
}
envolver(VISTAS.clientes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<div class="neg-titulo"><h1>Clientes</h1>', `<button class="icon-btn campana tit-acc" data-a="ir" data-v="bandeja" aria-label="Mensajes">${ic('chat')}<i class="badge">1</i></button>`, true)];
});

/* =====================================================================
   Automatizaciones IA (Vuelve a tu corte + Ofertas en huecos)
   ===================================================================== */
VISTAS.automatizaciones = { padre: 'ajustes', html() {
  const toca = clientesDB().filter((c) => c.visitas > 4 && !c.bloqueado).slice(0, 4);
  const v = pro('javi');
  const ph = proximoHueco('javi');
  const f = diaFlojo();
  return sub('Automatizaciones IA', `<div class="pad form-hoja" style="padding-top:0">
    <p class="franja">Vuelve a tu corte</p>
    ${sw('bizVuelve', 'Avisar cuando les toca volver', 'Por WhatsApp, con un hueco ya propuesto')}
    <div class="campo"><label>¿Cuándo?</label>${segmento([['ia', 'Según cada cliente (IA)'], ['3', '3 sem'], ['4', '4 sem'], ['6', '6 sem']], S.ajustes.bizVuelveCada, 'vuelve-cada')}</div>
    <div class="wa"><div class="wa__burbuja">Hola Carlos 👋 Hace 4 semanas de tu corte con ${v.nombre}. ${ph ? `Tiene hueco ${fRel(ph.fecha).toLowerCase()} a las ${ph.hora}` : 'Tiene huecos esta semana'}. ¿Te lo reservo? Responde <b>SÍ</b> o elige otra hora en la app.<small>10:00 ✓✓</small></div></div>
    <p class="franja">Esta semana les toca volver</p>
    ${toca.map((c) => `<div class="factura"><span><b>${esc(c.nombre)}</b><small>${c.visitas} visitas · suele venir cada ${3 + (hash(c.id) % 3)} semanas</small></span><button class="btn btn--sm btn--ghost" data-a="vuelve-enviar" data-n="${esc(c.nombre)}">Enviar ya</button></div>`).join('')}
    <div class="kpis" style="padding:0"><div class="kpi"><small>Avisos este mes</small><b>41</b></div><div class="kpi"><small>Citas recuperadas</small><b>18</b></div></div>
    <p class="franja">Ofertas en días flojos</p>
    ${sw('bizFlash', 'Proponer ofertas cuando un día va flojo', 'Te aviso en el calendario y tú decides')}
    <div class="campo"><label>Cuando un día baje del</label>${segmento([['40', '40 %'], ['50', '50 %'], ['60', '60 %']], S.ajustes.bizFlashUmbral, 'flash-umbral')}</div>
    <div class="campo"><label>Descuento por defecto</label>${segmento([['10', '−10 %'], ['15', '−15 %'], ['20', '−20 %']], S.ajustes.bizFlashPct, 'flash-pct-def')}</div>
    ${f ? `<button class="btn btn--primary btn--block" data-a="flash-abrir" data-f="${kF(f.d)}">Lanzar para el ${fLarga(f.d)} (${f.o.pct} %)</button>` : '<p class="muted small">Esta semana no hay días flojos.</p>'}
    <p class="faint small">Cifras de ejemplo.</p></div>`, 'La IA trabaja por ti: recupera clientes y llena los días flojos.');
} };

/* Ajustes: añadir las nuevas secciones */
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('ir', 'chispa', 'Automatizaciones IA', 'Vuelve a tu corte · ofertas en días flojos', 'automatizaciones')}
        ${filaAj('ir', 'chat', 'Recepcionista IA', 'WhatsApp, Instagram y llamadas', 'recepcionista')}
        ${filaAj('ir', 'recibo', 'Bonos y suscripciones', `${S.bonos.length} activos · Club Sublime`, 'bonos')}
        ${filaAj('ir', 'regalo', 'Tarjetas regalo', 'Vender y canjear', 'regalos')}
        ${filaAj('ir', 'google', 'Google e Instagram', 'Botón «Reservar» donde te buscan', 'canales')}
        ${filaAj('idioma', 'idioma', 'Idioma', S.idioma === 'en' ? 'English' : 'Español')}`, true)];
});

/* =====================================================================
   9 · Idiomas (traducción de la interfaz; en el prototipo, inglés)
   ===================================================================== */
const EN = {
  'Inicio': 'Home', 'Explorar': 'Explore', 'Inspiración': 'Inspiration', 'Citas': 'Bookings', 'Perfil': 'Profile', 'Calendario': 'Calendar', 'Clientes': 'Clients', 'Caja': 'Checkout', 'Ajustes': 'Settings',
  'Tus favoritos': 'Your favourites', 'Ofertas especiales': 'Special offers', 'Recomendados para ti': 'Recommended for you', 'Cerca de ti': 'Near you', 'Ver todo': 'See all', 'Abrir mapa': 'Open map', 'Tu próxima cita': 'Your next booking', 'Según tus gustos': 'Based on your taste', 'Personalizar': 'Personalise',
  'Barbería': 'Barber', 'Peluquería': 'Hair salon', 'Uñas': 'Nails', 'Depilación': 'Waxing', 'Masaje': 'Massage', 'Facial': 'Facial', 'Cejas y pestañas': 'Brows & lashes', 'Maquillaje': 'Make-up', 'Spa': 'Spa', 'Salud': 'Health', 'Tatuajes': 'Tattoo', 'Dental': 'Dental', 'Medicina estética': 'Aesthetics', 'Trenzas': 'Braids', 'Perros': 'Dogs',
  'Busca o pídeselo a la IA:': 'Search or ask the AI:', 'Mis citas': 'My bookings', 'Anteriores': 'Past', 'Reservar': 'Book', 'Reservar cita': 'Book now', 'Reservar de nuevo': 'Book again', 'Detalle': 'Details', 'No tienes citas próximas.': 'No upcoming bookings.',
  'Continuar': 'Continue', 'Confirmar cita': 'Confirm booking', 'Día y hora': 'Date & time', 'Servicio': 'Service', 'Profesional': 'Professional', 'Confirmar': 'Confirm', '¿Cuándo te viene bien?': 'When suits you?', '¿Qué te vas a hacer?': 'What would you like?', '¿Con quién?': 'Who with?', 'Revisa y confirma': 'Review & confirm', 'Sin preferencia': 'No preference', 'Tarde': 'Afternoon', '¿Cómo quieres pagar?': 'How do you want to pay?', 'Pagar en el estudio': 'Pay at the studio',
  'Servicios': 'Services', 'Muro': 'Wall', 'Equipo': 'Team', 'Trabajos': 'Work', 'Reseñas': 'Reviews', 'Ayuda': 'Help', 'Enviar': 'Send', 'Guardar': 'Save', 'Guardado': 'Saved', 'Mensaje': 'Message', 'Regalar': 'Gift', 'Bonos y Club': 'Packages', 'Ver tráiler': 'Watch trailer',
  'Mis preferencias': 'My preferences', 'Datos de la cuenta': 'Account', 'Pagos': 'Payments', 'Recordatorios': 'Reminders', 'Notificaciones': 'Notifications', 'Mis reseñas': 'My reviews', 'Privacidad y seguridad': 'Privacy & security', 'Ajustes de la app': 'App settings', 'Ayuda y soporte': 'Help & support', 'Cerrar sesión': 'Log out', 'Mis bonos': 'My packages', 'Tarjetas regalo': 'Gift cards', 'Mensajes': 'Messages',
  'Lista': 'List', 'Mapa': 'Map', 'Cerca de mí': 'Near me', 'Recientes': 'Recent', 'Filtros': 'Filters', 'Todo': 'All', 'Recomendado': 'Recommended', 'Hoy': 'Today', 'Día': 'Day', 'Semana': 'Week', 'Mes': 'Month', 'Todos': 'All', 'ocupación': 'occupancy', 'citas': 'bookings', 'libres': 'free', 'por cobrar': 'to collect', 'Lista de espera': 'Waiting list',
  'Mi perfil': 'My profile', 'Mi negocio': 'My business', 'Gestión': 'Management', 'Estadísticas': 'Statistics', 'Marketing': 'Marketing', 'Soporte': 'Support', 'Idioma': 'Language',
};
const ES = Object.fromEntries(Object.entries(EN).map(([k, v]) => [v, k]));
function traducir(raiz) {
  const dic = S.idioma === 'en' ? EN : ES;
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && dic[t] && !(S.idioma !== 'en' && !ES[t])) n.nodeValue = n.nodeValue.replace(t, dic[t]); }
}
new MutationObserver((ms) => { if (S.idioma === 'es' && !S.traducido) return; ms.forEach((m) => m.addedNodes.forEach((nd) => { if (nd.nodeType === 1) traducir(nd); })); }).observe($('#screen'), { childList: true, subtree: true });
function abrirIdioma() {
  hojaGenerica('Idioma', 'Tus clientes verán IMAGO en su idioma', `<div class="form-hoja">${[['es', 'Español'], ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português']].map(([id, t]) => `<button class="pago ${S.idioma === id ? 'on' : ''}" data-a="idioma-set" data-v="${id}"><div><b>${t}</b>${['fr', 'de', 'it', 'pt'].includes(id) ? '<small>En la app real (en el prototipo solo inglés)</small>' : ''}</div><span class="radio"></span></button>`).join('')}</div>`);
}

/* =====================================================================
   Acciones
   ===================================================================== */
Object.assign(A, {
  rebook: (b) => { S.historial = ['inicio']; empezarReserva({ servicio: b.dataset.s, pro: b.dataset.p, fecha: b.dataset.f, hora: b.dataset.h }); },
  'noti-ir': ((orig) => (b) => { if (b.dataset.v === 'rebook') { const v = sugerenciaVuelta(); if (v) { S.historial = ['inicio']; empezarReserva({ servicio: v.servicio, pro: v.pro, fecha: kF(v.ph.fecha), hora: v.ph.hora }); } return; } orig(b); })(A['noti-ir']),
  'flash-abrir': (b) => abrirFlash(b.dataset.f),
  'flash-pct': (b) => { S.borradorFlash.pct = b.dataset.v; moverSegmento(b); },
  'flash-franja': (b) => { S.borradorFlash.franja = b.dataset.v; moverSegmento(b); },
  'flash-lanzar': () => {
    S.flash = { ...S.borradorFlash, pct: +S.borradorFlash.pct };
    S.notiCli.unshift({ ic: 'regalo', t: `<b>Sublime Barber Studio</b>: −${S.flash.pct} % ${fRel(deK(S.flash.fecha)).toLowerCase()}. ¡Coge tu hueco!`, cuando: 'ahora' });
    S.muro.push({ id: 'fl' + Date.now(), autor: 'negocio', nombre: NEGOCIOS[0].nombre, texto: `Oferta: −${S.flash.pct} % ${fRel(deK(S.flash.fecha)).toLowerCase()} en los huecos libres. ¡Corre!`, fecha: new Date(), storyNueva: true, respuestas: [], likes: 0 });
    cerrarHoja(); render(null, { mantenerScroll: true });
    toast(`Oferta lanzada: −${S.flash.pct} %. Enviada a la lista de espera y a tus clientes`);
  },
  'flash-reservar': () => { S.historial = ['inicio']; empezarReserva({ fecha: S.flash.fecha }); if (S.vista === 'reserva') { S.reserva.fecha = S.flash.fecha; S.mesOff = 0; irPaso(0); } },
  'flash-umbral': (b) => { S.ajustes.bizFlashUmbral = b.dataset.v; moverSegmento(b); },
  'flash-pct-def': (b) => { S.ajustes.bizFlashPct = b.dataset.v; moverSegmento(b); },
  'vuelve-cada': (b) => { S.ajustes.bizVuelveCada = b.dataset.v; moverSegmento(b); },
  'vuelve-enviar': (b) => { b.disabled = true; b.textContent = 'Enviado ✓'; toast(`WhatsApp enviado a ${b.dataset.n} con un hueco propuesto`); },
  'recep-demo': demoRecepcion,
  'bono-nuevo': () => hojaGenerica('Nuevo bono', '', `<div class="form-hoja"><div class="campo"><label>Tipo</label>${segmento([['bono', 'Bono de sesiones'], ['suscripcion', 'Suscripción mensual']], 'bono', 'toast-seg')}</div>
    <div class="campo"><label>Nombre</label><input type="text" id="bn-nombre" placeholder="Ej.: Bono 10 cortes"></div>
    <div class="campo"><label>Qué incluye</label><input type="text" id="bn-inc" placeholder="Ej.: 10 cortes de pelo"></div>
    <div class="campo"><label>Precio <b id="bn-v">90 €</b></label><input type="range" id="bn-precio" min="10" max="200" value="90" oninput="document.getElementById('bn-v').textContent=this.value+' €'"></div>
    <button class="btn btn--primary btn--block" data-a="bono-crear">Crear</button></div>`),
  'bono-crear': () => { S.bonos.push({ id: 'n' + Date.now(), nombre: $('#bn-nombre').value || 'Bono nuevo', tipo: 'bono', precio: +$('#bn-precio').value, incluye: $('#bn-inc').value || 'Sesiones', servicios: ['corte'], usos: 10, vendidos: 0 }); cerrarHoja(); render(null); toast('Bono creado. Ya aparece en vuestra ficha'); },
  'bonos-cliente': abrirBonosCliente,
  'bono-comprar': (b) => {
    const bono = S.bonos.find((x) => x.id === b.dataset.id);
    b.disabled = true; b.innerHTML = '<span class="spinner"></span>';
    setTimeout(() => { S.misBonos.push({ id: bono.id, quedan: bono.usos }); S.notiBiz.unshift({ tipo: 'reserva', t: `<b>${YO.nombre}</b> ha comprado <b>${bono.nombre}</b> (${eur(bono.precio)})`, cuando: 'ahora' }); abrirBonosCliente(); toast(`¡Listo! ${bono.nombre} ya es tuyo. Úsalo al reservar`); }, 900);
  },
  'mis-bonos': () => hojaGenerica('Mis bonos', '', `<div class="form-hoja">${S.misBonos.length ? S.misBonos.map((m) => { const b = S.bonos.find((x) => x.id === m.id); return `<div class="bono"><span class="bono__tipo">${b.tipo === 'suscripcion' ? 'Suscripción' : 'Bono'}</span><b>${b.nombre}</b><small>Sublime Barber Studio</small><span class="bono__pie"><b>Quedan ${m.quedan} de ${b.usos}</b></span></div>`; }).join('') : '<p class="muted small">Aún no tienes bonos. Los encuentras en la ficha de cada negocio.</p>'}<button class="btn btn--ghost btn--block" data-a="bonos-cliente">Ver bonos de Sublime</button></div>`),
  'regalo-abrir': abrirRegalo,
  'regalo-imp': (b) => { S.regaloB.importe = +b.dataset.v; moverSegmento(b); $('#tr-imp').textContent = b.dataset.v === '18' ? 'Corte + barba' : `${b.dataset.v} €`; },
  'regalo-dis': (b) => { S.regaloB.diseno = b.dataset.v; moverSegmento(b); $('#tr-prev').className = `tarjeta-regalo tr--${b.dataset.v}`; },
  'regalo-enviar': (b) => {
    const nombre = $('#tr-nombre').value.trim();
    if (!nombre) return toast('Escribe para quién es');
    b.disabled = true; b.innerHTML = '<span class="spinner"></span>';
    const codigo = 'SUB-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    setTimeout(() => { S.regalos.push({ codigo, importe: S.regaloB.importe, de: YO.nombre, para: nombre, mensaje: $('#tr-msg').value, recibido: false }); S.notiBiz.unshift({ tipo: 'reserva', t: `Tarjeta regalo vendida: <b>${eur(S.regaloB.importe)}</b> de ${YO.nombre} para ${esc(nombre)}`, cuando: 'ahora' }); cerrarHoja(); toast(`Enviada a ${nombre} por WhatsApp · código ${codigo}`); }, 900);
  },
  'mis-regalos': () => hojaGenerica('Tarjetas regalo', '', `<div class="form-hoja">${S.regalos.map((r) => `<div class="tarjeta-regalo tr--neon tr--mini"><span class="marca">${LOGO}</span><b>${eur(r.importe)}</b><small>${r.recibido ? `De ${esc(r.de)}` : `Para ${esc(r.para)}`} · ${r.codigo}</small>${r.mensaje ? `<em>«${esc(r.mensaje)}»</em>` : ''}</div>`).join('')}<button class="btn btn--ghost btn--block" data-a="regalo-abrir">${ic('regalo', 'ic-s')}Regalar a alguien</button></div>`),
  'regalo-canjear': () => { const c = ($('#canje').value || '').trim().toUpperCase(); const r = S.regalos.find((x) => x.codigo === c); toast(r ? `Válida: ${eur(r.importe)} para ${r.para}. Úsala en Caja` : 'Código no válido. Prueba con SUB-7Q2K'); },
  cobrar: () => abrirCobro(),
  propina: (b) => { const v = b.dataset.v; S.cobro.propina = v === '10p' ? Math.round(S.cobro.total * 10) / 100 : +v; moverSegmento(b); $('#cobro-btn').textContent = `Cobrar ${eur(totalCobro())}`; },
  'cobro-metodo': (b) => { S.cobro.metodo = b.dataset.v; $$('[data-a="cobro-metodo"]').forEach((x) => x.classList.toggle('on', x === b)); },
  'cobro-ok': () => {
    if (S.cobro.metodo !== 'tap') return cerrarCobro();
    $('#cobro').innerHTML = `<div class="tap"><span class="tap__ondas"><i></i><i></i><i></i></span>${ic('tap')}<b>${eur(totalCobro())}</b><small>Acerca la tarjeta o el móvil del cliente a tu iPhone</small></div>`;
    setTimeout(() => { const t = $('.tap'); if (t) { t.classList.add('ok'); t.querySelector('small').textContent = 'Pago aceptado'; } }, 1600);
    setTimeout(cerrarCobro, 2400);
  },
  'ficha-nota': () => hojaGenerica('Nota de ficha técnica', 'Solo la ve el equipo', `<div class="form-hoja"><div class="campo"><label>¿Cómo se lo has dejado?</label><textarea class="nota-campo" id="ft-txt" placeholder="Ej.: Máquina 1 en laterales, tijera arriba 3 cm"></textarea></div>
    <div class="aj-fotos"><div><img src="${IMG}obras/claroscuro.webp" alt=""><small>Antes</small></div><div><img src="${IMG}obras/espiral.webp" alt=""><small>Después</small></div></div>
    <button class="btn btn--primary btn--block" data-a="ficha-guardar">Guardar</button></div>`),
  'ficha-guardar': () => { const c = clientesDB().find((x) => x.id === S.clienteSel); fichaTecnica(c).notas.unshift({ fecha: HOY, pro: 'javi', texto: $('#ft-txt').value || 'Nota sin texto', antes: IMG + 'obras/claroscuro.webp', despues: IMG + 'obras/espiral.webp' }); cerrarHoja(); render(null, { mantenerScroll: true }); toast('Guardado en su ficha técnica'); },
  'antes-despues': (b) => hojaGenerica('Antes y después', '', `<div class="form-hoja"><div class="comparador"><img src="${b.dataset.despues}" alt=""><img class="comparador__antes" src="${b.dataset.antes}" alt=""><input type="range" min="0" max="100" value="50" aria-label="Comparar" oninput="this.previousElementSibling.style.clipPath='inset(0 '+(100-this.value)+'% 0 0)';this.nextElementSibling.style.left=this.value+'%'"><i></i></div><p class="faint small">Desliza para comparar.</p></div>`),
  'consent-enviar': () => toast('Le llega por WhatsApp para firmarlo con el dedo'),
  'firma-borrar': () => { const c = $('#firma'); if (c) { c.getContext('2d').clearRect(0, 0, c.width, c.height); c.parentElement.classList.remove('firmada'); S.reserva.firmado = false; } },
  canal: (b) => { const k = b.dataset.v; b.disabled = true; b.innerHTML = '<span class="spinner"></span>'; setTimeout(() => { S.canales[k] = true; render(null, { mantenerScroll: true }); toast(`${k === 'google' ? 'Google' : 'Instagram'} conectado (simulado)`); }, 900); },
  'copiar-codigo': () => { try { navigator.clipboard?.writeText('<script src="https://imagocitas.com/boton.js" data-negocio="sublime"></script>'); } catch {} toast('Código copiado'); },
  'chat-abrir': () => ir('chat'),
  'chat-biz': (b) => { S.chatSel = b.dataset.id; ir('chat-biz'); },
  'chat-sug': (b) => { $('#chat-txt').value = b.dataset.t; $('#chat-txt').focus(); },
  idioma: abrirIdioma,
  'idioma-set': (b) => {
    const v = b.dataset.v;
    if (!['es', 'en'].includes(v)) return toast('En la app real se traduce todo. En el prototipo, prueba con English');
    S.idioma = v; S.traducido = true; cerrarHoja(); render(null, { mantenerScroll: true }); pintarTabbar(!$('#tabbar').classList.contains('oculta')); traducir($('#screen'));
    toast(v === 'en' ? 'Language: English' : 'Idioma: español');
  },
});
/* El cobro de siempre, tras propina y forma de pago */
const cobrarTicket = (() => {
  const T = () => S.ticket;
  return () => {
    const t = T(), p = pro(t.pro), L = lineasTicket(), tk = 'caja' + Date.now(), total = L.reduce((a, l) => a + l.total, 0);
    L.forEach((l) => { for (let i = 0; i < l.q; i++) S.ventas.push({ t: Date.now(), pro: t.pro, tipo: l.tipo, id: l.o.id, precio: l.o.precio, metodo: t.metodo, com: p.propietario ? 0 : l.tipo === 's' ? (l.o.precio * p.comisionServicios) / 100 : (l.o.precio * l.o.comision) / 100, tk }); if (l.tipo === 'p') l.o.stock = Math.max(0, l.o.stock - l.q); });
    S.ticket = { pro: t.pro, items: {}, metodo: t.metodo };
    render(null, { mantenerScroll: true });
    toast(`Cobrado ${eur(total)} con ${t.metodo}. Ya cuenta en Estadísticas.`);
  };
})();
/* Pagar con bono al confirmar y exigir la firma del consentimiento */
{
  const conf = A.confirmar;
  A.confirmar = (b) => {
    const R = S.reserva;
    if (necesitaFirma(R.servicio) && !R.firmado) { toast('Firma el consentimiento para confirmar'); $('.firma')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (R.pago === 'bono') { const m = S.misBonos.find((x) => x.quedan > 0 && S.bonos.find((bb) => bb.id === x.id).servicios.includes(R.servicio)); if (m) m.quedan--; }
    conf(b);
  };
}
/* Perfil del cliente: mis bonos, tarjetas regalo e idioma */
envolver(VISTAS.perfil, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<button data-a="perfil-datos">', `<button data-a="mis-bonos">${ic('recibo')}<span>Mis bonos<small>${S.misBonos.length ? `${S.misBonos.length} activos` : 'Club Sublime y bonos'}</small></span>${ic('sig', 'ic-s')}</button>
    <button data-a="mis-regalos">${ic('regalo')}<span>Tarjetas regalo<small>${S.regalos.filter((r) => r.recibido).length} recibida · ${eur(30)} para gastar</small></span>${ic('sig', 'ic-s')}</button>
    <button data-a="idioma">${ic('idioma')}<span>Idioma<small>${S.idioma === 'en' ? 'English' : 'Español'}</small></span>${ic('sig', 'ic-s')}</button>`)];
});

/* Atajos del panel lateral para las novedades */
Object.assign(DEMOS, {
  nVuelve: () => { S.citas.forEach((c) => (c.cancelada = true)); abrirApp('cliente', 'inicio'); render(null); },
  nFlash: () => { S.flash = null; abrirApp('negocio', 'agenda'); S.agendaModo = 'dia'; render(null); const f = diaFlojo(); if (f) setTimeout(() => abrirFlash(kF(f.d)), 300); },
  nRecepcion: () => { abrirApp('negocio', 'ajustes'); ir('recepcionista'); },
  nBonos: () => { abrirApp('cliente', 'inicio'); S.tabFicha = 'servicios'; ir('negocio'); setTimeout(abrirBonosCliente, 400); },
  nRegalo: () => { abrirApp('cliente', 'inicio'); S.tabFicha = 'servicios'; ir('negocio'); setTimeout(abrirRegalo, 400); },
  nCobro: () => { S.ticket = { pro: 'adri', items: { 's:combo': 1, 'p:cera': 1 }, metodo: 'tarjeta' }; abrirApp('negocio', 'caja'); render(null); setTimeout(abrirCobro, 300); },
  nFicha: () => { abrirApp('negocio', 'clientes'); S.clienteSel = clientesDB().find((c) => !c.first && !c.yo).id; ir('cliente'); setTimeout(() => { const t = $$('.bloque-t').find((x) => x.textContent.startsWith('Ficha')); t && $('.view').scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' }); }, 400); },
  nCanales: () => { abrirApp('negocio', 'ajustes'); ir('canales'); },
  nIdioma: () => { abrirApp('cliente', 'perfil'); setTimeout(abrirIdioma, 300); },
  nChat: () => { abrirApp('cliente', 'inicio'); ir('chat'); },
  nBandeja: () => { abrirApp('negocio', 'clientes'); ir('bandeja'); },
});
