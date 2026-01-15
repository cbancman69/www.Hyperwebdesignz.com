document.addEventListener('DOMContentLoaded', ()=>{
  const monthlyBtn = document.getElementById('billingMonthly');
  const annualBtn = document.getElementById('billingAnnual');
  const priceEls = document.querySelectorAll('.price');
  const ctas = document.querySelectorAll('.pricing-cta');
  const estTotal = document.getElementById('estTotal');
  const estOpts = document.querySelectorAll('.est-opt');
  const estApply = document.getElementById('estApply');

  function updatePrices(mode){
    priceEls.forEach(el=>{
      const m = Number(el.dataset.monthly||0);
      const a = Number(el.dataset.annual||0);
      if(mode==='monthly') el.textContent = `$${m.toLocaleString()}`;
      else el.textContent = `$${a.toLocaleString()}`;
    });
  }

  // initial
  updatePrices('monthly');

  monthlyBtn?.addEventListener('click', ()=>{
    monthlyBtn.classList.add('active'); annualBtn.classList.remove('active');
    updatePrices('monthly');
  });
  annualBtn?.addEventListener('click', ()=>{
    annualBtn.classList.add('active'); monthlyBtn.classList.remove('active');
    updatePrices('annual');
  });

  // CTAs -> open contact view and prefill message
  ctas.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const plan = btn.dataset.plan || 'Quote';
      const price = btn.dataset.price || '';
      // switch view
      const ev = new Event('click');
      const target = document.querySelector('[data-view-link="contact"]');
      if(target){ target.dispatchEvent(ev); }
      // prefill contact form
      setTimeout(()=>{
        const msg = `Hi — I'm interested in ${plan}${price?(' at approx $'+price):''}. Please send a quote.`;
        const cmessage = document.getElementById('cmessage');
        if(cmessage) cmessage.value = msg;
      },120);
    });
  });

  // estimator
  function calcEst(){
    let sum = 0;
    estOpts.forEach(ch=>{ if(ch.checked) sum += Number(ch.dataset.cost||0); });
    estTotal.textContent = `$${sum.toLocaleString()}`;
    return sum;
  }
  estOpts.forEach(ch=> ch.addEventListener('change', calcEst));
  calcEst();

  estApply?.addEventListener('click', ()=>{
    const total = calcEst();
    // open contact with message containing estimate
    const target = document.querySelector('[data-view-link="contact"]');
    if(target) target.click();
    setTimeout(()=>{
      const cmessage = document.getElementById('cmessage');
      if(cmessage) cmessage.value = `Estimated extras total: $${total}. Please include this in my quote.`;
    },120);
  });

});
