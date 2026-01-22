/* Vanilla Select component
   Usage: markup with .select-root, .select-trigger (data-select="#id"), and .select-content id matching.
   List items should have attribute data-value and optional data-disabled.
   Fires 'select:change' event on the .select-root element with detail {value, label}.
*/
(function(){
  function open(content){ content.classList.remove('select-hidden') }
  function close(content){ content.classList.add('select-hidden') }

  function position(content, trigger){
    const rect = trigger.getBoundingClientRect()
    content.style.minWidth = rect.width + 'px'
    // fallback positioning handled by CSS top/left
  }

  function initSelect(root){
    const trigger = root.querySelector('.select-trigger')
    const contentId = trigger && (trigger.dataset.select || trigger.getAttribute('aria-controls'))
    const content = contentId ? document.querySelector(contentId) : root.querySelector('.select-content')
    if(!trigger || !content) return

    // set ARIA
    trigger.setAttribute('aria-haspopup','listbox')
    trigger.setAttribute('role','button')
    trigger.setAttribute('tabindex','0')
    content.setAttribute('role','listbox')
    content.classList.add('select-hidden')

    function updateValue(value, label){
      const v = root.querySelector('.select-value')
      if(v) v.textContent = label ?? value
      root.value = value
      root.dispatchEvent(new CustomEvent('select:change',{detail:{value,label}}))
    }

    // find current selected
    const selected = content.querySelector('[data-selected="true"]') || content.querySelector('[aria-selected="true"]')
    if(selected){ updateValue(selected.dataset.value, selected.textContent.trim()) }

    trigger.addEventListener('click', (e)=>{
      e.stopPropagation()
      const openNow = !content.classList.contains('select-hidden')
      document.querySelectorAll('.select-content').forEach(c=>c.classList.add('select-hidden'))
      if(openNow) return
      position(content, trigger)
      open(content)
      // focus first or selected
      const sel = content.querySelector('[aria-selected="true"]') || content.querySelector('.select-item')
      if(sel) sel.focus()
    })

    // keyboard support on trigger
    trigger.addEventListener('keydown', (ev)=>{
      if(ev.key === 'ArrowDown' || ev.key === 'Enter' || ev.key===' '){ ev.preventDefault(); trigger.click() }
    })

    // items
    const items = Array.from(content.querySelectorAll('.select-item'))
    items.forEach((item, idx)=>{
      item.tabIndex = 0
      if(item.dataset.disabled !== undefined) item.setAttribute('aria-disabled','true')
      if(item.dataset.value && (item.dataset.selected==='true' || item.getAttribute('aria-selected')==='true')){
        item.setAttribute('aria-selected','true')
      }

      item.addEventListener('click', (e)=>{
        e.stopPropagation()
        if(item.dataset.disabled !== undefined) return
        // clear previous
        items.forEach(i=>i.removeAttribute('aria-selected'))
        item.setAttribute('aria-selected','true')
        updateValue(item.dataset.value, item.textContent.trim())
        close(content)
      })

      item.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); item.click() }
        if(ev.key === 'ArrowDown'){ ev.preventDefault(); const next = items[(idx+1)%items.length]; next.focus() }
        if(ev.key === 'ArrowUp'){ ev.preventDefault(); const prev = items[(idx-1+items.length)%items.length]; prev.focus() }
        if(ev.key === 'Home'){ ev.preventDefault(); items[0].focus() }
        if(ev.key === 'End'){ ev.preventDefault(); items[items.length-1].focus() }
        if(ev.key === 'Escape'){ close(content); trigger.focus() }
      })
    })

    // global close
    document.addEventListener('click', ()=>{ close(content) })
    document.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape') close(content) })
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.select-root').forEach(initSelect)
  })
})();
