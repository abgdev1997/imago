'use strict';
/* Guía de bienvenida (11/10/2026)
   La primera vez que alguien entra (en Clientes o en Business), una guía corta ilumina cada parte de la
   pantalla con una flecha y explica para qué sirve. Se puede saltar. No vuelve a salir (se puede repetir
   desde Perfil o Ajustes). Las 3 preguntas del cuestionario salen después, cuando ya llevas un rato. */

const GUIAS = {
  cliente: { vista: 'inicio', pasos: [
    ['.buscador', 'Busca o pide', 'Escribe lo que quieres, por ejemplo «corte el viernes por la tarde», o el nombre de un sitio. La IA te ayuda.'],
    ['.cats', 'Categorías', 'Toca una para ver los sitios de ese tipo. El color del fondo te dirá en qué apartado estás.'],
    ['[data-a="tab"][data-v="explorar"]', 'Explorar', 'Todos los sitios cerca de ti, en lista o en mapa.'],
    ['[data-a="tab"][data-v="inspiracion"]', 'Feed', 'Vídeos de cortes y trabajos. Si te gusta uno, reservas con quien lo hizo.'],
    ['[data-a="tab"][data-v="citas"]', 'Tus citas', 'Aquí las ves, las cambias, las cancelas o miras cómo llegar.'],
    ['[data-a="tab"][data-v="perfil"]', 'Tu perfil', 'Tus gustos, bonos, avisos y ajustes.'],
    [null, '¡Ya está!', 'Para reservar: elige un sitio → día y hora → servicio → profesional → confirmar. Si te atascas, toca «Ayuda» en cualquier momento.'],
  ] },
  negocio: { vista: 'agenda', pasos: [
    ['.cal-top .segmento', 'Tu agenda', 'Cambia entre día, semana y mes.'],
    ['.dias-strip', 'Ocupación', 'Cada día con su % de ocupación. Toca uno para verlo entero.'],
    ['.agenda-res', 'Resumen del día', 'Ocupación, citas, huecos libres y lo que queda por cobrar.'],
    ['.fab-reservar', 'Reservar', 'Crea una cita para un cliente en segundos. También tocando un hueco libre.'],
    ['.tab--orbe', 'Tu asistente', 'Pregúntale por tus clientes, tus huecos o (si eres gerente) tu facturación.'],
    ['[data-a="tab"][data-v="clientes"]', 'Clientes', 'Fichas, inasistencias, bloqueados y mensajes.'],
    ['[data-a="tab"][data-v="caja"]', 'Caja', 'Cobra servicios y productos, con propina y comisiones.'],
    ['[data-a="tab"][data-v="ajustes"]', 'Ajustes', 'Muro y novedades, mensajes, servicios temporales, fuera de horario, comisiones…'],
  ] },
};
const claveGuia = (m) => `imago-guia-${m}`;
const guiaVista = (m) => { try { return localStorage.getItem(claveGuia(m)) === '1'; } catch { return !!S['guia_' + m]; } };
const marcarGuia = (m) => { S['guia_' + m] = true; try { localStorage.setItem(claveGuia(m), '1'); } catch {} };

