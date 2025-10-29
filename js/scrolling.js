/*scroll down
document.getElementById('scrollBtn').addEventListener('click', function() {
    const element = document.getElementById('description');
    const elementPosition = element.getBoundingClientRect().top;
    const position = elementPosition + window.scrollY;
    
    window.scrollTo({
        top: position,
        behavior: 'smooth'
    });
});
*/

//scroll up
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