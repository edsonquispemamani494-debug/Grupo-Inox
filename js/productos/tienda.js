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
  const resolve = (key, index = 0) => {
    if (!Object.hasOwn(categories, key)) key = 'barras';
    const category = categories[key];
    const types = typesFor(key);
    if (!Number.isInteger(index) || index < 0 || index >= types.length) index = 0;
    let image = category.image;
    if (key === 'valvulas') image = 'valvula de compuerta.png';
    if (key === 'controles' && index === 0) image = 'caudalimetro.png';
    if (key === 'sellos-mecanicos' && index === 0) image = 'sello mecanico doble.png';
    return { key, index, id: `${key}:${index}`, name: types[index], category,
      image: `../../images/productos/${image}`,
      reference: `${key.toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
      url: `ficha.html?categoria=${encodeURIComponent(key)}&tipo=${index}` };
  };
  const storageKey = 'inox-product-cart-v1';
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) saved.slice(0, 100).forEach(row => {
      if (!row || !Object.hasOwn(categories, row.key) || !Number.isInteger(row.index) || row.index < 0 || row.index >= typesFor(row.key).length || !Number.isInteger(row.quantity) || row.quantity < 1) return;
      const product = resolve(row.key, row.index);
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
  dialog.innerHTML = '<div class="cart-heading"><h2 id="cartTitle">Mi carrito</h2><button type="button" class="cart-close" aria-label="Cerrar carrito">×</button></div><p class="cart-intro">Tu selección de productos industriales.</p><div class="cart-items"></div><div class="cart-footer"><strong class="cart-total"></strong><p>Las compras aún no están habilitadas. Esta selección no genera un pedido ni una solicitud de cotización.</p><button type="button" class="shop-primary cart-continue">Seguir explorando →</button></div>';
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
    try { localStorage.setItem(storageKey, JSON.stringify(cart.map(({ key, index, quantity }) => ({ key, index, quantity })))); }
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
  const product = resolve(params.get('categoria') || (document.getElementById('productSheet') ? 'valvulas' : 'barras'), Number(params.get('tipo') || 0));
  // Mantener nombres e imágenes iguales entre categoría y ficha.
  document.querySelectorAll('.product-type-card').forEach((card, index) => {
    const item = resolve(product.key, index);
    if (index >= typesFor(product.key).length) { card.remove(); return; }
    card.querySelector('h3').textContent = item.name;
    const img = card.querySelector('img');
    img.src = item.image; img.alt = item.name;
    card.querySelector('a').href = item.url;
  });
  if (!document.getElementById('productSheet')) return;
  document.title = `${product.name} | Grupo Inox S.R.L.`;
  const text = (id, value) => { document.getElementById(id).textContent = value; };
  text('sheetTitle', product.name);
  text('sheetCategory', product.category.eyebrow || product.category.name);
  text('sheetReference', product.reference);
  text('sheetDescription', product.category.intro);
  text('sheetMaterials', 'Los componentes y materiales específicos se confirmarán para cada modelo.');
  text('sheetDimensions', product.category.availability);
  for (const id of ['categoryLink', 'seeCategory']) document.getElementById(id).href = `detalle.html?categoria=${product.key}`;
  text('categoryLink', product.category.name);
  const mainImage = document.getElementById('sheetImage');
  mainImage.src = product.image; mainImage.alt = product.name;
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
  const specs = [ ['Producto', product.name], ['Categoría', product.category.name], ['Referencia del catálogo', product.reference], ['Aplicaciones', product.category.applications], ['Material', 'Por confirmar según modelo'], ['Conexiones / montaje', 'Por confirmar según aplicación'], ['Dimensiones', 'Por confirmar según requerimiento'], ['Condiciones de operación', 'Consultar especificaciones del fabricante'], ['Disponibilidad', 'Por confirmar'] ];
  specs.forEach(([label, value]) => {
    const row = document.createElement('tr');
    const heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = label;
    const cell = document.createElement('td'); cell.textContent = value;
    row.append(heading, cell); document.getElementById('sheetSpecs').append(row);
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
  related.forEach(item => {
    const card = document.createElement('article'); card.className = 'sheet-related-card';
    card.innerHTML = `<img src="${item.image}" alt="${item.name}" loading="lazy"><div class="sheet-related-body"><h3>${item.name}</h3><small>Referencia: ${item.reference}</small><a class="shop-primary" href="${item.url}">Ver producto <span aria-hidden="true">→</span></a></div>`;
    document.getElementById('sheetRelated').append(card);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductShop, { once: true });
} else {
  initProductShop();
}


