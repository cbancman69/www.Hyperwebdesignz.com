document.addEventListener('DOMContentLoaded', ()=>{
  const modal = document.getElementById('previewModal');
  let previewLive = document.getElementById('previewLive');
  // If the previewLive element isn't present in the DOM, create and insert it
  if(!previewLive){
    const meta = document.querySelector('.preview-meta');
    if(meta){
      previewLive = document.createElement('a');
      previewLive.id = 'previewLive';
      previewLive.className = 'btn';
      previewLive.target = '_blank';
      previewLive.rel = 'noopener noreferrer';
      previewLive.style.display = 'none';
      previewLive.style.marginTop = '8px';
      previewLive.textContent = 'Open Live';
      const pre = meta.querySelector('pre');
      if(pre) meta.insertBefore(previewLive, pre);
      else meta.appendChild(previewLive);
    }
  }

  document.querySelectorAll('.home-cards .card').forEach(card=>{
    function setLive(target){
      const link = target.dataset?.link || '';
      if(link){
        previewLive.href = link;
        previewLive.style.display = 'inline-block';
      } else {
        previewLive.style.display = 'none';
        previewLive.removeAttribute('href');
      }
    }
    card.addEventListener('click', ()=> setLive(card));
    card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ' || e.key==='Spacebar'){ setLive(card); } });
  });

  // allow closing with Escape key
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape'){
      if(modal && modal.getAttribute('aria-hidden') === 'false') modal.setAttribute('aria-hidden','true');
    }
  });

});
