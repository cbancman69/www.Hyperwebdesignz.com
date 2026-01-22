// Breadcrumb helper: collapse long trails into an ellipsis that toggles expanded state
(function(){
  function collapseBreadcrumb(nav, maxVisible=4){
    const list = nav.querySelector('.breadcrumb-list')
    if(!list) return
    const items = Array.from(list.querySelectorAll('.breadcrumb-item'))
    if(items.length <= maxVisible) return

    const first = items[0]
    const last = items[items.length-1]
    const middle = items.slice(1, items.length-1)

    // create ellipsis node
    const ell = document.createElement('button')
    ell.className = 'breadcrumb-ellipsis'
    ell.setAttribute('aria-expanded','false')
    ell.setAttribute('aria-label','Show path')
    ell.innerHTML = '…'

    // wrap middle items
    const wrapper = document.createElement('span')
    wrapper.className = 'bc-collapsed'
    middle.forEach(it=>{ it.classList.add('hidden-item'); wrapper.appendChild(it) })

    // insert after first item: first + ell + wrapper + last
    // remove middle from list if already in DOM order
    // append elements accordingly
    middle.forEach(m=> m.remove())
    const insertAfter = first
    insertAfter.after(ell)
    ell.after(wrapper)

    ell.addEventListener('click', ()=>{
      const expanded = ell.getAttribute('aria-expanded') === 'true'
      if(expanded){
        // collapse
        wrapper.classList.remove('bc-expanded')
        ell.setAttribute('aria-expanded','false')
        wrapper.querySelectorAll('.breadcrumb-item').forEach(i=> i.classList.add('hidden-item'))
      } else {
        // expand
        wrapper.classList.add('bc-expanded')
        ell.setAttribute('aria-expanded','true')
        wrapper.querySelectorAll('.breadcrumb-item').forEach(i=> i.classList.remove('hidden-item'))
      }
    })
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('nav.breadcrumb[data-collapse]').forEach(nav=>{
      const n = parseInt(nav.getAttribute('data-collapse')||'4',10)
      collapseBreadcrumb(nav, n)
    })
  })
})();
