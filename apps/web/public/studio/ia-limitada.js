'use strict';
/* IA limitada a funciones concretas (11/10/2026)
   · Clientes: encontrar negocios por necesidad (tipo, precio, cerca, mejor valorado) o por nombre + pedir cita.
   · Business: listas de clientes (inasistencias, bloqueados, confianza, nuevos, pendientes de cobro) para todo el equipo;
     facturación y estadísticas SOLO para el gerente.
   · Fuera de eso, la IA dice amablemente qué puede hacer (así se controla el coste y el uso).
   · Inasistencias: marcar «No vino» desde la agenda, filtro y lista de últimas inasistencias en Clientes. */

Object.assign(S, { rolBiz: 'gerente', inasistencias: [] });
const esGerente = () => S.rolBiz === 'gerente';
const yoBiz = () => (esGerente() ? pro('javi') : pro('adri'));

/* =====================================================================
   IA de clientes: buscar negocios
   ===================================================================== */
const CAT_KW = [
  ['barberia', /barber|barbero/], ['peluqueria', /peluquer|peinad|mechas|tinte/], ['unas', /\bunas\b|manicura|pedicura|nail/],
  ['facial', /facial|estetica|depila|cejas|pestan|limpieza de cutis/], ['fisio', /fisio|masaje|contractura|espalda|lesion/], ['psico', /psicolog|ansiedad|terapia/],
  ['tatuajes', /tatu|tattoo|piercing/], ['perros', /perro|canin|mascota/],
];
const FUERA_CLIENTE = /receta|chiste|futbol|politic|tiempo hace|clima|noticia|deberes|traduce|poema|cancion|programa|codigo|bitcoin|invertir|medic(o|ina)|diagnost/;
function buscarNegocios(t) {
  if (/donde esta|direcc|como llego|llegar/.test(t)) return null;
  const porNombre = NEGOCIOS.filter((n) => {
    const nn = norm(n.nombre);
    if (t.includes(nn)) return true;
    return nn.split(/\s+/).filter((w) => w.length >= 4 && !['barberia', 'estudio', 'studio', 'barber', 'estetica', 'club'].includes(w)).some((w) => new RegExp('\\b' + w).test(t));
  });
  if (porNombre.length) return { lista: porNombre, motivo: 'nombre' };
  let cats = CAT_KW.filter(([, re]) => re.test(t)).map(([c]) => c);
  const barato = /barat|economic|precio bajo|poco dinero|asequible|low cost|mas barat/.test(t);
  const cerca = /cerca|al lado|proxim|cercan|andando/.test(t);
  const mejor = /mejor|bueno|valorad|recomend|top|calidad/.test(t);
  const rapido = /rapid|ya mismo|sin esperar|hoy mismo|ahora/.test(t);
  const servicio = /corte|cortar|pelar|pelo|barba|degradado|fade/.test(t);
  if (!cats.length && servicio && (barato || cerca || mejor || /busco|necesito|sitio|lugar/.test(t))) cats = ['barberia', 'peluqueria'];
  if (!cats.length) return null;
  let l = NEGOCIOS.filter((n) => cats.includes(n.cat) || (cats.includes('fisio') && n.tags.some((x) => x === 'fisio' || x === 'masaje')) || (cats.includes('psico') && n.tags.includes('psicologia')));
  if (!l.length) return { lista: [], motivo: 'vacio', cats };
  const orden = barato ? (a, b) => a.precioMedio - b.precioMedio : cerca ? (a, b) => distancia(a) - distancia(b) : rapido ? (a, b) => (a.espera === 'rapida' ? -1 : 0) - (b.espera === 'rapida' ? -1 : 0) || distancia(a) - distancia(b) : (a, b) => b.nota - a.nota || distancia(a) - distancia(b);
  l = [...l].sort(orden).slice(0, 3);
  return { lista: l, motivo: barato ? 'barato' : cerca ? 'cerca' : rapido ? 'rapido' : 'mejor', cats };
}
const proximoTexto = () => { const h = proximoHueco(); return h ? `${mayus(fRel(h.fecha))} · ${h.hora}` : 'Lista de espera'; };
function tarjetasNegocio(l) {
  return l.map((n, i) => `<button class="match" data-a="${n.real ? 'cuest-ver' : 'negocio-ej'}" data-n="${esc(n.nombre)}"><span class="match__img">${arteNegocio(n)}</span><span class="match__txt"><b>${n.nombre}</b>${i === 0 ? '<span class="match__top">Mejor opción</span>' : ''}<small>${n.tipo} · ${fDist(n)} · ${nota(n)} ★ · desde ${eur(n.precioDesde)}</small><span class="match__razones"><span class="pill">${n.proximo || proximoTexto()}</span></span></span></button>`).join('');
}
{
  const orig = respuestaCliente;
  respuestaCliente = (t) => {
    if (FUERA_CLIENTE.test(t)) return ['Solo puedo ayudarte con <b>IMAGO</b>: encontrar un sitio (barbería, peluquería, uñas, fisio…), pedir cita y resolver dudas de servicios, precios y pagos. ¿Qué necesitas?', { chips: ['Una barbería barata cerca', 'Corte y barba el viernes por la tarde', 'Busca Barbería Norte'] }];
    const r = buscarNegocios(t.replace(/^busca(r)?\s+/, ''));
    if (r && r.motivo === 'vacio') return ['Todavía no hay negocios de ese tipo cerca de ti en IMAGO. Te aviso en cuanto se una alguno.', { chips: ['Una barbería barata cerca'] }];
    if (r) {
      const intro = { nombre: r.lista.length > 1 ? 'He encontrado estos negocios con ese nombre:' : 'Aquí lo tienes:', barato: 'Los más <b>económicos</b> cerca de ti:', cerca: 'Los que tienes <b>más cerca</b>:', rapido: 'Los que suelen tener <b>hueco antes</b>:', mejor: 'Los <b>mejor valorados</b> cerca de ti:' }[r.motivo];
      const extra = r.motivo === 'barato' ? ` <b>${r.lista[0].nombre}</b> tiene un precio medio de ${eur(r.lista[0].precioMedio)}.` : '';
      return [`${intro}${extra} Toca uno para ver su ficha y reservar.`, { opciones: `<div class="ia-negocios">${tarjetasNegocio(r.lista)}</div>`, chips: r.motivo === 'barato' ? ['Los mejor valorados', 'Los más cerca'] : ['Los más baratos', 'Los más cerca'] }];
    }
    if (/los mas baratos/.test(t)) return respuestaCliente('barberia barata');
    if (/los mas cerca/.test(t)) return respuestaCliente('barberia cerca');
    if (/los mejor valorados/.test(t)) return respuestaCliente('mejor barberia');
    const [html, extra] = orig(t);
    if (/En este prototipo entiendo/.test(html)) return ['Puedo ayudarte a <b>encontrar un sitio</b> («una barbería barata cerca», «busca Raíz Estudio»), a <b>pedir cita</b> («corte y barba el viernes por la tarde») y con dudas de precios, pagos o cancelaciones.', { chips: ['Una barbería barata cerca', 'Corte y barba el viernes por la tarde'] }];
    return [html, extra];
  };
}

