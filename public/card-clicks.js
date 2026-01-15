document.addEventListener('DOMContentLoaded', ()=>{
  const cards = document.querySelectorAll('.home-cards .card');
  cards.forEach(card=>{
    // visual affordance + accessibility
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    const label = card.querySelector('.card-body strong')?.textContent?.trim();
    if(label) card.setAttribute('aria-label', label);

    function openPreviewFromCard(targetCard){
      const title = targetCard.querySelector('.card-body strong')?.textContent?.trim() || targetCard.dataset.title || 'Preview';
      const img = targetCard.querySelector('.card-media img')?.src || targetCard.dataset.img || '';
      const previewImg = document.getElementById('previewImg');
      const previewTitle = document.getElementById('previewTitle');
      const previewCode = document.getElementById('previewCode');
      if(previewImg){ previewImg.src = img; previewImg.alt = title; }
      if(previewTitle) previewTitle.textContent = title;
      const pre = targetCard.querySelector('.code-snippet');
      if(previewCode) previewCode.textContent = pre ? pre.textContent : '<!-- no sample -->';
      const modal = document.getElementById('previewModal');
      if(modal) modal.setAttribute('aria-hidden','false');
    }

    card.addEventListener('click', e=>{
      if(e.target.closest('button') || e.target.closest('a')) return;
      openPreviewFromCard(card);
    });

    // keyboard activation (Enter / Space)
    card.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        openPreviewFromCard(card);
      }
    });
  });
});
