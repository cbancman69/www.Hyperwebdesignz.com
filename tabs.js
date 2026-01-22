/* Vanilla Tabs implementation
   - keyboard navigation (ArrowLeft/ArrowRight/Home/End)
   - ARIA roles and aria-selected
   - data attributes: data-tab-target="#panel-id"
*/
(function(){
  function initTabs(root){
    const list = root.querySelector('.tabs-list')
    const triggers = Array.from(list.querySelectorAll('[role="tab"]'))
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'))

    function activate(index){
      triggers.forEach((t,i)=>{
        const selected = i===index
        t.setAttribute('aria-selected', String(selected))
        t.tabIndex = selected ? 0 : -1
      })
      panels.forEach((p,i)=>{
        p.hidden = i!==index
        p.classList.toggle('tab-hidden', i!==index)
      })
      triggers[index].focus()
    }

    function indexOfTab(el){ return triggers.indexOf(el) }

    triggers.forEach((t,i)=>{
      t.addEventListener('click', ()=> activate(i))
      t.addEventListener('keydown', (ev)=>{
        if(ev.key === 'ArrowRight'){ ev.preventDefault(); activate((i+1)%triggers.length) }
        if(ev.key === 'ArrowLeft'){ ev.preventDefault(); activate((i-1+triggers.length)%triggers.length) }
        if(ev.key === 'Home'){ ev.preventDefault(); activate(0) }
        if(ev.key === 'End'){ ev.preventDefault(); activate(triggers.length-1) }
      })
    })

    // initialize first selected or first tab
    const firstIndex = triggers.findIndex(t=>t.getAttribute('aria-selected')==='true')
    activate(firstIndex >=0 ? firstIndex : 0)
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.tabs-root').forEach(initTabs)
  })
})();
