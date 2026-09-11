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
document.addEventListener('DOMContentLoaded', () => {
  // Crea una segunda copia idéntica e independiente del catálogo principal.
  const primaryProductShowcase=document.getElementById('productos');
  if(primaryProductShowcase?.classList.contains('product-showcase') && !document.getElementById('productos-2')){
    const secondProductShowcase=primaryProductShowcase.cloneNode(true);
    secondProductShowcase.id='productos-2';
    secondProductShowcase.classList.add('product-showcase--emotions');
    secondProductShowcase.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
    const secondEyebrow=secondProductShowcase.querySelector('.product-showcase__head .eyebrow');
    if(secondEyebrow) secondEyebrow.textContent='Catálogo industrial 2';
    secondProductShowcase.querySelectorAll('.product-showcase__card').forEach((card,index)=>card.toggleAttribute('active',index===0));
    secondProductShowcase.querySelector('.product-showcase__dots')?.replaceChildren();
    primaryProductShowcase.after(secondProductShowcase);
  }

  // Duplica los logos automáticamente para mantener el carrusel continuo.
  const brandTrack=document.querySelector('.brand-track');
  if(brandTrack && !brandTrack.dataset.cloned){
    [...brandTrack.children].forEach(brand=>{
      const clone=brand.cloneNode(true);
      clone.setAttribute('aria-hidden','true');
      brandTrack.appendChild(clone);
    });
    brandTrack.dataset.cloned='true';
  }

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const sectors = [
    ['PETROLERO','Soluciones y suministros confiables para operaciones de alta exigencia.'],
    ['MINERO','Componentes y soporte para procesos mineros, conducción y control de fluidos.'],
    ['ALIMENTICIO','Equipamiento orientado a higiene, precisión y continuidad de procesos.'],
    ['FARMACÉUTICO','Soluciones de alto estándar para instalaciones y procesos especializados.'],
    ['MANUFACTURA','Productos y servicios para optimizar la confiabilidad de planta.']
  ];
  let sectorIndex = 0;
  const sectorTrack = document.getElementById('sectorTrack');
  const sectorName = document.getElementById('sectorName');
  const sectorText = document.getElementById('sectorText');
  const sectorCounter = document.getElementById('sectorCounter');
  const updateSector = () => {
    if(!sectorTrack || !sectorTrack.children.length) return;
    const sectorSlides=[...sectorTrack.children];
    const nextSectorIndex=(sectorIndex+1)%sectorSlides.length;
    sectorSlides.forEach((slide,index)=>{
      slide.classList.toggle('is-active',index===sectorIndex);
      slide.classList.toggle('is-next',index===nextSectorIndex);
    });
    if(sectorName) sectorName.textContent = sectors[sectorIndex][0];
    if(sectorText) sectorText.textContent = sectors[sectorIndex][1];
    if(sectorCounter) sectorCounter.textContent = `${String(sectorIndex+1).padStart(2,'0')} / 05`;
  };
  let sectorTimer;
  const startSectorAutoplay = () => {
    clearInterval(sectorTimer);
    if (!document.body.classList.contains('home-page') || !sectorTrack || document.hidden) return;
    sectorTimer = setInterval(() => {
      sectorIndex = (sectorIndex + 1) % sectors.length;
      updateSector();
    }, 5000);
  };
  document.getElementById('sectorNext')?.addEventListener('click',()=>{sectorIndex=(sectorIndex+1)%sectors.length;updateSector();startSectorAutoplay()});
  document.getElementById('sectorPrev')?.addEventListener('click',()=>{sectorIndex=(sectorIndex+sectors.length-1)%sectors.length;updateSector();startSectorAutoplay()});
  updateSector();
  startSectorAutoplay();
  document.addEventListener('visibilitychange', startSectorAutoplay);

  const initProductShowcase=productShowcase=>{
    const productShowcaseTrack=productShowcase.querySelector('.product-showcase__track');
    const productShowcaseSlider=productShowcase.querySelector('.product-showcase__slider');
    const productShowcasePrev=productShowcase.querySelector('.product-showcase__controls .product-showcase__nav:first-child');
    const productShowcaseNext=productShowcase.querySelector('.product-showcase__controls .product-showcase__nav:last-child');
    const productShowcaseDots=productShowcase.querySelector('.product-showcase__dots');
    if(!productShowcaseTrack || !productShowcaseSlider || !productShowcaseDots) return;
    const productCards=[...productShowcaseTrack.children];
    const infiniteCatalog=productShowcase.dataset.infinite==='true';
    const centeredCatalog=!productShowcase.classList.contains('product-showcase--emotions');
    if(centeredCatalog) productShowcase.classList.add('product-showcase--centered');
    else {
      const controls=productShowcase.querySelector('.product-showcase__controls');
      if(controls) productShowcaseSlider.appendChild(controls);
    }
    productCards.forEach(card=>{
      const categoryLink=card.querySelector('.product-showcase__content a');
      if(!categoryLink) return;
      const imageLink=document.createElement('a');
      imageLink.className='product-showcase__image-link';
      imageLink.href=categoryLink.href;
      imageLink.setAttribute('aria-label',`Ver productos: ${card.querySelector('h3')?.textContent || ''}`);
      card.appendChild(imageLink);
      categoryLink.tabIndex=-1;
    });
    let activeProduct=productShowcase.classList.contains('product-showcase--emotions') && productCards.length>1?1:0;
    const isMobileProduct=()=>window.matchMedia('(max-width:767px)').matches;

    productCards.forEach((card,index)=>{
      const dot=document.createElement('button');
      dot.className='product-showcase__dot';
      dot.type='button';
      dot.setAttribute('aria-label',`Mostrar producto ${index+1}`);
      dot.addEventListener('click',()=>activateProduct(index,true));
      productShowcaseDots.appendChild(dot);
    });
    const productDots=[...productShowcaseDots.children];

    const fitProductCards=()=>{
      if(productShowcase.classList.contains('product-showcase--emotions')){
        productShowcaseTrack.style.removeProperty('--product-open');
        const width=productShowcaseSlider.clientWidth;
        const gap=isMobileProduct()?20:Math.min(40,width*.03);
        const catalogCenter=productShowcase.closest('.catalog-page') || document.body.classList.contains('catalog-page');
        const centerWidth=isMobileProduct()?width:Math.min(catalogCenter?680:540,width*(catalogCenter?.58:.46));
        const sideWidth=isMobileProduct()?width:(width-centerWidth-2*gap)/2;
        productShowcase.style.setProperty('--emotion-center',`${centerWidth}px`);
        productShowcase.style.setProperty('--emotion-side',`${sideWidth}px`);
        productShowcase.style.setProperty('--emotion-step',`${(centerWidth+sideWidth)/2+gap}px`);
        return;
      }
      if(isMobileProduct()){
        productShowcaseTrack.style.removeProperty('--product-open');
        return;
      }
      const widthProbe=document.createElement('div');
      widthProbe.style.cssText='position:absolute;visibility:hidden;width:var(--product-closed);pointer-events:none';
      productShowcaseTrack.appendChild(widthProbe);
      const closedWidth=widthProbe.getBoundingClientRect().width;
      widthProbe.remove();
      const trackStyles=getComputedStyle(productShowcaseTrack);
      const gap=parseFloat(trackStyles.columnGap)||0;
      const available=productShowcaseSlider.clientWidth-(closedWidth*(productCards.length-1))-(gap*(productCards.length-1));
      productShowcaseTrack.style.setProperty('--product-open',`${Math.max(220,available)}px`);
      if(centeredCatalog){
        const openWidth=Math.max(220,available);
        const rightCount=Math.floor(productCards.length/2);
        const leftCount=productCards.length-1-rightCount;
        const sideSpace=(productShowcaseSlider.clientWidth-openWidth)/2;
        const leftWidth=leftCount ? (sideSpace-leftCount*gap)/leftCount : 0;
        const rightWidth=rightCount ? (sideSpace-rightCount*gap)/rightCount : 0;
        productCards.forEach((card,index)=>{
          let distance=(index-activeProduct+productCards.length)%productCards.length;
          if(distance>Math.floor(productCards.length/2)) distance-=productCards.length;
          const offset=distance===0 ? -openWidth/2 : distance>0
            ? openWidth/2+gap+(distance-1)*(rightWidth+gap)
            : -openWidth/2+distance*(leftWidth+gap);
          card.style.setProperty('--card-width',`${distance<0?leftWidth:rightWidth}px`);
          card.style.setProperty('--card-x',`${offset}px`);
        });
      }
    };

    const centerProduct=index=>{
      if(!centeredCatalog) return;
      if(centeredCatalog && !isMobileProduct()) return;
      const card=productCards[index];
      const mobile=isMobileProduct();
      const start=mobile?card.offsetTop:card.offsetLeft;
      const viewportSize=mobile?productShowcaseSlider.clientHeight:productShowcaseSlider.clientWidth;
      const cardSize=mobile?card.clientHeight:card.clientWidth;
      productShowcaseSlider.scrollTo({[mobile?'top':'left']:start-(viewportSize/2-cardSize/2),behavior:'smooth'});
    };
    const updateProductUI=index=>{
      const emotionsMode=productShowcase.classList.contains('product-showcase--emotions');
      const previousIndex=(index+productCards.length-1)%productCards.length;
      const nextIndex=(index+1)%productCards.length;
      productCards.forEach((card,i)=>{
        if(emotionsMode){
          let distance=(i-index+productCards.length)%productCards.length;
          if(distance>productCards.length/2) distance-=productCards.length;
          card.style.setProperty('--emotion-offset',Math.max(-2,Math.min(2,distance)));
          card.inert=Math.abs(distance)>1;
        }
        card.toggleAttribute('active',i===index);
        card.classList.toggle('is-prev',emotionsMode && i===previousIndex);
        card.classList.toggle('is-next',emotionsMode && i===nextIndex);
      });
      productDots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
      if(productShowcasePrev) productShowcasePrev.disabled=!infiniteCatalog && index===0;
      if(productShowcaseNext) productShowcaseNext.disabled=!infiniteCatalog && index===productCards.length-1;
    };
    let productLinkReadyAt=0;
    function activateProduct(index,shouldScroll=false){
      if(!centeredCatalog && performance.now()<productLinkReadyAt) return;
      if(index!==activeProduct) productLinkReadyAt=performance.now()+650;
      activeProduct=infiniteCatalog ? (index%productCards.length+productCards.length)%productCards.length : Math.min(Math.max(index,0),productCards.length-1);
      updateProductUI(activeProduct);
      fitProductCards();
      if(shouldScroll && !productShowcase.classList.contains('product-showcase--emotions')) requestAnimationFrame(()=>centerProduct(activeProduct));
    }
    const moveProduct=step=>activateProduct(activeProduct+step,true);

    productShowcasePrev?.addEventListener('click',()=>moveProduct(-1));
    productShowcaseNext?.addEventListener('click',()=>moveProduct(1));
    let hoverActivationLocked=false;
    productCards.forEach((card,index)=>{
      card.addEventListener('mouseenter',()=>{
        if(!window.matchMedia('(hover:hover)').matches || hoverActivationLocked) return;
        // Una sola apertura por entrada, aunque las tarjetas pasen bajo el puntero.
        hoverActivationLocked=true;
        if(index!==activeProduct) activateProduct(index,true);
      });
      card.addEventListener('click',event=>{
        if(index!==activeProduct){
          event.preventDefault();
          hoverActivationLocked=true;
          activateProduct(index,true);
          return;
        }
        // Evita navegar mientras la imagen todavía se mueve hacia el centro.
        if(performance.now()<productLinkReadyAt){event.preventDefault();return;}
        if(!event.target.closest('a')) activateProduct(index,true);
      });
    });
    productShowcaseSlider.addEventListener('mouseleave',()=>{hoverActivationLocked=false});
    let touchX=0;
    let touchY=0;
    productShowcaseTrack.addEventListener('touchstart',event=>{touchX=event.touches[0].clientX;touchY=event.touches[0].clientY},{passive:true});
    productShowcaseTrack.addEventListener('touchend',event=>{
      const deltaX=event.changedTouches[0].clientX-touchX;
      const deltaY=event.changedTouches[0].clientY-touchY;
      const delta=isMobileProduct()?deltaY:deltaX;
      if(Math.abs(delta)>60) moveProduct(delta>0?-1:1);
    },{passive:true});
    productShowcaseSlider.addEventListener('keydown',event=>{
      if(['ArrowRight','ArrowDown'].includes(event.key)){event.preventDefault();moveProduct(1)}
      if(['ArrowLeft','ArrowUp'].includes(event.key)){event.preventDefault();moveProduct(-1)}
    });
    window.addEventListener('resize',()=>{fitProductCards();centerProduct(activeProduct)});
    updateProductUI(activeProduct);
    fitProductCards();
  };
  document.querySelectorAll('.product-showcase').forEach(initProductShowcase);

  // Compatibilidad con el carrusel de la página independiente de Productos.
  let productIndex=0;
  const productTrack=document.getElementById('productTrack');
  const productDots=document.getElementById('productDots');
  const featuredProductCount=productTrack?.children.length||0;
  const updateProducts=()=>{
    if(!productTrack || !productTrack.children.length) return;
    const slide=productTrack.children[0];
    const gap=parseFloat(getComputedStyle(productTrack).columnGap)||18;
    productTrack.style.transform=`translateX(-${productIndex*(slide.getBoundingClientRect().width+gap)}px)`;
    productTrack.querySelectorAll('.featured-product-card').forEach(card=>card.classList.remove('is-center'));
    productTrack.children[productIndex+1]?.classList.add('is-center');
    productDots?.querySelectorAll('button').forEach((dot,index)=>dot.classList.toggle('active',index===productIndex%featuredProductCount));
  };
  const nextProduct=()=>{
    if(!productTrack || !featuredProductCount) return;
    productIndex=(productIndex+1)%featuredProductCount;
    updateProducts();
  };
  document.getElementById('productNext')?.addEventListener('click',nextProduct);
  document.getElementById('productPrev')?.addEventListener('click',()=>{
    if(!productTrack || !featuredProductCount) return;
    productIndex=(productIndex+featuredProductCount-1)%featuredProductCount;
    updateProducts();
  });
  if(productTrack && productDots){
    [...productTrack.children].forEach((slide,index)=>{
      const dot=document.createElement('button');
      dot.type='button';dot.className='featured-products__dot';
      dot.setAttribute('aria-label',`Mostrar producto destacado ${index+1}`);
      dot.addEventListener('click',()=>{productIndex=index;updateProducts()});
      productDots.appendChild(dot);
    });
    [...productTrack.children].forEach(slide=>productTrack.appendChild(slide.cloneNode(true)));
    updateProducts();
    window.addEventListener('resize',updateProducts);
    let productAutoplay=setInterval(nextProduct,5200);
    productTrack.closest('.featured-products__viewport')?.addEventListener('mouseenter',()=>clearInterval(productAutoplay));
    productTrack.closest('.featured-products__viewport')?.addEventListener('mouseleave',()=>{productAutoplay=setInterval(nextProduct,5200)});
  }

  document.querySelectorAll('.service-track').forEach(serviceTrack=>{
  let serviceIndex = 0;
  const serviceSection = serviceTrack.closest('section');
  const serviceSelectors = serviceSection.querySelectorAll('[data-service]');
  const updateServices = () => {
    if(!serviceTrack || !serviceTrack.children.length) return;
    serviceTrack.style.transform = `translateX(-${serviceIndex * 100}%)`;
    serviceSelectors.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.service)===serviceIndex)));
    [...serviceTrack.children].forEach((slide,index)=>{slide.inert=index!==serviceIndex;});
  };
  const nextService = () => {
    if(!serviceTrack) return;
    serviceIndex=(serviceIndex+1)%serviceTrack.children.length; updateServices();
  };
  serviceSection.querySelector('#serviceNext')?.addEventListener('click',nextService);
  serviceSection.querySelector('#servicePrev')?.addEventListener('click',()=>{
    if(!serviceTrack) return;
    serviceIndex=(serviceIndex+serviceTrack.children.length-1)%serviceTrack.children.length; updateServices();
  });
  let serviceTimer = serviceTrack ? setInterval(nextService, 4800) : null;
  serviceSelectors.forEach(button=>button.addEventListener('click',()=>{
    serviceIndex=Number(button.dataset.service);
    updateServices();
    clearInterval(serviceTimer);
    serviceTimer=setInterval(nextService,4800);
  }));
  updateServices();
  serviceTrack?.closest('.service-carousel')?.addEventListener('mouseenter',()=>{ if(serviceTimer){clearInterval(serviceTimer);serviceTimer=null;} });
  serviceTrack?.closest('.service-carousel')?.addEventListener('mouseleave',()=>{ if(!serviceTimer) serviceTimer=setInterval(nextService,4800); });

  });

  const projects=[
    {name:'PACEÑA',category:'Industria alimenticia · Proyecto industrial',text:'Implementación de soluciones y componentes orientados a fortalecer la operación industrial y sus procesos.',logo:'PACEÑA',image:'https://www.noticiasfides.com/images/news/2013/11/cbn-cumplio-127-anos-de-trayectoria-y-servicio-al-pais-y-se-convierte-en-compania-lider-_336325.jpg'},
    {name:'SOBOCE',category:'Industria cementera · Suministro industrial',text:'Suministro especializado para aplicaciones industriales con énfasis en confiabilidad y continuidad operativa.',logo:'SOBOCE',image:'https://tinformas.com/wp-content/uploads/2026/07/Cemento-Eco-Plus-Soboce.jpg'},
    {name:'YPFB',category:'Energía · Soluciones industriales',text:'Soluciones aplicadas a requerimientos técnicos de infraestructura y procesos del sector energético.',logo:'YPFB',image:'https://lavozdetarija.com/wp-content/uploads/2020/05/bolivia_ypfb_13.jpg'}
  ];
  let projectIndex=0;
  let projectChangeToken=0;
  const updateProject=()=>{
    const name=document.getElementById('projectName'); if(!name) return;
    const p=projects[projectIndex]; name.textContent=p.name;
    document.getElementById('projectCategory').textContent=p.category;
    document.getElementById('projectText').textContent=p.text;
    document.getElementById('projectLogo').textContent=p.logo;
    const projectImage=document.getElementById('projectImage');
    const projectFrame=projectImage.closest('.project-image');
    const currentToken=++projectChangeToken;
    const preload=new Image();
    const showImage=src=>{
      if(currentToken!==projectChangeToken) return;
      projectFrame?.classList.add('is-changing');
      window.setTimeout(()=>{
        if(currentToken!==projectChangeToken) return;
        projectImage.onerror=()=>{projectImage.onerror=null;projectImage.src='images/index/proyecto-industrial.png'};
        projectImage.alt=`Proyecto industrial ${p.name}`;
        projectImage.src=src;
        requestAnimationFrame(()=>requestAnimationFrame(()=>projectFrame?.classList.remove('is-changing')));
      },220);
    };
    preload.onload=()=>showImage(p.image);
    preload.onerror=()=>showImage('images/index/proyecto-industrial.png');
    preload.src=p.image;
  };
  document.getElementById('projectNext')?.addEventListener('click',()=>{projectIndex=(projectIndex+1)%projects.length;updateProject()});
  document.getElementById('projectPrev')?.addEventListener('click',()=>{projectIndex=(projectIndex+projects.length-1)%projects.length;updateProject()});

  const statsSection=document.querySelector('.stats');
  if(statsSection){
    let statsStarted=false;
    const statsObserver=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting && !statsStarted){
        statsStarted=true;
        document.querySelectorAll('[data-count]').forEach(el=>{
          const target=Number(el.dataset.count);
          const duration=Number(el.dataset.duration) || 1800;
          const start=performance.now();

          const animateCount=(now)=>{
            const progress=Math.min((now-start)/duration,1);
            const eased=1-Math.pow(1-progress,3);
            el.textContent=Math.floor(target*eased).toLocaleString('es-BO')+'+';
            if(progress<1) requestAnimationFrame(animateCount);
          };

          requestAnimationFrame(animateCount);
        });
      }
    },{threshold:.35});
    statsObserver.observe(statsSection);
  }

  window.addEventListener('resize',()=>{updateSector();updateProducts();updateServices();});
  const contactForm=document.getElementById('contactForm');
  contactForm?.addEventListener('submit',(event)=>{event.preventDefault();alert('Solicitud enviada.');});
});

{window}

;
// JavaScript independiente de la página Productos.
