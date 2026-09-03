document.addEventListener('DOMContentLoaded', () => {
  // Crea una segunda copia idéntica e independiente del catálogo principal.
  const primaryProductShowcase=document.getElementById('productos');
  if(primaryProductShowcase && !document.getElementById('productos-2')){
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
  document.getElementById('sectorNext')?.addEventListener('click',()=>{sectorIndex=(sectorIndex+1)%5;updateSector()});
  document.getElementById('sectorPrev')?.addEventListener('click',()=>{sectorIndex=(sectorIndex+4)%5;updateSector()});
  updateSector();

  const initProductShowcase=productShowcase=>{
    const productShowcaseTrack=productShowcase.querySelector('.product-showcase__track');
    const productShowcaseSlider=productShowcase.querySelector('.product-showcase__slider');
    const productShowcasePrev=productShowcase.querySelector('.product-showcase__controls .product-showcase__nav:first-child');
    const productShowcaseNext=productShowcase.querySelector('.product-showcase__controls .product-showcase__nav:last-child');
    const productShowcaseDots=productShowcase.querySelector('.product-showcase__dots');
    if(!productShowcaseTrack || !productShowcaseSlider || !productShowcaseDots) return;
    const productCards=[...productShowcaseTrack.children];
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
        return;
      }
      if(isMobileProduct()){
        productShowcaseTrack.style.removeProperty('--product-open');
        return;
      }
      const inactiveCard=productCards.find((card,index)=>index!==activeProduct);
      const closedWidth=inactiveCard?.getBoundingClientRect().width||0;
      const trackStyles=getComputedStyle(productShowcaseTrack);
      const gap=parseFloat(trackStyles.columnGap)||0;
      const available=productShowcaseSlider.clientWidth-(closedWidth*(productCards.length-1))-(gap*(productCards.length-1));
      productShowcaseTrack.style.setProperty('--product-open',`${Math.max(220,available)}px`);
    };

    const centerProduct=index=>{
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
        card.toggleAttribute('active',i===index);
        card.classList.toggle('is-prev',emotionsMode && i===previousIndex);
        card.classList.toggle('is-next',emotionsMode && i===nextIndex);
      });
      productDots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
      if(productShowcasePrev) productShowcasePrev.disabled=index===0;
      if(productShowcaseNext) productShowcaseNext.disabled=index===productCards.length-1;
    };
    function activateProduct(index,shouldScroll=false){
      activeProduct=Math.min(Math.max(index,0),productCards.length-1);
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
        if(!window.matchMedia('(hover:hover)').matches) return;
        if(productShowcase.classList.contains('product-showcase--emotions')){
          if(!hoverActivationLocked && index!==activeProduct){hoverActivationLocked=true;activateProduct(index,true)}
          return;
        }
        activateProduct(index,true);
      });
      card.addEventListener('click',event=>{if(!event.target.closest('a')) activateProduct(index,true)});
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
  const updateProducts=()=>{
    if(!productTrack || !productTrack.children.length) return;
    const slide=productTrack.children[0];
    productTrack.style.transform=`translateX(-${productIndex*(slide.getBoundingClientRect().width+20)}px)`;
  };
  const nextProduct=()=>{
    if(!productTrack) return;
    productIndex=(productIndex+1)%productTrack.children.length;
    updateProducts();
  };
  document.getElementById('productNext')?.addEventListener('click',nextProduct);
  document.getElementById('productPrev')?.addEventListener('click',()=>{
    if(!productTrack) return;
    productIndex=(productIndex+productTrack.children.length-1)%productTrack.children.length;
    updateProducts();
  });

  let serviceIndex = 0;
  const serviceTrack = document.getElementById('serviceTrack');
  const updateServices = () => {
    if(!serviceTrack || !serviceTrack.children.length) return;
    serviceTrack.style.transform = `translateX(-${serviceIndex * 100}%)`;
  };
  const nextService = () => {
    if(!serviceTrack) return;
    serviceIndex=(serviceIndex+1)%serviceTrack.children.length; updateServices();
  };
  document.getElementById('serviceNext')?.addEventListener('click',nextService);
  document.getElementById('servicePrev')?.addEventListener('click',()=>{
    if(!serviceTrack) return;
    serviceIndex=(serviceIndex+serviceTrack.children.length-1)%serviceTrack.children.length; updateServices();
  });
  let serviceTimer = serviceTrack ? setInterval(nextService, 4800) : null;
  serviceTrack?.closest('.service-carousel')?.addEventListener('mouseenter',()=>{ if(serviceTimer){clearInterval(serviceTimer);serviceTimer=null;} });
  serviceTrack?.closest('.service-carousel')?.addEventListener('mouseleave',()=>{ if(!serviceTimer) serviceTimer=setInterval(nextService,4800); });

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
