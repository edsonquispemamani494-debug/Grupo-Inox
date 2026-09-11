async function loadComponent(selector, file) {
  const target = document.querySelector(selector);
  if (!target) return;

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
    target.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
  }
}

function initSharedHeader() {
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const headerLogo = document.getElementById('headerLogo');
  // Detecta automáticamente el hero de cualquier plantilla para conservar
  // el mismo cambio de transparencia y color utilizado en la página principal.
  const hero = document.querySelector(
    '[data-header-hero], main > .hero, main > .internal-hero, main > .contact-hero, main > .about-hero'
  );

  if (!header) return;

  function handleHeader() {
    let isScrolled;

    if (hero) {
      const headerHeight = header.offsetHeight;
      const heroEnd = hero.offsetTop + hero.offsetHeight - headerHeight;
      isScrolled = window.scrollY >= heroEnd;
    } else {
      isScrolled = true;
    }

    header.classList.toggle('scrolled', isScrolled);

    if (headerLogo) {
      const logoWhite = headerLogo.dataset.logoWhite;
      const logoColor = headerLogo.dataset.logoColor;
      headerLogo.src = isScrolled ? logoColor : logoWhite;
    }

    if (menuBtn) {
      menuBtn.style.color = isScrolled ? '#071f37' : '#ffffff';
    }
  }

  window.addEventListener('scroll', handleHeader);
  window.addEventListener('resize', handleHeader);
  handleHeader();

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.submenu-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.has-submenu');
        const isOpen = item.classList.toggle('submenu-open');
        button.setAttribute('aria-expanded', String(isOpen));
      });
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

async function initSharedComponents() {
  const currentPath = window.location.pathname.replace(/\\/g, '/');
  const isHtmlPage = currentPath.includes('/html/');
  const isNestedHtmlPage = /\/html\/[^/]+\/[^/]+$/.test(currentPath);
  const componentBase = isNestedHtmlPage ? '../' : (isHtmlPage ? '' : 'html/');

  await Promise.all([
    loadComponent('#site-header', `${componentBase}header.html`),
    loadComponent('#site-footer', `${componentBase}footer.html`)
  ]);

  const pagePrefix = isNestedHtmlPage ? '../' : (isHtmlPage ? '' : 'html/');
  const rootPrefix = isNestedHtmlPage ? '../../' : (isHtmlPage ? '../' : '');

  document.querySelectorAll('#site-header a[href], #site-footer a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.includes(':')) return;
    link.setAttribute('href', href.startsWith('index.html') ? `${rootPrefix}${href}` : `${pagePrefix}${href}`);
  });

  document.querySelectorAll('#site-header img, #site-footer img').forEach(image => {
    const src = image.getAttribute('src');
    if (src) image.setAttribute('src', `${rootPrefix}${src}`);
    ['logoWhite', 'logoColor'].forEach(key => {
      if (image.dataset[key]) image.dataset[key] = `${rootPrefix}${image.dataset[key]}`;
    });
  });

  initSharedHeader();
}

initSharedComponents();