/* =====================================================================
   IA de Business: clientes para todos, facturación solo gerente
   ===================================================================== */
function todasInasistencias() {
  const l = [...S.inasistencias];
  clientesDB().forEach((c) => {
    if (c.yo || !c.noShows) return;
    historialCliente(c).pas.filter((x) => x.estado === 'no-vino').forEach((x) => l.push({ nombre: c.nombre, id: c.id, fecha: x.fecha, hora: x.hora, servicio: x.servicio.nombre, pro: x.pro }));
  });
  return l.sort((a, b) => b.fecha - a.fecha || minH(b.hora) - minH(a.hora));
}
const filaCliIA = (c, extra) => `<button class="op-ia" data-a="ia-cli" data-id="${c.id}">${sil()}<div><b>${esc(c.nombre)}</b><small>${extra}</small></div>${ic('sig')}</button>`;
const SOLO_GERENTE = ['Eso es información del <b>gerente</b>: la facturación, las comisiones y las estadísticas solo las ve él. Puedo ayudarte con tus citas y con los clientes.', { chips: ['¿Quién ha faltado más?', 'Últimas inasistencias', 'Huecos libres mañana'] }];
const FUERA_BIZ = /receta|chiste|futbol|politic|clima|noticia|poema|cancion|bitcoin|invertir/;
function periodoTexto(t) {
  const y = HOY.getFullYear(), m = HOY.getMonth();
  if (/hoy/.test(t)) return { ini: +HOY, fin: +addD(HOY, 1), prev: [+addD(HOY, -7), +addD(HOY, -6)], nombre: 'hoy', vs: 'el mismo día de la semana pasada' };
  if (/ayer/.test(t)) return { ini: +addD(HOY, -1), fin: +HOY, prev: [+addD(HOY, -8), +addD(HOY, -7)], nombre: 'ayer', vs: 'una semana antes' };
  if (/semana/.test(t)) { const l = lunesDe(HOY); return { ini: +l, fin: +addD(HOY, 1), prev: [+addD(l, -7), +addD(HOY, -6)], nombre: 'esta semana', vs: 'la semana pasada a estas alturas' }; }
  if (/ano|anual/.test(t)) return { ini: +new Date(y, 0, 1), fin: +addD(HOY, 1), prev: [+new Date(y - 1, 0, 1), +new Date(y - 1, m, HOY.getDate() + 1)], nombre: `en ${y}`, vs: `${y - 1} a estas alturas` };
  if (/mes pasado|ultimo mes/.test(t)) return { ini: +new Date(y, m - 1, 1), fin: +new Date(y, m, 1), prev: [+new Date(y, m - 2, 1), +new Date(y, m - 1, 1)], nombre: 'el mes pasado', vs: 'el mes anterior' };
  return { ini: +new Date(y, m, 1), fin: +addD(HOY, 1), prev: [+new Date(y, m - 1, 1), +new Date(y, m - 1, HOY.getDate() + 1)], nombre: 'este mes', vs: 'el mes pasado a estas alturas' };
}
{
  const orig = respuestaNegocio;
  respuestaNegocio = (t) => {
    if (FUERA_BIZ.test(t)) return ['Solo te ayudo con tu negocio: <b>clientes</b> (quién falta, bloqueados, nuevos…), <b>huecos</b> de la agenda' + (esGerente() ? ' y <b>facturación y estadísticas</b>.' : '.'), { chips: chipsBiz() }];
    // Inasistencias
    if (/ultim.*(inasist|falt|no vin|plant)|inasistencias recientes|lista de inasist/.test(t)) {
      const l = todasInasistencias().slice(0, 6);
      if (!l.length) return ['No hay inasistencias registradas. 👌', {}];
      return [`Últimas <b>inasistencias</b>:`, { opciones: l.map((x) => { const c = clientesDB().find((y) => y.id === x.id || y.nombre === x.nombre); return c ? filaCliIA(c, `${mayus(fCorta(x.fecha))} · ${x.hora} · ${x.servicio} · con ${pro(x.pro).nombre}`) : ''; }).join(''), chips: ['¿Quién ha faltado más?', 'Ir a inasistencias'] }];
    }
    if (/falla|fallad|falta|no vien|no vino|no se presenta|inasist|plant|ausen/.test(t)) {
      const l = clientesDB().filter((c) => c.noShows > 0).sort((a, b) => b.noShows - a.noShows).slice(0, 6);
      const total = clientesDB().reduce((a, c) => a + c.noShows, 0) + S.inasistencias.length;
      return [`Los clientes que <b>más han faltado</b> (${total} inasistencias en total). Si quieres, a los que faltan mucho les pido señal o los bloqueas desde su ficha:`, { opciones: l.map((c) => filaCliIA(c, `${c.noShows} ${c.noShows === 1 ? 'vez' : 'veces'} sin venir · ${c.visitas} visitas${c.bloqueado ? ' · bloqueado' : ''}`)).join(''), chips: ['Últimas inasistencias', 'Clientes bloqueados'] }];
    }
    if (/bloquead/.test(t)) {
      const l = clientesDB().filter((c) => c.bloqueado);
      return [l.length ? `Tienes <b>${l.length} cliente${l.length > 1 ? 's' : ''} bloqueado${l.length > 1 ? 's' : ''}</b>: no pueden reservar en IMAGO.` : 'No tienes a nadie bloqueado.', { opciones: l.map((c) => filaCliIA(c, `${c.noShows} inasistencias · ${c.tel}`)).join(''), chips: ['¿Quién ha faltado más?'] }];
    }
    if (/confianza/.test(t)) {
      const l = clientesDB().filter((c) => c.confianza);
      return [`<b>${l.length} clientes de confianza</b> (no pagan señal):`, { opciones: l.slice(0, 6).map((c) => filaCliIA(c, `${c.visitas} visitas`)).join('') }];
    }
    if (/nuevo|first|primera vez/.test(t)) {
      const l = clientesDB().filter((c) => c.first);
      return [`<b>${l.length} clientes nuevos</b> esta semana (salen con la etiqueta FIRST):`, { opciones: l.map((c) => filaCliIA(c, 'Primera reserva · ' + c.tel)).join('') }];
    }
    if (/pendiente|debe|sin cobrar|sin pagar/.test(t)) {
      const l = clientesDB().filter((c) => c.pendientes);
      return [l.length ? `<b>${l.length} clientes</b> tienen alguna cita pendiente de cobro:` : 'No hay nada pendiente de cobro.', { opciones: l.map((c) => filaCliIA(c, `${c.pendientes} cita pendiente`)).join('') }];
    }
    if (/mejores clientes|mas vienen|fieles|habituales/.test(t)) {
      const l = [...clientesDB()].filter((c) => !c.yo).sort((a, b) => b.visitas - a.visitas).slice(0, 5);
      return ['Tus clientes <b>más fieles</b>:', { opciones: l.map((c) => filaCliIA(c, `${c.visitas} visitas · suele ir con ${pro(c.proFav).nombre}`)).join('') }];
    }
    if (/ir a inasistencias/.test(t)) { setTimeout(() => { cerrarHoja(); S.cliFiltro = 'inasistencias'; ir('clientes', { reset: true, dir: 'fundido' }); }, 300); return ['Te llevo a Clientes → Inasistencias.', {}]; }
    // Facturación y estadísticas: solo gerente
    const pideDinero = /factur|caja|llevamos|ganad|ingres|estadist|comision|nomina|producto|vendido|vende|ticket|dinero|cuanto hemos|beneficio|servicio mas/.test(t);
    if (pideDinero && !esGerente()) return SOLO_GERENTE;
    if (/factur|ingres|ganad|estadist|cuanto hemos|ticket|dinero/.test(t) && !/^cuanto llevamos hoy|caja de hoy/.test(t)) {
      const P = periodoTexto(t);
      const v = ventasEntre(P.ini, P.fin), r = resumenVentas(v), rp = resumenVentas(ventasEntre(...P.prev));
      const dif = rp.total ? Math.round(((r.total - rp.total) / rp.total) * 100) : 0;
      const porPro = EQUIPO.map((p) => `<li>${p.nombre}: <b>${eur(v.filter((x) => x.pro === p.id).reduce((a, x) => a + x.precio, 0))}</b></li>`).join('');
      const m = new Map(); v.filter((x) => x.tipo === 's').forEach((x) => m.set(x.id, (m.get(x.id) || 0) + 1));
      const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
      return [`Facturación ${P.nombre}: <b>${eur(r.total)}</b> (${dif >= 0 ? "+" : ""}${dif} % frente a${P.vs.startsWith('el ') ? 'l ' + P.vs.slice(3) : ' ' + P.vs}).<br>${r.citas} servicios · ticket medio ${eur(Math.round(r.ticket * 100) / 100)} · ${r.uds} productos.<ul>${porPro}</ul>${top ? `El servicio más pedido: <b>${serv(top[0]).nombre}</b> (${top[1]}).` : ''}`, { opciones: `<button class="op-ia" data-a="ia-ir" data-v="stats">${ic('grafico')}<div><b>Ver estadísticas</b></div>${ic('sig')}</button>`, chips: ['Facturación de esta semana', 'Facturación del año', 'Comisiones del mes'] }];
    }
    const [html, extra] = orig(t);
    if (/En el prototipo te respondo/.test(html)) return [`Puedo ayudarte con los <b>clientes</b> (quién ha faltado más, bloqueados, nuevos, pendientes de cobro) y los <b>huecos</b>${esGerente() ? ', y como gerente también con la <b>facturación</b> y las <b>estadísticas</b>' : ''}.`, { chips: chipsBiz() }];
    if (extra && extra.chips) extra.chips = extra.chips.filter((c) => esGerente() || !/comision|llevamos|vendido/i.test(norm(c)));
    return [html, extra];
  };
}
const chipsBiz = () => (esGerente() ? ['¿Quién ha faltado más?', 'Facturación de este mes', 'Clientes bloqueados', '¿Cuánto llevamos hoy?'] : ['¿Quién ha faltado más?', 'Últimas inasistencias', 'Clientes bloqueados', 'Huecos libres mañana']);
{
  const orig = saludoIA;
  saludoIA = (ctx) => {
    if (ctx === 'negocio') return [esGerente()
      ? 'Hola, <b>Javi</b> (gerente). Pregúntame por tus <b>clientes</b> (quién falta más, bloqueados, nuevos), los <b>huecos</b> y la <b>facturación</b>.'
      : 'Hola, <b>Adri</b>. Te ayudo con los <b>clientes</b> y los <b>huecos</b>. La facturación y las estadísticas solo las ve el gerente.', chipsBiz()];
    return orig(ctx);
  };
}
const ctxRol = () => { ctxIA = null; };

