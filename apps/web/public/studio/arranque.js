'use strict';
/* =====================================================================
   ARRANQUE
   ===================================================================== */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]');
  if (!b || b.disabled) return;
  const f = A[b.dataset.a];
  if (f) { e.preventDefault(); f(b, e); }
});
$('#velo').addEventListener('click', cerrarHoja);
$('#ia-form').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#ia-input'); enviarIA(i.value); i.value = ''; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { cerrarVisor(); cerrarHoja(); } });
$$('.hoja').forEach(arrastrable);
addEventListener('resize', () => { if (S.vista === 'stats') render(null, { mantenerScroll: true }); moverIndicador(); });

$$('[data-marca]').forEach((e) => (e.textContent = MARCA));
$$('[data-logo]').forEach((e) => (e.innerHTML = LOGO));
$$('[data-marca-t]').forEach((e) => (e.textContent = MARCA_T));
if (!document.body.dataset.app) document.title = `${MARCA} · prototipo`;
S.ventas = generarVentas();
{
  const app = new URLSearchParams(location.search).get('app');
  S.modo = '';
  setModo(document.body.dataset.app || (app === 'business' ? 'negocio' : 'cliente'), { forzar: true });
  if ('serviceWorker' in navigator && document.body.classList.contains('instalable')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
fetch('assets/resenas.json').then((r) => r.json()).then((d) => {
  S.resenas = d.resenas || [];
  if (S.vista === 'negocio' && S.tabFicha === 'resenas') { $('#panel').innerHTML = panelFicha(); montarResenas(document); }
}).catch(() => {});
