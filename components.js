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
  const hero = document.getElementById('inicio');

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
  await Promise.all([
    loadComponent('#site-header', 'header.html'),
    loadComponent('#site-footer', 'footer.html')
  ]);

  initSharedHeader();
}

initSharedComponents();
