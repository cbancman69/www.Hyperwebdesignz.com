/* Vanilla Menubar implementation
   - Top-level triggers open menus (click/keyboard)
   - Supports checkbox and radio items via data attributes
   - Dispatches 'menubar:action' custom event with {action, item}
*/
(function(){
  function positionMenu(menu, trigger){
    const r = trigger.getBoundingClientRect()
    menu.style.left = (r.left) + 'px'
    menu.style.top = (r.bottom + 8) + 'px'
  }

  function closeAll(){
    document.querySelectorAll('.mb-menu').forEach(m=> m.classList.add('mb-hidden'))
    document.querySelectorAll('.mb-trigger').forEach(t=> t.setAttribute('aria-expanded','false'))
  }

  function toggleCheckbox(item){
    const checked = item.getAttribute('aria-checked') === 'true'
    item.setAttribute('aria-checked', String(!checked))
    const cb = item.querySelector('.mb-check')
    if(cb) cb.style.visibility = !checked ? 'visible' : 'hidden'
  }

  function setRadio(item){
    const group = item.dataset.radioGroup
    if(!group) return
    const items = Array.from(document.querySelectorAll(`[data-radio-group="${group}"]`))
    items.forEach(i=>{
      const sel = i === item
      i.setAttribute('aria-checked', String(sel))
      const dot = i.querySelector('.mb-radio')
      if(dot) dot.classList.toggle('checked', sel)
    })
  }

  function initMenu(menu){
    menu.querySelectorAll('.mb-item').forEach(item=>{
      item.tabIndex = 0
      item.addEventListener('click', (e)=>{
        e.stopPropagation()
        if(item.dataset.disabled) return
        if(item.dataset.checkbox !== undefined){ toggleCheckbox(item); return }
        if(item.dataset.radioGroup !== undefined){ setRadio(item); return }
        const action = item.dataset.action
        if(action){ menu.dispatchEvent(new CustomEvent('menubar:action',{detail:{action, item}})) }
        closeAll()
      })
      item.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); item.click() }
        if(ev.key === 'Escape'){ closeAll(); ev.stopPropagation() }
      })
    })
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.menubar').forEach(root=>{
      const triggers = Array.from(root.querySelectorAll('.mb-trigger'))
      triggers.forEach(trig=>{
        const menuId = trig.dataset.menu
        const menu = menuId ? document.querySelector(menuId) : null
        if(menu) initMenu(menu)
        trig.addEventListener('click',(ev)=>{
          ev.stopPropagation()
          const isOpen = trig.getAttribute('aria-expanded') === 'true'
          closeAll()
          if(isOpen) return
          if(menu){
            menu.classList.remove('mb-hidden')
            positionMenu(menu, trig)
            trig.setAttribute('aria-expanded','true')
            // focus first item
            const first = menu.querySelector('.mb-item:not([aria-disabled="true"])')
            if(first) first.focus()
          }
        })

        trig.addEventListener('keydown', (ev)=>{
          const idx = triggers.indexOf(trig)
          if(ev.key === 'ArrowRight'){ ev.preventDefault(); triggers[(idx+1)%triggers.length].focus() }
          if(ev.key === 'ArrowLeft'){ ev.preventDefault(); triggers[(idx-1+triggers.length)%triggers.length].focus() }
          if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); trig.click() }
          if(ev.key === 'Escape'){ closeAll() }
        })
      })
    })

    // close on outside click or Escape globally
    document.addEventListener('click', ()=> closeAll())
    document.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape') closeAll() })
  })

  window.Menubar = {closeAll}
})();
