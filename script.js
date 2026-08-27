const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  })
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
function updateSector(){
  const slide = sectorTrack.children[0];
  const shift = sectorIndex * (slide.getBoundingClientRect().width + 20);
  sectorTrack.style.transform = `translateX(-${shift}px)`;
  document.getElementById('sectorName').textContent = sectors[sectorIndex][0];
  document.getElementById('sectorText').textContent = sectors[sectorIndex][1];
  document.getElementById('sectorCounter').textContent = `${String(sectorIndex+1).padStart(2,'0')} / 05`;
}
document.getElementById('sectorNext').onclick=()=>{sectorIndex=(sectorIndex+1)%5;updateSector()};
document.getElementById('sectorPrev').onclick=()=>{sectorIndex=(sectorIndex+4)%5;updateSector()};


let productIndex=0;
const productTrack=document.getElementById('productTrack');
function updateProducts(){
  const slide=productTrack.children[0];
  const shift=productIndex*(slide.getBoundingClientRect().width+20);
  productTrack.style.transform=`translateX(-${shift}px)`;
}
document.getElementById('productNext').onclick=()=>{productIndex=(productIndex+1)%3;updateProducts()};
document.getElementById('productPrev').onclick=()=>{productIndex=(productIndex+2)%3;updateProducts()};


const projects=[
  {
    name:'PACEÑA',
    category:'Industria alimenticia · Proyecto industrial',
    text:'Implementación de soluciones y componentes orientados a fortalecer la operación industrial y sus procesos.',
    logo:'PACEÑA',
    image:'images/imagendelaempresa1.png'
  },
  {
    name:'SOBOCE',
    category:'Industria cementera · Suministro industrial',
    text:'Suministro especializado para aplicaciones industriales con énfasis en confiabilidad y continuidad operativa.',
    logo:'SOBOCE',
    image:'images/imagendelaempresa1.png'
  },
  {
    name:'YPFB',
    category:'Energía · Soluciones industriales',
    text:'Soluciones aplicadas a requerimientos técnicos de infraestructura y procesos del sector energético.',
    logo:'YPFB',
    image:'images/imagendelaempresa1.png'
  }
];
let projectIndex=0;
function updateProject(){
  const p=projects[projectIndex];
  document.getElementById('projectName').textContent=p.name;
  document.getElementById('projectCategory').textContent=p.category;
  document.getElementById('projectText').textContent=p.text;
  document.getElementById('projectLogo').textContent=p.logo;
  document.getElementById('projectImage').src=p.image;
}
document.getElementById('projectNext').onclick=()=>{projectIndex=(projectIndex+1)%projects.length;updateProject()};
document.getElementById('projectPrev').onclick=()=>{projectIndex=(projectIndex+projects.length-1)%projects.length;updateProject()};

let statsStarted=false;
const statsSection=document.querySelector('.stats');
const statsObserver=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting && !statsStarted){
    statsStarted=true;
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target=+el.dataset.count;
      let current=0;
      const timer=setInterval(()=>{
        current+=5;
        if(current>=target){current=target;clearInterval(timer)}
        el.textContent=current+'+';
      },25);
    })
  }
},{threshold:.35});
statsObserver.observe(statsSection);

window.addEventListener('resize', ()=>{updateSector();updateProducts()});


const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Solicitud enviada.');
});
