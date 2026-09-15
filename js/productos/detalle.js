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
const products = window.INOX_CATEGORIES;
const key = new URLSearchParams(window.location.search).get('categoria') || 'barras';
const product = Object.hasOwn(products, key) ? products[key] : products.barras;
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
  `${product.name} de tipo estándar`,
  `${product.name} para uso industrial`,
  `${product.name} de diseño reforzado`,
  `${product.name} de diseño compacto`,
  `${product.name} para aplicaciones especiales`,
  `${product.name} a medida`
];
const typeGrid = document.getElementById('productTypes');
if (typeGrid) {
  const cards = document.createDocumentFragment();
  (product.types || defaultTypes).forEach((typeName, index) => {
    const card = document.createElement('article');
    card.className = 'product-type-card';
    card.innerHTML = `
      <img class="product-type-card__image" src="../../images/productos/${product.image}" alt="${typeName}" loading="lazy">
      <h3>${typeName}</h3>
      <a class="btn btn-primary btn-arrow" href="ficha.html?categoria=${encodeURIComponent(key)}&amp;tipo=${index}">Ver producto</a>`;
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


