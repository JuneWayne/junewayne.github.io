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