function empezarGuia(m = S.modo) {
  const g = GUIAS[m];
  if (!g || $('.guia')) return;
  S.guia = { m, i: 0 };
  const el = document.createElement('div');
  el.className = 'guia';
  el.innerHTML = '<div class="guia__luz"></div><div class="guia__caja" role="dialog" aria-live="polite"></div>';
  $('#screen').appendChild(el);
  pasoGuia();
}
function pasoGuia() {
  const G = S.guia, g = GUIAS[G.m], el = $('.guia');
  if (!el) return;
  // saltar pasos cuyo elemento no está en pantalla
  while (G.i < g.pasos.length && g.pasos[G.i][0] && !$(g.pasos[G.i][0])) G.i++;
  if (G.i >= g.pasos.length) return terminarGuia();
  const [sel, t, txt] = g.pasos[G.i];
  const scr = $('#screen').getBoundingClientRect();
  const luz = $('.guia__luz', el), caja = $('.guia__caja', el);
  const n = g.pasos.filter((p) => !p[0] || $(p[0])).length;
  const actual = g.pasos.slice(0, G.i + 1).filter((p) => !p[0] || $(p[0])).length;
  caja.innerHTML = `<small>${actual} de ${n}</small><b>${t}</b><p>${txt}</p><div class="guia__btns"><button class="link" data-a="guia-saltar">Saltar</button><button class="btn btn--primary btn--sm" data-a="guia-sig">${actual === n ? 'Empezar' : 'Siguiente'}</button></div>`;
  if (!sel) {
    luz.style.cssText = `left:${scr.width / 2}px;top:${scr.height / 2}px;width:0;height:0`;
    caja.className = 'guia__caja guia__caja--centro';
    caja.style.cssText = '';
    return;
  }
  const tgt = $(sel);
  tgt.scrollIntoView({ block: 'nearest' });
  const r = tgt.getBoundingClientRect();
  const x = r.left - scr.left - 6, y = r.top - scr.top - 6, w = r.width + 12, h = r.height + 12;
  luz.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
  const abajo = y + h / 2 < scr.height / 2;
  caja.className = `guia__caja ${abajo ? 'guia__caja--abajo' : 'guia__caja--arriba'}`;
  const cx = Math.min(Math.max(x + w / 2, 40), scr.width - 40);
  caja.style.cssText = abajo ? `top:${y + h + 14}px;--fx:${cx}px` : `bottom:${scr.height - y + 14}px;--fx:${cx}px`;
}
function terminarGuia() {
  const m = S.guia?.m || S.modo;
  marcarGuia(m);
  $('.guia')?.remove();
  S.guia = null;
  if (m === 'cliente') programarCuestionario();
}
/* Las 3 preguntas, cuando ya llevas un rato (y nunca encima de la guía) */
function programarCuestionario() {
  if (S.prefs) return;
  clearTimeout(programarCuestionario.t);
  programarCuestionario.t = setTimeout(function intenta() {
    if (S.prefs) return;
    if ($('.guia') || $('.hoja.on') || !['inicio', 'explorar'].includes(S.vista) || S.modo !== 'cliente') { programarCuestionario.t = setTimeout(intenta, 8000); return; }
    abrirCuestionario();
  }, 40000);
}
ofrecerCuestionario = () => { if (guiaVista('cliente')) programarCuestionario(); };

/* Lanzar la guía la primera vez que se llega al inicio (clientes) o a la agenda (Business) */
{
  const orig = render;
  render = (...a) => {
    const r = orig(...a);
    const m = S.modo, g = GUIAS[m];
    if (g && S.vista === g.vista && !guiaVista(m) && !$('.guia') && (m === 'negocio' || S.logueado)) {
      clearTimeout(render.tGuia);
      render.tGuia = setTimeout(() => { if (S.vista === g.vista && !guiaVista(m) && !$('.hoja.on')) empezarGuia(m); }, 2300);
    }
    return r;
  };
}
addEventListener('resize', () => { if (S.guia) pasoGuia(); });
Object.assign(A, {
  'guia-sig': () => { S.guia.i++; pasoGuia(); },
  'guia-saltar': terminarGuia,
  'guia-repetir': () => { cerrarHoja(); const g = GUIAS[S.modo]; ir(g.vista, { reset: true, dir: 'fundido' }); setTimeout(() => empezarGuia(S.modo), 500); },
});
/* «Ver la guía otra vez» en Perfil (clientes) y Ajustes (Business) */
envolver(VISTAS.perfil, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<button data-a="perfil-datos">', `<button data-a="guia-repetir">${ic('chispa')}<span>Ver la guía otra vez<small>Para qué sirve cada cosa</small></span>${ic('sig', 'ic-s')}</button>`)];
});
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('guia-repetir', 'chispa', 'Ver la guía otra vez', 'Para qué sirve cada cosa')}`, true)];
});
DEMOS.nGuiaCli = () => { try { localStorage.removeItem(claveGuia('cliente')); } catch {} S.guia_cliente = false; abrirApp('cliente', 'inicio'); setTimeout(() => empezarGuia('cliente'), 600); };
DEMOS.nGuiaBiz = () => { try { localStorage.removeItem(claveGuia('negocio')); } catch {} S.guia_negocio = false; abrirApp('negocio', 'agenda'); setTimeout(() => empezarGuia('negocio'), 600); };
