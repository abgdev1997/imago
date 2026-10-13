// Datos de ejemplo del prototipo.
// Nombre de la app: cámbialo aquí y se actualiza en todas partes.
const MARCA = 'IMAGO';
const MARCA_T = MARCA.charAt(0) + MARCA.slice(1).toLowerCase();
// Sublime Barber Studio usa sus servicios, precios, fotos y reseñas reales; el resto es inventado.

const IMG = 'assets/img/';
const VID = 'assets/video/';

// Ubicación de ejemplo del cliente (cerca de Sublime, en San Jerónimo, Sevilla)
const UBI = { lat: 37.4208, lng: -5.9808 };

const NEGOCIOS = [
  {
    id: 'sublime', espera: 'normal', atencion: 3, nombre: 'Sublime Barber Studio', tipo: 'Barbería', cat: 'barberia', tags: ['corte', 'barba', 'color', 'largo', 'degradado'],
    direccion: 'C. Cataluña 54 · Sevilla', lat: 37.42446, lng: -5.98296, nota: 5.0, totalResenas: 291, precioDesde: 8, precioMedio: 18,
    portada: IMG + 'hero-estudio-700.webp', video: VID + 'neon-vertical.mp4', logo: IMG + 'logo-mark.svg',
    fotos: [IMG + 'hero-estudio-700.webp', IMG + 'estudio-900.webp', IMG + 'proceso-corte-900.webp', IMG + 'g-fachada-900.webp'],
    real: true,
  },
  { id: 'raiz', espera: 'tranquila', atencion: 3, nombre: 'Raíz Estudio', tipo: 'Peluquería', cat: 'peluqueria', tags: ['corte', 'color', 'peinado', 'largo', 'rizado'], direccion: 'Av. de San Jerónimo · Sevilla', lat: 37.4148, lng: -5.9768, nota: 4.9, totalResenas: 184, precioDesde: 18, precioMedio: 38, tono: ['#c9a27e', '#5b3a29'], proximo: 'Mañana · 10:00', resumen: 'Destacan el asesoramiento de color y que te enseñan a peinarte en casa. Los sábados suele haber espera.' },
  { id: 'kinesis', espera: 'normal', atencion: 3, nombre: 'Kinésis Fisioterapia', tipo: 'Fisioterapia', cat: 'salud', tags: ['masaje', 'fisio'], direccion: 'C. Fray Isidoro · Sevilla', lat: 37.4182, lng: -5.9712, nota: 4.8, totalResenas: 96, precioDesde: 35, precioMedio: 42, tono: ['#8fb8c9', '#1f3d4a'], proximo: 'Lun · 9:30', resumen: 'Puntuales y muy claros con los ejercicios para casa. Aparcar a media mañana es complicado.' },
  { id: 'calma', espera: 'tranquila', atencion: 3, nombre: 'Calma Psicología', tipo: 'Psicología', cat: 'salud', tags: ['psicologia'], direccion: 'Online y presencial', lat: 37.4072, lng: -5.9836, nota: 5.0, totalResenas: 58, precioDesde: 45, precioMedio: 55, tono: ['#b8c4a0', '#2f3a24'], proximo: 'Mar · 18:00', resumen: 'Ambiente tranquilo y trato cercano. Valoran mucho poder hacer la sesión online.' },
  { id: 'nacar', espera: 'normal', atencion: 2, nombre: 'Nácar Estética', tipo: 'Estética', cat: 'facial', tags: ['facial', 'depilacion', 'cejas', 'manicura'], direccion: 'C. Medina y Galnares · Sevilla', lat: 37.4111, lng: -5.9872, nota: 4.9, totalResenas: 212, precioDesde: 15, precioMedio: 32, tono: ['#e2b9b3', '#5a2f35'], proximo: 'Hoy · 19:00', resumen: 'Muy buenas en faciales y depilación, con productos de calidad. Es una zona difícil para aparcar.' },
  { id: 'norte', espera: 'rapida', atencion: 1, nombre: 'Barbería Norte', tipo: 'Barbería', cat: 'barberia', tags: ['corte', 'barba'], direccion: 'San Jerónimo · Sevilla', lat: 37.4268, lng: -5.9772, nota: 4.7, totalResenas: 133, precioDesde: 10, precioMedio: 13, tono: ['#9aa3ad', '#22262b'], proximo: 'Hoy · 18:30', resumen: 'Rápidos y económicos, ideales para un repaso. En hora punta suele haber cola.' },
  { id: 'fade', espera: 'normal', atencion: 2, nombre: 'The Fade Club', tipo: 'Barbería', cat: 'barberia', tags: ['corte', 'barba', 'degradado', 'barba-italiana', 'tendencia'], direccion: 'Pino Montano · Sevilla', lat: 37.4179, lng: -5.9893, nota: 4.8, totalResenas: 247, precioDesde: 13, precioMedio: 17, tono: ['#c2b280', '#2c2616'], proximo: 'Mañana · 12:00', resumen: 'Especialistas en degradados y muy buen ambiente. Fácil aparcar en la zona.' },
  { id: 'tinta', espera: 'tranquila', atencion: 3, nombre: 'Tinta Viva Tattoo', tipo: 'Tatuajes', cat: 'tatuajes', tags: ['tatuaje', 'piercing'], direccion: 'Macarena · Sevilla', lat: 37.4131, lng: -5.9934, nota: 4.6, totalResenas: 77, precioDesde: 60, precioMedio: 120, tono: ['#a48bd1', '#251b3a'], proximo: 'Jue · 17:00', resumen: 'Diseños a medida y estudio muy limpio. Las citas se llenan con semanas de antelación.' },
  { id: 'lima', espera: 'rapida', atencion: 2, nombre: 'Lima Nails', tipo: 'Uñas', cat: 'unas', tags: ['manicura', 'pedicura'], direccion: 'San Jerónimo · Sevilla', lat: 37.4236, lng: -5.9706, nota: 4.5, totalResenas: 151, precioDesde: 12, precioMedio: 24, tono: ['#e8a6b8', '#4a1f2b'], proximo: 'Hoy · 17:30', resumen: 'Las uñas duran muchísimo. Algunos comentan retrasos de unos 10 minutos.' },
  { id: 'huellas', espera: 'normal', atencion: 3, nombre: 'Huellas', tipo: 'Peluquería canina', cat: 'perros', tags: ['perros'], direccion: 'Pío XII · Sevilla', lat: 37.4087, lng: -5.9931, nota: 4.8, totalResenas: 64, precioDesde: 20, precioMedio: 30, tono: ['#d9b77e', '#3b2a10'], proximo: 'Vie · 11:00', resumen: 'Mucha paciencia con los perros. Avisa si el tuyo es nervioso y te dan la primera hora.' },
];

