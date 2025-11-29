function switchMode() {
    const page = document.getElementById('page');
    page.classList.toggle('dark-theme');

    const iconSpan = document.getElementById('mode');
    
    if (page.classList.contains('dark-theme'))
        iconSpan.textContent = "light_mode";
    else
        iconSpan.textContent = "dark_mode";
}