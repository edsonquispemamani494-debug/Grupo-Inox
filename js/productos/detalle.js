// Lógica exclusiva del detalle y su cursor animado.
(() => {
function initIndustrialCursor() {
  if (document.querySelector('.industrial-cursor')) return;
  const motion = window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const cursor = document.createElement('div');
  cursor.className = 'industrial-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M2 2 7 20 12 12 20 7Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
    <g class="industrial-cursor__nut">
      <path d="m20 8 10 6v12l-10 5-10-5V14Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="20" cy="20" r="5" fill="#fff" stroke="var(--cursor-accent)" stroke-width="2"/>
    </g></svg>`;
  document.body.appendChild(cursor);
  const hide = () => {
    cursor.classList.remove('is-visible');
    document.documentElement.classList.remove('industrial-cursor-active');
  };
  document.addEventListener('pointermove', event => {
    if (!motion.matches || event.pointerType !== 'mouse') { hide(); return; }
    // Los controles de texto y deshabilitados conservan su cursor nativo.
    const nativeCursor = getComputedStyle(event.target).cursor;
    if (!/tuerca-|cursor-vacio/.test(nativeCursor) || event.target.closest('dialog')) { hide(); return; }
    cursor.classList.toggle('is-interactive', /naranja|#orange/.test(nativeCursor));
    cursor.style.transform = `translate3d(${event.clientX - 2}px,${event.clientY - 2}px,0)`;
    cursor.classList.add('is-visible');
    document.documentElement.classList.add('industrial-cursor-active');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('scroll', hide, { passive: true, capture: true });
  motion.addEventListener('change', hide);
}


function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm || contactForm.dataset.initialized) return;
  contactForm.dataset.initialized = 'true';
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    // Mismo comportamiento local que el formulario de las otras páginas.
    alert('Solicitud enviada.');
  });
  const items = document.querySelectorAll('#contacto .reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  items.forEach(item => observer.observe(item));
}

function initProductDetail() {
  initContactForm();
  initIndustrialCursor();
const products = {
  barras: {
    name: 'Barras',
    image: 'barras.png',
    intro: 'Barras y perfiles de acero inoxidable para fabricación, montaje y mantenimiento industrial.',
    description: 'Una alternativa versátil para proyectos que necesitan resistencia, precisión y una terminación durable.',
    applications: 'Estructuras, soportes, fabricación de piezas y mantenimiento de equipos.',
    availability: 'Consulta diámetros, largos, calidades y disponibilidad según tu requerimiento.'
  },
  valvulas: {
    name: 'Válvulas',
    image: 'BARRAS 1.png',
    eyebrow: 'Válvulas industriales',
    types: ['Válvula de compuerta', 'Válvula de bola', 'Válvula mariposa', 'Válvula de globo', 'Válvula de retención', 'Válvula de aguja'],
    intro: 'Componentes para apertura, cierre, regulación y control seguro de fluidos.',
    description: 'Seleccionamos válvulas de acuerdo con el fluido, la presión, la temperatura y las condiciones de operación.',
    applications: 'Procesos industriales, conducción de fluidos, agua, vapor y servicios auxiliares.',
    availability: 'Consulta tipos, conexiones, diámetros, materiales y rangos de presión disponibles.'
  },
  accesorios: {
    name: 'Accesorios',
    image: 'BARRAS 1.png',
    intro: 'Componentes complementarios para completar instalaciones y montajes industriales.',
    description: 'Encuentra soluciones compatibles para unir, adaptar, proteger y mantener tus instalaciones.',
    applications: 'Montajes, piping, estructuras, mantenimiento y ampliación de instalaciones.',
    availability: 'Indícanos medidas, material y aplicación para encontrar la alternativa adecuada.'
  },
  controles: {
    name: 'Controles',
    image: 'controles.png',
    intro: 'Instrumentos y equipos para medir, supervisar y controlar procesos industriales.',
    description: 'Productos orientados a mejorar la lectura de variables y la toma de decisiones en planta.',
    applications: 'Medición de presión, caudal, temperatura y supervisión de procesos.',
    availability: 'Consulta rangos, conexiones, precisión y compatibilidad con tu instalación.'
  },
  empaques: {
    name: 'Empaques',
    image: 'sello mecanico doble.png',
    intro: 'Soluciones de sellado para proteger uniones y reducir pérdidas en distintas aplicaciones.',
    description: 'Materiales pensados para trabajar en condiciones exigentes y facilitar el mantenimiento.',
    applications: 'Bridas, bombas, equipos de proceso, tuberías y mantenimiento industrial.',
    availability: 'Consulta medidas, materiales, temperaturas y compatibilidad química.'
  },
  planchas: {
    name: 'Planchas',
    image: 'planchas.png',
    intro: 'Planchas de acero inoxidable para fabricación, construcción y procesos industriales.',
    description: 'Una base confiable para piezas, revestimientos y soluciones fabricadas a medida.',
    applications: 'Fabricación de equipos, revestimientos, estructuras y proyectos especiales.',
    availability: 'Consulta espesores, formatos, calidades y terminaciones disponibles.'
  },
  cilindros: {
    name: 'Cilindros',
    image: 'BARRAS 1.png',
    intro: 'Cilindros para usos técnicos, operación industrial y necesidades de suministro.',
    description: 'Te ayudamos a definir el producto según capacidad, material, conexión y uso final.',
    applications: 'Procesos productivos, almacenamiento, conducción y servicios industriales.',
    availability: 'Consulta capacidades, dimensiones, materiales y condiciones de entrega.'
  },
  soldadura: {
    name: 'Soldadura',
    image: 'BARRAS 1.png',
    intro: 'Equipos y suministros para trabajos de soldadura y fabricación industrial.',
    description: 'Soluciones para ejecutar uniones confiables, repetibles y adecuadas a cada material.',
    applications: 'Fabricación, montaje, reparación y mantenimiento de estructuras y equipos.',
    availability: 'Consulta consumibles, equipos y accesorios según el proceso de soldadura.'
  },
  'sellos-mecanicos': {
    name: 'Sellos mecánicos',
    image: 'sellos mecanico.png',
    intro: 'Sistemas de sellado para equipos rotativos y aplicaciones de alta exigencia.',
    description: 'Ayudan a mantener la continuidad operativa y evitar fugas en equipos críticos.',
    applications: 'Bombas, agitadores, mezcladores y equipos rotativos industriales.',
    availability: 'Consulta medidas, materiales, caras de sello y compatibilidad con el equipo.'
  },
  barandas: {
    name: 'Barandas',
    image: 'BARRAS 1.png',
    intro: 'Soluciones en acero inoxidable para protección y terminaciones en proyectos industriales y comerciales.',
    description: 'Diseñamos alternativas resistentes y funcionales para delimitar, proteger y ordenar espacios.',
    applications: 'Plantas, escaleras, plataformas, pasarelas y espacios comerciales.',
    availability: 'Consulta dimensiones, terminaciones y opciones de fabricación a medida.'
  }
};

const key = new URLSearchParams(window.location.search).get('categoria') || 'barras';
const product = products[key] || products.barras;
const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

setText('productTitle', product.name);
setText('productEyebrow', product.eyebrow || `${product.name} industriales`);
setText('productIntro', product.intro);
setText('productDescription', product.description);
setText('productApplications', product.applications);
setText('productAvailability', product.availability);
const typesTitle = document.getElementById('productTypesTitle');
if (typesTitle) {
  typesTitle.replaceChildren(
    document.createTextNode('Explora nuestros'),
    document.createElement('br'),
    document.createTextNode(`tipos de ${product.name.toLocaleLowerCase('es')}`)
  );
}

document.title = `${product.name} | Grupo Inox S.R.L.`;
const image = document.getElementById('productImage');
if (image) {
  image.src = `../../images/productos/${product.image}`;
  image.alt = product.name;
}

const defaultTypes = [
  `${product.name} estándar`,
  `${product.name} industrial`,
  `${product.name} reforzado`,
  `${product.name} compacto`,
  `${product.name} especial`,
  `${product.name} a medida`
];
const typeGrid = document.getElementById('productTypes');
if (typeGrid) {
  const cards = document.createDocumentFragment();
  (product.types || defaultTypes).forEach(typeName => {
    const card = document.createElement('article');
    card.className = 'product-type-card';
    card.innerHTML = `
      <img class="product-type-card__image" src="../../images/productos/${product.image}" alt="${typeName}" loading="lazy">
      <h3>${typeName}</h3>
      <a class="btn btn-primary btn-arrow" href="../contacto/contacto.html">Ver productos</a>`;
    cards.appendChild(card);
  });
  typeGrid.replaceChildren(cards);
}
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductDetail, { once: true });
} else {
  initProductDetail();
}
})();
