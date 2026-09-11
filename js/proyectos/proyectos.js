// Comportamiento independiente de esta página.
function initIndustrialCursor() {
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

initIndustrialCursor();

;

// Cada proyecto administra sus propias tres etapas, fotografías y progreso.
(() => {
  const stories = [...document.querySelectorAll('[data-project-story]')].map(root => ({
    steps: [...root.querySelectorAll('[data-story-step]')],
    frames: [...root.querySelectorAll('[data-story-frame]')],
    links: [...root.querySelectorAll('[data-story-link]')],
    rail: root.querySelector('.project-story__rail'),
    active: -1
  }));
  let scheduled = false;
  function updateStories() {
    scheduled = false;
    const focusLine = window.innerHeight * .48;
    stories.forEach(story => {
      if (!story.steps.length) return;
      const positions = story.steps.map(step => {
        const marker = step.querySelector('.project-story__marker');
        return marker ? marker.getBoundingClientRect().top + marker.offsetHeight / 2 : step.getBoundingClientRect().top;
      });
      let index = 0;
      positions.forEach((position, i) => { if (position <= focusLine) index = i; });
      if (index !== story.active) {
        story.active = index;
        story.steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
        story.frames.forEach((frame, i) => {
          frame.classList.toggle('is-active', i === index);
          frame.setAttribute('aria-hidden', String(i !== index));
        });
        story.links.forEach((link, i) => {
          if (i === index) link.setAttribute('aria-current', 'step');
          else link.removeAttribute('aria-current');
        });
      }
      if (story.rail) {
        const bounds = story.rail.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (focusLine - bounds.top) / Math.max(1, bounds.height)));
        story.rail.style.setProperty('--story-progress', String(progress));
      }
    });
  }
  function scheduleUpdate() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateStories); }
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
  document.querySelectorAll('.project-story img').forEach(image => image.addEventListener('load', scheduleUpdate, { once: true }));
  updateStories();
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .12 });
    reveals.forEach(item => observer.observe(item));
  } else reveals.forEach(item => item.classList.add('visible'));
  document.getElementById('contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    alert('Solicitud enviada.');
  });
})();
