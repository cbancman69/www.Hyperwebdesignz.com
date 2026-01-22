/* Vanilla Command Palette (cmdk-like) 
   Features: open/close, search filter, keyboard navigation, groups, triggers custom event 'command:select' with {action, label}
*/
(function(){
  function $(s,ctx=document){return ctx.querySelector(s)}
  function $$(s,ctx=document){return Array.from(ctx.querySelectorAll(s))}

  function openPalette(palette){
    if(!palette) return
    palette.classList.remove('cp-hidden')
    palette.classList.add('cp-open')
    palette.querySelector('input').focus()
  }
  function closePalette(palette){
    if(!palette) return
    palette.classList.add('cp-hidden')
    palette.querySelectorAll('.cp-item').forEach(it=>it.removeAttribute('aria-selected'))
  }

  function filterItems(palette, term){
    term = (term||'').trim().toLowerCase()
    const items = $$('.cp-item', palette)
    let anyVisible=false
    items.forEach(it=>{
      const label = it.dataset.label || it.querySelector('.label')?.textContent || ''
      const group = it.dataset.group || ''
      const match = label.toLowerCase().includes(term) || group.toLowerCase().includes(term)
      it.style.display = match ? '' : 'none'
      if(match) anyVisible = true
    })
    const empty = $('.cp-empty', palette)
    if(empty) empty.style.display = anyVisible ? 'none' : ''
  }

  function moveSelection(palette, dir){
    const visible = $$('.cp-item', palette).filter(i=>i.style.display!=='none')
    if(!visible.length) return
    const current = visible.findIndex(i=>i.getAttribute('aria-selected')==='true')
    let next = current + dir
    if(next < 0) next = visible.length - 1
    if(next >= visible.length) next = 0
    visible.forEach(i=>i.removeAttribute('aria-selected'))
    visible[next].setAttribute('aria-selected','true')
    visible[next].scrollIntoView({block:'nearest'})
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // initialize palettes
    $$('.cp-overlay').forEach(p=>{
      // close behaviour
      p.querySelector('.cp-dialog').addEventListener('click', e=>e.stopPropagation())
      p.addEventListener('click', ()=> closePalette(p))
      // input events
      const input = $('input', p)
      if(input){
        input.addEventListener('input', ()=> filterItems(p, input.value))
        input.addEventListener('keydown', (ev)=>{
          if(ev.key === 'ArrowDown'){ ev.preventDefault(); moveSelection(p, 1) }
          if(ev.key === 'ArrowUp'){ ev.preventDefault(); moveSelection(p, -1) }
          if(ev.key === 'Enter'){ ev.preventDefault(); const sel = $('.cp-item[aria-selected="true"]', p) || $('.cp-item', p); if(sel) sel.click() }
          if(ev.key === 'Escape'){ closePalette(p) }
        })
      }

      // item click handlers
      $$('.cp-item', p).forEach(item=>{
        item.addEventListener('click', (e)=>{
          e.stopPropagation()
          const action = item.dataset.action
          const label = item.dataset.label || (item.querySelector('.label')?.textContent||'')
          closePalette(p)
          const ev = new CustomEvent('command:select', {detail:{action,label}})
          p.dispatchEvent(ev)
        })
      })
    })

    // open triggers (buttons with data-palette="#id")
    $$('[data-palette]').forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        const id = btn.dataset.palette
        const palette = document.querySelector(id)
        if(palette) openPalette(palette)
      })
    })

    // global keyboard: Ctrl+K or Cmd+K to open first palette
    document.addEventListener('keydown', (ev)=>{
      if((ev.ctrlKey||ev.metaKey) && ev.key.toLowerCase()==='k'){
        const palette = document.querySelector('.cp-overlay')
        if(palette){ ev.preventDefault(); openPalette(palette) }
      }
      if(ev.key==='Escape'){
        $$('.cp-overlay').forEach(closePalette)
      }
    })
  })
  window.CommandPalette = {openPalette, closePalette}
})();
