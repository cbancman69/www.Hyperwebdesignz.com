// Minimal Switch enhancement: sync ARIA, emit 'switch:change' events
(function(){
  function initSwitch(root){
    const input = root.querySelector('.switch-input')
    const track = root.querySelector('.switch-track')
    if(!input || !track) return

    function sync(){
      const checked = !!input.checked
      root.classList.toggle('switch-checked', checked)
      input.setAttribute('aria-checked', String(checked))
      root.setAttribute('aria-disabled', input.disabled ? 'true' : 'false')
      root.dispatchEvent(new CustomEvent('switch:change',{detail:{checked}}))
    }

    // toggle when track clicked (label handles this too)
    track.addEventListener('click', (e)=>{ if(!input.disabled) input.click() })

    input.addEventListener('change', sync)
    // keyboard: allow Space/Enter on root to toggle
    root.addEventListener('keydown', (e)=>{
      if(input.disabled) return
      if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); input.click() }
    })

    sync()
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.switch-root').forEach(initSwitch)
  })
})();
