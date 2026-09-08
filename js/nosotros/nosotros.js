// JavaScript independiente de la página Nosotros.
document.addEventListener('DOMContentLoaded',()=>{
  const aboutVideo=document.querySelector('[data-about-video]');
  const videoToggle=document.querySelector('[data-video-toggle]');
  const videoLabel=document.querySelector('[data-video-label]');
  const videoIcon=document.querySelector('[data-video-icon]');
  if(aboutVideo && videoToggle){
    const updateVideoControl=()=>{
      videoLabel.textContent=aboutVideo.paused?'Reproducir video':'Pausar video';
      videoIcon.textContent=aboutVideo.paused?'▶':'Ⅱ';
    };
    aboutVideo.addEventListener('play',updateVideoControl);
    aboutVideo.addEventListener('pause',updateVideoControl);
    videoToggle.addEventListener('click',()=>{
      if(aboutVideo.paused)aboutVideo.play().catch(updateVideoControl);
      else aboutVideo.pause();
    });
    aboutVideo.muted=true;
    aboutVideo.play().catch(updateVideoControl);
    updateVideoControl();
  }
  const employeeDialog=document.querySelector('.employee-dialog');
  if(employeeDialog){
    let activeCard=null;
    const descriptions={
      'Gerente Financiero':'Planifica los recursos financieros, supervisa presupuestos y analiza resultados para apoyar las decisiones y el crecimiento de la empresa.',
      'Administrador La Paz':'Coordina las operaciones de la sede de La Paz, organiza los recursos y acompaña al equipo para brindar una atención eficiente a los clientes.',
      'Director de Marketing':'Desarrolla estrategias de comunicación, coordina campañas y presenta las soluciones de la empresa para conectar con nuevos clientes.',
      'Administrador':'Organiza las actividades diarias, coordina los recursos y da seguimiento a los procesos para apoyar al equipo y atender las necesidades de los clientes.'
    };
    document.querySelectorAll('.team-card').forEach(card=>{
      const name=card.querySelector('h3').textContent;
      const role=card.querySelector('p').textContent;
      const trigger=document.createElement('button');
      trigger.type='button';
      trigger.className='employee-trigger';
      trigger.setAttribute('aria-label',`Ver perfil de ${name}, ${role}`);
      trigger.setAttribute('aria-haspopup','dialog');
      card.append(trigger);
      trigger.addEventListener('click',()=>{
        activeCard=trigger;
        const photo=employeeDialog.querySelector('[data-employee-image]');
        photo.src=card.querySelector('img').src;
        photo.alt=name;
        employeeDialog.querySelector('#employee-name').textContent=name;
        employeeDialog.querySelector('[data-employee-role]').textContent=role;
        employeeDialog.querySelector('#employee-description').textContent=card.dataset.description || descriptions[role] || descriptions.Administrador;
        const index=Array.from(card.parentElement.children).indexOf(card);
        employeeDialog.classList.toggle('employee-dialog--orange',!card.closest('.team-section--portraits') || index%2===1);
        employeeDialog.showModal();
        document.body.classList.add('employee-profile-open');
      });
    });
    employeeDialog.querySelector('.employee-close').addEventListener('click',()=>employeeDialog.close());
    employeeDialog.addEventListener('click',event=>{
      const bounds=employeeDialog.getBoundingClientRect();
      if(event.target===employeeDialog && (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom))employeeDialog.close();
    });
    employeeDialog.addEventListener('close',()=>{
      document.body.classList.remove('employee-profile-open');
      activeCard?.focus({preventScroll:true});
    });
  }
  const experience=document.querySelector('.experience');
  if(!experience)return;
  let started=false;
  const startCounters=()=>{
    if(started)return;
    started=true;
    document.querySelectorAll('[data-about-count]').forEach(counter=>{
      const target=Number(counter.dataset.aboutCount);
      const duration=Number(counter.dataset.duration)||1800;
      const start=performance.now();
      const animate=now=>{
        const progress=Math.min((now-start)/duration,1);
        const eased=1-Math.pow(1-progress,3);
        counter.textContent=Math.floor(target*eased).toLocaleString('es-BO');
        if(progress<1)requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    });
  };
  if(!('IntersectionObserver' in window)){startCounters();return}
  const observer=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){startCounters();observer.disconnect()}
  },{threshold:.3});
  observer.observe(experience);
});