// Categorías del inicio del cliente (icono = nombre en ICON_CAT de cliente.js)
const CATEGORIAS = [
  ['barberia', 'Barbería'], ['peluqueria', 'Peluquería'], ['unas', 'Uñas'], ['depilacion', 'Depilación'], ['masaje', 'Masaje'],
  ['facial', 'Facial'], ['cejas', 'Cejas y pestañas'], ['maquillaje', 'Maquillaje'], ['spa', 'Spa'], ['salud', 'Salud'],
  ['fitness', 'Fitness'], ['tatuajes', 'Tatuajes'], ['piercing', 'Piercing'], ['dental', 'Dental'], ['medicina', 'Medicina estética'],
  ['trenzas', 'Trenzas'], ['perros', 'Perros'],
].map(([id, nombre]) => ({ id, nombre }));

const OFERTAS = [
  { neg: 'fade', titulo: '-20 % en tu primera visita', sub: 'Solo nuevos clientes' },
  { neg: 'raiz', titulo: 'Mechas con un 15 % menos', sub: 'Hasta el domingo' },
  { neg: 'nacar', titulo: 'Facial + cejas por 35 €', sub: 'Martes y miércoles' },
  { neg: 'kinesis', titulo: 'Bono de 5 sesiones', sub: 'Ahorra 30 €' },
];

const SERVICIOS = [
  { id: 'corte', nombre: 'Corte de pelo', desc: 'Corte personalizado según tu rostro y tu estilo, con acabado y peinado.', min: 30, precio: 14, img: IMG + 'serv-corte-600.webp', video: VID + 'corte.mp4', tag: 'El más pedido' },
  { id: 'combo', nombre: 'Corte + barba', desc: 'El servicio completo: corte a medida y barba perfilada.', min: 45, precio: 18, img: IMG + 'serv-combo-600.webp', video: VID + 'barba.mp4' },
  { id: 'degradado', nombre: 'Degradado', desc: 'Repaso de laterales y nuca para mantener el corte impecable.', min: 30, precio: 12, img: IMG + 'serv-degradado-600.webp', video: VID + 'acabado.mp4' },
  { id: 'barba', nombre: 'Diseño de barba top', desc: 'Perfilado, degradado y definición para enmarcar tu rostro.', min: 20, precio: 8, img: IMG + 'serv-barba-600.webp' },
  { id: 'largo', nombre: 'Pelo largo + hidratación', desc: 'Corte para melenas con tratamiento de hidratación.', min: 45, precio: 20, img: IMG + 'serv-largo-600.webp', video: VID + 'lavado.mp4' },
  { id: 'mechas', nombre: 'Mechas + corte', desc: 'Mechas a medida y corte para un cambio con personalidad.', min: 90, precio: 45, img: IMG + 'serv-mechas-600.webp' },
  { id: 'color', nombre: 'Corte + color Sublime', desc: 'Cambio de look completo: color y corte firmados por Sublime.', min: 90, precio: 60, img: IMG + 'serv-color-600.webp', video: VID + 'asesoria.mp4' },
  { id: 'nino', nombre: 'Corte niño', desc: 'Para los más peques de la casa, con toda la paciencia.', min: 30, precio: 13, img: IMG + 'serv-nino-600.webp' },
  { id: 'senior', nombre: 'Corte +60 años', desc: 'El mismo mimo y precisión, con precio especial.', min: 30, precio: 12, img: IMG + 'serv-senior-600.webp' },
];

