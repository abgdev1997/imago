'use strict';
/* IMAGO Business: reservar una cita desde el calendario.
   Buscar cliente (nombre o teléfono) o crearlo, profesional, día, hora de inicio (o una hora a medida),
   uno o varios servicios, duración y precio personalizados, cliente de confianza, nota y WhatsApp. */

S.reservasBiz = [];

const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const nrServ = () => S.nr.servicios.map(serv);
const nrDur = () => S.nr.dur ?? nrServ().reduce((a, s) => a + s.min, 0);
const nrPrecio = () => S.nr.precio ?? nrServ().reduce((a, s) => a + s.precio, 0);
const nrNombre = () => (S.nr.cliente ? S.nr.cliente.nombre : (S.nr.nuevo?.nombre || '').trim());

function abrirReservaBiz(pre = {}) {
  const base = S.agendaFecha && S.agendaFecha >= HOY && S.agendaFecha.getDay() !== 0 ? S.agendaFecha : HOY.getDay() === 0 ? addD(HOY, 1) : HOY;
  S.nr = {
    cliente: pre.cliente || null, nuevo: null, busca: '',
    pro: pre.pro || (S.agendaPro !== 'todos' ? S.agendaPro : 'javi'),
    fecha: pre.fecha || kF(base), hora: pre.hora || null, otraHora: false,
    servicios: [], eligiendo: true, dur: null, precio: null, nota: '', whatsapp: true,
  };
  nrProDisponible();
  hojaGenerica('Nueva cita', 'Reserva para un cliente', '<div class="form-hoja nr" id="nr"></div>');
  pintarNR();
}

/* Si el profesional elegido está de vacaciones ese día, se cambia a uno que trabaje */
function nrProDisponible() {
  const N = S.nr, d = deK(N.fecha);
  if (enVacaciones(N.pro, d)) { const otro = EQUIPO.find((p) => !enVacaciones(p.id, d)); if (otro) N.pro = otro.id; }
}
/* Tramos de 30 min del calendario que ocupa la cita */
function nrTramos() {
  const N = S.nr;
  if (!N.hora) return [];
  const ini = minH(N.hora), fin = ini + Math.max(nrDur(), 15);
  return HORAS.filter((h) => minH(h) < fin && minH(h) + 30 > ini);
}
function nrProblemas() {
  const N = S.nr, d = deK(N.fecha), out = [];
  if (!N.hora) return out;
  if (enVacaciones(N.pro, d)) out.push(`${pro(N.pro).nombre} está de vacaciones ese día`);
  const ini = minH(N.hora), fin = ini + nrDur(), cierre = ini < 15 * 60 ? 14 * 60 : 21 * 60;
  if (nrDur() && fin > cierre) out.push(`Terminaría a las ${hm(fin)}, después del cierre (${hm(cierre)})`);
  nrTramos().forEach((h) => { const c = ocupada(N.pro, d, h); if (c) out.push(`Se solapa con ${c.cliente} a las ${h}`); });
  if (N.cliente?.bloqueado) out.push(`${N.cliente.nombre} está bloqueado`);
  return out;
}

function nrResultados() {
  const crudo = S.nr.busca.trim();
  const q = norm(crudo), qt = crudo.replace(/\D/g, '');
  const l = clientesDB().filter((c) => !q || norm(c.nombre).includes(q) || (qt.length > 2 && c.tel.replace(/\D/g, '').includes(qt)));
  const vista = q ? l.slice(0, 6) : [...l].sort((a, b) => b.visitas - a.visitas).slice(0, 4);
  return `${q ? '' : '<p class="franja">Clientes habituales</p>'}
    ${vista.map((c) => `<button class="nr-res" data-a="nr-cli" data-id="${c.id}">${sil()}<span><b>${esc(c.nombre)}</b><small>${c.tel}${c.visitas ? ` · ${c.visitas} visitas` : ''}</small></span><span class="nr-tags">${insignias(c)}</span></button>`).join('')}
    ${q && !vista.length ? '<p class="muted small">No hay ningún cliente con ese nombre o teléfono.</p>' : ''}
    ${q ? `<button class="nr-res nr-res--nuevo" data-a="nr-nuevo">${ic('mas')}<span><b>Crear cliente «${esc(crudo)}»</b><small>Se guarda en Clientes como nuevo (FIRST)</small></span></button>` : ''}`;
}

