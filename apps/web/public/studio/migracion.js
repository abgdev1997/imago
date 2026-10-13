'use strict';
/* «Cámbiate a IMAGO»: migración sin miedo (11/10/2026)
   El problema real: al cambiar de app, la antigua sigue aceptando reservas online durante días o semanas
   y entran citas por los dos lados. Solución en 3 fases:
   1. PREPARAR (días antes): importar clientes, citas futuras, servicios y precios, equipo, horarios y fotos; revisarlo.
   2. DÍA DEL CAMBIO: última importación, apagar las reservas online de la app antigua (sin borrar la cuenta),
      cambiar enlaces (Instagram, Google, web, QR) y avisar a los clientes.
   3. VIGILANCIA (máx. 3 días): IMAGO lee el calendario de la app antigua cada 15 min; si se cuela una cita,
      la añade y avisa; si choca con una de IMAGO, alerta de cita doble. Después: cierre definitivo y baja de la app antigua. */

const ORIGENES = [['booksy', 'Booksy'], ['yeasy', 'Yeasy'], ['treatwell', 'Treatwell'], ['fresha', 'Fresha'], ['google', 'Google Calendar'], ['excel', 'Excel u otra']];
S.mig = S.mig || { paso: 0, origen: null, importado: null, ical: '', vigilando: false, check: {}, dia: null, colada: false };
const PASOS_DIA = [
  ['import', 'Última importación de citas', 'Trae las citas reservadas a última hora en la app antigua.'],
  ['apagar', 'Apagar las reservas online en la app antigua', 'Sin borrar la cuenta: así nadie más reserva allí. Lo hacemos juntos por videollamada.'],
  ['enlaces', 'Cambiar los enlaces', 'Bio de Instagram, botón «Reservar» de Google Maps, tu web y el QR del espejo → IMAGO.'],
  ['aviso', 'Avisar a tus clientes', 'WhatsApp o email desde IMAGO: «A partir de hoy reservamos aquí» con su enlace.'],
];
const CIERRE = [
  ['vacia', 'Ya no quedan citas futuras en la app antigua (todas están en IMAGO)'],
  ['sinentradas', '3 días sin citas nuevas en la app antigua'],
  ['baja', 'Darse de baja de la app antigua (y pedir la copia de tus datos)'],
];
const nombreOrigen = () => (ORIGENES.find((o) => o[0] === S.mig.origen) || [, 'tu app anterior'])[1];

