'use strict';
/* Business → Muro y novedades (11/10/2026)
   Todo lo que ve el cliente en el muro se escribe desde aquí: como el negocio o como un profesional.
   Tipos: aviso, novedad, producto o merchandising, huecos libres, precio especial y vacaciones (bloquea la agenda).
   Opciones: fijar arriba, stories, avisar a seguidores y mostrarlo como ventanita al entrar.
   Gestión: fijar o quitar, responder a los clientes como negocio o profesional y borrar. */

const TIPOS_POST = [['aviso', 'Aviso', 'megafono'], ['novedad', 'Novedad', 'chispa'], ['producto', 'Producto o merch', 'producto'], ['huecos', 'Huecos libres', 'calendario'], ['precio', 'Precio especial', 'euro'], ['vacaciones', 'Vacaciones', 'sol']];
const PLANT_POST = {
  aviso: 'El sábado abrimos solo por la mañana, de 10:00 a 14:00.',
  novedad: 'Estrenamos servicio: diseño de cejas para hombre. ¡Pregúntanos en tu próxima cita!',
  producto: 'Ya tenemos la nueva cera mate y las camisetas de Sublime. Pídelas en caja.',
  huecos: 'Quedan huecos esta tarde a partir de las 18:00. ¡Reserva desde la app!',
  precio: 'Esta semana, corte + barba a 16 € de lunes a miércoles.',
  vacaciones: 'Me voy unos días de vacaciones. El resto del equipo os atiende con normalidad.',
};
function autorPorDefecto() { return S.rolBiz === 'empleado' ? 'adri' : 'negocio'; }
function nuevoBorradorPost() {
  const lunes = addD(HOY, (8 - HOY.getDay()) % 7 || 7);
  return { autor: autorPorDefecto(), tipo: 'aviso', texto: '', foto: false, fijar: true, story: true, avisar: true, ventana: false, desde: kF(addD(lunes, 7)), hasta: kF(addD(lunes, 11)) };
}
VISTAS['muro-biz'] = { padre: 'ajustes', html() {
  const B = S.bp || (S.bp = nuevoBorradorPost());
  const empleado = S.rolBiz === 'empleado';
  const autores = [['negocio', NEGOCIOS[0].nombre, NEGOCIOS[0].logo], ...EQUIPO.map((p) => [p.id, p.nombre, p.img])];
  const posts = [...S.muro].sort((a, b) => (b.fijado - a.fijado) || (b.fecha - a.fecha));
  const sw = (k, t, d) => `<div class="ajuste"><span><b>${t}</b><small>${d}</small></span><button class="switch" role="switch" aria-checked="${!!B[k]}" data-a="bp-sw" data-k="${k}" aria-label="${t}"></button></div>`;
  return sub('Muro y novedades', `<div class="pad form-hoja" style="padding-top:0">
    <p class="franja">Nueva publicación</p>
    <div class="campo"><label>Publicar como</label><div class="autores">${autores.map(([id, n, img]) => {
      const bloq = empleado && id !== 'adri';
      return `<button class="autor ${B.autor === id ? 'on' : ''}" data-a="bp-autor" data-v="${id}" ${bloq ? 'disabled title="Como empleado solo publicas con tu nombre"' : ''}><img src="${img}" alt="">${n.split(' ')[0]}</button>`;
    }).join('')}</div>${empleado ? '<small class="faint">Como empleado, publicas con tu nombre.</small>' : ''}</div>
    <div class="campo"><label>Tipo</label><div class="chips">${TIPOS_POST.map(([id, t, icono]) => `<button class="chip" data-a="bp-tipo" data-v="${id}" aria-pressed="${B.tipo === id}">${ic(icono, 'ic-s')}${t}</button>`).join('')}</div></div>
    ${B.tipo === 'vacaciones' ? `<div class="nt-fila"><div class="campo"><label>Desde</label><input id="bp-desde" type="date" value="${B.desde}"></div><div class="campo"><label>Hasta</label><input id="bp-hasta" type="date" value="${B.hasta}"></div></div><p class="aviso-temp">${ic('calendario', 'ic-s')}<span>Esos días se bloquean solos en la agenda de ${B.autor === 'negocio' ? 'todo el equipo' : pro(B.autor).nombre}.</span></p>` : ''}
    <div class="campo"><label>Mensaje</label><textarea class="nota-campo" id="bp-txt" maxlength="280" placeholder="${esc(PLANT_POST[B.tipo])}">${esc(B.texto)}</textarea></div>
    <button class="btn btn--ghost btn--sm" data-a="bp-foto" style="align-self:flex-start">${ic('camara', 'ic-s')}${B.foto ? 'Foto añadida ✓' : 'Añadir foto'}</button>
    ${sw('fijar', 'Fijar arriba', 'Sale primero en el muro')}${sw('story', 'También en stories', 'Aparece en el Feed durante 24 h')}${sw('avisar', `Avisar a seguidores (${S.seguidoresAvisos})`, 'Les llega una notificación')}${sw('ventana', 'Ventanita al entrar en el perfil', 'Como mensaje destacado al reservar')}
    <button class="btn btn--primary btn--block" data-a="bp-publicar">${ic('megafono', 'ic-s')}Publicar</button>
    <p class="franja">Publicado (${posts.length})</p>
  </div>
  <div class="pad muro-gestion">${posts.map((m) => `<article class="post-g">
      <div class="post-g__cab">${avatarPost(m)}<div><b>${esc(m.nombre)}</b><small>${m.autor === 'cliente' ? 'Cliente' : m.autor === 'pro' ? 'Profesional' : 'Negocio'} · ${haceCuanto(m.fecha)}${m.fijado ? ' · fijado' : ''}</small></div></div>
      <p>${esc(m.texto)}</p>
      <small class="faint">${ic('corazon', 'ic-s')} ${m.likes} · ${ic('comentario', 'ic-s')} ${m.respuestas.length} respuestas</small>
      ${m.respuestas.length ? `<div class="post__resp">${m.respuestas.slice(-2).map((r) => `<div><b>${esc(r.nombre)}</b> ${esc(r.texto)}</div>`).join('')}</div>` : ''}
      ${S.bpResp === m.id ? `<div class="fila-input"><input id="bp-resp" type="text" maxlength="200" placeholder="Responder como ${esc(B.autor === 'negocio' ? NEGOCIOS[0].nombre : pro(B.autor).nombre)}…" style="text-transform:none"><button class="btn btn--sm btn--primary" data-a="bp-resp-enviar" data-id="${m.id}">Enviar</button></div>` : ''}
      <div class="post-g__acc">
        ${m.autor !== 'cliente' && !empleado ? `<button data-a="bp-fijar" data-id="${m.id}">${ic('pin2', 'ic-s')}${m.fijado ? 'Quitar fijado' : 'Fijar'}</button>` : ''}
        <button data-a="bp-responder" data-id="${m.id}">${ic('comentario', 'ic-s')}Responder</button>
        ${!empleado || m.pro === 'adri' ? `<button data-a="bp-borrar" data-id="${m.id}">${ic('papelera', 'ic-s')}Borrar</button>` : ''}
      </div></article>`).join('')}</div>`, 'Lo que publiques aquí lo ven tus clientes en el muro, en stories y, si quieres, como aviso.');
} };
document.addEventListener('input', (e) => { if (e.target.id === 'bp-txt' && S.bp) S.bp.texto = e.target.value; if (e.target.id === 'bp-desde' && S.bp) S.bp.desde = e.target.value; if (e.target.id === 'bp-hasta' && S.bp) S.bp.hasta = e.target.value; });