function htmlNRCliente() {
  const N = S.nr;
  const sw = (on, accion) => `<div class="ajuste"><span><b>Cliente de confianza</b><small>No paga señal y no hace falta que confirme</small></span><button class="switch" role="switch" aria-checked="${!!on}" data-a="${accion}" aria-label="Cliente de confianza"></button></div>`;
  if (N.cliente) {
    const c = N.cliente;
    return `<div class="nr-cli">${sil()}<span><b>${esc(c.nombre)}</b><small>${c.tel}${c.visitas ? ` · ${c.visitas} visitas · suele ir con ${pro(c.proFav).nombre}` : ' · primera vez'}</small><span class="nr-tags">${insignias(c)}</span></span><button class="link" data-a="nr-cambiar-cli">Cambiar</button></div>${sw(c.confianza, 'nr-confianza')}`;
  }
  if (N.nuevo) {
    return `<div class="nr-nuevo"><div class="campo"><label>Nombre y apellidos</label><input id="nr-nombre" type="text" value="${esc(N.nuevo.nombre)}" autocomplete="off" placeholder="Ej.: Carlos Pérez"></div>
      <div class="campo"><label>Teléfono</label><input id="nr-tel" type="tel" value="${esc(N.nuevo.tel)}" autocomplete="off" placeholder="600 000 000"></div>
      ${sw(N.nuevo.confianza, 'nr-confianza')}<button class="link" data-a="nr-cambiar-cli">Buscar un cliente existente</button></div>`;
  }
  return `<div class="nr-busca">${ic('buscar', 'ic-s')}<input id="nr-busca" type="search" value="${esc(N.busca)}" placeholder="Nombre o teléfono del cliente" autocomplete="off"></div><div id="nr-res">${nrResultados()}</div>`;
}

