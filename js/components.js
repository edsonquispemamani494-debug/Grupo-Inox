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

  }

  window.addEventListener('scroll', handleHeader);
  window.addEventListener('resize', handleHeader);
  handleHeader();

  if (menuBtn && nav) {
    const mobileMenu = window.matchMedia('(max-width: 1100px)');
    function setMenuOpen(isOpen) {
      nav.classList.toggle('open', isOpen);
      header.classList.toggle('menu-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      nav.inert = mobileMenu.matches && !isOpen;
      if (!isOpen) {
        nav.querySelectorAll('.submenu-open').forEach(item => {
          item.classList.remove('submenu-open');
          item.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false');
        });
      }
    }
    setMenuOpen(false);
    mobileMenu.addEventListener('change', () => setMenuOpen(false));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });
    document.addEventListener('click', event => {
      if (nav.classList.contains('open') && !header.contains(event.target)) setMenuOpen(false);
    });
    header.addEventListener('focusout', event => {
      if (nav.classList.contains('open') && !header.contains(event.relatedTarget)) setMenuOpen(false);
    });
    menuBtn.addEventListener('click', () => {
      setMenuOpen(!nav.classList.contains('open'));
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
        setMenuOpen(false);
      });
    });
  }
}

function initSharedQuoteForm() {
  const form = document.getElementById('contactForm');
  if (!form || form.dataset.contactMethod === 'email') return;

  form.dataset.contactMethod = 'email';
  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;

    const labels = [...form.querySelectorAll('label')];
    const fields = [...form.querySelectorAll('input, select, textarea')]
      .filter(field => !['button', 'submit', 'reset'].includes(field.type))
      .map(field => {
        const label = labels.find(item => item.htmlFor === field.id)?.textContent.trim()
          || field.id || 'Dato';
        return `${label}: ${field.value.trim()}`;
      });
    const pageName = document.title.split('|')[0].trim() || 'Grupo Inox';
    const subject = `Solicitud web - ${pageName}`;
    const body = [
      'Nueva solicitud desde el sitio web de Grupo Inox.',
      '',
      ...fields,
      '',
      `Página de origen: ${window.location.href}`
    ].join('\n');

    window.location.href = `mailto:info@grupoinox.com.bo?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, true);
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

  const footerYear = document.querySelector('[data-footer-year]');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  initSharedHeader();
}

initSharedQuoteForm();
initSharedComponents();