Object.assign(A, {
  'bp-autor': (b) => { S.bp.autor = b.dataset.v; render(null, { mantenerScroll: true }); },
  'bp-tipo': (b) => { S.bp.tipo = b.dataset.v; if (b.dataset.v === 'vacaciones' && S.bp.autor === 'negocio') S.bp.autor = S.rolBiz === 'empleado' ? 'adri' : 'javi'; render(null, { mantenerScroll: true }); },
  'bp-sw': (b) => { const k = b.dataset.k; S.bp[k] = !S.bp[k]; b.setAttribute('aria-checked', S.bp[k]); },
  'bp-foto': () => { S.bp.foto = !S.bp.foto; render(null, { mantenerScroll: true }); },
  'bp-publicar': () => {
    const B = S.bp;
    const texto = (B.texto || '').trim() || PLANT_POST[B.tipo];
    const v = moderarTexto(texto);
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    const esPro = B.autor !== 'negocio';
    const p = esPro ? pro(B.autor) : null;
    const post = { id: 'bp' + Date.now(), autor: esPro ? 'pro' : 'negocio', pro: esPro ? p.id : undefined, nombre: esPro ? p.nombre : NEGOCIOS[0].nombre, texto, fecha: new Date(), fijado: B.fijar, story: B.story, storyNueva: B.story, respuestas: [], likes: 0, img: B.foto ? IMG + 'g-productos-900.webp' : undefined, tipo: B.tipo };
    if (B.tipo === 'vacaciones') {
      if (!B.desde || !B.hasta || B.hasta < B.desde) return toast('Revisa las fechas de las vacaciones');
      (esPro ? [p.id] : EQUIPO.map((x) => x.id)).forEach((id) => S.vacaciones.push({ pro: id, desde: deK(B.desde), hasta: deK(B.hasta) }));
    }
    S.muro.unshift(post);
    if (B.ventana) { S.aviso = { id: 'av' + Date.now(), activo: true, tipo: { huecos: 'huecos', precio: 'precio', vacaciones: 'cerrado' }[B.tipo] || 'novedad', titulo: `${post.nombre}: ${TIPOS_POST.find((t) => t[0] === B.tipo)[1]}`, texto, hasta: '', popup: true }; S.avisosCerrados = []; }
    if (B.avisar && S.suscritos.includes('sublime')) S.notiCli.unshift({ ic: 'megafono', t: `<b>${esc(post.nombre)}</b> (${NEGOCIOS[0].nombre}): ${esc(texto.slice(0, 70))}`, cuando: 'ahora', ir: 'muro' });
    S.bp = nuevoBorradorPost();
    render(null, { mantenerScroll: true });
    toast(`Publicado como ${post.nombre}${B.avisar ? ` · avisados ${S.seguidoresAvisos} seguidores` : ''}${B.tipo === 'vacaciones' ? ' · agenda bloqueada esos días' : ''}`);
  },
  'bp-fijar': (b) => { const m = S.muro.find((x) => x.id === b.dataset.id); m.fijado = !m.fijado; render(null, { mantenerScroll: true }); },
  'bp-borrar': (b) => { S.muro = S.muro.filter((x) => x.id !== b.dataset.id); render(null, { mantenerScroll: true }); toast('Publicación borrada'); },
  'bp-responder': (b) => { S.bpResp = S.bpResp === b.dataset.id ? null : b.dataset.id; render(null, { mantenerScroll: true }); setTimeout(() => $('#bp-resp')?.focus(), 50); },
  'bp-resp-enviar': (b) => {
    const t = ($('#bp-resp').value || '').trim();
    if (!t) return;
    const v = moderarTexto(t);
    if (!v.ok) return toast(`No se ha enviado: ${v.motivo}`);
    const m = S.muro.find((x) => x.id === b.dataset.id);
    const autor = S.bp.autor === 'negocio' ? NEGOCIOS[0].nombre : pro(S.bp.autor).nombre;
    m.respuestas.push({ nombre: autor, negocio: true, texto: t });
    S.bpResp = null;
    render(null, { mantenerScroll: true });
    toast(`Respuesta publicada como ${autor}`);
  },
});
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('ir', 'comentario', 'Muro y novedades', `${S.muro.length} publicaciones · como negocio o profesional`, 'muro-biz')}`, true)];
});
DEMOS.nMuroBiz = () => { abrirApp('negocio', 'ajustes'); S.bp = null; ir('muro-biz'); };