const EQUIPO = [
  { id: 'javi', nombre: 'Javi', completo: 'Javi Navarro', rol: 'Fundador · 10 años de oficio', img: IMG + 'javi-600.webp', img2: IMG + 'javi-2-600.webp', recorte: IMG + 'recorte-javi.webp', video: VID + 'javi.mp4', comisionServicios: 0, propietario: true },
  { id: 'adri', nombre: 'Adri', completo: 'Adri Reina', rol: 'Barbero', img: IMG + 'adri-600.webp', img2: IMG + 'adri-2-600.webp', recorte: IMG + 'recorte-adri.webp', video: VID + 'adri.mp4', comisionServicios: 40 },
];

const TRABAJOS = [
  { id: 'espiral', titulo: 'Espiral', pro: 'javi' },
  { id: 'carmesi', titulo: 'Carmesí', pro: 'adri' },
  { id: 'claroscuro', titulo: 'Claroscuro', pro: 'javi' },
  { id: 'horizonte', titulo: 'Horizonte', pro: 'adri' },
  { id: 'oleo', titulo: 'Óleo', pro: 'javi' },
  { id: 'primavera', titulo: 'Primavera', pro: 'adri' },
  { id: 'retrato-con-barba', titulo: 'Retrato con barba', pro: 'javi' },
  { id: 'rizo-indomito', titulo: 'Rizo indómito', pro: 'adri' },
  { id: 'tinta', titulo: 'Tinta', pro: null },
  { id: 'bajo-el-neon', titulo: 'Bajo el neón', pro: null },
].map((t) => ({ ...t, img: `${IMG}obras/${t.id}.webp`, video: `${VID}obras/${t.id}.mp4` }));

const TRAILER = [
  { video: VID + 'neon-vertical.mp4', poster: IMG + 'hero-estudio-700.webp', kicker: 'Barbería de autor · Sevilla', titulo: 'Sublime Barber Studio' },
  { video: VID + 'javi.mp4', poster: IMG + 'javi-600.webp', kicker: 'Fundador · 10 años de oficio', titulo: 'Javi Navarro' },
  { video: VID + 'adri.mp4', poster: IMG + 'adri-600.webp', kicker: 'Barbero', titulo: 'Adri Reina' },
  { video: VID + 'obras/espiral.mp4', poster: IMG + 'obras/espiral.webp', kicker: 'La Colección', titulo: 'Cada corte, una obra' },
  { video: VID + 'acabado.mp4', poster: IMG + 'proceso-acabado-900.webp', kicker: 'C. Cataluña 54', titulo: 'Te esperamos', cta: true },
];

const PRODUCTOS = [
  { id: 'cera', nombre: 'Cera mate', precio: 16, stock: 14, comision: 10, forma: 'tarro', tono: '#c8b49a' },
  { id: 'polvo', nombre: 'Polvo texturizador', precio: 14, stock: 9, comision: 10, forma: 'tarro', tono: '#a9b7c2' },
  { id: 'aceite', nombre: 'Aceite de barba', precio: 18, stock: 6, comision: 15, forma: 'gotero', tono: '#d2a35c' },
  { id: 'champu', nombre: 'Champú fortalecedor', precio: 15, stock: 11, comision: 10, forma: 'bote', tono: '#9fc0a6' },
  { id: 'balsamo', nombre: 'Bálsamo de barba', precio: 17, stock: 3, comision: 15, forma: 'tarro', tono: '#d8c9a8' },
  { id: 'peine', nombre: 'Peine de madera', precio: 9, stock: 20, comision: 5, forma: 'peine', tono: '#b08968' },
];

const CLIENTES = ['Carlos', 'Pablo', 'Álvaro', 'Manuel', 'Jesús', 'Antonio', 'David', 'Sergio', 'Rafa', 'Marcos', 'Javier', 'Hugo', 'Iván', 'Luis', 'Óscar', 'Raúl', 'Mario', 'Adrián', 'Diego', 'Fran', 'Curro', 'Nico'];

// Horario del prototipo: mañana 10:00–14:00 y tarde 17:00–21:00, huecos de 30 min.
const HORAS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

const APELLIDOS = ['García', 'Romero', 'Ruiz', 'Navarro', 'Moreno', 'Jiménez', 'Díaz', 'Torres', 'Vázquez', 'Ramos', 'Gil', 'Serrano', 'Molina', 'Ortega', 'Delgado', 'Castro', 'Rubio', 'Marín', 'Sanz', 'Iglesias'];
// Cliente de prueba de IMAGO Clientes (el mismo aparece en la ficha de clientes del negocio)
const YO = { nombre: 'Marcos Sado', tel: '600 000 000', email: 'marcos@ejemplo.com', direccion: 'Sevilla' };
