// Minimal tooltip implementation
(function(){
  const MARGIN = 8
  function createTooltip(){
    const el = document.createElement('div')
    el.className = 'tt'
    el.innerHTML = '<div class="tt-content"></div><div class="tt-arrow" aria-hidden="true"></div>'
    document.body.appendChild(el)
    return el
  }

  function positionTooltip(tt, target, side='top'){
    const rect = target.getBoundingClientRect()
    const ttRect = tt.getBoundingClientRect()
    let left=0, top=0
    const arrow = tt.querySelector('.tt-arrow')
    arrow.style.left = ''
    arrow.style.top = ''
    if(side==='top'){
      left = rect.left + rect.width/2 - ttRect.width/2
      top = rect.top - ttRect.height - MARGIN
      arrow.style.left = (ttRect.width/2 - 5) + 'px'
      arrow.style.top = ''
    } else if(side==='bottom'){
      left = rect.left + rect.width/2 - ttRect.width/2
      top = rect.bottom + MARGIN
      arrow.style.left = (ttRect.width/2 - 5) + 'px'
      arrow.style.top = ''
    } else if(side==='left'){
      left = rect.left - ttRect.width - MARGIN
      top = rect.top + rect.height/2 - ttRect.height/2
      arrow.style.top = (ttRect.height/2 - 5) + 'px'
      arrow.style.left = ''
    } else { // right
      left = rect.right + MARGIN
      top = rect.top + rect.height/2 - ttRect.height/2
      arrow.style.top = (ttRect.height/2 - 5) + 'px'
      arrow.style.left = ''
    }
    // keep inside viewport
    left = Math.max(6, Math.min(left, window.innerWidth - ttRect.width - 6))
    top = Math.max(6, Math.min(top, window.innerHeight - ttRect.height - 6))
    tt.style.left = left + 'px'
    tt.style.top = top + 'px'
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const tooltip = createTooltip()
    const content = tooltip.querySelector('.tt-content')
    let activeTarget = null
    let side = 'top'

    function show(target){
      const text = target.getAttribute('data-tooltip') || ''
      if(!text) return
      content.textContent = text
      side = target.getAttribute('data-side') || 'top'
      tooltip.classList.add('tt-open-anim')
      tooltip.classList.add('tt-open')
      activeTarget = target
      positionTooltip(tooltip, target, side)
    }
    function hide(){
      tooltip.classList.remove('tt-open')
      activeTarget = null
    }

    // attach to elements with data-tooltip
    const nodes = document.querySelectorAll('[data-tooltip]')
    nodes.forEach(n=>{
      n.addEventListener('mouseenter', ()=> show(n))
      n.addEventListener('focus', ()=> show(n))
      n.addEventListener('mouseleave', hide)
      n.addEventListener('blur', hide)
    })

    // reposition on scroll/resize
    window.addEventListener('scroll', ()=>{ if(activeTarget) positionTooltip(tooltip, activeTarget, side) }, true)
    window.addEventListener('resize', ()=>{ if(activeTarget) positionTooltip(tooltip, activeTarget, side) })
  })
})();
