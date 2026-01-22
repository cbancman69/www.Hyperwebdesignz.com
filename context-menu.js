// Vanilla ContextMenu port: basic contextmenu, submenu, checkbox, radio handling
(function(){
  function qs(sel, ctx=document){ return ctx.querySelector(sel) }
  function qsa(sel, ctx=document){ return Array.from((ctx||document).querySelectorAll(sel)) }

  function openMenu(menu, x, y){
    menu.style.left = x + 'px'
    menu.style.top = y + 'px'
    menu.classList.remove('cm-hidden')
    menu.classList.add('cm-open')
    menu.setAttribute('aria-hidden','false')
    // focus first focusable item
    const it = menu.querySelector('.cm-item:not([aria-disabled="true"])')
    if(it) it.focus()
  }

  function closeAll(){
    qsa('.cm-menu').forEach(m=>{
      m.classList.add('cm-hidden')
      m.removeAttribute('style')
      m.setAttribute('aria-hidden','true')
    })
  }

  function toggleCheckbox(item){
    const checked = item.getAttribute('aria-checked') === 'true'
    item.setAttribute('aria-checked', String(!checked))
    const icon = item.querySelector('.cm-check')
    if(icon) icon.style.visibility = !checked ? 'visible' : 'hidden'
  }

  function setRadio(item){
    const group = item.dataset.radioGroup
    if(!group) return
    const items = qsa(`[data-radio-group="${group}"]`)
    items.forEach(i=>{
      const checked = i === item
      i.setAttribute('aria-checked', String(checked))
      const dot = i.querySelector('.cm-radio-dot')
      if(dot) dot.classList.toggle('checked', checked)
    })
  }

  function initMenu(menu){
    // click handlers for items
    qsa('.cm-item', menu).forEach(item => {
      item.setAttribute('tabindex', '0')
      item.addEventListener('click', (e)=>{
        e.stopPropagation()
        if(item.dataset.disabled) return
        if(item.dataset.checkbox!==undefined){ toggleCheckbox(item) }
        if(item.dataset.radioGroup!==undefined){ setRadio(item) }
        const submenuId = item.dataset.submenu
        if(submenuId){
          const sub = document.getElementById(submenuId)
          if(sub){
            // position submenu next to parent
            const rect = item.getBoundingClientRect()
            sub.style.left = (rect.right + 8) + 'px'
            sub.style.top = rect.top + 'px'
            sub.classList.remove('cm-hidden')
            sub.setAttribute('aria-hidden','false')
          }
          return
        }
        // normal action: if data-action is present, dispatch
        const action = item.dataset.action
        if(action){
          const ev = new CustomEvent('context:action', {detail:{action, item}})
          menu.dispatchEvent(ev)
        }
        closeAll()
      })

      // keyboard support: Enter/Space to activate, ArrowRight to open submenu, Esc to close
      item.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); item.click() }
        if(ev.key === 'ArrowRight' && item.dataset.submenu){
          item.click()
        }
        if(ev.key === 'Escape'){ closeAll() }
      })
    })
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // initialize menus
    qsa('.cm-menu').forEach(initMenu)

    // triggers
    qsa('.context-menu-trigger').forEach(tx => {
      tx.addEventListener('contextmenu', (ev)=>{
        ev.preventDefault()
        ev.stopPropagation()
        closeAll()
        const menuId = tx.dataset.menu || tx.getAttribute('aria-controls')
        const menu = document.getElementById(menuId)
        if(menu) openMenu(menu, ev.clientX, ev.clientY)
      })
      // optional left-click open
      tx.addEventListener('click', (ev)=>{
        ev.preventDefault(); ev.stopPropagation();
        closeAll();
        const menuId = tx.dataset.menu || tx.getAttribute('aria-controls')
        const menu = document.getElementById(menuId)
        if(menu) openMenu(menu, ev.clientX, ev.clientY)
      })
    })

    // close on outside click or Escape
    document.addEventListener('mousedown', (ev)=>{
      if(!ev.target.closest('.cm-menu')) closeAll()
    })
    document.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape') closeAll() })
  })
  // expose for debug
  window.CM = {openMenu, closeAll}
})();
