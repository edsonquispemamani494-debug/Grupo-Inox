// JavaScript independiente de la página Nosotros.
document.addEventListener('DOMContentLoaded',()=>{
  const videoOpen=document.querySelector('[data-video-open]');
  const videoModal=document.querySelector('[data-video-modal]');
  const videoClose=document.querySelector('[data-video-close]');
  const aboutVideo=document.querySelector('[data-about-video]');

  const closeVideo=()=>{
    if(!videoModal)return;
    videoModal.classList.remove('is-open');
    videoModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('video-modal-open');
    aboutVideo?.pause();
  };
  videoOpen?.addEventListener('click',()=>{
    videoModal?.classList.add('is-open');
    videoModal?.setAttribute('aria-hidden','false');
    document.body.classList.add('video-modal-open');
    aboutVideo?.play().catch(()=>{});
  });
  videoClose?.addEventListener('click',closeVideo);
  videoModal?.addEventListener('click',event=>{if(event.target===videoModal)closeVideo()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeVideo()});

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
