document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]');
    const sidebarLinks = document.getElementById('sidebarLinks');
    const sidebarMenu = document.getElementById('sidebarMenu');

    headers.forEach(header => {
        const level = header.tagName.toLowerCase().replace('h', '');

        //Tick
        const tick = document.createElement('div');
        tick.className = 'sidebar-tick';
        tick.setAttribute('data-level', level);
        tick.setAttribute('data-target', header.id);
        sidebarLinks.appendChild(tick);

        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.textContent = header.textContent;
        menuItem.setAttribute('data-target', header.id);

        menuItem.addEventListener('click', () => {
            const offset = 100;
            const elementPosition = header.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });

        sidebarMenu.appendChild(menuItem);
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;

                document.querySelectorAll('.sidebar-tick').forEach(tick => tick.classList.remove('active'));
                const activeTick = document.querySelector(`.sidebar-tick[data-target="${id}"]`);
                if (activeTick)
                    activeTick.classList.add('active');

                document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
                const activeItem = document.querySelector(`.menu-item[data-target="${id}"]`);
                
                if (activeItem)
                    activeItem.classList.add('active');
            }
        });
    }, observerOptions);

    headers.forEach(header => observer.observe(header));
});