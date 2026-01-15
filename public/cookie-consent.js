// Simple cookie-consent / analytics opt-in
(function(){
  const key = 'fp_cookie_ok';
  // Configure your analytics provider here. provider: 'plausible'|'ga'|'none'|'auto'
  // 'auto' will prefer GA if a measurementId is set, otherwise attempt Plausible using
  // the page hostname (skips analytics on localhost).
  // Examples:
  //   // Plausible explicitly
  //   provider: 'plausible', domain: 'yourdomain.com'
  //   // Google Analytics explicitly
  //   provider: 'ga', measurementId: 'G-XXXXXXX'
  //   // Auto (default): prefers GA if measurementId present, otherwise Plausible
  const ANALYTICS = {
    provider: 'auto',
    // for Plausible set domain to your domain, or leave empty to use the current hostname
    domain: '',
    // for Google Analytics set measurementId to 'G-XXXXXXX' (optional)
    measurementId: ''
  };

  function createBanner(){
    const b = document.createElement('div');
    b.id = 'cookieBanner';
    Object.assign(b.style, {
      position: 'fixed', left: '12px', right: '12px', bottom: '18px', padding: '12px',
      background: 'linear-gradient(180deg,rgba(2,18,24,0.9),rgba(2,12,18,0.85))',
      border: '1px solid rgba(0,212,255,0.06)', borderRadius: '10px', zIndex: 2000,
      display: 'flex', gap: '12px', alignItems: 'center'
    });
    const txt = document.createElement('div'); txt.style.flex = '1'; txt.style.color = '#cfe';
    txt.textContent = 'We use minimal analytics to improve the site. Allow anonymous analytics?';
    const yes = document.createElement('button'); yes.className='btn small'; yes.textContent='Allow';
    const no = document.createElement('button'); no.className='btn small'; no.textContent='Deny';
    yes.addEventListener('click', ()=>{ localStorage.setItem(key,'allow'); initAnalytics(); b.remove(); });
    no.addEventListener('click', ()=>{ localStorage.setItem(key,'deny'); b.remove(); });
    b.appendChild(txt); b.appendChild(yes); b.appendChild(no); document.body.appendChild(b);
  }

  function loadScript(src, attrs){
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script'); s.src = src; s.async = true; s.defer = true;
      if(attrs) Object.keys(attrs).forEach(k=>s.setAttribute(k, attrs[k]));
      s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load '+src));
      document.head.appendChild(s);
    });
  }

  function initAnalytics(){
    if(!ANALYTICS || ANALYTICS.provider === 'none') return;

    const isLocal = (hostname=>{
      if(!hostname) return true;
      if(hostname === 'localhost' || hostname === '127.0.0.1') return true;
      // simple check for local dev hostnames
      if(hostname.endsWith('.local')) return true;
      return false;
    })(window.location.hostname);

    let provider = ANALYTICS.provider;
    if(provider === 'auto'){
      if(isLocal){ provider = 'none'; }
      else if(ANALYTICS.measurementId) provider = 'ga';
      else provider = 'plausible';
    }

    if(provider === 'none'){
      if(isLocal) console.info('Analytics skipped on localhost (consent recorded).');
      else console.info('Analytics provider set to "none".');
      return;
    }

    if(provider === 'plausible'){
      const domain = ANALYTICS.domain && ANALYTICS.domain !== 'example.com' ? ANALYTICS.domain : window.location.hostname;
      if(!domain){ console.warn('Plausible domain not determined; analytics skipped'); return; }
      loadScript('https://plausible.io/js/plausible.js', {'data-domain': domain})
        .then(()=> console.log('Plausible loaded for', domain))
        .catch(e=> console.warn('Plausible failed to load', e));
      return;
    }

    if(provider === 'ga'){
      if(!ANALYTICS.measurementId){ console.warn('GA measurementId not set; analytics skipped'); return; }
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} window.gtag = gtag;
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.measurementId}`)
        .then(()=>{
          gtag('js', new Date());
          gtag('config', ANALYTICS.measurementId, { 'anonymize_ip': true });
          console.log('GA loaded', ANALYTICS.measurementId);
        })
        .catch(e=> console.warn('GA failed to load', e));
      return;
    }

    console.log('Unknown analytics provider:', ANALYTICS.provider);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const pref = localStorage.getItem(key);
    if(pref === 'allow') initAnalytics();
    else if(pref === 'deny') return;
    else createBanner();
  });
})();