function pintarNR() {
  const el = $('#nr');
  if (!el) return;
  const N = S.nr, d = deK(N.fecha);
  const tramos = nrTramos();
  // Días: las próximas 3 semanas
  let dias = '';
  for (let i = 0; i < 21; i++) {
    const x = addD(HOY, i);
    if (x.getDay() === 0) continue;
    const o = ocupacion(x, [pro(N.pro)]);
    const vac = enVacaciones(N.pro, x);
    dias += `<button class="nr-dia ${kF(x) === N.fecha ? 'on' : ''}" data-a="nr-dia" data-f="${kF(x)}"><small>${i === 0 ? 'Hoy' : i === 1 ? 'Mañ.' : x.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</small><b>${x.getDate()}</b><i>${vac ? 'vac.' : o ? o.pct + '%' : ''}</i></button>`;
  }
  // Horas de inicio
  const horas = HORAS.map((h) => {
    const pasada = esHoy(d) && minH(h) <= MIN_AHORA;
    const c = ocupada(N.pro, d, h);
    const cls = [N.hora === h ? 'on' : '', tramos.includes(h) && N.hora !== h ? 'cubre' : '', c ? 'ocu' : ''].join(' ');
    return `<button class="nr-hora ${cls}" data-a="nr-hora" data-h="${h}" ${pasada || enVacaciones(N.pro, d) ? 'disabled' : ''}>${h}${c ? `<small>${esc(c.cliente.split(' ')[0])}</small>` : ''}</button>`;
  }).join('');
  const aMedida = N.otraHora || (N.hora && !HORAS.includes(N.hora));
  const servs = nrServ();
  const probs = nrProblemas();
  const listo = nrNombre() && servs.length && N.hora;
  const fin = N.hora ? hm(minH(N.hora) + nrDur()) : '';
  el.innerHTML = `
    <section><p class="nr-t"><span>1</span>Cliente</p>${htmlNRCliente()}</section>
    <section><p class="nr-t"><span>2</span>Con quién</p>
      <div class="nr-pros">${EQUIPO.map((p) => `<button class="nr-pro ${N.pro === p.id ? 'on' : ''}" data-a="nr-pro" data-v="${p.id}"><img src="${p.img}" alt=""><span>${p.nombre}${enVacaciones(p.id, d) ? '<small>De vacaciones</small>' : ''}</span></button>`).join('')}</div></section>
    <section><p class="nr-t"><span>3</span>Día y hora de inicio</p>
      <div class="nr-dias">${dias}</div>
      <div class="nr-horas">${horas}<button class="nr-hora ${aMedida ? 'on' : ''}" data-a="nr-otra-hora">Otra hora</button></div>
      ${probs.length ? `<div class="nr-aviso">${ic('alerta', 'ic-s')}<div>${probs.map((p) => `<span>${esc(p)}</span>`).join('')}</div></div>` : ''}
      ${aMedida ? `<div class="campo nr-otra"><label>Hora exacta de inicio</label><input id="nr-hora-libre" type="time" step="300" min="09:00" max="21:00" value="${N.hora && !HORAS.includes(N.hora) ? N.hora : ''}"></div>` : ''}
    </section>
    <section><p class="nr-t"><span>4</span>Servicios</p>
      ${servs.map((s, i) => `<div class="nr-serv"><span><b>${s.nombre}</b><small>${s.min} min · ${eur(s.precio)}</small></span><button class="icon-btn" data-a="nr-quitar" data-i="${i}" aria-label="Quitar ${s.nombre}">${ic('cerrar', 'ic-s')}</button></div>`).join('')}
      ${N.eligiendo || !servs.length ? `<div class="nr-catalogo">${SERVICIOS.map((s) => `<button class="chip" data-a="nr-serv" data-v="${s.id}">${s.nombre}<small>${s.min}′ · ${eur(s.precio)}</small></button>`).join('')}</div>` : `<button class="btn btn--ghost btn--block" data-a="nr-otro">${ic('mas', 'ic-s')}Añadir otro servicio</button>`}
    </section>
    ${servs.length ? `<section><p class="nr-t"><span>5</span>Duración y precio</p>
      <div class="nr-ajuste"><button class="icon-btn" data-a="nr-dur" data-d="-15" aria-label="Menos tiempo">${ic('menos', 'ic-s')}</button><span><b>${nrDur()} min</b><small>${N.dur == null ? 'Según los servicios' : 'Personalizada'}${N.hora ? ` · de ${N.hora} a ${fin}` : ''}</small></span><button class="icon-btn" data-a="nr-dur" data-d="15" aria-label="Más tiempo">${ic('mas', 'ic-s')}</button></div>
      <div class="nr-ajuste"><button class="icon-btn" data-a="nr-precio" data-d="-1" aria-label="Bajar precio">${ic('menos', 'ic-s')}</button><span><b>${eur(nrPrecio())}</b><small>${N.precio == null ? 'Precio de los servicios' : 'Precio personalizado'}</small></span><button class="icon-btn" data-a="nr-precio" data-d="1" aria-label="Subir precio">${ic('mas', 'ic-s')}</button></div>
      ${N.dur != null || N.precio != null ? '<button class="link" data-a="nr-reset">Volver a la duración y el precio de los servicios</button>' : ''}
    </section>` : ''}
    <section><p class="nr-t"><span>${servs.length ? 6 : 5}</span>Más opciones</p>
      <div class="campo"><label>Nota interna <span class="faint">(solo la ve el equipo)</span></label><textarea class="nota-campo" id="nr-nota" placeholder="Ej.: quiere probar degradado bajo">${esc(N.nota)}</textarea></div>
      <div class="ajuste"><span><b>Avisar al cliente</b><small>Notificación + email, y recordatorios 24 h y 1 h antes</small></span><button class="switch" role="switch" aria-checked="${N.whatsapp}" data-a="nr-wa" aria-label="Avisar al cliente"></button></div>
    </section>
    <div id="nr-pie">${htmlNRPie(probs, listo)}</div>`;
}
function htmlNRPie(probs = nrProblemas(), listo = nrNombre() && S.nr.servicios.length && S.nr.hora) {
  const N = S.nr;
  const falta = !nrNombre() ? 'Elige o crea un cliente' : !N.servicios.length ? 'Añade al menos un servicio' : !N.hora ? 'Elige la hora de inicio' : '';
  return `${listo ? `<p class="nr-resumen"><b>${esc(nrNombre())}</b> · ${nrServ().map((s) => s.nombre).join(' + ')} · ${pro(N.pro).nombre} · ${fCorta(deK(N.fecha))}, ${N.hora}–${hm(minH(N.hora) + nrDur())}${probs.length ? `<br><span class="nr-resumen__aviso">${ic('alerta', 'ic-s')}${esc(probs[0])}${probs.length > 1 ? ` y ${probs.length - 1} aviso más` : ''}</span>` : ''}</p>` : ''}
    <button class="btn btn--primary btn--block" data-a="nr-guardar" ${listo ? '' : 'disabled'}>${listo ? `${probs.length ? 'Reservar igualmente' : 'Reservar'} · ${eur(nrPrecio())}` : falta}</button>`;
}

