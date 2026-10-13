'use strict';
/* Cambio de cita con propuesta (11/10/2026)
   1. El cliente propone una hora nueva desde «Mis citas» y escribe el motivo (o lo omite).
   2. La propuesta le llega al profesional, que acepta o rechaza.
   3. Si la hora nueva era de otro cliente, a ese cliente le llega la propuesta de intercambio con el motivo:
      si acepta, se cambian las dos citas; si no, cada uno se queda con la suya. */

S.cambios = [];
const MOTIVOS = ['Tengo médico o dentista', 'Me ha salido trabajo', 'Me viene mejor a otra hora', 'Un imprevisto familiar'];
const citaDe = (cb) => S.citas[cb.cita];
const nombreCorto = (n) => n.split(' ')[0];

function abrirCambio(i) {
  const c = S.citas[i];
  S.cb = { cita: i, fecha: c.fecha, hora: null, motivo: '' };
  hojaGenerica('Proponer cambio de cita', `${serv(c.servicio).nombre} · ${fCorta(deK(c.fecha))} · ${c.hora} · ${pro(c.pro).nombre}`, '<div class="form-hoja cb" id="cb"></div>');
  pintarCambio();
}
function pintarCambio() {
  const el = $('#cb');
  if (!el) return;
  const B = S.cb, c = citaDe(B), d = deK(B.fecha);
  let dias = '';
  for (let k = 0; k < 14; k++) {
    const x = addD(HOY, k);
    if (x.getDay() === 0 || enVacaciones(c.pro, x)) continue;
    dias += `<button class="nr-dia ${kF(x) === B.fecha ? 'on' : ''}" data-a="cb-dia" data-f="${kF(x)}"><small>${k === 0 ? 'Hoy' : x.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</small><b>${x.getDate()}</b><i>${kF(x) === c.fecha ? 'tu día' : ''}</i></button>`;
  }
  const horas = HORAS.map((h) => {
    const mia = B.fecha === c.fecha && h === c.hora;
    const pasada = esHoy(d) && minH(h) <= MIN_AHORA;
    const o = mia ? null : ocupada(c.pro, d, h);
    const estado = mia ? 'mia' : o ? 'otro' : 'libre';
    return `<button class="nr-hora cb-h cb-h--${estado} ${B.hora === h ? 'on' : ''}" data-a="cb-hora" data-h="${h}" ${mia || pasada ? 'disabled' : ''}>${h}<small>${mia ? 'tu cita' : o ? 'ocupada' : 'libre'}</small></button>`;
  }).join('');
  const o = B.hora ? ocupada(c.pro, d, B.hora) : null;
  el.innerHTML = `
    <p class="nr-t"><span>1</span>Nuevo día y hora</p>
    <div class="nr-dias">${dias}</div>
    <div class="nr-horas">${horas}</div>
    <p class="leyenda-cb"><span><i class="l"></i>Libre: el profesional solo tiene que aceptar</span><span><i class="o"></i>Ocupada: se le propone el intercambio al otro cliente</span></p>
    ${B.hora ? `<div class="cb-resumen">${o ? `${ic('repetir', 'ic-s')}<span>Esa hora es de <b>otro cliente</b>. Si ${pro(c.pro).nombre} acepta, le preguntaremos si quiere tu hora (${c.hora} del ${fCorta(deK(c.fecha))}) a cambio.</span>` : `${ic('check', 'ic-s')}<span>Hora libre. Solo falta que ${pro(c.pro).nombre} acepte el cambio.</span>`}</div>` : ''}
    <p class="nr-t"><span>2</span>Motivo <small class="faint">(opcional)</small></p>
    <div class="chips">${MOTIVOS.map((m) => `<button class="chip" data-a="cb-motivo" data-v="${esc(m)}" aria-pressed="${B.motivo === m}">${m}</button>`).join('')}</div>
    <textarea class="nota-campo" id="cb-txt" maxlength="160" placeholder="Cuéntaselo con tus palabras (lo verán el profesional y, si hay intercambio, el otro cliente)">${esc(MOTIVOS.includes(B.motivo) ? '' : B.motivo)}</textarea>
    <div class="cb-pie"><button class="btn btn--ghost" data-a="cb-enviar" data-sin="1" ${B.hora ? '' : 'disabled'}>Omitir motivo y enviar</button><button class="btn btn--primary" data-a="cb-enviar" ${B.hora ? '' : 'disabled'}>Enviar propuesta</button></div>`;
}
document.addEventListener('input', (e) => { if (e.target.id === 'cb-txt' && S.cb) { S.cb.motivo = e.target.value; $$('[data-a="cb-motivo"]').forEach((x) => x.setAttribute('aria-pressed', 'false')); } });

