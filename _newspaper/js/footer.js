// -------- Footer --------
export function setupFooter() {
  setupGrain();
}

function setupGrain() {
  const grainElement = document.getElementById('footer-grain');
  
  grained('#footer-grain', {
    animate: false,
    patternWidth: 100,
    patternHeight: 100,
    grainOpacity: 0.05,
    grainDensity: 1,
    grainWidth: 1,
    grainHeight: 1
  });
}