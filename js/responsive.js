// Gestos compartidos: el scroll vertical queda en manos del navegador.
document.addEventListener('DOMContentLoaded', () => {
  function swipe(surface, previous, next) {
    if (!surface || !previous || !next) return;
    surface.classList.add('touch-carousel');
    let start = null;
    let suppressClickUntil = 0;
    surface.addEventListener('touchstart', event => {
      start = event.touches.length === 1
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    surface.addEventListener('touchmove', event => {
      if (event.touches.length !== 1) start = null;
    }, { passive: true });
    surface.addEventListener('touchcancel', () => { start = null; }, { passive: true });
    surface.addEventListener('touchend', event => {
      if (!start || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy) * 1.3) return;
      suppressClickUntil = performance.now() + 700;
      const action = dx > 0 ? previous : next;
      if (typeof action === 'function') action();
      else action.click();
    }, { passive: true });
    surface.addEventListener('click', event => {
      // Un deslizamiento sobre una imagen enlazada no debe abrir otra página.
      if (event.isTrusted && performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  document.querySelectorAll('.product-showcase').forEach(section => {
    swipe(section.querySelector('.product-showcase__slider'),
      section.querySelector('.product-showcase__nav:first-child'),
      section.querySelector('.product-showcase__nav:last-child'));
  });
  document.querySelectorAll('.service-carousel').forEach(surface => {
    const section = surface.closest('section');
    const selectors = [...section.querySelectorAll('[data-service]')];
    const move = step => {
      const current = selectors.findIndex(button => button.getAttribute('aria-pressed') === 'true');
      selectors[(current + step + selectors.length) % selectors.length]?.click();
    };
    swipe(surface, section.querySelector('#servicePrev') || (selectors.length && (() => move(-1))),
      section.querySelector('#serviceNext') || (selectors.length && (() => move(1))));
  });
  swipe(document.querySelector('#sectorTrack')?.parentElement,
    document.getElementById('sectorPrev'), document.getElementById('sectorNext'));
  swipe(document.querySelector('#productTrack')?.parentElement,
    document.getElementById('productPrev'), document.getElementById('productNext'));
  swipe(document.querySelector('#projectImage')?.closest('.project-grid'),
    document.getElementById('projectPrev'), document.getElementById('projectNext'));

  // Reutiliza los efectos visuales al entrar/salir del área visible solo en móvil.
  const mobile = window.matchMedia('(max-width:767px) and (hover:none) and (pointer:coarse)');
  const effectTargets = '.media-card,.why-card,.brand,.service-window,.service-slide,.category-tile,.featured-product-card,.product-type-card,.product-showcase__card,.available-product,.sheet-related-card,.purpose-image,.value-card,.team-card,.services-intro__image,.service-icon-card,.timeline-content,.advisory-card,.advisory-process__steps li,.maintenance-card,.maintenance-actions__image,.maintenance-actions__list li,.attention-process__steps li';
  // Copia las declaraciones originales, incluidos colores y zoom de cada página.
  const effectRules = [];
  function collectEffects(rules) {
    for (const rule of rules) {
      if (rule.selectorText && rule.selectorText.includes(':hover') &&
          /card|tile|image|brand|window|slide|timeline-content|advisory-process__steps|maintenance-actions__list|attention-process__steps/.test(rule.selectorText)) {
        effectRules.push(rule.selectorText.replaceAll(':hover', '.is-mobile-visible') + '{' + rule.style.cssText + '}');
      } else if (rule.cssRules) {
        const start = effectRules.length;
        collectEffects(rule.cssRules);
        if (rule.conditionText && effectRules.length > start) {
          const condition = rule.conditionText.replace(/\(hover:\s*hover\)|\(pointer:\s*fine\)/g, '(min-width:0px)');
          const nested = effectRules.splice(start);
          effectRules.push('@media ' + condition + '{' + nested.join('\n') + '}');
        }
      }
    }
  }
  for (const sheet of document.styleSheets) {
    try { collectEffects(sheet.cssRules); } catch { /* Hojas externas sin acceso CSSOM. */ }
  }
  const effects = document.createElement('style');
  effects.textContent = '@media(max-width:767px) and (hover:none) and (pointer:coarse){' + effectRules.join('\n') + '}';
  document.head.append(effects);
  const sharedEffectTargets = effectTargets + ',main img,.project-image,.project-story__frame,.sector-slide,.product-detail-hero__visual,.available-brand,.sheet-thumbnail,.sheet-certification-image,.sheet-image,.form-box,.branch-form';
  let cards = document.querySelectorAll(sharedEffectTargets);
  let centerUpdatePending = false;
  const updateCenteredCards = () => {
    centerUpdatePending = false;
    const viewportCenter = window.innerHeight / 2;
    const centerRange = Math.min(100, Math.max(48, window.innerHeight * .12));
    cards.forEach(card => {
      if (!mobile.matches) {
        card.classList.remove('is-mobile-visible');
        return;
      }
      const rect = card.getBoundingClientRect();
      // En el catálogo del Inicio se usa el centro de la tarjeta cerrada.
      // Así, al desplegarse no pierde el estado por el cambio de altura.
      const isHomeCatalogCard = card.matches('.home-page .product-showcase--centered .product-showcase__card');
      const cardCenter = isHomeCatalogCard ? rect.top + 41 : rect.top + rect.height / 2;
      const isOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      card.classList.toggle('is-mobile-visible',
        isOnScreen && Math.abs(cardCenter - viewportCenter) <= centerRange);
    });
  };
  const scheduleCenterUpdate = () => {
    if (centerUpdatePending) return;
    centerUpdatePending = true;
    requestAnimationFrame(updateCenteredCards);
  };
  window.addEventListener('scroll', scheduleCenterUpdate, { passive: true });
  window.addEventListener('resize', scheduleCenterUpdate);
  mobile.addEventListener('change', scheduleCenterUpdate);
  // Incluye tambien las tarjetas creadas al filtrar o cambiar de producto.
  const contentObserver = new MutationObserver(() => {
    cards = document.querySelectorAll(sharedEffectTargets);
    scheduleCenterUpdate();
  });
  contentObserver.observe(document.querySelector('main') || document.body, {
    childList: true, subtree: true
  });
  scheduleCenterUpdate();
});
