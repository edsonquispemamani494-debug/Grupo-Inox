function initProductShop() {
  'use strict';
  const categories = window.INOX_CATEGORIES;
  if (!categories) return;
  const specialTypes = {
    controles: ['Caudalímetro', 'Instrumentos de control', 'Instrumentos de medición'],
    'sellos-mecanicos': ['Sello mecánico doble', 'Sello mecánico', 'Sellos para equipos rotativos']
  };
  const typesFor = key => categories[key].types || specialTypes[key] || [
    `${categories[key].name} de tipo estándar`, `${categories[key].name} para uso industrial`,
    `${categories[key].name} de diseño reforzado`, `${categories[key].name} de diseño compacto`,
    `${categories[key].name} para aplicaciones especiales`, `${categories[key].name} a medida`
  ];
  const resolve = (key, index = 0, model = 0) => {
    if (!Object.hasOwn(categories, key)) key = 'barras';
    const category = categories[key];
    const types = typesFor(key);
    if (!Number.isInteger(index) || index < 0 || index >= types.length) index = 0;
    if (!Number.isInteger(model) || model < 0 || model > 3) model = 0;
    const brands = ['GENEBRE', 'SPIRAX SARCO', 'DANFOSS', 'HONEYWELL'];
    const materials = ['Acero inoxidable', 'Acero al carbono', 'Hierro dúctil', 'Bronce'];
    const connections = ['Bridada', 'Roscada', 'Soldable', 'Clamp'];
    const modelNames = ['PN16', 'Clase 800', 'PN25', 'Serie industrial'];
    let image = category.image;
    if (key === 'valvulas') image = 'valvula de compuerta.png';
    if (key === 'controles' && index === 0) image = 'caudalimetro.png';
    if (key === 'sellos-mecanicos' && index === 0) image = 'sello mecanico doble.png';
    return { key, index, model, id: `${key}:${index}:${model}`, name: types[index], category,
      image: `../../images/productos/${image}`,
      brand: brands[model], material: materials[model], connection: connections[model], modelName: modelNames[model],
      reference: `${key.toUpperCase()}-${String(index + 1).padStart(2, '0')}-${String(model + 1).padStart(3, '0')}`,
      url: `ficha.html?categoria=${encodeURIComponent(key)}&tipo=${index}&modelo=${model}` };
  };
  const storageKey = 'inox-product-cart-v1';
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) saved.slice(0, 100).forEach(row => {
      if (!row || !Object.hasOwn(categories, row.key) || !Number.isInteger(row.index) || row.index < 0 || row.index >= typesFor(row.key).length || !Number.isInteger(row.quantity) || row.quantity < 1) return;
      const product = resolve(row.key, row.index, Number.isInteger(row.model) ? row.model : 0);
      const previous = cart.find(item => item.id === product.id);
      if (previous) previous.quantity = Math.min(999, previous.quantity + row.quantity);
      else cart.push({ ...product, quantity: Math.min(999, row.quantity) });
    });
  } catch { /* El carrito sigue funcionando si el almacenamiento no está disponible. */ }
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cart-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'productCart');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 3h3l3 12h11l3-9H6M9 19h.01M18 19h.01" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.2"/><circle cx="18" cy="19" r="1.2"/></svg> Mi carrito <span class="cart-count">0</span>';
  const dialog = document.createElement('dialog');
  dialog.id = 'productCart';
  dialog.className = 'cart-dialog';
  dialog.setAttribute('aria-labelledby', 'cartTitle');
  dialog.innerHTML = '<div class="cart-heading"><h2 id="cartTitle">Mi carrito</h2><button type="button" class="cart-close" aria-label="Cerrar carrito">×</button></div><p class="cart-intro">Tu selección de productos industriales.</p><div class="cart-items"></div><div class="cart-footer"><strong class="cart-total"></strong><p>cambiar texto cuando sea aprobado.</p><button type="button" class="shop-primary cart-continue">Seguir explorando →</button></div>';
  const status = document.createElement('div');
  status.className = 'cart-status';
  status.setAttribute('role', 'status');
  document.body.append(trigger, dialog, status);
  let statusTimer;
  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    statusTimer = setTimeout(() => { status.textContent = ''; }, 4000);
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart.map(({ key, index, model, quantity }) => ({ key, index, model, quantity })))); }
    catch { announce('Selección actualizada. No se pudo guardar en este navegador.'); }
  }
  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    trigger.querySelector('.cart-count').textContent = count;
    trigger.setAttribute('aria-label', `Abrir carrito, ${count} unidades`);
    dialog.querySelector('.cart-total').textContent = `${cart.length} productos · ${count} unidades`;
    const list = dialog.querySelector('.cart-items');
    list.replaceChildren();
    if (!cart.length) {
      const empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = 'Tu carrito está vacío. Explora el catálogo y agrega los productos que te interesan.';
      list.append(empty);
    }
    cart.forEach(item => {
      const row = document.createElement('article');
      row.className = 'cart-item';
      row.innerHTML = `<a href="${item.url}" tabindex="-1"><img src="${item.image}" alt=""></a><div><h3><a href="${item.url}">${item.name}</a></h3><div class="cart-item-controls"><button type="button" class="cart-step" data-action="decrease" aria-label="Reducir cantidad de ${item.name}" ${item.quantity === 1 ? 'disabled' : ''}>−</button><span>${item.quantity}</span><button type="button" class="cart-step" data-action="increase" aria-label="Aumentar cantidad de ${item.name}" ${item.quantity === 999 ? 'disabled' : ''}>+</button></div><button type="button" class="cart-remove" data-action="remove" aria-label="Quitar ${item.name}">Quitar producto</button></div>`;
      row.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'remove') cart = cart.filter(entry => entry.id !== item.id);
        else item.quantity = Math.max(1, Math.min(999, item.quantity + (action === 'increase' ? 1 : -1)));
        persist(); renderCart();
        const updated = [...list.children].find(child => child.dataset.id === item.id);
        const replacement = updated?.querySelector(`[data-action="${action}"]:not(:disabled)`) || updated?.querySelector('[data-action="remove"]');
        (replacement || dialog.querySelector('.cart-close')).focus();
      }));
      row.dataset.id = item.id;
      list.append(row);
    });
  }
  trigger.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.cart-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.cart-continue').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; trigger.focus(); });
  trigger.addEventListener('click', () => { document.body.style.overflow = 'hidden'; });
  renderCart();

  // Enlaces de destacados y categorías existentes.
  document.querySelectorAll('.featured-product-card').forEach(card => {
    const name = card.querySelector('h3')?.textContent || '';
    const key = name.includes('compuerta') ? 'valvulas' : name.includes('doble') ? 'sellos-mecanicos' : 'controles';
    const product = resolve(key);
    const button = card.querySelector('button');
    if (button) button.addEventListener('click', () => { location.href = product.url; });
  });
  const tileKeys = { 'categoria-4': 'empaques', 'categoria-8': 'sellos-mecanicos', 'categoria-9': 'barandas' };
  document.querySelectorAll('.category-tile').forEach(tile => {
    const key = tileKeys[tile.id] || tile.id;
    const link = tile.querySelector('a');
    if (link && Object.hasOwn(categories, key)) {
      link.href = `detalle.html?categoria=${key}`;
      link.textContent = 'Ver productos';
      link.setAttribute('aria-label', `Ver ${categories[key].name}`);
    }
  });
  const params = new URLSearchParams(location.search);
  const product = resolve(params.get('categoria') || (document.getElementById('productSheet') ? 'valvulas' : 'barras'), Number(params.get('tipo') || 0), Number(params.get('modelo') || 0));
  // Mantener nombres e imágenes iguales entre categoría y ficha.
  document.querySelectorAll('.product-type-card').forEach((card, index) => {
    const item = resolve(product.key, index);
    if (index >= typesFor(product.key).length) { card.remove(); return; }
    card.querySelector('h3').textContent = item.name;
    const img = card.querySelector('img');
    img.src = item.image; img.alt = item.name;
    card.querySelector('a').href = document.body.classList.contains('product-detail-page')
      ? `listado.html?categoria=${encodeURIComponent(product.key)}&tipo=${index}` : item.url;
  });
  if (!document.getElementById('productSheet')) return;
  document.title = `${product.name} ${product.modelName} | Grupo Inox S.R.L.`;
  const text = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
  text('sheetTitle', `${product.name} ${product.modelName}`);
  text('sheetCategory', product.category.eyebrow || product.category.name);
  text('sheetReference', product.reference);
  text('sheetDescription', product.category.intro);
  const brandLogoFiles = {
    'GENEBRE': 'display-genebre.png',
    'SPIRAX SARCO': 'display-spiraxsarco.png',
    'DANFOSS': 'display-danfoos.png',
    'HONEYWELL': 'display-honeywell.png'
  };
  const brandLogo = document.getElementById('sheetBrandLogo');
  if (brandLogo) {
    brandLogo.src = `../../images/productos/marcas/${brandLogoFiles[product.brand] || 'display-genebre.png'}`;
    brandLogo.alt = product.brand;
  }
  text('sheetMaterials', `${product.material}. Los componentes específicos se confirmarán según el modelo seleccionado.`);
  text('sheetDimensions', `${product.modelName}, conexión ${product.connection.toLocaleLowerCase('es')}. ${product.category.availability}`);
  for (const id of ['categoryLink', 'seeCategory']) {
    const link = document.getElementById(id);
    if (link) link.href = `detalle.html?categoria=${product.key}`;
  }
  const listingLink = document.getElementById('listingLink');
  if (listingLink) listingLink.href = `listado.html?categoria=${encodeURIComponent(product.key)}&tipo=${product.index}`;
  text('categoryLink', product.category.name);
  const mainImage = document.getElementById('sheetImage');
  mainImage.src = product.image; mainImage.alt = `${product.name} ${product.modelName}`;
  ['Vista general', 'Detalle ampliado', 'Vista inclinada'].forEach((label, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'sheet-thumbnail';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(index === 0));
    button.innerHTML = `<img src="${product.image}" alt="">`;
    if (index === 1) button.firstChild.style.transform = 'scale(1.15)';
    if (index === 2) button.firstChild.style.transform = 'rotate(-12deg)';
    button.addEventListener('click', () => {
      document.querySelectorAll('.sheet-thumbnail').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      mainImage.parentElement.classList.toggle('is-closeup', index === 1);
      mainImage.parentElement.classList.toggle('is-side', index === 2);
      mainImage.alt = `${product.name}: ${label.toLowerCase()}`;
    });
    document.getElementById('sheetThumbnails').append(button);
  });
  const specs = [ ['Producto', product.name], ['Modelo', product.modelName], ['Marca', product.brand], ['Categoría', product.category.name], ['Referencia del catálogo', product.reference], ['Aplicaciones', product.category.applications], ['Material', product.material], ['Conexiones / montaje', product.connection], ['Dimensiones', 'Por confirmar según requerimiento'], ['Condiciones de operación', 'Consultar especificaciones del fabricante'], ['Disponibilidad', 'Por confirmar'] ];
  const specsBody = document.getElementById('sheetSpecs');
  specs.forEach(([label, value]) => {
    const row = document.createElement('tr');
    const heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = label;
    const cell = document.createElement('td'); cell.textContent = value;
    row.append(heading, cell); specsBody?.append(row);
  });
  document.getElementById('addToCart').addEventListener('click', () => {
    const input = document.getElementById('sheetQuantity');
    if (!input.reportValidity()) return;
    const quantity = Number(input.value);
    const existing = cart.find(item => item.id === product.id);
    if ((existing?.quantity || 0) + quantity > 999) { announce('Puedes agregar hasta 999 unidades de cada producto.'); return; }
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    announce(`${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito.`);
    persist(); renderCart();
  });
  const related = typesFor(product.key).map((_, index) => resolve(product.key, index)).filter(item => item.id !== product.id).slice(0, 3);
  if (related.length < 3) related.push(resolve(product.key === 'valvulas' ? 'controles' : 'valvulas'));
  const relatedGrid = document.getElementById('sheetRelated');
  related.forEach(item => {
    const card = document.createElement('article'); card.className = 'sheet-related-card';
    card.innerHTML = `<img src="${item.image}" alt="${item.name}" loading="lazy"><div class="sheet-related-body"><h3>${item.name}</h3><small>Referencia: ${item.reference}</small><a class="shop-primary" href="${item.url}">Ver producto <span aria-hidden="true">→</span></a></div>`;
    relatedGrid?.append(card);
  });
  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault(); alert('Solicitud enviada.');
  });
  const contactRevealItems = document.querySelectorAll('#contacto .reveal');
  if ('IntersectionObserver' in window) {
    const contactObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      contactObserver.unobserve(entry.target);
    }), { threshold: .12 });
    contactRevealItems.forEach(item => contactObserver.observe(item));
  } else {
    contactRevealItems.forEach(item => item.classList.add('visible'));
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductShop, { once: true });
} else {
  initProductShop();
}
