(() => {
  const categories = window.INOX_CATEGORIES;
  if (!categories) return;
  const params = new URLSearchParams(location.search);
  let key = params.get('categoria') || 'valvulas';
  if (!Object.hasOwn(categories, key)) key = 'valvulas';
  const category = categories[key];
  const specialTypes = {
    controles: ['Caudalímetro', 'Instrumentos de control', 'Instrumentos de medición'],
    'sellos-mecanicos': ['Sello mecánico doble', 'Sello mecánico', 'Sellos para equipos rotativos']
  };
  const defaultTypes = [
    `${category.name} de tipo estándar`, `${category.name} para uso industrial`,
    `${category.name} de diseño reforzado`, `${category.name} de diseño compacto`,
    `${category.name} para aplicaciones especiales`, `${category.name} a medida`
  ];
  const types = category.types || specialTypes[key] || defaultTypes;
  let typeIndex = Number(params.get('tipo') || 0);
  if (!Number.isInteger(typeIndex) || typeIndex < 0 || typeIndex >= types.length) typeIndex = 0;
  const typeName = types[typeIndex];
  const brands = ['GENEBRE', 'SPIRAX SARCO', 'DANFOSS', 'HONEYWELL'];
  const brandLogos = {
    'GENEBRE': 'display-genebre.png',
    'SPIRAX SARCO': 'display-spiraxsarco.png',
    'DANFOSS': 'display-danfoos.png',
    'HONEYWELL': 'display-honeywell.png'
  };
  const materials = ['Acero inoxidable', 'Acero al carbono', 'Hierro dúctil', 'Bronce'];
  const connections = ['Bridada', 'Roscada', 'Soldable', 'Clamp'];
  const modelNames = ['PN16', 'Clase 800', 'PN25', 'Serie industrial'];
  let imageName = category.image;
  if (key === 'valvulas') imageName = 'valvula de compuerta.png';
  if (key === 'controles' && typeIndex === 0) imageName = 'caudalimetro.png';
  if (key === 'sellos-mecanicos' && typeIndex === 0) imageName = 'sello mecanico doble.png';
  const image = `../../images/productos/${imageName}`;
  const variants = modelNames.map((model, index) => ({
    model: index,
    name: typeName,
    modelName: model,
    brand: brands[index],
    material: materials[index],
    connection: connections[index],
    reference: `${key.toUpperCase()}-${String(typeIndex + 1).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`
  }));

  const text = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
  text('listingEyebrow', category.eyebrow || category.name);
  text('listingTitle', typeName);
  text('listingIntro', category.intro);
  document.title = `${typeName} disponibles | Grupo Inox S.R.L.`;
  const heroImage = document.getElementById('listingImage');
  heroImage.src = image; heroImage.alt = typeName;
  const back = document.getElementById('listingBack');
  back.href = `detalle.html?categoria=${encodeURIComponent(key)}`;
  document.getElementById('requestProduct').value = typeName;

  const selected = { brand: new Set(), material: new Set(), connection: new Set() };
  const brandButtons = new Map();
  const syncBrandControls = () => {
    brandButtons.forEach((button, brand) => {
      const active = selected.brand.has(brand);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('#brandFilters input').forEach(input => {
      input.checked = selected.brand.has(input.value);
    });
  };
  const filterDefinitions = [
    ['brand', 'brandFilters', brands],
    ['material', 'materialFilters', materials],
    ['connection', 'connectionFilters', connections]
  ];
  const renderProducts = () => {
    const visible = variants.filter(product => Object.entries(selected).every(([property, values]) => !values.size || values.has(product[property])));
    const grid = document.getElementById('availableProducts');
    grid.replaceChildren();
    visible.forEach(product => {
      const card = document.createElement('article');
      card.className = 'available-product';
      const url = `ficha.html?categoria=${encodeURIComponent(key)}&tipo=${typeIndex}&modelo=${product.model}`;
      card.innerHTML = `<img class="available-product__image" src="${image}" alt="${product.name} ${product.modelName}" loading="lazy"><div class="available-product__body"><h3>${product.name}</h3><p class="available-product__model">${product.modelName}</p><div class="available-product__meta"><span>Referencia: ${product.reference}</span><span class="available-product__brand">${product.brand}</span></div><a class="shop-primary" href="${url}">Ver producto <span aria-hidden="true">→</span></a></div>`;
      grid.append(card);
    });
    text('listingCount', `${visible.length} ${visible.length === 1 ? 'modelo disponible' : 'modelos disponibles'}`);
    document.getElementById('noProducts').hidden = visible.length > 0;
    syncBrandControls();
  };
  filterDefinitions.forEach(([property, targetId, values]) => {
    const target = document.getElementById(targetId);
    values.forEach(value => {
      const label = document.createElement('label');
      label.className = 'product-filter';
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = value;
      input.addEventListener('change', () => {
        input.checked ? selected[property].add(value) : selected[property].delete(value);
        renderProducts();
      });
      label.append(input, document.createTextNode(value));
      target.append(label);
    });
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    Object.values(selected).forEach(values => values.clear());
    document.querySelectorAll('.product-filter input').forEach(input => { input.checked = false; });
    renderProducts();
  });
  const filters = document.querySelector('.product-filters');
  document.querySelector('.product-filters__toggle').addEventListener('click', event => {
    const open = filters.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.querySelector('span').textContent = open ? '−' : '+';
  });
  brands.forEach(brand => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'available-brand';
    item.setAttribute('aria-label', `Mostrar productos de ${brand}`);
    item.setAttribute('aria-pressed', 'false');
    const logo = document.createElement('img');
    logo.src = `../../images/productos/marcas/${brandLogos[brand]}`;
    logo.alt = brand;
    logo.loading = 'lazy';
    item.append(logo);
    item.addEventListener('click', () => {
      const removeFilter = selected.brand.size === 1 && selected.brand.has(brand);
      selected.brand.clear();
      if (!removeFilter) selected.brand.add(brand);
      renderProducts();
      document.getElementById('availableTitle').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
    brandButtons.set(brand, item);
    document.getElementById('availableBrands').append(item);
  });
  document.getElementById('contactForm').addEventListener('submit', event => {
    event.preventDefault(); alert('Solicitud enviada.');
  });
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: .12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }
  renderProducts();
})();
