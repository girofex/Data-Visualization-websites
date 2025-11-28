var topButton = document.getElementById("top");
    
function GoTop() {
    const scroll = () => {
        const c = document.documentElement.scrollTop || document.body.scrollTop;

        if (c > 0) {
            window.requestAnimationFrame(scroll);
            window.scrollTo(0, c - c);
        }
    };

    scroll();
}