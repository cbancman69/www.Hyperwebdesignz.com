// SPA view switching and UI handlers
// Cleaned SPA script: view switching, modal preview, contact
(function(){
  function showView(name){
    document.querySelectorAll('.view').forEach(v=> v.classList.remove('active-view'));
    const el = document.getElementById(name);
    if(el) el.classList.add('active-view');
    document.querySelectorAll('.nav-btn').forEach(b=> b.classList.toggle('active', b.getAttribute('data-view')===name));
  }

  // Attach nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn=> btn.addEventListener('click', ()=> showView(btn.getAttribute('data-view'))));

  // hero quick links
  document.querySelectorAll('[data-view-link]').forEach(b=> b.addEventListener('click', ()=> showView(b.getAttribute('data-view-link'))));

  // Generic nav-item dropdown handling: any .nav-item with a .nav-item-toggle will work
  document.querySelectorAll('.nav-item').forEach(item=>{
    const toggle = item.querySelector('.nav-item-toggle');
    const dropdown = item.querySelector('.nav-dropdown');
    if(!toggle || !dropdown) return;
    toggle.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      const open = dropdown.classList.toggle('visible');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      dropdown.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    // close when clicking a link inside
    dropdown.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{ dropdown.classList.remove('visible'); toggle.setAttribute('aria-expanded','false'); dropdown.setAttribute('aria-hidden','true'); }));
  });
  // close all dropdowns when clicking outside or pressing Escape
  function closeAllNavDropdowns(){ document.querySelectorAll('.nav-item .nav-dropdown.visible').forEach(dd=>{ dd.classList.remove('visible'); dd.setAttribute('aria-hidden','true'); const t = dd.closest('.nav-item')?.querySelector('.nav-item-toggle'); if(t) t.setAttribute('aria-expanded','false'); }); }
  document.addEventListener('click', (e)=>{ if(!e.target.closest('.nav-item')) closeAllNavDropdowns(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeAllNavDropdowns(); });

  // initial view
  document.addEventListener('DOMContentLoaded', ()=> showView('home'));

  // preview modal element
  const modal = document.getElementById('previewModal');
  // modal close helpers: click overlay, close button, or press Escape. Return focus when closing.
  let _lastFocus = null;
  // Focus trap variables
  let _modalFirst = null, _modalLast = null;
  function closeModal(){
    if(modal) modal.setAttribute('aria-hidden','true');
    if(_lastFocus && typeof _lastFocus.focus === 'function') _lastFocus.focus();
    _lastFocus = null;
  }
  document.addEventListener('click', e=>{
    if(!modal) return;
    if(e.target.matches('.modal-close')) return closeModal();
    // if clicking outside modal content (overlay click), close and forward the click to underlying element
    if(modal.contains(e.target) && !e.target.closest('.modal-content')){
      const x = e.clientX, y = e.clientY;
      closeModal();
      // after the modal is hidden, dispatch a click to whatever is underneath that point
      setTimeout(()=>{
        const el = document.elementFromPoint(x, y);
        if(el && !el.closest('.modal')) el.click();
      }, 10);
      return;
    }
  });
  // close on Escape
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') closeModal();
    // trap focus when modal is open
    if(modal && modal.getAttribute('aria-hidden') === 'false' && e.key === 'Tab'){
      if(!_modalFirst || !_modalLast){ const focusables = modal.querySelectorAll('a,button,input,textarea,[tabindex]:not([tabindex="-1"])'); _modalFirst = focusables[0]; _modalLast = focusables[focusables.length-1]; }
      if(e.shiftKey){ if(document.activeElement === _modalFirst){ e.preventDefault(); _modalLast.focus(); } }
      else { if(document.activeElement === _modalLast){ e.preventDefault(); _modalFirst.focus(); } }
    }
  });
  // when opening modal, capture last focused element
  document.querySelectorAll('.card[data-img]').forEach(card=>{
    card.addEventListener('click', (ev)=>{
      if(ev.target && (ev.target.closest('a') || ev.target.closest('button') || ev.target.closest('input'))) return;
      _lastFocus = document.activeElement;
      const title = card.getAttribute('data-title') || 'Preview';
      const img = card.getAttribute('data-img') || '';
      const previewImg = document.getElementById('previewImg');
      const previewTitle = document.getElementById('previewTitle');
      const previewCode = document.getElementById('previewCode');
      if(previewImg) { previewImg.src = img; previewImg.alt = title }
      if(previewTitle) previewTitle.textContent = title;
      const pre = card.querySelector('.code-snippet');
      if(previewCode) previewCode.textContent = pre ? pre.textContent : '<!-- no sample -->';
      if(modal) {
        modal.setAttribute('aria-hidden','false');
        // set focus into modal
        setTimeout(()=>{ const focusable = modal.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'); if(focusable) focusable.focus(); }, 30);
      }
    });

    // Resume modal handling
    const resumeBtn = document.querySelector('.resume-btn');
    const resumeModal = document.getElementById('resumeModal');
    const resumeFrame = document.getElementById('resumeFrame');
    let _lastFocusResume = null;
    if(resumeBtn && resumeModal && resumeFrame){
      resumeBtn.addEventListener('click', ()=>{
        _lastFocusResume = document.activeElement;
        // set iframe src to load the PDF on demand
        resumeFrame.src = '/assets/resume.pdf';
        resumeModal.setAttribute('aria-hidden','false');
        setTimeout(()=>{ const focusable = resumeModal.querySelector('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'); if(focusable) focusable.focus(); }, 30);
      });
      // close handlers for resume modal (overlay + close button)
      document.addEventListener('click', e=>{
        if(!resumeModal) return;
        if(e.target.matches('.modal-close') && resumeModal.contains(e.target)){
          resumeModal.setAttribute('aria-hidden','true'); resumeFrame.src=''; if(_lastFocusResume && typeof _lastFocusResume.focus==='function') _lastFocusResume.focus(); _lastFocusResume=null; return;
        }
        if(resumeModal.contains(e.target) && !e.target.closest('.modal-content')){
          resumeModal.setAttribute('aria-hidden','true'); resumeFrame.src=''; if(_lastFocusResume && typeof _lastFocusResume.focus==='function') _lastFocusResume.focus(); _lastFocusResume=null; return;
        }
      });
      document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && resumeModal.getAttribute('aria-hidden') === 'false'){ resumeModal.setAttribute('aria-hidden','true'); resumeFrame.src=''; if(_lastFocusResume && typeof _lastFocusResume.focus==='function') _lastFocusResume.focus(); _lastFocusResume=null; } });
    }
  });

  // simple card tilt (lightweight)
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotX = (y * 6).toFixed(2);
      const rotY = (x * -6).toFixed(2);
      card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    card.addEventListener('mouseleave', ()=> { card.style.transform = '' });
  });

  // Contact form submit (single handler)
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const name = document.getElementById('cname')?.value.trim() || '';
      const email = document.getElementById('cemail')?.value.trim() || '';
      const message = document.getElementById('cmessage')?.value.trim() || '';
      const msgEl = document.getElementById('contactMsg');
      if(!name || !email || !message){ if(msgEl) msgEl.textContent = 'Please complete all fields.'; return; }
      if(msgEl) { msgEl.textContent = 'Sending...'; msgEl.style.color = 'var(--teal)'; }
      try{
        const res = await fetch('/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,message})});
        if(!res.ok) throw new Error('Failed');
        if(msgEl) { msgEl.textContent = 'Message sent — thank you.'; msgEl.style.color = 'lightgreen'; }
        contactForm.reset();
      }catch(err){ if(msgEl) { msgEl.textContent = 'Failed to send — email cbancman@gmail.com'; msgEl.style.color='salmon'; } }
    });
  }

  // live-reload: connect to same host websocket (graceful)
  try{
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}`);
    ws.addEventListener('message', e=>{ try{ const d = JSON.parse(e.data); if(d?.type==='reload') location.reload(); }catch(_){} });
  }catch(e){}

})();

// Click outside nav/dropdowns/modals to go back to Home (non-interactive areas)
document.addEventListener('click', (e) => {
  try {
    const target = e.target;
    const tag = (target.tagName || '').toUpperCase();
    const interactive = ['A','BUTTON','INPUT','TEXTAREA','SELECT','LABEL'];
    if (interactive.includes(tag)) return;
    if (target.closest && (target.closest('.main-nav') || target.closest('.nav-item') || target.closest('.nav-dropdown') || target.closest('.modal') || target.closest('#admin-app'))) return;
    const btn = document.querySelector('[data-view-link="home"]') || document.querySelector('[data-view="home"]');
    if (btn) { btn.click(); }
  } catch (err) { /* ignore */ }
});

// QR widget: show after scroll and allow hover/focus expand
(function(){
  const qr = document.getElementById('qrWidget');
  if(!qr) return;
  const showAt = 160; // pixels scrolled before showing
  function update(){
    if(window.scrollY > showAt){ qr.classList.add('visible'); qr.setAttribute('aria-hidden','false'); }
    else { qr.classList.remove('visible'); qr.setAttribute('aria-hidden','true'); }
  }
  // initial check and listeners
  update();
  let tick;
  window.addEventListener('scroll', ()=>{ if(tick) cancelAnimationFrame(tick); tick = requestAnimationFrame(update); }, {passive:true});
  // keyboard focus should also reveal
  qr.addEventListener('focus', ()=> qr.classList.add('visible'));
  qr.addEventListener('blur', ()=> { if(window.scrollY <= showAt) qr.classList.remove('visible'); });
})();

// set Edge-open link (Windows): clicking will open Microsoft Edge with same URL
;(function(){
  const btn = document.getElementById('openInEdge');
  try{
    if(btn){
      // microsoft-edge: protocol opens Edge on Windows
      btn.setAttribute('href', 'microsoft-edge:' + window.location.href);
      btn.setAttribute('target','_blank');
    }
  }catch(e){}
})();

// lightweight parallax for floating orbs
(function(){
  const orbs = Array.from(document.querySelectorAll('.floating-orb'));
  if(!orbs.length) return;
  const onMove = (e)=>{
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    const nx = (e.clientX - cx) / cx; // -1..1
    const ny = (e.clientY - cy) / cy;
    orbs.forEach((orb, i)=>{
      const depth = (i+1) * 6; // smaller = less movement
      const tx = nx * depth;
      const ty = ny * depth;
      orb.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  };
  window.addEventListener('mousemove', onMove, {passive:true});
  window.addEventListener('touchmove', (t)=>{ if(t.touches && t.touches[0]) onMove(t.touches[0]); }, {passive:true});
})();

// Testimonials loader and rotator
(function(){
  const container = document.getElementById('testimonials');
  if(!container) return;
  let idx = 0, items = [];
  function render(){
    container.innerHTML = '';
    if(!items.length) return;
    const it = items[idx];
    const tcard = document.createElement('div'); tcard.className = 'tcard';
    tcard.innerHTML = `
      <div class="quote">“${it.quote}”</div>
      <div class="tmeta">
        <img src="${it.logo}" alt="${it.company}" onerror="this.style.display='none'"/>
        <div>
          <div class="tname">${it.name} — ${it.company}</div>
          <div class="trole">${it.title}</div>
        </div>
      </div>`;
    container.appendChild(tcard);

    // dots
    const controls = document.createElement('div'); controls.className='test-controls';
    items.forEach((_,i)=>{ const d = document.createElement('div'); d.className='test-dot'+(i===idx?' active':''); d.addEventListener('click', ()=>{ idx=i; render(); reset(); }); controls.appendChild(d) });
    container.appendChild(controls);
  }

  async function load(){
    try{
      const res = await fetch('/api/testimonials');
      if(!res.ok) throw new Error('fetch');
      items = await res.json();
      render();
      start();
    }catch(e){
      // fallback to static file
      try{ const r2 = await fetch('/data/testimonials.json'); items = await r2.json(); render(); start(); }catch(_){ }
    }
  }

  let timer;
  function start(){ timer = setInterval(()=>{ idx = (idx+1)%items.length; render(); }, 6500); }
  function reset(){ clearInterval(timer); start(); }

  load();
})();
