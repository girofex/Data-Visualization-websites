// -------- Navbar --------
export function setupNavbar() {
    setupThemeToggle();
    setupMenu();
    setupGrain();
}

// -------- Theme Toggle --------
function setupThemeToggle() {
    const toggleBtn = document.querySelector('.theme-toggle-btn');
    if (!toggleBtn)
        return;

    toggleBtn.addEventListener('click', () => {
        switchMode();
    });
}

// -------- Menu --------
function setupMenu() {
    const anchorEl = document.querySelector('#usage-anchor');
    const menuEl = document.querySelector('#usage-menu');
    if (!anchorEl || !menuEl)
        return;

    anchorEl.addEventListener('click', () => {
        menuEl.open = !menuEl.open;
    });

    document.querySelectorAll('.section').forEach(item => {
        item.addEventListener('click', () => {
            const href = item.dataset.href;
            if (href)
                window.location.href = href;
        });
    });
}

function setupGrain() {
    const grainElement = document.getElementById('navbar-grain');
    if (grainElement) {
        grained('#navbar-grain', {
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