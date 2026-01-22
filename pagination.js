/* Vanilla Pagination helper
   - If a .pagination-root element has data-total and data-current attributes, the script will render page links.
   - Emits 'pagination:change' event with {page} when a link is clicked.
   - Supports prev/next and ellipsis insertion.
*/
(function(){
  function renderPagination(root){
    const total = parseInt(root.dataset.total||'0',10)
    const current = parseInt(root.dataset.current||'1',10)
    const compact = root.classList.contains('pg-compact')
    const ul = document.createElement('ul')

    function li(linkOrText, isLink){
      const li = document.createElement('li')
      li.className = 'pg-item'
      if(isLink){
        const a = document.createElement('a')
        a.href = '#'
        a.className = 'pg-link'
        a.dataset.page = String(linkOrText)
        a.textContent = String(linkOrText)
        if(Number(linkOrText) === current){ a.classList.add('active'); a.setAttribute('aria-current','page') }
        li.appendChild(a)
      } else {
        const span = document.createElement('span')
        span.className = 'pg-ellipsis'
        span.textContent = linkOrText
        li.appendChild(span)
      }
      return li
    }

    // previous
    const prevLi = document.createElement('li')
    prevLi.className = 'pg-item'
    const prev = document.createElement('a')
    prev.href = '#'
    prev.className = 'pg-link pg-prev'
    prev.dataset.page = String(Math.max(1,current-1))
    prev.innerHTML = '<span style="transform:translateX(-2px)">◀</span><span>Previous</span>'
    if(current<=1) prev.setAttribute('aria-disabled','true')
    prevLi.appendChild(prev)
    ul.appendChild(prevLi)

    if(total <= 9){
      for(let i=1;i<=total;i++) ul.appendChild(li(i, true))
    } else {
      // show first two, ellipsis, neighbors, ellipsis, last two
      ul.appendChild(li(1,true))
      ul.appendChild(li(2,true))
      const left = Math.max(3, current-1)
      const right = Math.min(total-2, current+1)
      if(left > 3) ul.appendChild(li('…', false))
      for(let i=left;i<=right;i++) ul.appendChild(li(i, true))
      if(right < total-2) ul.appendChild(li('…', false))
      ul.appendChild(li(total-1, true))
      ul.appendChild(li(total, true))
    }

    // next
    const nextLi = document.createElement('li')
    nextLi.className = 'pg-item'
    const next = document.createElement('a')
    next.href = '#'
    next.className = 'pg-link pg-next'
    next.dataset.page = String(Math.min(total,current+1))
    next.innerHTML = '<span>Next</span><span style="transform:translateX(2px)">▶</span>'
    if(current>=total) next.setAttribute('aria-disabled','true')
    nextLi.appendChild(next)
    ul.appendChild(nextLi)

    // clear root and append
    root.innerHTML = ''
    root.appendChild(ul)

    // attach click handlers
    root.querySelectorAll('.pg-link').forEach(a=>{
      a.addEventListener('click', (ev)=>{
        ev.preventDefault()
        if(a.getAttribute('aria-disabled')==='true') return
        const page = parseInt(a.dataset.page||'1',10)
        root.dispatchEvent(new CustomEvent('pagination:change',{detail:{page}}))
      })
    })
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.pagination-root').forEach(root=>{
      const total = parseInt(root.dataset.total||'0',10)
      if(total>0){ renderPagination(root) }
      // if markup already present, attach click handlers for links
      root.addEventListener('click', (ev)=>{
        const a = ev.target.closest('.pg-link')
        if(!a) return
        ev.preventDefault()
        if(a.getAttribute('aria-disabled')==='true') return
        const page = parseInt(a.dataset.page||'1',10)
        root.dispatchEvent(new CustomEvent('pagination:change',{detail:{page}}))
      })
    })
  })
})();
