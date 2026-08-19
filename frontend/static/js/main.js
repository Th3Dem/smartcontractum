/**
 * SmartContractum Platform Client-side Interaction Controller
 * Version: 2.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const headerNav = document.getElementById('headerNav');

    if (toggleBtn && headerNav) {
        toggleBtn.addEventListener('click', () => {
            const isOpen = headerNav.classList.toggle('is-open');
            toggleBtn.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // 2. Dynamic Active Nav Item Highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (href !== '/' && currentPath.startsWith(href)))) {
            link.classList.add('active');
        }
    });

    console.info('🚀 SmartContractum Base Shell v2.0 initialized (Umbrella-Dev mode active).');
});
