//COMPONENTS
import { includeComponent } from "../js/components.js";

document.addEventListener("DOMContentLoaded", () => {
  includeComponent("navbar", "../components/navbar.html");
  includeComponent("section-credits", "../components/footer.html");
  includeComponent("top", "../components/top_button.html");
});

//SCROLL SPY
const navLinks = document.querySelectorAll('.dot-link, .sidebar-link');
const sections = document.querySelectorAll('section, .footer');

const observerOptions = {
    root: null,
    rootMargin: '-45% 0px -45% 0px', 
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(l => l.classList.remove('active'));

            const activeLinks = document.querySelectorAll(`a[href="#${id}"]`);
            activeLinks.forEach(l => l.classList.add('active'));
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection)
            targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});