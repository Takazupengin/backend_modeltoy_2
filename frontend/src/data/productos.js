// UTILIDADES FINANCIERAS Y DE FORMATO
export function formatearPrecioCLP(precio) {
  const num = Number(precio) || 0;
  return `$${num.toLocaleString('es-CL')}`;
}

export function calcularSubtotal(precio, cantidad) {
  const p = Number(precio) || 0;
  const c = Number(cantidad) || 0;
  if (p <= 0 || c <= 0) return 0;
  return p * c;
}

// BÚSQUEDA Y FILTRADO
export function obtenerProductoPorId(id) {
  const producto = productosCatalog.find((p) => p.id === id);
  return producto || null;
}

export function filtrarPorEscala(escala) {
  if (!escala || escala.toLowerCase() === 'all') {
    return productosCatalog;
  }
  return productosCatalog.filter((p) => p.scale === escala);
}

// CATÁLOGO BASE (10 PRODUCTOS OFICIALES PARA CUMPLIR LA RÚBRICA Y TESTS)
export const productosCatalog = [
  {
    id: 'RX-78-2',
    nombre: 'RX-78-2 Gundam 2.0',
    grade: 'RG 1/144',
    scale: 'RG',
    precio: 42990,
    status: 'in-stock',
    imagenes: [
      '/img/rx-78-2 IMG 1.jpg',
      '/img/RG-RX-78-2 IMG 2.webp',
      '/img/RG-RX-78-2 IMG 3.webp'
    ],
    descripcion: 'El clásico móvil suit de la Federación Terrestre con esqueleto interno avanzado y alto nivel de detalle.'
  },
  {
    id: 'Wing-Zero-EW',
    nombre: 'Wing Gundam Zero EW',
    grade: 'HG 1/144',
    scale: 'HG',
    precio: 28990,
    status: 'in-stock',
    imagenes: [
      '/img/hg wing zero caja.png',
      '/img/hg wing zero armado.webp',
      '/img/hg wing zero pose.webp'
    ],
    descripcion: 'Alas articuladas de apertura rápida con doble rifle buster acoplable para poses dinámicas de disparo.'
  },
  {
    id: 'Exia-Lighting',
    nombre: 'Gundam Exia Lighting',
    grade: 'PG 1/60',
    scale: '1/60',
    precio: 189990,
    status: 'in-stock',
    imagenes: [
      '/img/pg exia caja.jpg',
      '/img/pg exia armado.webp',
      '/img/pg exia pose.webp'
    ],
    descripcion: 'Maqueta de gran escala con cableado LED interior para simular condensación de energía GN.'
  },
  {
    id: 'Sazabi',
    nombre: 'MSN-04 Sazabi',
    grade: 'RG 1/144',
    scale: 'RG',
    precio: 52990,
    status: 'in-stock',
    imagenes: [
      '/img/rg sazabi caja.webp',
      '/img/rg sazabi armado.webp',
      '/img/rg sazabi pose.webp'
    ],
    descripcion: 'El imponente móvil suit de Char Aznable con funnels desplegables y propulsores de alta potencia.'
  },
  {
    id: 'Strike-Freedom',
    nombre: 'ZGMF-X20A Strike Freedom',
    grade: 'MG 1/100',
    scale: '1/100',
    precio: 72990,
    status: 'in-stock',
    imagenes: [
      '/img/mg strike freedom caja.webp',
      '/img/mg strike freedom armado.webp',
      '/img/mg strike freedom pose.jpg'
    ],
    descripcion: 'Frame interior con acabados dorados, alas DRAGOON expandibles y base de exhibición dedicada.'
  },
  {
    id: 'Kit-Herramientas',
    nombre: 'Kit de Armado Pro',
    grade: 'Herramientas',
    scale: 'tools',
    precio: 19990,
    status: 'in-stock',
    imagenes: [
      '/img/herramientas img 1.avif',
      '/img/herramientas img 2.jpg',
      '/img/herramientas img 3.webp'
    ],
    descripcion: 'Incluye nipper de corte fino, bisturí de precision, pinzas anguladas, separador de piezas y limas.'
  },
  {
    id: 'Unicorn',
    nombre: 'RX-0 Unicorn Gundam',
    grade: 'RG 1/144',
    scale: 'RG',
    precio: 38990,
    status: 'in-stock',
    imagenes: [
      '/img/unicorn rg.jpg',
      '/img/unicorn rg pose.webp',
      '/img/unicorn rg armado.jpg'
    ],
    descripcion: 'Capaz de realizar el cambio completo de modo Unicorn a Destroy sin piezas intercambiables.'
  },
  {
    id: 'Astray-Red',
    nombre: 'MBF-P02 Astray Red Frame',
    grade: 'MG 1/100',
    scale: '1/100',
    precio: 59990,
    status: 'in-stock',
    imagenes: [
      '/img/Astray Red Frame caja.jpg',
      '/img/Astray Red Frame armado.webp',
      '/img/Astray Red Frame pose.avif'
    ],
    descripcion: 'Incluye la legendaria espada Gerbera Straight con hoja cromada y detalles excepcionales.'
  },
  {
    id: 'God-Gundam',
    nombre: 'GF13-017NJII God Gundam',
    grade: 'RG 1/144',
    scale: 'RG',
    precio: 35990,
    status: 'in-stock',
    imagenes: [
      '/img/God Gundam caja.png',
      '/img/God Gundam armado.jpg',
      '/img/God Gundam pose.webp'
    ],
    descripcion: 'Incomparable movilidad en artes marciales con efectos de energía para el ataque Hyper Mode.'
  },
  {
    id: 'Zaku-Char',
    nombre: "MS-06S Zaku II (Char)",
    grade: 'RG 1/144',
    scale: 'RG',
    precio: 31990,
    status: 'in-stock',
    imagenes: [
      "/img/Zaku II Char_s Custom caja.jpg",
      "/img/Zaku II Char_s Custom armado.webp",
      "/img/Zaku II Char_s Custom pose.webp"
    ],
    descripcion: 'El icónico mobile suit rojo del Cometa Rojo con armamento y mangueras realistas.'
  }
];

