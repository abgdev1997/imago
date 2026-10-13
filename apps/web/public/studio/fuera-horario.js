'use strict';
/* Servicio fuera de horario (11/10/2026)
   El negocio abre una franja extra fuera de su horario (p. ej., de 21:00 a 22:00) con precio incrementado
   (el doble, ×1,5 o un suplemento fijo). El cliente ve esas horas marcadas «Fuera de horario» con su precio. */

S.fh = { activo: true, desde: '21:00', hasta: '22:00', tipo: 'x2', pros: ['javi', 'adri'], modo: 'semana', dias: [1, 2, 3, 4, 5], fechas: [] };
const FH_TIPOS = [['x1.5', '×1,5'], ['x2', 'El doble'], ['+5', '+5 €'], ['+10', '+10 €']];
const horasExtra = () => { const out = []; for (let m = minH(S.fh.desde); m < minH(S.fh.hasta); m += 15) out.push(hm(m)); return out; };
const esExtra = (h) => S.fh.activo && horasExtra().includes(h);
function precioFuera(p) { const t = S.fh.tipo; return t.startsWith('x') ? Math.round(p * parseFloat(t.slice(1)) * 100) / 100 : p + parseFloat(t.slice(1)); }
function extrasLibres(p, d) {
  const toca = S.fh.modo === 'fechas' ? S.fh.fechas.includes(kF(d)) : S.fh.dias.includes(d.getDay());
  if (!S.fh.activo || !S.fh.pros.includes(p) || !toca || enVacaciones(p, d) || d < HOY) return [];
  const k = kF(d);
  return horasExtra().filter((h) => !S.extra[`${k}|${p}|${h}`] && !(esHoy(d) && minH(h) <= MIN_AHORA + 15));
}
/* En la reserva, las horas fuera de horario cuentan como libres (solo ahí, para no mezclarlas con el resto) */
{
  const orig = libres;
  libres = (p, d) => {
    const base = orig(p, d);
    if (S.vista !== 'reserva' || !p || d.getDay() === 0) return base;
    if (p === 'any') return [...new Set([...base, ...extrasLibres('javi', d), ...extrasLibres('adri', d)])].sort((a, b) => minH(a) - minH(b));
    return [...base, ...extrasLibres(p, d)];
  };
}
{
  const orig = htmlHoras;
  htmlHoras = () => {
    let h = orig();
    if (!S.fh.activo) return h;
    h = h.replace(/<button class="hora([^"]*)" data-a="hora" data-h="(\d\d:\d\d)"([^>]*)>(\d\d:\d\d)/g, (m, cls, hora, resto, txt) => (esExtra(hora) ? `<button class="hora hora--fuera${cls}" data-a="hora" data-h="${hora}"${resto}>${txt}<i>${FH_TIPOS.find((t) => t[0] === S.fh.tipo)[1].replace('El doble', '×2')}</i>` : m));
    if (/hora--fuera/.test(h)) h += `<p class="fh-nota">${ic('reloj', 'ic-s')}<span>Las horas marcadas son <b>fuera de horario</b>: se puede reservar, pero con precio incrementado.</span></p>`;
    return h;
  };
  const origPaso = htmlPaso;
  htmlPaso = (dir) => {
    let h = origPaso(dir);
    const R = S.reserva;
    if (R.paso === 3 && R.hora && esExtra(R.hora) && R.servicio) {
      const s = serv(R.servicio);
      h = h.replace('<div class="pagos">', `<p class="fh-nota">${ic('reloj', 'ic-s')}<span><b>Cita fuera de horario:</b> pagas <b>${eur(precioFuera(s.precio))}</b> en vez de ${eur(s.precio)}.</span></p><div class="pagos">`);
    }
    return h;
  };
}
/* Guardar el precio incrementado en la cita */
{
  const conf = A.confirmar;
  A.confirmar = (b) => {
    const R = S.reserva, extra = R.hora && esExtra(R.hora);
    conf(b);
    if (!extra) return;
    setTimeout(() => {
      const quien = R.pro === 'any' ? 'adri' : R.pro;
      const k = `${R.fecha}|${quien}|${R.hora}`;
      if (S.extra[k]) Object.assign(S.extra[k], { fueraHorario: true, precio: precioFuera(serv(R.servicio).precio) });
    }, 1300);
  };
}

