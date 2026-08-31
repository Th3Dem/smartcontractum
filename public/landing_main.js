/**
 * SmartContractum Platform Client-side Interaction Controller
 * Version: 2.0.0
 * Mobile Menu, Active Nav Highlighting & User Profile Dropdown & Auth Modal
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

    // 3. User Profile Dropdown Controller
    const btnUserDropdown = document.getElementById('btnUserDropdown');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const userDropdownWrapper = document.getElementById('userDropdownWrapper');

    if (btnUserDropdown && userDropdownMenu) {
        btnUserDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const isShown = userDropdownMenu.style.display === 'flex';
            userDropdownMenu.style.display = isShown ? 'none' : 'flex';
            btnUserDropdown.setAttribute('aria-expanded', String(!isShown));
        });

        document.addEventListener('click', (e) => {
            if (userDropdownWrapper && !userDropdownWrapper.contains(e.target)) {
                userDropdownMenu.style.display = 'none';
                btnUserDropdown.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 4. Global Auth Modal Controller
    const authModalOverlay = document.getElementById('authModalOverlay');
    const btnOpenAuth = document.getElementById('btnOpenAuthModal');
    const btnCloseAuth = document.getElementById('btnCloseAuthModal');
    const btnCancelAuth = document.getElementById('btnCancelAuth');

    function closeAuthModal() {
        if (authModalOverlay) authModalOverlay.style.display = 'none';
    }

    if (btnOpenAuth && authModalOverlay) {
        btnOpenAuth.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.style.display = 'none';
            authModalOverlay.style.display = 'flex';
        });
    }

    if (btnCloseAuth) btnCloseAuth.addEventListener('click', closeAuthModal);
    if (btnCancelAuth) btnCancelAuth.addEventListener('click', closeAuthModal);

    if (authModalOverlay) {
        authModalOverlay.addEventListener('click', (e) => {
            if (e.target === authModalOverlay) closeAuthModal();
        });
    }

    console.info('🚀 SmartContractum Base Shell v2.0 initialized (Profile & Umbrella-Dev active).');
});