// PRODUCTOS ADICIONALES (6 KITS EXTRA)
export const productosExtra = [
  {
    id: 'Action-Base-5',
    nombre: 'Action Base 5 (Clear)',
    grade: 'Accesorios',
    scale: 'tools',
    precio: 6990,
    status: 'in-stock',
    imagenes: [
      '/img/Action Base 5 Clear caja.webp',
      '/img/Action Base 5 Clear armado.jpg',
      '/img/Action Base 5 Clear pose.webp'
    ],
    descripcion: 'Base de soporte transparente para exhibir kits en poses aéreas dinámicas y estables.'
  },
  {
    id: 'Markers-Classic',
    nombre: 'Gundam Marker Set (Classic)',
    grade: 'Herramientas',
    scale: 'tools',
    precio: 14990,
    status: 'in-stock',
    imagenes: [
      '/img/Marker Set Gundam Classic caja.jpg',
      '/img/Marker Set Gundam Classic armado.jpg',
      '/img/Marker Set Gundam Classic pose.webp'
    ],
    descripcion: 'Set de 6 rotuladores de pintura metálica y plana ideales para retoques rápidos sin aerógrafo.'
  },
  {
    id: 'Sinanju',
    nombre: 'MSN-06S Sinanju',
    grade: 'RG 1/144',
    scale: 'RG',
    precio: 44990,
    status: 'in-stock',
    imagenes: [
      '/img/Sinanju Real Grade caja.webp',
      '/img/Sinanju Real Grade armado.jpg',
      '/img/Sinanju Real Grade pose.jpg'
    ],
    descripcion: 'Elegante armadura roja brillante con piezas doradas pre-separadas y escudo con lanzagranadas.'
  },
  {
    id: 'Aerial',
    nombre: 'XVX-016 Gundam Aerial',
    grade: 'HG 1/144',
    scale: 'HG',
    precio: 24990,
    status: 'in-stock',
    imagenes: [
      '/img/Aerial Gundam caja.webp',
      '/img/Aerial Gundam armado.jpg',
      '/img/Aerial Gundam pose.jpg'
    ],
    descripcion: 'Directo de The Witch from Mercury con tecnología GUND-BIT escudables y gran posabilidad.'
  },
  {
    id: 'Freedom-MG',
    nombre: 'ZGMF-X10A Freedom Gundam',
    grade: 'MG 1/100',
    scale: '1/100',
    precio: 56990,
    status: 'in-stock',
    imagenes: [
      '/img/Freedom Gundam Master Grade caja.webp',
      '/img/Freedom Gundam Master Grade armado.webp',
      '/img/Freedom Gundam Master Grade pose.webp'
    ],
    descripcion: 'El clásico de SEED con despliegue de cañones de plasma en las alas y rifle de alta energía.'
  },
  {
    id: 'Panel-Line',
    nombre: 'Panel Line Accent (Black)',
    grade: 'Herramientas',
    scale: 'tools',
    precio: 6500,
    status: 'in-stock',
    imagenes: [
      '/img/Panel Line Accent Color Tamiya caja.webp',
      '/img/Panel Line Accent Color Tamiya armado.jpg',
      '/img/Panel Line Accent Color Tamiya pose.webp'
    ],
    descripcion: 'Pintura esmalte diluida especial para marcar y resaltar todos los recesos y detalles del panel.'
  }
];

// LISTA TOTAL (16 PRODUCTOS COMPLETOS)
export const productosExtendidos = [...productosCatalog, ...productosExtra];

export default productosCatalog;