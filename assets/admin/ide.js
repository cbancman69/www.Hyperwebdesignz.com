(async function(){
  const editor = document.getElementById('editor');
  const loadBtn = document.getElementById('loadBtn');
  const saveBtn = document.getElementById('saveBtn');
  const openBtn = document.getElementById('openBtn');
  const qrPreview = document.getElementById('qrPreview');
  const msg = document.getElementById('msg');

  function setMsg(t, ok){ msg.textContent = t; msg.style.color = ok ? 'lightgreen' : 'salmon'; }

  async function fetchFile(){
    try{
      const res = await fetch('/admin/file?path=index.html');
      if(!res.ok) throw new Error('not ok');
      const data = await res.text();
      editor.value = data;
      setMsg('Loaded index.html', true);
    }catch(e){ setMsg('Failed to load. Are you logged in as admin?', false); }
  }

  async function saveFile(){
    try{
      const res = await fetch('/admin/file', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ path:'index.html', content: editor.value }) });
      if(!res.ok) throw new Error('save failed');
      setMsg('Saved index.html', true);
      updateQR();
    }catch(e){ setMsg('Save failed. Check admin session.', false); }
  }

  loadBtn.addEventListener('click', fetchFile);
  saveBtn.addEventListener('click', saveFile);
  openBtn.addEventListener('click', ()=> window.open('/', '_blank'));
  const shareBtn = document.getElementById('shareBtn');
  const shareLink = document.getElementById('shareLink');

  async function generateShare(ttlMs = 1000 * 60 * 60 * 24){
    try{
      const res = await fetch('/admin/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ttlMs }) });
      if(!res.ok) throw new Error('generate failed');
      const body = await res.json();
      // body: { token, url, qr, expires }
      const url = body.url;
      const svg = body.qr;
      // embed clickable QR
      qrPreview.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${svg}</a>`;
      shareLink.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#9fd">${url}</a>`;
      setMsg('Shareable QR generated', true);
    }catch(e){ setMsg('Failed to generate share QR — check admin session.', false); }
  }

  if(shareBtn){ shareBtn.addEventListener('click', ()=> generateShare()); }

  // QR: request server /qr for a themed SVG and embed
  async function updateQR(){
    try{
      const r = await fetch('/qr');
      if(!r.ok) throw new Error('noqr');
      const svg = await r.text();
      qrPreview.innerHTML = svg;
    }catch(e){ qrPreview.innerHTML = '<div style="color:#9fd">QR unavailable</div>'; }
  }

  // load on open
  await fetchFile();
  updateQR();

})();