/* Escribir en los campos sin perder el foco */
document.addEventListener('input', (e) => {
  if (!S.nr) return;
  const id = e.target.id;
  if (id === 'nr-busca') { S.nr.busca = e.target.value; $('#nr-res').innerHTML = nrResultados(); }
  else if (id === 'nr-nombre' || id === 'nr-tel') { S.nr.nuevo[id === 'nr-nombre' ? 'nombre' : 'tel'] = e.target.value; $('#nr-pie').innerHTML = htmlNRPie(); }
  else if (id === 'nr-nota') S.nr.nota = e.target.value;
});
document.addEventListener('change', (e) => {
  if (!S.nr || e.target.id !== 'nr-hora-libre' || !e.target.value) return;
  S.nr.hora = e.target.value;
  pintarNR();
});

Object.assign(A, {
  'biz-reservar': () => abrirReservaBiz(),
  'nr-cli': (b) => { S.nr.cliente = clientesDB().find((c) => c.id === b.dataset.id); S.nr.nuevo = null; if (!S.nr.servicios.length && !S.nr.hora && S.nr.cliente.proFav && S.agendaPro === 'todos') { S.nr.pro = S.nr.cliente.proFav; nrProDisponible(); } pintarNR(); },
  'nr-nuevo': () => {
    const t = S.nr.busca.trim(), tel = /\d{3}/.test(t);
    S.nr.nuevo = { nombre: tel ? '' : mayus(t), tel: tel ? t : '', confianza: false };
    pintarNR();
    setTimeout(() => $(tel ? '#nr-nombre' : '#nr-tel')?.focus(), 50);
  },
  'nr-cambiar-cli': () => { S.nr.cliente = null; S.nr.nuevo = null; pintarNR(); setTimeout(() => $('#nr-busca')?.focus(), 50); },
  'nr-confianza': (b) => {
    const on = b.getAttribute('aria-checked') !== 'true';
    b.setAttribute('aria-checked', on);
    if (S.nr.cliente) { S.nr.cliente.confianza = on; const t = $('.nr-cli .nr-tags'); if (t) t.innerHTML = insignias(S.nr.cliente); }
    else if (S.nr.nuevo) S.nr.nuevo.confianza = on;
  },
  'nr-pro': (b) => { S.nr.pro = b.dataset.v; pintarNR(); },
  'nr-dia': (b) => { S.nr.fecha = b.dataset.f; nrProDisponible(); if (S.nr.hora && esHoy(deK(S.nr.fecha)) && minH(S.nr.hora) <= MIN_AHORA) S.nr.hora = null; pintarNR(); },
  'nr-hora': (b) => { S.nr.hora = b.dataset.h; S.nr.otraHora = false; pintarNR(); },
  'nr-otra-hora': () => { S.nr.otraHora = true; pintarNR(); setTimeout(() => $('#nr-hora-libre')?.focus(), 50); },
  'nr-serv': (b) => { S.nr.servicios.push(b.dataset.v); S.nr.eligiendo = false; pintarNR(); },
  'nr-otro': () => { S.nr.eligiendo = true; pintarNR(); },
  'nr-quitar': (b) => { S.nr.servicios.splice(+b.dataset.i, 1); if (!S.nr.servicios.length) S.nr.eligiendo = true; pintarNR(); },
  'nr-dur': (b) => { S.nr.dur = Math.min(240, Math.max(15, nrDur() + +b.dataset.d)); pintarNR(); },
  'nr-precio': (b) => { S.nr.precio = Math.max(0, nrPrecio() + +b.dataset.d); pintarNR(); },
  'nr-reset': () => { S.nr.dur = null; S.nr.precio = null; pintarNR(); },
  'nr-wa': (b) => { S.nr.whatsapp = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', S.nr.whatsapp); },
  'nr-guardar': (b) => {
    const N = S.nr;
    let c = N.cliente;
    if (!c) {
      c = { id: 'n' + Date.now(), nombre: nrNombre(), tel: N.nuevo.tel.trim() || 'Sin teléfono', email: '', visitas: 0, desde: HOY, proFav: N.pro, noShows: 0, pendientes: 0, confianza: !!N.nuevo.confianza, bloqueado: false, proxima: true, first: true };
      clientesDB().push(c);
      clientesDB().sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'));
    }
    const ss = nrServ(), titulo = ss.map((s) => s.nombre).join(' + '), dur = nrDur(), precio = nrPrecio();
    b.disabled = true;
    b.innerHTML = '<span class="spinner"></span>';
    setTimeout(() => {
      nrTramos().forEach((h, i) => {
        S.extra[`${N.fecha}|${N.pro}|${h}`] = { servicio: ss[0].id, pago: 'local', cliente: c.nombre, clienteId: c.id, titulo, min: dur, precio: i ? 0 : precio, cont: i > 0, inicio: N.hora, nota: N.nota, manual: true };
      });
      S.reservasBiz.push({ clienteId: c.id, fecha: deK(N.fecha), hora: N.hora, servicio: { ...ss[0], nombre: titulo, min: dur, precio }, pro: N.pro, estado: 'proxima' });
      if (c.yo) {
        S.citas.push({ servicio: ss[0].id, pro: N.pro, fecha: N.fecha, hora: N.hora, pago: 'local' });
        S.notiCli.unshift({ ic: 'calendario', t: `<b>Sublime Barber Studio</b> te ha reservado <b>${titulo}</b> el ${fLarga(deK(N.fecha))} a las ${N.hora} con ${pro(N.pro).nombre}.`, cuando: 'ahora' });
      }
      S.notiBiz.unshift({ tipo: 'reserva', t: `Cita creada: <b>${esc(c.nombre)}</b> · ${titulo} con ${pro(N.pro).nombre}`, sub: `${mayus(fLarga(deK(N.fecha)))} · ${N.hora}${N.whatsapp ? ' · aviso enviado (app + email)' : ''}`, cuando: 'ahora', first: c.first });
      S.leidasBiz++;
      cerrarHoja();
      S.agendaFecha = deK(N.fecha);
      S.agendaModo = 'dia';
      if (S.agendaPro !== 'todos') S.agendaPro = N.pro;
      S.nr = null;
      if (S.vista !== 'agenda') ir('agenda', { reset: true, dir: 'fundido' }); else render(null, { mantenerScroll: true });
      toast(`Cita reservada: ${c.nombre.split(' ')[0]}, ${N.hora} con ${pro(N.pro).nombre}${N.whatsapp ? '. Aviso enviado por la app y por email' : ''}`);
    }, 600);
  },
  'nr-desde-cliente': () => { const c = clientesDB().find((x) => x.id === S.clienteSel); abrirReservaBiz({ cliente: c, pro: c.proFav }); },
});

/* Botón «Reservar» flotante en el calendario */
envolver(VISTAS.agenda, 'html', function (orig) {
  const [a] = orig();
  return [a, `<button class="fab-reservar" data-a="biz-reservar">${ic('mas')}<span>Reservar</span></button>`];
});
/* Al tocar un hueco libre: reservar directamente en ese hueco */
{
  const orig = A.slot;
  A.slot = (b) => {
    orig(b);
    const t = $('#hoja-gen .hoja__cab b');
    if (!t || !t.textContent.startsWith('Hueco libre')) return;
    $('#hoja-gen .form-hoja').insertAdjacentHTML('afterbegin', `<button class="btn btn--primary btn--block" data-a="nr-hueco" data-p="${b.dataset.p}" data-h="${b.dataset.h}">${ic('mas', 'ic-s')}Reservar en este hueco</button>`);
    $('#hoja-gen .form-hoja .btn--primary:not([data-a="nr-hueco"])')?.classList.replace('btn--primary', 'btn--ghost');
  };
  A['nr-hueco'] = (b) => { cerrarHoja(); setTimeout(() => abrirReservaBiz({ pro: b.dataset.p, hora: b.dataset.h, fecha: kF(S.agendaFecha || HOY) }), 220); };
}
/* Ficha del cliente en Business: botón para reservarle */
envolver(VISTAS.cliente, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<div class="bloque-t">Ficha técnica', `<div class="pad" style="margin-top:18px"><button class="btn btn--primary btn--block" data-a="nr-desde-cliente">${ic('calendario', 'ic-s')}Reservar cita para este cliente</button></div>`)];
});
/* Las citas creadas desde Business aparecen en la ficha del cliente */
{
  const orig = historialCliente;
  historialCliente = (c) => {
    const h = orig(c);
    if (!c.yo) h.prox = [...S.reservasBiz.filter((r) => r.clienteId === c.id), ...h.prox];
    return h;
  };
}
DEMOS.nReservarBiz = () => { abrirApp('negocio', 'agenda'); S.agendaModo = 'dia'; render(null); setTimeout(() => abrirReservaBiz(), 300); };
