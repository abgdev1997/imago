'use strict';
/* Comisiones por profesional (11/10/2026)
   El gerente fija el % de cada servicio que se lleva cada profesional (p. ej., Adri 45 %). Solo lo ve el gerente.
   Se aplica a las ventas nuevas y, si se elige, a todo el mes en curso; así las estadísticas y la caja cuadran. */

VISTAS.comisiones = { padre: 'ajustes', html() {
  if (typeof esGerente === 'function' && !esGerente()) return bloqueoGerente('Comisiones');
  const ini = +new Date(HOY.getFullYear(), HOY.getMonth(), 1);
  return sub('Comisiones', `<div class="pad form-hoja" style="padding-top:0">
    ${EQUIPO.map((p) => {
      const v = S.ventas.filter((x) => x.pro === p.id && x.t >= ini);
      const serv_ = v.filter((x) => x.tipo === 's').reduce((a, x) => a + x.precio, 0);
      const com = v.reduce((a, x) => a + (x.com || 0), 0);
      return `<div class="com-pro"><div class="com-pro__cab"><img src="${p.img}" alt=""><span><b>${p.completo}</b><small>${p.propietario ? 'Propietario: no lleva comisión' : `Este mes: ${eur(Math.round(serv_))} en servicios → ${eur(Math.round(com))} de comisión`}</small></span></div>
        ${p.propietario ? '' : `<div class="nr-ajuste"><button class="icon-btn" data-a="com-mas" data-p="${p.id}" data-d="-5" aria-label="Bajar">${ic('menos', 'ic-s')}</button><span><b id="com-${p.id}">${p.comisionServicios} %</b><small>de cada servicio que haga</small></span><button class="icon-btn" data-a="com-mas" data-p="${p.id}" data-d="5" aria-label="Subir">${ic('mas', 'ic-s')}</button></div>
        <div class="ajuste"><span><b>Aplicarlo también a este mes</b><small>Recalcula sus servicios desde el día 1</small></span><button class="switch" role="switch" aria-checked="${!!S.comMes?.[p.id]}" data-a="com-mes" data-p="${p.id}" aria-label="Aplicar a este mes"></button></div>
        <button class="btn btn--primary btn--block" data-a="com-guardar" data-p="${p.id}">Guardar ${p.nombre}</button>`}</div>`;
    }).join('')}
    <p class="faint small">Solo lo ve el gerente. La comisión de cada producto se fija en Servicios y productos. La propina va entera al profesional.</p></div>`, 'El porcentaje que se lleva cada profesional de cada servicio.');
} };
Object.assign(A, {
  'com-mas': (b) => { const p = pro(b.dataset.p); S.comBorr = S.comBorr || {}; const v = Math.max(0, Math.min(100, (S.comBorr[p.id] ?? p.comisionServicios) + +b.dataset.d)); S.comBorr[p.id] = v; $(`#com-${p.id}`).textContent = `${v} %`; },
  'com-mes': (b) => { S.comMes = S.comMes || {}; S.comMes[b.dataset.p] = !S.comMes[b.dataset.p]; b.setAttribute('aria-checked', S.comMes[b.dataset.p]); },
  'com-guardar': (b) => {
    const p = pro(b.dataset.p), v = S.comBorr?.[p.id] ?? p.comisionServicios;
    p.comisionServicios = v;
    let n = 0;
    if (S.comMes?.[p.id]) { const ini = +new Date(HOY.getFullYear(), HOY.getMonth(), 1); S.ventas.forEach((x) => { if (x.pro === p.id && x.tipo === 's' && x.t >= ini) { x.com = (x.precio * v) / 100; n++; } }); }
    render(null, { mantenerScroll: true });
    toast(`${p.nombre}: ${v} % de cada servicio${n ? ` (recalculados ${n} servicios de este mes)` : ' a partir de ahora'}`);
  },
});
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  if (typeof esGerente === 'function' && !esGerente()) return [a];
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('ir', 'euro', 'Comisiones', EQUIPO.filter((p) => !p.propietario).map((p) => `${p.nombre} ${p.comisionServicios} %`).join(' · ') + ' · solo gerente', 'comisiones')}`, true)];
});
DEMOS.nComisiones = () => { S.rolBiz = 'gerente'; abrirApp('negocio', 'ajustes'); ir('comisiones'); };