/* «Mis citas»: estado del cambio y propuestas recibidas */
envolver(VISTAS.citas, 'html', function (orig) {
  const r = orig();
  let h = r[0];
  S.citas.forEach((c, i) => {
    const cb = S.cambios.find((x) => x.cita === i && !x.recibida && !['rechazado', 'hecho', 'anulado'].includes(x.estado));
    if (!cb) return;
    const txt = cb.estado === 'pro' ? `Cambio a las <b>${cb.a.hora}</b> del ${fCorta(deK(cb.a.fecha))} · esperando a ${pro(c.pro).nombre}` : `${pro(c.pro).nombre} lo ha aceptado · esperando a que ${nombreCorto(cb.otro.nombre)} acepte el intercambio`;
    const k = h.indexOf(`data-a="cita-cambiar" data-i="${i}"`);
    const j = h.lastIndexOf('<div class="cita-acciones">', k);
    if (k < 0 || j < 0) return;
    h = h.slice(0, j) + `<div class="cb-estado">${ic('repetir', 'ic-s')}<span>${txt}</span><button class="link" data-a="cb-anular" data-id="${cb.id}">Anular</button></div>` + h.slice(j).replace(`data-a="cita-cambiar" data-i="${i}"`, `data-a="cita-cambiar" data-i="${i}" disabled`);
  });
  const recibidas = S.cambios.filter((x) => x.recibida && x.estado === 'otro');
  if (recibidas.length) {
    h = h.replace('</div>', `</div>${recibidas.map((x) => `<div class="cb-recibida"><span class="cb-recibida__ic">${ic('repetir')}</span><div><small>Propuesta de intercambio</small><b>${esc(x.de_nombre)} quiere tu hora del ${fCorta(deK(x.mia.fecha))} a las ${x.mia.hora}</b>
      <p>Te ofrece la suya: <b>${fCorta(deK(x.suya.fecha))} a las ${x.suya.hora}</b> con ${pro(x.pro).nombre}.${x.motivo ? ` Motivo: «${esc(x.motivo)}».` : ''}</p>
      <div class="cb-recibida__btns"><button class="btn btn--sm btn--primary" data-a="cb-acepto" data-id="${x.id}">Acepto el cambio</button><button class="btn btn--sm btn--ghost" data-a="cb-no" data-id="${x.id}">No, gracias</button></div></div></div>`).join('')}`);
  }
  r[0] = h;
  return r;
});

/* Business: aviso en la agenda y hoja para decidir */
const cambiosPendientesPro = () => S.cambios.filter((x) => x.estado === 'pro' && !x.recibida);
envolver(VISTAS.agenda, 'html', function (orig) {
  const r = orig();
  const n = cambiosPendientesPro().length;
  if (n) r[0] = r[0].replace(/(<div class="chips cal-pros">[\s\S]*?<\/div>)/, `$1<button class="ia-aviso cb-aviso" data-a="cb-ver">${ic('repetir')}<span><b>${n} ${n === 1 ? 'solicitud' : 'solicitudes'} de cambio de cita</b><small>Revísalas y acepta o rechaza</small></span>${ic('sig', 'ic-s')}</button>`);
  return r;
});
function abrirSolicitudes() {
  const l = cambiosPendientesPro();
  if (!l.length) return toast('No hay solicitudes pendientes');
  hojaGenerica('Solicitudes de cambio', 'Tú decides si es posible', `<div class="form-hoja">${l.map((x) => {
    const c = citaDe(x);
    return `<div class="cb-sol"><b>${esc(YO.nombre)}</b><small>${serv(c.servicio).nombre} · con ${pro(c.pro).nombre}</small>
      <div class="cb-sol__de"><span>${fCorta(deK(x.de.fecha))} · ${x.de.hora}</span>${ic('sig', 'ic-s')}<span><b>${fCorta(deK(x.a.fecha))} · ${x.a.hora}</b></span></div>
      <p>${x.motivo ? `Motivo: «${esc(x.motivo)}»` : '<span class="faint">Sin motivo</span>'}</p>
      ${x.otro ? `<p class="cb-sol__otro">${ic('repetir', 'ic-s')}<span>Esa hora es de <b>${esc(x.otro.nombre)}</b>. Si aceptas, le enviamos la propuesta de intercambio.</span></p>` : `<p class="cb-sol__otro cb-sol__otro--ok">${ic('check', 'ic-s')}<span>La hora está libre.</span></p>`}
      <div class="cb-pie"><button class="btn btn--ghost" data-a="cb-rechazar" data-id="${x.id}">Rechazar</button><button class="btn btn--primary" data-a="cb-aceptar" data-id="${x.id}">${x.otro ? "Aceptar y preguntarle" : "Aceptar el cambio"}</button></div></div>`;
  }).join('')}</div>`);
}
function moverCita(c, a, quedaEnLaVieja) {
  const viejo = `${c.fecha}|${c.pro}|${c.hora}`;
  const datos = S.extra[viejo] || { servicio: c.servicio, pago: c.pago };
  delete S.extra[viejo];
  if (quedaEnLaVieja) S.extra[viejo] = quedaEnLaVieja;
  c.fecha = a.fecha; c.hora = a.hora;
  S.extra[`${a.fecha}|${c.pro}|${a.hora}`] = datos;
}