/* Business → Ajustes → Fuera de horario */
VISTAS['fuera-horario'] = { padre: 'ajustes', html() {
  const F = S.fh, opts = (sel) => ['19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00'].map((h) => `<option ${h === sel ? 'selected' : ''}>${h}</option>`).join('');
  const ej = serv('corte');
  return sub('Fuera de horario', `<div class="pad form-hoja" style="padding-top:0">
    <div class="ajuste"><span><b>Permitir reservas fuera de horario</b><small>Franja extra con precio incrementado</small></span><button class="switch" role="switch" aria-checked="${F.activo}" data-a="fh-sw" aria-label="Permitir fuera de horario"></button></div>
    <div class="nt-fila"><div class="campo"><label>Desde</label><select id="fh-desde">${opts(F.desde)}</select></div><div class="campo"><label>Hasta</label><select id="fh-hasta">${opts(F.hasta)}</select></div></div>
    <div class="campo"><label>Precio</label>${segmento(FH_TIPOS, F.tipo, 'fh-tipo')}</div>
    <div class="campo"><label>¿Quién atiende fuera de horario?</label><div class="chips">${EQUIPO.map((p) => `<button class="chip" data-a="fh-pro" data-v="${p.id}" aria-pressed="${F.pros.includes(p.id)}">${p.nombre}</button>`).join('')}</div></div>
    <div class="campo"><label>¿Qué días?</label>${segmento([['semana', 'Días de la semana'], ['fechas', 'Fechas concretas']], F.modo, 'fh-modo')}</div>
    ${F.modo === 'semana' ? `<div class="chips">${[[1, 'L'], [2, 'M'], [3, 'X'], [4, 'J'], [5, 'V'], [6, 'S']].map(([d, t]) => `<button class="chip" data-a="fh-dia" data-v="${d}" aria-pressed="${F.dias.includes(d)}">${t}</button>`).join('')}</div>`
      : `<div class="fila-input"><input id="fh-fecha" type="date" min="${kF(HOY)}" style="text-transform:none"><button class="btn btn--sm btn--primary" data-a="fh-add">Añadir</button></div>
      <div class="chips">${F.fechas.length ? F.fechas.map((f) => `<button class="chip" data-a="fh-quitar" data-v="${f}" aria-pressed="true">${fCorta(deK(f))} ✕</button>`).join('') : '<span class="faint small">Aún no hay fechas. Añade los días en que abrirás fuera de horario.</span>'}</div>`}
    <div class="explica">${ic('reloj', 'ic-s')}<span>Ejemplo: un <b>${ej.nombre}</b> de ${eur(ej.precio)} reservado a las ${F.desde} cuesta <b>${eur(precioFuera(ej.precio))}</b>. El cliente lo ve claro antes de confirmar.</span></div>
    <button class="btn btn--primary btn--block" data-a="fh-guardar">Guardar</button></div>`, 'Para quien no puede venir en tu horario normal y está dispuesto a pagar más.');
} };
Object.assign(A, {
  'fh-sw': (b) => { S.fh.activo = !S.fh.activo; b.setAttribute('aria-checked', S.fh.activo); },
  'fh-tipo': (b) => { S.fh.tipo = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'fh-pro': (b) => { const v = b.dataset.v; S.fh.pros = S.fh.pros.includes(v) ? S.fh.pros.filter((x) => x !== v) : [...S.fh.pros, v]; b.setAttribute('aria-pressed', S.fh.pros.includes(v)); },
  'fh-dia': (b) => { const v = +b.dataset.v; S.fh.dias = S.fh.dias.includes(v) ? S.fh.dias.filter((x) => x !== v) : [...S.fh.dias, v]; b.setAttribute('aria-pressed', S.fh.dias.includes(v)); },
  'fh-modo': (b) => { S.fh.modo = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'fh-add': () => { const v = $('#fh-fecha').value; if (!v) return toast('Elige una fecha'); if (!S.fh.fechas.includes(v)) S.fh.fechas.push(v); S.fh.fechas.sort(); render(null, { mantenerScroll: true }); },
  'fh-quitar': (b) => { S.fh.fechas = S.fh.fechas.filter((x) => x !== b.dataset.v); render(null, { mantenerScroll: true }); },
  'fh-guardar': () => {
    const d = $('#fh-desde').value, h = $('#fh-hasta').value;
    if (minH(h) <= minH(d)) return toast('La hora de fin tiene que ser posterior');
    if (S.fh.modo === 'fechas' && !S.fh.fechas.length) return toast('Añade al menos una fecha');
    S.fh.desde = d; S.fh.hasta = h; volver();
    toast(S.fh.activo ? `Fuera de horario activado: ${d}–${h} · ${FH_TIPOS.find((t) => t[0] === S.fh.tipo)[1].toLowerCase()}` : 'Fuera de horario desactivado');
  },
});
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('ir', 'reloj', 'Fuera de horario', S.fh.activo ? `${S.fh.desde}–${S.fh.hasta} · ${FH_TIPOS.find((t) => t[0] === S.fh.tipo)[1].toLowerCase()}` : 'Desactivado', 'fuera-horario')}`, true)];
});
DEMOS.nFueraHorario = () => { abrirApp('negocio', 'ajustes'); ir('fuera-horario'); };
DEMOS.nFueraHorarioCli = () => { abrirApp('cliente', 'inicio'); S.historial = ['inicio']; empezarReserva({ servicio: 'corte', fecha: kF(addD(HOY, HOY.getDay() === 6 ? 2 : 1)) }); };
