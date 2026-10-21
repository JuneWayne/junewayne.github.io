const selector = document.querySelector('#benchmark');
const panels = [...document.querySelectorAll('.chart-panel')];

// All results remain visible when JavaScript is unavailable
function showBenchmark() {
  for (const panel of panels) panel.hidden = panel.id !== `chart-${selector.value}`;
}
if (selector) {
  selector.addEventListener('change', showBenchmark);
  showBenchmark();
}

// Read only marked formulas so prompts and code examples stay unchanged
if (window.katex) {
  for (const formula of document.querySelectorAll('.math')) {
    window.katex.render(formula.textContent, formula, {
      displayMode: formula.classList.contains('math-display'),
      output: 'htmlAndMathml',
      throwOnError: false,
      trust: false,
    });
  }
}