VISTAS.migracion = { padre: 'ajustes', html() {
  const M = S.mig;
  const fases = ['Preparar', 'Día del cambio', 'Vigilancia y cierre'];
  const barra = `<div class="mig-fases">${fases.map((f, i) => `<div class="${i < M.paso ? 'ok' : i === M.paso ? 'on' : ''}"><b>${i < M.paso ? ic('check', 'ic-s') : i + 1}</b><span>${f}</span></div>`).join('')}</div>`;
  let cuerpo = '';
  if (M.paso === 0) {
    cuerpo = `<p class="franja">1 · ¿De dónde vienes?</p>
      <div class="chips">${ORIGENES.map(([id, t]) => `<button class="chip" data-a="mig-origen" data-v="${id}" aria-pressed="${M.origen === id}">${t}</button>`).join('')}</div>
      ${M.origen ? `<p class="franja">2 · Trae tus datos</p>
      <div class="explica">${ic('subir', 'ic-s')}<span>Descarga la copia de tus clientes y citas desde ${nombreOrigen()} (Excel o CSV) y súbela aquí. Si no te deja, se la pides: <b>los datos de tus clientes son tuyos</b> y la ley (RGPD) les obliga a dártelos. Nosotros te ayudamos.</span></div>
      <button class="btn btn--primary btn--block" data-a="mig-importar">${ic('subir', 'ic-s')}${M.importado ? 'Volver a importar' : 'Subir el archivo (ejemplo)'}</button>` : ''}
      ${M.importado ? `<div class="mig-res">${[['Clientes', M.importado.clientes], ['Citas futuras', M.importado.citas], ['Servicios y precios', M.importado.servicios], ['Profesionales', M.importado.pros], ['Horarios', 'sí'], ['Fotos', M.importado.fotos]].map(([t, n]) => `<div><b>${n}</b><small>${t}</small></div>`).join('')}</div>
        <div class="mig-revisa">${ic('alerta', 'ic-s')}<span><b>${M.importado.dudas} clientes</b> aparecen repetidos (mismo teléfono). Los hemos unido; revísalos si quieres.</span></div>
        <p class="franja">3 · Enlazar el calendario de ${nombreOrigen()}</p>
        <p class="muted small" style="line-height:1.5">Así IMAGO ve las citas que entren allí mientras dura el cambio. Copia el «enlace del calendario» (iCal o Google Calendar) desde los ajustes de ${nombreOrigen()}.</p>
        <div class="fila-input"><input id="mig-ical" type="url" placeholder="https://…/calendario.ics" value="${esc(M.ical)}" style="text-transform:none"><button class="btn btn--sm btn--primary" data-a="mig-ical">Enlazar</button></div>
        ${M.vigilando ? `<p class="estado estado--ok" style="align-self:flex-start">${ic('check', 'ic-s')}Calendario enlazado: se revisa cada 15 min</p>` : ''}
        <div class="campo"><label>¿Qué día hacemos el cambio?</label><input id="mig-dia" type="date" value="${M.dia || kF(addD(HOY, 7))}"></div>
        <button class="btn btn--primary btn--block" data-a="mig-siguiente">Todo revisado: ir al día del cambio</button>` : ''}`;
  } else if (M.paso === 1) {
    const hechos = PASOS_DIA.filter(([k]) => M.check[k]).length;
    cuerpo = `<div class="mig-dia">${ic('calendario', 'ic-s')}<span>Día del cambio: <b>${mayus(fLarga(deK(M.dia || kF(HOY))))}</b> · lo hacemos juntos en una videollamada de 30 min</span></div>
      ${PASOS_DIA.map(([k, t, d], i) => `<button class="mig-paso ${M.check[k] ? 'ok' : ''}" data-a="mig-check" data-k="${k}"><span class="mig-paso__n">${M.check[k] ? ic('check', 'ic-s') : i + 1}</span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}
      ${M.check.aviso ? `<div class="wa"><div class="wa__burbuja">¡Hola! 💈 Desde hoy en <b>${NEGOCIOS[0].nombre}</b> reservamos con <b>IMAGO</b>. Tus citas ya están allí. Reserva aquí: imagocitas.com/sublime<small>✓✓</small></div></div>` : ''}
      <button class="btn btn--primary btn--block" data-a="mig-siguiente" ${hechos < PASOS_DIA.length ? 'disabled' : ''}>${hechos < PASOS_DIA.length ? `Faltan ${PASOS_DIA.length - hechos} pasos` : 'Empezar la vigilancia (3 días)'}</button>`;
  } else {
    const hechos = CIERRE.filter(([k]) => M.check[k]).length;
    cuerpo = `<div class="mig-vigila ${M.vigilando ? 'on' : ''}"><span class="punto"></span><span><b>Vigilando ${nombreOrigen()}</b><small>Última revisión hace 3 min · cada 15 min · quedan 2 días</small></span></div>
      ${M.colada ? `<div class="mig-alerta">${ic('alerta', 'ic-s')}<span><b>Se ha colado una cita en ${nombreOrigen()}</b>: Rubén Gil · ${fCorta(addD(HOY, 2))} · 18:00 · Corte. Ya está añadida a tu agenda de IMAGO y no choca con nada.<br><button class="link" data-a="mig-colada-ok">Entendido</button></span></div>` : `<button class="btn btn--ghost btn--block btn--sm" data-a="mig-colada">Simular: entra una cita en ${nombreOrigen()}</button>`}
      <p class="franja">Cierre definitivo</p>
      ${CIERRE.map(([k, t]) => `<button class="mig-paso ${M.check[k] ? 'ok' : ''}" data-a="mig-check" data-k="${k}"><span class="mig-paso__n">${M.check[k] ? ic('check', 'ic-s') : ic('lista', 'ic-s')}</span><span><b>${t}</b></span></button>`).join('')}
      ${hechos === CIERRE.length ? `<div class="mig-fin">${ic('check')}<b>¡Cambio terminado!</b><small>Solo IMAGO a partir de hoy. Durante 30 días tienes soporte prioritario.</small></div>` : ''}`;
  }
  return sub('Cámbiate a IMAGO', `<div class="pad form-hoja" style="padding-top:0">${barra}${cuerpo}
    <p class="faint small">Demostración: la importación y la vigilancia están simuladas.</p></div>`, 'Te traemos todo y, durante 3 días, vigilamos que no se cuele ninguna cita por la app antigua.');
} };
document.addEventListener('change', (e) => { if (e.target.id === 'mig-dia') S.mig.dia = e.target.value; });

Object.assign(A, {
  'mig-origen': (b) => { S.mig.origen = b.dataset.v; render(null, { mantenerScroll: true }); },
  'mig-importar': (b) => {
    b.disabled = true; b.innerHTML = '<span class="spinner"></span>';
    setTimeout(() => { S.mig.importado = { clientes: 412, citas: 37, servicios: 9, pros: 2, fotos: 24, dudas: 6 }; render(null, { mantenerScroll: true }); toast('Datos importados: revísalos antes del día del cambio'); }, 1200);
  },
  'mig-ical': () => { S.mig.ical = $('#mig-ical').value || 'https://calendario-de-ejemplo.ics'; S.mig.vigilando = true; render(null, { mantenerScroll: true }); toast('Calendario enlazado'); },
  'mig-siguiente': () => { if (S.mig.paso === 0 && !S.mig.dia) S.mig.dia = $('#mig-dia')?.value || kF(addD(HOY, 7)); S.mig.paso = Math.min(2, S.mig.paso + 1); S.mig.vigilando = true; render(null); },
  'mig-check': (b) => { const k = b.dataset.k; S.mig.check[k] = !S.mig.check[k]; render(null, { mantenerScroll: true }); },
  'mig-colada': () => { S.mig.colada = true; S.notiBiz.unshift({ tipo: 'reserva', t: `Se ha colado una cita en ${nombreOrigen()}: <b>Rubén Gil</b>. Ya está en IMAGO.`, cuando: 'ahora' }); render(null, { mantenerScroll: true }); },
  'mig-colada-ok': () => { S.mig.colada = false; render(null, { mantenerScroll: true }); },
});
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('ir', 'repetir', 'Cámbiate a IMAGO', 'Trae tus clientes y citas sin perder ninguna', 'migracion')}`, true)];
});
DEMOS.nMigracion = () => { S.mig = { paso: 0, origen: null, importado: null, ical: '', vigilando: false, check: {}, dia: null, colada: false }; abrirApp('negocio', 'ajustes'); ir('migracion'); };
