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

// A figure link also reveals its benchmark when another chart is selected
function openLinkedFigure() {
  const figure = document.getElementById(location.hash.slice(1));
  if (!figure) return;
  let parent = figure.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') parent.open = true;
    parent = parent.parentElement;
  }
  if (figure.tagName === 'DETAILS') figure.open = true;
  const panel = figure.closest('.chart-panel');
  if (panel && selector) {
    selector.value = panel.id.replace('chart-', '');
    showBenchmark();
  }
  figure.scrollIntoView();
}
window.addEventListener('hashchange', openLinkedFigure);
openLinkedFigure();
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (link.hash === location.hash) openLinkedFigure();
  });
});

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
