document.addEventListener("DOMContentLoaded", function() {
    var mode = document.getElementById("mode");
    var navbar = document.querySelector(".navbar");
    var sidebar = document.querySelectorAll(".sidebar-tick");
    var link = document.querySelector(".link");
    var logo = document.getElementById("logo");
    var btn = document.querySelectorAll(".btn")
    var zoom = document.querySelectorAll(".bi");
    var body = document.body;

    const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
    const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();

    var scrollbarThumbBorderColor = cssBlack;
    document.documentElement.style.setProperty("--scrollbar-thumb-border-color", scrollbarThumbBorderColor);

    var themeMode = localStorage.getItem("theme") || "dark";
    applyTheme(themeMode);

    if(mode){
        mode.onclick = function(){
            const newTheme = body.classList.contains("body-mode") ? "light" : "dark";
            applyTheme(newTheme);
            localStorage.setItem("theme", newTheme);
        };
    }

    function applyTheme(theme){
        const isDark = theme === "dark";

        body.classList.toggle("body-mode", isDark);
        if(navbar)
            navbar.classList.toggle("navbar-mode", isDark);
        if(link)
            link.classList.toggle("link-mode", isDark);

        sidebar.forEach(el => el.classList.toggle("sidebar-link-mode", isDark));
        let scrollbarThumbBorderColor;

        if(isDark){
            if (mode)
                mode.style.color = cssWhite;
            scrollbarThumbBorderColor = cssWhite;
            if (logo)
                logo.src = './img/DIBRIS_UniGe_white.svg';
            if(mode){
                mode.classList.remove("bi-brightness-high-fill");
                mode.classList.add("bi-moon-fill");
            }
            if(btn)
                btn.forEach(el => el.classList.toggle("btn-mode", true));
            if(zoom)
                zoom.forEach(el => el.classList.toggle("bi-mode", true));
        } else {
            scrollbarThumbBorderColor = cssBlack;
            if (mode)
                mode.style.color = cssBlack;
            if (logo)
                logo.src = './img/DIBRIS_UniGe_black.svg';
            if(mode){
                mode.classList.remove("bi-moon-fill");
                mode.classList.add("bi-brightness-high-fill");
            }
            if(btn)
                btn.forEach(el => el.classList.toggle("btn-mode", false));
            if(zoom)
                zoom.forEach(el => el.classList.toggle("bi-mode", false));
        }

        document.documentElement.style.setProperty("--scrollbar-thumb-border-color", scrollbarThumbBorderColor);

        [
            window.updateBarChartTheme,
            window.updateWaffleChartTheme,
            window.updateHeatMapTheme,
            window.updateGroupedBarChartTheme,
            window.updateStackedBarChartTheme,
            window.updateDropdownTheme,
            window.updateBoxPlotTheme,
            window.updateHistogramTheme,
            window.updateRidgeLinePlotTheme,
            window.updateLineChartTheme,
            updateChoroplethTheme,
            updateDotMapTheme,
            updateHexbinTheme
        ].forEach(fn => {
            if (typeof fn === "function") fn(isDark);
        });
    }
});