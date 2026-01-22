/* Minimal Toaster system (Sonner-like) 
   Usage: Toast.show({title, description, type:'success'|'error'|'info', duration, actionText, action})
   Also: Toast.success(...), Toast.error(...), Toast.info(...)
*/
(function(){
  const containerId = 'toaster-root'
  function getContainer(){
    let c = document.getElementById(containerId)
    if(!c){
      c = document.createElement('div')
      c.id = containerId
      c.className = 'toaster-container'
      document.body.appendChild(c)
    }
    return c
  }

  function createToastNode(opts){
    const {title='', description='', type='info', duration=4500, actionText, action} = opts
    const node = document.createElement('div')
    node.className = 'toast ' + (type||'')
    node.tabIndex = 0

    node.innerHTML = `
      <div class="toast-body">
        <div class="toast-title">${escapeHtml(title)}</div>
        ${description?`<div class="toast-desc">${escapeHtml(description)}</div>`:''}
      </div>
    `

    const actions = document.createElement('div')
    actions.className = 'toast-actions'
    if(actionText && typeof action === 'function'){
      const btn = document.createElement('button')
      btn.className = 'btn primary'
      btn.textContent = actionText
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); action(); removeToast(node) })
      actions.appendChild(btn)
    }
    const close = document.createElement('button')
    close.className = 'close'
    close.innerHTML = '✕'
    close.addEventListener('click', (e)=>{ e.stopPropagation(); removeToast(node) })
    actions.appendChild(close)

    node.appendChild(actions)

    // auto-dismiss
    let timer = null
    function startTimer(){ if(duration>0) timer = setTimeout(()=> removeToast(node), duration) }
    function clearTimer(){ if(timer) { clearTimeout(timer); timer = null } }
    node.addEventListener('mouseenter', clearTimer)
    node.addEventListener('focus', clearTimer)
    node.addEventListener('mouseleave', startTimer)
    node.addEventListener('blur', startTimer)

    // keyboard: Enter to activate primary action, Esc to close
    node.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') removeToast(node)
      if(e.key === 'Enter' && actionText && typeof action === 'function'){ action(); removeToast(node) }
    })

    startTimer()
    return node
  }

  function removeToast(node){
    if(!node) return
    node.classList.add('toast-hide')
    setTimeout(()=>{ node.remove() }, 120)
  }

  function escapeHtml(str){ return (str+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  function show(opts){
    const container = getContainer()
    const node = createToastNode(opts)
    // newest on top
    container.insertBefore(node, container.firstChild)
    node.focus()
    // attach to lookup map for API access
    const id = node.dataset.toastId
    if(id) idToNode.set(id, node)
    notifyListeners()
    return node
  }

  // --- Enhanced API: id-based toasts, update, dismiss, subscribe ---
  let _count = 0
  function genId(){ _count = (_count + 1) % Number.MAX_SAFE_INTEGER; return String(_count) }

  const idToNode = new Map()
  const listeners = []

  function notifyListeners(){
    const state = Array.from(idToNode.keys()).map(id=>({id, node: idToNode.get(id)}))
    listeners.forEach(cb=>{ try{ cb(state) }catch(e){} })
  }

  function removeToast(node){
    if(!node) return
    const id = node.dataset.toastId
    node.classList.add('toast-hide')
    setTimeout(()=>{
      node.remove()
      if(id) idToNode.delete(id)
      notifyListeners()
    }, 120)
  }

  function showWithId(opts){
    const id = opts && opts.id ? String(opts.id) : genId()
    opts = Object.assign({}, opts, {id})
    const node = createToastNode(opts)
    node.dataset.toastId = id
    const container = getContainer()
    container.insertBefore(node, container.firstChild)
    node.focus()
    idToNode.set(id, node)
    notifyListeners()
    return node
  }

  function dismissById(id){
    const node = idToNode.get(String(id))
    if(node) removeToast(node)
  }

  function updateById(id, props){
    const node = idToNode.get(String(id))
    if(!node) return
    const titleEl = node.querySelector('.toast-title')
    const descEl = node.querySelector('.toast-desc')
    if(props.title !== undefined) titleEl.textContent = props.title
    if(props.description !== undefined){
      if(descEl) descEl.textContent = props.description
      else node.querySelector('.toast-body').insertAdjacentHTML('beforeend', `<div class="toast-desc">${escapeHtml(props.description)}</div>`)
    }
    notifyListeners()
  }

  // public surface
  window.Toast = {
    show: showWithId,
    success: (o)=> showWithId(Object.assign({}, o, {type:'success'})),
    error: (o)=> showWithId(Object.assign({}, o, {type:'error'})),
    info: (o)=> showWithId(Object.assign({}, o, {type:'info'})),
    // clear all
    clearAll: ()=>{
      const c = document.getElementById(containerId)
      if(c) c.innerHTML = '';
      idToNode.clear();
      notifyListeners();
    },
    // id-based APIs
    toast(opts){
      const id = genId()
      showWithId(Object.assign({}, opts, {id}))
      return {
        id,
        dismiss: ()=>dismissById(id),
        update: (p)=>updateById(id,p)
      }
    },
    dismiss(id){ dismissById(id) },
    update(id, props){ updateById(id, props) },
    subscribe(cb){ listeners.push(cb); cb(Array.from(idToNode.keys()).map(id=>({id}))); return ()=>{ const i = listeners.indexOf(cb); if(i>-1) listeners.splice(i,1) } },
    _internal: { idToNode }
  }
})();
