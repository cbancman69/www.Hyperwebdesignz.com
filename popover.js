// Minimal popover implementation: toggles elements with role=dialog and id target
(function(){
  function position(pop, trigger, side='bottom', align='center'){
    const r = trigger.getBoundingClientRect()
    const pr = pop.getBoundingClientRect()
    let left=0, top=0
    if(side==='bottom') top = r.bottom + 8
    else if(side==='top') top = r.top - pr.height - 8
    else if(side==='left') left = r.left - pr.width - 8
    else if(side==='right') left = r.right + 8

    if(align==='center' || !left){
      left = r.left + (r.width/2) - (pr.width/2)
    } else if(align==='start'){
      left = r.left
    } else if(align==='end'){
      left = r.right - pr.width
    }
    // clamp to viewport
    left = Math.max(6, Math.min(left, window.innerWidth - pr.width - 6))
    top = Math.max(6, Math.min(top || (r.top + 8), window.innerHeight - pr.height - 6))
    pop.style.left = left + 'px'
    pop.style.top = top + 'px'
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-popover]').forEach(btn=>{
      const id = btn.dataset.popover
      const pop = document.querySelector(id)
      if(!pop) return
      pop.classList.add('hidden')
      pop.style.position = 'absolute'
      btn.addEventListener('click', (e)=>{
        const open = !pop.classList.contains('hidden')
        document.querySelectorAll('.po').forEach(p=>p.classList.add('hidden'))
        if(open) { pop.classList.add('hidden'); return }
        const side = btn.dataset.side || 'bottom'
        const align = btn.dataset.align || 'center'
        pop.classList.remove('hidden')
        position(pop, btn, side, align)
      })
    })

    // close on outside click
    document.addEventListener('click', (e)=>{
      if(e.target.closest('.po') || e.target.closest('[data-popover]')) return
      document.querySelectorAll('.po').forEach(p=>p.classList.add('hidden'))
    })
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') document.querySelectorAll('.po').forEach(p=>p.classList.add('hidden')) })
    window.addEventListener('resize', ()=>{ document.querySelectorAll('.po:not(.hidden)').forEach(p=>{
      const id = p.getAttribute('id')
      const trigger = document.querySelector(`[data-popover="#${id}"]`)
      if(trigger) position(p, trigger, trigger.dataset.side || 'bottom', trigger.dataset.align || 'center')
    }) })
  })
})();
