document.addEventListener("DOMContentLoaded", function() {
    var mode = document.getElementById("mode");
    var navbar = document.querySelector(".navbar");
    var body = document.body;

    var themeMode = localStorage.getItem("theme") || "dark";
    applyTheme(themeMode);

    mode.onclick = function() {
        const newTheme = body.classList.contains("body-mode") ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    function applyTheme(theme) {
        const isDark = theme === "dark";

        body.classList.toggle("body-mode", isDark);
        navbar.classList.toggle("navbar-mode", isDark);

        if (isDark) {
            mode.classList.remove("bi-brightness-high-fill");
            mode.classList.add("bi-moon-fill");
        } else {
            mode.classList.remove("bi-moon-fill");
            mode.classList.add("bi-brightness-high-fill");
        }
    }
});