(() => {
  const feedEl = document.getElementById('feed');
  const postBtn = document.getElementById('postBtn');
  const postText = document.getElementById('postText');

  async function loadPosts(){
    try{
      const res = await fetch('/api/posts');
      const list = await res.json();
      render(list);
    }catch(e){console.error(e)}
  }

  function render(list){
    feedEl.innerHTML = '';
    list.forEach(p => {
      const el = document.createElement('article');
      el.className = 'post';
      el.innerHTML = `
        <div class="meta"><div class="avatar" aria-hidden="true"></div><div class="info"><div class="username">${escapeHtml(p.user && p.user.name ? p.user.name : 'Anon')}</div><div class="muted">${new Date(p.ts).toLocaleString()}</div></div></div>
        <div class="text">${escapeHtml(p.text)}</div>
        <div class="actions">
          <button class="action-btn react-btn" data-id="${p.id}" data-type="like"><svg class="action-icon"><use href="/assets/icons.svg#icon-like"></use></svg><span class="reaction-count">${(p.reactions && p.reactions.like) || 0}</span></button>
          <button class="action-btn react-btn" data-id="${p.id}" data-type="love"><svg class="action-icon"><use href="/assets/icons.svg#icon-love"></use></svg><span class="reaction-count">${(p.reactions && p.reactions.love) || 0}</span></button>
          <button class="action-btn react-btn" data-id="${p.id}" data-type="haha"><svg class="action-icon"><use href="/assets/icons.svg#icon-haha"></use></svg><span class="reaction-count">${(p.reactions && p.reactions.haha) || 0}</span></button>
          <button class="action-btn"><svg class="action-icon"><use href="/assets/icons.svg#icon-comment"></use></svg></button>
          <button class="action-btn"><svg class="action-icon"><use href="/assets/icons.svg#icon-share"></use></svg></button>
        </div>
      `;
      feedEl.appendChild(el);
    });
    attachReactionHandlers();
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

  postBtn.addEventListener('click', async ()=>{
    const text = postText.value.trim();
    if(!text) return;
    postBtn.disabled = true;
    try{
      const res = await fetch('/api/posts', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text, user: { name: 'You' } }) });
      if(res.ok){ postText.value=''; const p = await res.json(); prependPost(p); }
    }catch(e){console.error(e)}
    postBtn.disabled = false;
  });

  function prependPost(p){
    const el = document.createElement('article'); el.className='post'; el.innerHTML = `\n      <div class="meta"><div class="avatar" aria-hidden="true"></div><div><div class="username">${escapeHtml(p.user && p.user.name ? p.user.name : 'Anon')}</div><div class="muted">${new Date(p.ts).toLocaleString()}</div></div></div>\n      <div class="text">${escapeHtml(p.text)}</div>\n    `;
    feedEl.insertBefore(el, feedEl.firstChild);
  }

  function attachReactionHandlers(){
    document.querySelectorAll('.react-btn').forEach(btn => {
      if (btn.dataset._bound) return btn.dataset._bound = '1';
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        try{
          // optimistic UI: animate
          const span = btn.querySelector('.reaction-count');
          btn.classList.add('pop');
          setTimeout(()=>btn.classList.remove('pop'), 360);
          const res = await fetch(`/api/posts/${id}/reaction`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ type }) });
          if (res.ok){
            const data = await res.json();
            if (span) span.textContent = (data.reactions && data.reactions[type]) || span.textContent;
          }
        }catch(err){console.error(err)}
      });
    });
  }

  // WebSocket real-time updates
  try{
    const wsScheme = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(wsScheme + '://' + location.host);
    ws.addEventListener('message', (ev)=>{
      try{
        const msg = JSON.parse(ev.data);
        if(msg && msg.type === 'post' && msg.post) prependPost(msg.post);
        if(msg && msg.type === 'reaction' && msg.id){
          // update reaction counts if visible
          const buttons = document.querySelectorAll(`.react-btn[data-id="${msg.id}"]`);
          buttons.forEach(b => {
            const t = b.getAttribute('data-type');
            const span = b.querySelector('.reaction-count');
            if (span && msg.reactions && typeof msg.reactions[t] !== 'undefined') span.textContent = msg.reactions[t];
          });
        }
        // server also sends reload messages for file changes; ignore
      }catch(e){}
    });
  }catch(e){/* ignore websocket errors */}

  loadPosts();
})();