/* =====================================================================
   Permisos: gerente / empleado
   ===================================================================== */
function bloqueoGerente(titulo) {
  return sub(titulo, `<div class="vacio" style="padding-top:30px">${ic('escudo')}<b style="color:var(--fg)">Solo para el gerente</b>Las cifras de facturación, comisiones y estadísticas solo las ve el gerente. Pídeselas a Javi o cámbiate de rol en Ajustes.</div>`);
}
envolver(VISTAS.stats, 'html', function (orig) { return esGerente() ? orig() : bloqueoGerente('Estadísticas'); });
for (const v of [VISTAS.stats, VISTAS.transacciones]) if (v.montar) envolver(v, 'montar', function (orig, ...args) { if (esGerente()) return orig(...args); });
envolver(VISTAS.transacciones, 'html', function (orig) { return esGerente() ? orig() : bloqueoGerente('Transacciones'); });
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  const fila = `<div class="pad rol-caja"><p class="franja" style="padding:0 0 8px">Has entrado como</p>${segmento([['gerente', 'Gerente · Javi'], ['empleado', 'Empleado · Adri']], S.rolBiz, 'rol-biz')}<p class="faint small" style="margin-top:8px">${esGerente() ? 'Ves todo: facturación, comisiones y estadísticas.' : 'Sin acceso a facturación ni estadísticas (ni en la IA).'}</p></div>`;
  return [conMarco(a, '<p class="franja pad">Gestión</p>', fila)];
});
/* En Caja, el empleado no ve el total del día */
envolver(VISTAS.caja, 'html', function (orig) {
  const r = orig();
  if (esGerente()) return r;
  r[0] = r[0].replace(/<div class="caja-hoy">[\s\S]*?(?=<div class="bloque-t">Nuevo ticket)/, `<div class="caja-hoy caja-hoy--bloq"><span class="eyebrow">Caja de hoy</span><b>${ic('escudo', 'ic-s')} Solo la ve el gerente</b></div>`);
  return r;
});