Object.assign(A, {
  'cita-cambiar': (b) => abrirCambio(+b.dataset.i),
  'cb-dia': (b) => { S.cb.fecha = b.dataset.f; S.cb.hora = null; pintarCambio(); },
  'cb-hora': (b) => { S.cb.hora = b.dataset.h; pintarCambio(); },
  'cb-motivo': (b) => { S.cb.motivo = S.cb.motivo === b.dataset.v ? '' : b.dataset.v; pintarCambio(); },
  'cb-enviar': (b) => {
    const B = S.cb, c = citaDe(B), d = deK(B.fecha);
    const motivo = b.dataset.sin ? '' : (B.motivo || '').trim();
    if (motivo) { const v = moderarTexto(motivo); if (!v.ok) return toast(`Revisa el motivo: ${v.motivo}`); }
    const o = ocupada(c.pro, d, B.hora);
    const cb = { id: 'cb' + Date.now(), cita: B.cita, de: { fecha: c.fecha, hora: c.hora }, a: { fecha: B.fecha, hora: B.hora }, pro: c.pro, motivo, estado: 'pro', otro: o ? { nombre: o.cliente, servicio: o.servicio } : null };
    S.cambios.push(cb);
    S.notiBiz.unshift({ tipo: 'cambio', t: `<b>${YO.nombre}</b> pide cambiar su cita del ${fCorta(deK(c.fecha))} (${c.hora}) a las <b>${B.hora}</b> del ${fCorta(d)}${motivo ? `: «${esc(motivo)}»` : ''}`, sub: o ? `Esa hora es de ${o.cliente}: habría intercambio` : 'Hora libre', cuando: 'ahora' });
    cerrarHoja(); render(null, { mantenerScroll: true });
    toast(`Propuesta enviada a ${pro(c.pro).nombre}. Te avisamos cuando responda.`);
  },
  'cb-anular': (b) => { const x = S.cambios.find((y) => y.id === b.dataset.id); x.estado = 'anulado'; render(null, { mantenerScroll: true }); toast('Solicitud de cambio anulada. Mantienes tu cita.'); },
  'cb-ver': abrirSolicitudes,
  'cb-rechazar': (b) => {
    const x = S.cambios.find((y) => y.id === b.dataset.id); x.estado = 'rechazado';
    S.notiCli.unshift({ ic: 'calendario', t: `${pro(x.pro).nombre} no puede hacer el cambio a las ${x.a.hora}. Mantienes tu cita de las ${x.de.hora}.`, cuando: 'ahora' });
    cerrarHoja(); render(null, { mantenerScroll: true }); toast('Cambio rechazado. Hemos avisado al cliente.');
  },
  'cb-aceptar': (b) => {
    const x = S.cambios.find((y) => y.id === b.dataset.id), c = citaDe(x);
    if (!x.otro) {
      moverCita(c, x.a);
      x.estado = 'hecho';
      S.notiCli.unshift({ ic: 'check', t: `¡Cambio aceptado! Tu cita es ahora el ${fLarga(deK(x.a.fecha))} a las <b>${x.a.hora}</b> con ${pro(x.pro).nombre}.`, cuando: 'ahora' });
      cerrarHoja(); render(null, { mantenerScroll: true });
      return toast('Cita cambiada. Al cliente le llega la confirmación.');
    }
    x.estado = 'otro';
    cerrarHoja(); render(null, { mantenerScroll: true });
    toast(`Propuesta enviada a ${x.otro.nombre} con el motivo. Si acepta, se intercambian las citas.`);
    // En el prototipo, el otro cliente responde a los pocos segundos
    setTimeout(() => {
      if (x.estado !== 'otro') return;
      moverCita(c, x.a, { servicio: x.otro.servicio.id || c.servicio, pago: 'local', cliente: x.otro.nombre });
      x.estado = 'hecho';
      S.notiCli.unshift({ ic: 'check', t: `${esc(nombreCorto(x.otro.nombre))} ha aceptado el intercambio. Tu cita es ahora el ${fLarga(deK(x.a.fecha))} a las <b>${x.a.hora}</b>.`, cuando: 'ahora' });
      S.notiBiz.unshift({ tipo: 'cambio', t: `<b>${esc(x.otro.nombre)}</b> ha aceptado el intercambio con ${YO.nombre}`, sub: `${x.a.hora} ⇄ ${x.de.hora}`, cuando: 'ahora' });
      if (['citas', 'agenda'].includes(S.vista)) render(null, { mantenerScroll: true });
      toast(`${nombreCorto(x.otro.nombre)} ha aceptado el intercambio de citas`);
    }, 4500);
  },
  'cb-acepto': (b) => {
    const x = S.cambios.find((y) => y.id === b.dataset.id);
    const c = S.citas[x.cita];
    moverCita(c, x.suya, { servicio: c.servicio, pago: 'local', cliente: x.de_nombre });
    x.estado = 'hecho';
    S.notiBiz.unshift({ tipo: 'cambio', t: `<b>${YO.nombre}</b> ha aceptado el intercambio con ${esc(x.de_nombre)}`, cuando: 'ahora' });
    render(null, { mantenerScroll: true });
    toast(`Hecho: tu cita pasa al ${fCorta(deK(x.suya.fecha))} a las ${x.suya.hora}. ¡Gracias por el favor!`);
  },
  'cb-no': (b) => { const x = S.cambios.find((y) => y.id === b.dataset.id); x.estado = 'rechazado'; render(null, { mantenerScroll: true }); toast('Propuesta rechazada. Mantienes tu cita.'); },
});

