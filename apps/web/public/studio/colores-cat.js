'use strict';
/* Color por categoría: el fondo (aurora) toma la paleta del apartado en el que estás, con transición suave.
   Barbería = negro y morado · Peluquería = rosa · Uñas = amarillo · … · Sin categoría = nácar. */
const PALETAS = {
  todo: ['#ffb08a', '#b49dff', '#7fe0c0', '#86c4ff', '#ff9fc8'],
  barberia: ['#3b1f6e', '#8a5cff', '#120a22', '#6b3fd4', '#b48cff'],
  peluqueria: ['#ff7eb6', '#ffb6d5', '#e0569a', '#ff9ec7', '#f7c1dd'],
  unas: ['#ffd23f', '#ffe58a', '#f5b700', '#ffcf66', '#fff0b3'],
  depilacion: ['#ff9a76', '#ffc2a8', '#ff7a59', '#ffb38f', '#ffd8c7'],
  masaje: ['#4fd1b2', '#9debd6', '#2fb59a', '#7fe0c0', '#c3f5e8'],
  facial: ['#c7a6ff', '#e3d1ff', '#a882f5', '#d7c2ff', '#f0e6ff'],
  cejas: ['#c98b5a', '#e8b98f', '#a8683d', '#d9a070', '#f2d3b8'],
  maquillaje: ['#ff4d6d', '#ff8fa3', '#d6284f', '#ff6f8b', '#ffc2cf'],
  spa: ['#48c9d6', '#9ae7ef', '#2aa6b5', '#6fd8e2', '#c8f4f8'],
  salud: ['#4aa8ff', '#9ccfff', '#2a7fe0', '#74bcff', '#cfe6ff'],
  fitness: ['#8fdc4a', '#c4f08f', '#62b81e', '#a8e86d', '#e2fbc6'],
  tatuajes: ['#b3122e', '#ff3b55', '#2a0a10', '#7d0d22', '#ff6b7f'],
  piercing: ['#9fb3c8', '#d3dee9', '#6f859c', '#b8c8d8', '#e8eef4'],
  dental: ['#7fd6ff', '#c6efff', '#3fb8f0', '#a3e2ff', '#e6f8ff'],
  medicina: ['#e8a598', '#f5cfc6', '#c97d70', '#efb8ad', '#fbe6e1'],
  trenzas: ['#e08a3c', '#f2b77a', '#b8642a', '#eaa25b', '#f8d6b0'],
  perros: ['#ff9f43', '#ffc78a', '#f07c1a', '#ffb466', '#ffe0bd'],
};
const ALIAS_CAT = { corte: 'barberia', barba: 'barberia', color: 'peluqueria', manicura: 'unas', pedicura: 'unas', tatuaje: 'tatuajes', fisio: 'salud', psicologia: 'salud', estetica: 'facial' };
function categoriaActual() {
  if (S.modo !== 'cliente') return 'todo';
  if (S.vista === 'explorar') return S.filtro && S.filtro !== 'todo' ? S.filtro : 'todo';
  if (['negocio', 'reserva', 'exito', 'chat'].includes(S.vista)) return NEGOCIOS[0].cat;
  return 'todo';
}
function pintarCategoria(cat = categoriaActual()) {
  cat = ALIAS_CAT[cat] || cat;
  const p = PALETAS[cat] || PALETAS.todo;
  const raiz = $('#screen');
  if (!raiz) return;
  raiz.dataset.cat = cat;
  p.forEach((c, i) => raiz.style.setProperty(`--c${i + 1}`, c));
  $$('.aurora i', raiz).forEach((el, k) => (el.style.backgroundColor = p[k % p.length]));
}
{
  const origRender = render;
  render = (...a) => { const r = origRender(...a); pintarCategoria(); return r; };
  const origFiltro = A.filtro;
  A.filtro = (b) => { origFiltro(b); pintarCategoria(); };
  const origCat = A.cat;
  A.cat = (b) => { pintarCategoria(b.dataset.c); origCat(b); };
}
pintarCategoria();
