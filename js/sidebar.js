document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]');
    const sidebar = document.getElementById('sidebarLinks');

    headers.forEach(header => {
        const link = document.createElement('div');
        const level = header.tagName.toLowerCase().replace('h', '');
        link.className = 'sidebar-link';
        link.setAttribute('data-level', level);
        link.setAttribute('data-target', header.id);
        link.setAttribute('data-text', header.textContent);

        var headerOffset = 45;
        position = document.getElementById(headers) + window.pageYOffset - headerOffset;
        
        link.addEventListener('click', function() {
            header.scrollTo({ behavior: 'smooth', top: position });
        });
        
        sidebar.appendChild(link);
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.remove('active');
                });

                const activeLink = document.querySelector(`.sidebar-link[data-target="${id}"]`);
                if (activeLink)
                    activeLink.classList.add('active');
            }
        });
    }, observerOptions);
});