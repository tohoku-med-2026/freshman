document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (!header) return;

    const menuButton = header.querySelector('.hamburger-btn');
    const siteNav = header.querySelector('.site-nav');
    if (!menuButton || !siteNav) return;

    const closeMenu = () => {
        header.classList.remove('is-menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = header.classList.toggle('is-menu-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 768px)').matches) {
                closeMenu();
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});