/* =====================================================================
   Inasistencias: marcar «No vino», filtro y lista en Clientes
   ===================================================================== */
{
  const orig = A.slot;
  A.slot = (b) => {
    orig(b);
    const t = $('#hoja-gen .hoja__cab b');
    if (!t || t.textContent.startsWith('Hueco libre')) return;
    const d = S.agendaFecha || HOY;
    const yaPaso = d < HOY || (esHoy(d) && minH(b.dataset.h) <= MIN_AHORA);
    const marcada = S.inasistencias.some((x) => kF(x.fecha) === kF(d) && x.hora === b.dataset.h && x.pro === b.dataset.p);
    $('#hoja-gen .form-hoja').insertAdjacentHTML('beforeend', marcada
      ? `<p class="estado estado--mal" style="align-self:center">Marcada como «No vino»</p>`
      : yaPaso ? `<button class="btn btn--ghost btn--block btn-novino" data-a="no-vino" data-p="${b.dataset.p}" data-h="${b.dataset.h}">${ic('cerrar', 'ic-s')}Marcar «No vino»</button>` : '<p class="faint small" style="text-align:center">Podrás marcar «No vino» cuando pase la hora de la cita.</p>');
  };
}
A['no-vino'] = (b) => {
  const d = S.agendaFecha || HOY, p = b.dataset.p, h = b.dataset.h;
  const c = ocupada(p, d, h);
  const cli = clientesDB().find((x) => x.nombre === c.cliente) || clientesDB().find((x) => norm(x.nombre).startsWith(norm(c.cliente)));
  S.inasistencias.unshift({ nombre: cli ? cli.nombre : c.cliente, id: cli?.id, fecha: d, hora: c.inicio || h, servicio: c.servicio.nombre, pro: p });
  if (cli) cli.noShows++;
  cerrarHoja();
  render(null, { mantenerScroll: true });
  toast(`${c.cliente} marcado como «No vino»${cli && cli.noShows >= 3 ? `. Lleva ${cli.noShows}: valora pedirle señal o bloquearlo` : ''}`);
};
/* Filtro «Inasistencias» en Clientes, ordenado por quién falta más, con las últimas arriba */
{
  const origLista = listaClientes;
  listaClientes = () => {
    if (S.cliFiltro !== 'inasistencias') return origLista();
    const q = norm(S.cliBusca.trim());
    const l = clientesDB().filter((c) => c.noShows > 0 && (!q || norm(c.nombre).includes(q) || c.tel.replace(/\s/g, '').includes(q.replace(/\s/g, '')))).sort((a, b) => b.noShows - a.noShows);
    const ult = todasInasistencias().slice(0, 5);
    const total = clientesDB().reduce((a, c) => a + c.noShows, 0);
    return `<div class="ina-res"><div><b>${total}</b><small>inasistencias</small></div><div><b>${l.length}</b><small>clientes</small></div><div><b>${l.filter((c) => c.noShows >= 2).length}</b><small>repiten</small></div></div>
      ${q ? '' : `<p class="franja">Últimas inasistencias</p>${ult.map((x) => `<button class="cli" data-a="cliente" data-id="${x.id || ''}" ${x.id ? '' : 'disabled'}><span class="ina-fecha"><b>${x.fecha.getDate()}</b><small>${x.fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</small></span><span class="cli__txt"><b>${esc(x.nombre)}</b><small>${x.hora} · ${x.servicio} · con ${pro(x.pro).nombre}</small></span><span class="estado estado--mal">No vino</span></button>`).join('')}`}
      <p class="franja">Quién falta más</p>
      ${l.map((c) => `<button class="cli" data-a="cliente" data-id="${c.id}">${sil()}<span class="cli__txt"><b>${esc(c.nombre)}</b><small>${c.visitas} visitas · ${c.tel}</small></span><span class="cli__tags">${c.bloqueado ? insignias(c) : ''}<span class="ina-n ${c.noShows >= 2 ? 'mal' : ''}">${c.noShows} ${c.noShows === 1 ? 'falta' : 'faltas'}</span></span></button>`).join('') || '<div class="vacio">Nadie ha faltado. 👌</div>'}`;
  };
}
envolver(VISTAS.clientes, 'html', function (orig) {
  const [a] = orig();
  return [a.replace(`<button class="chip" data-a="cli-filtro" data-v="bloqueados"`, `<button class="chip" data-a="cli-filtro" data-v="inasistencias" aria-pressed="${S.cliFiltro === 'inasistencias'}">Inasistencias</button><button class="chip" data-a="cli-filtro" data-v="bloqueados"`)];
});

