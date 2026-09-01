document.addEventListener('DOMContentLoaded', () => {
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
    const slide = sectorTrack.children[0];
    sectorTrack.style.transform = `translateX(-${sectorIndex * (slide.getBoundingClientRect().width + 20)}px)`;
    if(sectorName) sectorName.textContent = sectors[sectorIndex][0];
    if(sectorText) sectorText.textContent = sectors[sectorIndex][1];
    if(sectorCounter) sectorCounter.textContent = `${String(sectorIndex+1).padStart(2,'0')} / 05`;
  };
  document.getElementById('sectorNext')?.addEventListener('click',()=>{sectorIndex=(sectorIndex+1)%5;updateSector()});
  document.getElementById('sectorPrev')?.addEventListener('click',()=>{sectorIndex=(sectorIndex+4)%5;updateSector()});

  let productIndex = 0;
  const productTrack = document.getElementById('productTrack');
  const updateProducts = () => {
    if(!productTrack || !productTrack.children.length) return;
    const slide = productTrack.children[0];
    productTrack.style.transform = `translateX(-${productIndex * (slide.getBoundingClientRect().width + 20)}px)`;
  };
  const nextProduct = () => {
    if(!productTrack) return;
    productIndex = (productIndex + 1) % productTrack.children.length;
    updateProducts();
  };
  document.getElementById('productNext')?.addEventListener('click',nextProduct);
  document.getElementById('productPrev')?.addEventListener('click',()=>{
    if(!productTrack) return;
    productIndex=(productIndex+productTrack.children.length-1)%productTrack.children.length; updateProducts();
  });
  let productTimer = productTrack ? setInterval(nextProduct, 3600) : null;
  productTrack?.closest('.carousel-viewport')?.addEventListener('mouseenter',()=>{ if(productTimer){clearInterval(productTimer);productTimer=null;} });
  productTrack?.closest('.carousel-viewport')?.addEventListener('mouseleave',()=>{ if(!productTimer) productTimer=setInterval(nextProduct,3600); });

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
    {name:'PACEÑA',category:'Industria alimenticia · Proyecto industrial',text:'Implementación de soluciones y componentes orientados a fortalecer la operación industrial y sus procesos.',logo:'PACEÑA',image:'images/imagendelaempresa1.png'},
    {name:'SOBOCE',category:'Industria cementera · Suministro industrial',text:'Suministro especializado para aplicaciones industriales con énfasis en confiabilidad y continuidad operativa.',logo:'SOBOCE',image:'images/imagendelaempresa1.png'},
    {name:'YPFB',category:'Energía · Soluciones industriales',text:'Soluciones aplicadas a requerimientos técnicos de infraestructura y procesos del sector energético.',logo:'YPFB',image:'images/imagendelaempresa1.png'}
  ];
  let projectIndex=0;
  const updateProject=()=>{
    const name=document.getElementById('projectName'); if(!name) return;
    const p=projects[projectIndex]; name.textContent=p.name;
    document.getElementById('projectCategory').textContent=p.category;
    document.getElementById('projectText').textContent=p.text;
    document.getElementById('projectLogo').textContent=p.logo;
    document.getElementById('projectImage').src=p.image;
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
