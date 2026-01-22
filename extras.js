// Extras: cart, entrance animations, testimonials loader, access gate and more-info injection
(function(){
  try{
    document.getElementById('year').textContent=new Date().getFullYear();
  }catch(e){}

  // Cart and UI from original index
  (function(){
    var STORAGE_KEY = 'fp_cart_v1';
    function loadCart(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){return []} }
    function saveCart(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items||[])); }
    function updateCount(){ var c = loadCart().length; var el = document.getElementById('cart-count'); if(el){ el.textContent = c; el.style.display = c? 'inline-block':'none'; } }

    function showAddedBadge(planEl){
      var badge = planEl.querySelector('.added-badge');
      if(!badge){ badge = document.createElement('span'); badge.className = 'added-badge'; badge.textContent = 'Added'; planEl.appendChild(badge); }
      planEl.classList.add('added');
      setTimeout(function(){ planEl.classList.remove('added'); }, 900);
    }

    function addToCart(planEl){
      var title = (planEl.querySelector('h3')||{textContent:'Plan'}).textContent.trim();
      var amountEl = planEl.querySelector('.price .amount');
      var periodEl = planEl.querySelector('.price .period');
      var amount = amountEl? amountEl.textContent.trim() : '';
      var period = periodEl? periodEl.textContent.trim() : '';
      var items = loadCart();
      items.push({title: title, price: amount, period: period, addedAt: Date.now()});
      saveCart(items);
      updateCount();
      showAddedBadge(planEl);
      try{ var cb = document.getElementById('cart-button'); if(cb){ cb.classList.add('pulse'); setTimeout(function(){ cb.classList.remove('pulse'); }, 900); } }catch(e){}
    }

    function buildCartModal(){
      var modal = document.createElement('div'); modal.id = 'cart-modal'; modal.style.position='fixed'; modal.style.inset='0'; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.background='rgba(0,0,0,0.45)'; modal.style.zIndex='9999';
      var box = document.createElement('div'); box.style.maxWidth='720px'; box.style.width='90%'; box.style.background='rgba(255,255,255,0.03)'; box.style.backdropFilter='blur(10px)'; box.style.border='1px solid rgba(255,255,255,0.04)'; box.style.padding='18px'; box.style.borderRadius='12px'; box.style.color='white';
      var h = document.createElement('h3'); h.textContent='Cart'; h.style.marginTop='0'; box.appendChild(h);
      var list = document.createElement('div'); list.id='cart-list'; list.style.marginBottom='12px'; box.appendChild(list);
      var clearBtn = document.createElement('button'); clearBtn.textContent='Clear Cart'; clearBtn.style.marginRight='8px'; clearBtn.addEventListener('click', function(){ localStorage.removeItem(STORAGE_KEY); updateCount(); renderList(); });
      var closeBtn = document.createElement('button'); closeBtn.textContent='Close'; closeBtn.addEventListener('click', closeModal);
      box.appendChild(clearBtn); box.appendChild(closeBtn);
      modal.appendChild(box);
      modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });
      function renderList(){
        var items = loadCart();
        if(!items.length){ list.innerHTML = '<div style="opacity:0.7">Cart is empty</div>'; return; }
        var total = 0;
        list.innerHTML = items.map(function(it,i){
          var priceHtml = it.price ? '<div style="color:var(--muted);font-size:13px;margin-top:6px">' + (it.price||'') + ' ' + (it.period||'') + '</div>' : '';
          var num = 0;
          if(it.price){ var numStr = String(it.price).replace(/[^0-9\.-]+/g,''); if(numStr) { num = parseFloat(numStr); if(isNaN(num)) num = 0; } }
          total += num;
          return '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.02)">' + (i+1) + '. <strong>' + (it.title||'Plan') + '</strong>' + priceHtml + '</div>';
        }).join('');
        if(total>0){ list.innerHTML += '<div style="margin-top:12px;font-weight:900;color:var(--accent);font-size:16px">Estimated total: $' + total.toLocaleString() + '</div>'; }
      }
      function closeModal(){ modal.remove(); }
      modal.renderList = renderList;
      return modal;
    }

    function openCartModal(){ var existing = document.getElementById('cart-modal'); if(existing) return; var m = buildCartModal(); document.body.appendChild(m); m.renderList(); }

    var plans = Array.prototype.slice.call(document.querySelectorAll('.plan'));
    plans.forEach(function(p){
      p.setAttribute('role','button'); p.setAttribute('tabindex','0');
      var amountEl = p.querySelector('.price .amount');
      var isCustom = amountEl && amountEl.textContent.trim().toLowerCase() === 'custom';

      p.addEventListener('click', function(e){
        if(e.target && (e.target.tagName === 'A' || e.target.closest('a'))) return;
        if(isCustom){ /* custom modal omitted here for brevity */ return; }
        addToCart(p);
      });

      p.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); if(isCustom){ /* omitted */ } else { addToCart(p); } } });
    });

    var cartBtn = document.getElementById('cart-button');
    if(cartBtn){ cartBtn.addEventListener('click', openCartModal); cartBtn.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' ') openCartModal(); }); }
    updateCount();

    // entrance animations: stagger nav links, titles, design cards and plan cards
    setTimeout(function(){
      var navLinks = Array.prototype.slice.call(document.querySelectorAll('.center-nav a'));
      navLinks.forEach(function(a,i){ setTimeout(function(){ a.classList.add('animate-in'); }, i * 80); });
      var titles = Array.prototype.slice.call(document.querySelectorAll('.pricing-title, .design-title'));
      titles.forEach(function(t,i){ setTimeout(function(){ t.classList.add('animate-in'); }, 120 + i * 80); });
      var cards = Array.prototype.slice.call(document.querySelectorAll('.design-card'));
      cards.forEach(function(c,i){ setTimeout(function(){ c.classList.add('animate-in'); }, 180 + i * 120); });
      var plans2 = Array.prototype.slice.call(document.querySelectorAll('.plan'));
      plans2.forEach(function(p,i){ setTimeout(function(){ p.classList.add('animate-in'); }, 320 + i * 90); });
    }, 220);

    // testimonials simple loader (fallback)
    (function loadTestimonials(){
      var container = document.getElementById('testimonials');
      if(!container) return;
      fetch('/data/testimonials.json').then(function(r){ if(!r.ok) throw new Error('no file'); return r.json(); }).then(function(json){
        container.innerHTML = (json||[]).slice(0,6).map(function(t){ return '<div class="testimonial"><strong>'+ (t.name||'Client') +'</strong><div style="opacity:.9;margin-top:6px">'+ (t.text||'') +'</div></div>'; }).join('') || '';
      }).catch(function(){ container.innerHTML = ''; });
    })();

  })();

  // Access gate and QR handling (lightweight copy)
  (function(){
    try{
      var ACCESS_TOKEN = 'fp-7b3c9a2d';
      function urlWithToken(u){ try{ var url = new URL(u, window.location.href); if(!url.searchParams.get('access')) url.searchParams.set('access', ACCESS_TOKEN); return url.toString(); }catch(e){ return u + (u.indexOf('?')>-1? '&':'?') + 'access=' + ACCESS_TOKEN; } }
      var fixedQrImg = document.getElementById('fixed-qr-img');
      function qrApiFor(data){ var color = '00d4ff'; return 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(data) + '&color=' + color; }
      var shareBase = sessionStorage.getItem('fp_share_base') || window.location.origin;
      var currentShareUrl = urlWithToken(window.location.href || (shareBase + window.location.pathname));
      if(fixedQrImg){ try{ fixedQrImg.src = qrApiFor(currentShareUrl); }catch(e){} }
      function isLocal(){ var h = location.hostname; return h === 'localhost' || h === '127.0.0.1' || h === '' || h === '::1'; }
      function hasToken(){ try{ var u = new URL(window.location.href); if(u.searchParams.get('access') === ACCESS_TOKEN) return true; var h = window.location.hash || ''; var m = h.match(/access=([^&]+)/); if(m && decodeURIComponent(m[1]) === ACCESS_TOKEN) return true; return false; }catch(e){ try{ var h = window.location.hash || ''; var m = h.match(/access=([^&]+)/); return !!(m && decodeURIComponent(m[1]) === ACCESS_TOKEN); }catch(e){ return false; } } }
      function grantAccess(){ sessionStorage.setItem('fp_access_granted','1'); var gate = document.getElementById('access-gate'); if(gate) { gate.style.display='none'; gate.setAttribute('aria-hidden','true'); } }
      function showGate(){ var gate = document.getElementById('access-gate'); if(gate){ gate.style.display='flex'; gate.setAttribute('aria-hidden','false'); var gqr = document.getElementById('gate-qr'); if(gqr){ gqr.src = qrApiFor(urlWithToken(window.location.origin + window.location.pathname)); } } }
      if(isLocal() || hasToken() || sessionStorage.getItem('fp_access_granted')==='1'){ if(hasToken()) grantAccess(); else { var gate = document.getElementById('access-gate'); if(gate) gate.style.display='none'; } }
      var useShare = document.getElementById('use-share'); if(useShare){ useShare.addEventListener('click', function(){ var val = (document.getElementById('share-url')||{}).value||''; if(!val) return alert('Paste a public URL to use (ngrok or LAN IP)'); try{ var u = new URL(val); sessionStorage.setItem('fp_share_base', u.origin); var gqr = document.getElementById('gate-qr'); if(gqr){ gqr.src = qrApiFor(urlWithToken(u.origin + window.location.pathname)); } if(fixedQrImg){ fixedQrImg.src = qrApiFor(urlWithToken(u.origin + window.location.pathname)); } alert('Share URL saved. Devices scanning the QR will receive that link.'); }catch(e){ alert('Invalid URL. Use full URL including protocol, e.g. https://abcd.ngrok.io'); } }); }
    }catch(e){}
  })();

})();
