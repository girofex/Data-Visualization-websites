// --- 1. DARK MODE LOGIC ---
function switchMode() {
    // 1. Toggle the class on body to activate CSS variables
    document.body.classList.toggle('dark-theme');
    
    // 2. Select the icon element
    const iconSpan = document.getElementById('theme-icon');
    
    // 3. Logic for Google Symbols: Change internal text to swap icon
    if (document.body.classList.contains('dark-theme')) {
        // If in Dark Mode, show Sun icon (to switch back to light)
        iconSpan.textContent = "light_mode";
    } else {
        // If in Light Mode, show Moon/Dark Mode icon
        iconSpan.textContent = "dark_mode";
    }
}

// --- 2. UNIVERSAL SCROLL SPY (For Dots & Sidebar) ---
// This logic highlights the navigation links based on which section is currently visible.

// Select both the dots (mobile nav) and sidebar links (desktop nav)
const navLinks = document.querySelectorAll('.dot-link, .sidebar-link');
const sections = document.querySelectorAll('section, .footer');

const observerOptions = {
    root: null,
    // Margin offset to trigger the change earlier (before section hits very top)
    rootMargin: '-45% 0px -45% 0px', 
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to all links corresponding to this section ID
            const activeLinks = document.querySelectorAll(`a[href="#${id}"]`);
            activeLinks.forEach(l => l.classList.add('active'));
        }
    });
}, observerOptions);

// Start observing all sections
sections.forEach(section => {
    observer.observe(section);
});

// Smooth Scroll functionality for both menus
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});