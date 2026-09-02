document.addEventListener("DOMContentLoaded",()=>{
  const entries=document.querySelectorAll(".timeline-content");
  if(!("IntersectionObserver" in window)){entries.forEach(entry=>entry.classList.add("is-visible"));return}
  const observer=new IntersectionObserver((items,currentObserver)=>{items.forEach(item=>{if(!item.isIntersecting)return;item.target.classList.add("is-visible");currentObserver.unobserve(item.target)})},{threshold:.18});
  entries.forEach(entry=>observer.observe(entry));
});
