// -------- Footer --------
export function setupFooter() {
    const footerHTML = `
      <footer class="m3-footer" id="section-credits">
        <div id="footer-grain"></div>
        <div class="footer-container">
          ...
        </div>
      </footer>
    `;

    document.getElementById('footer').innerHTML = footerHTML;
    setupGrain();
}

function setupGrain() {
    const grainElement = document.getElementById('footer-grain');
    if (grainElement) {
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
}