Object.assign(A, {
  'ia-cli': (b) => { cerrarHoja(); S.clienteSel = b.dataset.id; setTimeout(() => { if (S.vista !== 'clientes') ir('clientes', { reset: true, dir: 'fundido' }); ir('cliente'); }, 220); },
  'rol-biz': (b) => { S.rolBiz = b.dataset.v; moverSegmento(b); ctxRol(); setTimeout(() => render(null, { mantenerScroll: true }), 160); toast(esGerente() ? 'Ahora eres gerente: ves facturación y estadísticas' : 'Ahora eres empleado: sin facturación ni estadísticas'); },
});
DEMOS.nIaCliente = () => { abrirApp('cliente', 'inicio'); setTimeout(() => abrirIA({ pregunta: 'Quiero una barbería que me corten el pelo barato' }), 400); };
DEMOS.nIaGerente = () => { S.rolBiz = 'gerente'; ctxRol(); abrirApp('negocio', 'agenda'); setTimeout(() => abrirIA({ pregunta: '¿Quién ha faltado más?' }), 400); };
DEMOS.nIaEmpleado = () => { S.rolBiz = 'empleado'; ctxRol(); abrirApp('negocio', 'agenda'); setTimeout(() => abrirIA({ pregunta: 'Facturación de este mes' }), 400); };
DEMOS.nInasistencias = () => { abrirApp('negocio', 'clientes'); S.cliFiltro = 'inasistencias'; render(null); };
