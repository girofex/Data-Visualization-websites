function switchMode() {
    document.body.classList.toggle('dark-theme');
    
    const iconSpan = document.getElementById('theme-icon');
    
    if (document.body.classList.contains('dark-theme'))
        iconSpan.textContent = "light_mode";
    else
        iconSpan.textContent = "dark_mode";
}