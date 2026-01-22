// Minimal AlertDialog vanilla JS
// Usage: AlertDialog.open({title, description, actionText, cancelText, onAction, onCancel})
window.AlertDialog = (function(){
  function createDOM(){
    const overlay = document.createElement('div'); overlay.className = 'alert-overlay';
    const content = document.createElement('div'); content.className = 'alert-content';

    const header = document.createElement('div'); header.className = 'alert-header';
    const title = document.createElement('div'); title.className = 'alert-title';
    const desc = document.createElement('div'); desc.className = 'alert-desc';

    header.appendChild(title); header.appendChild(desc);

    const footer = document.createElement('div'); footer.className = 'alert-footer';
    const btnCancel = document.createElement('button'); btnCancel.className = 'alert-btn alert-btn-cancel';
    const btnAction = document.createElement('button'); btnAction.className = 'alert-btn alert-btn-primary';

    footer.appendChild(btnCancel); footer.appendChild(btnAction);

    content.appendChild(header); content.appendChild(footer);
    overlay.appendChild(content);

    return {overlay, content, title, desc, btnCancel, btnAction};
  }

  function focusFirst(el){
    const focusable = el.querySelectorAll('a[href],button,textarea,select,input,[tabindex]:not([tabindex="-1"])');
    if(focusable.length) focusable[0].focus();
  }

  function open(opts){
    opts = opts || {};
    const dom = createDOM();
    dom.title.textContent = opts.title || 'Alert';
    dom.desc.textContent = opts.description || '';
    dom.btnAction.textContent = opts.actionText || 'OK';
    dom.btnCancel.textContent = opts.cancelText || 'Cancel';

    // Append
    document.body.appendChild(dom.overlay);

    // Save previously focused element
    const prev = document.activeElement;

    // Event handlers
    function close(returnVal){
      dom.overlay.remove();
      document.removeEventListener('keydown', onKey);
      if(prev && prev.focus) prev.focus();
      if(opts.onClose) opts.onClose(returnVal);
    }
    function onAction(e){ e && e.preventDefault(); if(opts.onAction) opts.onAction(); close(true); }
    function onCancel(e){ e && e.preventDefault(); if(opts.onCancel) opts.onCancel(); close(false); }
    function onOutside(e){ if(e.target===dom.overlay) onCancel(); }
    function onKey(e){ if(e.key==='Escape') onCancel(); if(e.key==='Enter' && document.activeElement!==dom.btnCancel) onAction(); }

    dom.btnAction.addEventListener('click', onAction);
    dom.btnCancel.addEventListener('click', onCancel);
    dom.overlay.addEventListener('click', onOutside);
    document.addEventListener('keydown', onKey);

    // Focus management
    setTimeout(()=> focusFirst(dom.content), 10);

    return {close};
  }

  // Auto-bind triggers: data-alert-title, data-alert-desc, data-alert-action, data-alert-cancel
  function bindTriggers(root){
    root = root || document;
    const triggers = root.querySelectorAll('[data-alert-trigger]');
    triggers.forEach(btn=>{
      if(btn._alertBound) return; btn._alertBound = true;
      btn.addEventListener('click', ()=>{
        const title = btn.getAttribute('data-alert-title') || btn.textContent || 'Alert';
        const desc = btn.getAttribute('data-alert-desc') || btn.getAttribute('data-alert-description') || '';
        const actionText = btn.getAttribute('data-alert-action') || 'OK';
        const cancelText = btn.getAttribute('data-alert-cancel') || 'Cancel';
        open({title, description:desc, actionText, cancelText});
      });
    });
  }

  // init on DOM ready
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>bindTriggers()); else bindTriggers();

  return {open, bindTriggers};
})();