/* Atajos de demostración */
function citaDemo() {
  if (S.citas.some((c) => !c.cancelada)) return S.citas.findIndex((c) => !c.cancelada);
  const ph = proximoHueco('adri');
  S.citas.push({ servicio: 'combo', pro: 'adri', fecha: kF(ph.fecha), hora: ph.hora, pago: 'local' });
  S.extra[`${kF(ph.fecha)}|adri|${ph.hora}`] = { servicio: 'combo', pago: 'local' };
  return S.citas.length - 1;
}
DEMOS.nCambio = () => { const i = citaDemo(); abrirApp('cliente', 'citas'); setTimeout(() => abrirCambio(i), 300); };
DEMOS.nCambioBiz = () => {
  const i = citaDemo(), c = S.citas[i], d = deK(c.fecha);
  if (!cambiosPendientesPro().length) {
    const h = HORAS.find((x) => x !== c.hora && ocupada(c.pro, d, x) && !(esHoy(d) && minH(x) <= MIN_AHORA)) || HORAS[0];
    const o = ocupada(c.pro, d, h);
    S.cambios.push({ id: 'cb' + Date.now(), cita: i, de: { fecha: c.fecha, hora: c.hora }, a: { fecha: c.fecha, hora: h }, pro: c.pro, motivo: 'Tengo dentista a esa hora', estado: 'pro', otro: o ? { nombre: o.cliente, servicio: o.servicio } : null });
  }
  abrirApp('negocio', 'agenda'); S.agendaFecha = d; S.agendaModo = 'dia'; render(null); setTimeout(abrirSolicitudes, 400);
};
DEMOS.nCambioRecibido = () => {
  const i = citaDemo(), c = S.citas[i];
  const libre = libres(c.pro, deK(c.fecha)).find((h) => h !== c.hora) || HORAS[HORAS.length - 1];
  S.cambios = S.cambios.filter((x) => !x.recibida);
  S.cambios.push({ id: 'cr' + Date.now(), recibida: true, cita: i, de_nombre: 'Lucía Romero', mia: { fecha: c.fecha, hora: c.hora }, suya: { fecha: c.fecha, hora: libre }, pro: c.pro, motivo: 'Salgo antes del trabajo ese día y me viene genial tu hora', estado: 'otro' });
  abrirApp('cliente', 'citas');
};
