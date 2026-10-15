document.addEventListener('DOMContentLoaded', function() {
    // Navigation toggle for mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.setAttribute('role', 'button');
        navToggle.setAttribute('aria-label', 'Toggle navigation menu');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('tabindex', '0');

        const toggleMenu = () => {
            const isActive = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            console.log('Nav menu toggled:', isActive);
        };

        navToggle.addEventListener('click', toggleMenu);
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // Handle navigation link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const href = link.getAttribute('href');
            if (navMenu) navMenu.classList.remove('active'); // Close mobile menu
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');

            // Map links to slide IDs
            const slideMap = {
                'index.html': 'welcome-slide',
                'newallocation.html': 'create-goal-slide',
                'allocation.html': 'goal-selection-slide',
                'expenditure.html': 'expenditure-slide',
                'reports.html': 'reports-slide',
                'view.html': 'view-slide'
            };

            // If the link points to the current page, show the slide directly
            const currentPath = window.location.pathname.toLowerCase();
            const targetPath = href.toLowerCase();
            if (
                currentPath.includes(targetPath) ||
                (targetPath === 'index.html' && (currentPath === '/' || currentPath.includes('index.html') || currentPath.endsWith('/')))
            ) {
                showSlide(slideMap[targetPath] || 'welcome-slide');
            } else {
                // Navigate to the new page
                window.location.href = href;
            }
        });
    });

    // Slide transition handling
    window.showSlide = function(slideId) {
        console.log('Showing slide:', slideId);
        const targetSlide = document.getElementById(slideId);
        if (targetSlide) {
            document.querySelectorAll('.slide').forEach(slide => {
                slide.style.display = 'none';
                slide.classList.remove('slide-active');
            });
            targetSlide.style.display = 'block';
            targetSlide.classList.add('slide-active');
        } else {
            console.warn('Slide not found:', slideId);
            const firstSlide = document.querySelector('.slide');
            if (firstSlide) {
                firstSlide.style.display = 'block';
                firstSlide.classList.add('slide-active');
            }
        }
    };

    // Override showCreateGoal for allocation.html
    window.showCreateGoal = function() {
        showSlide('create-goal-slide');
    };

    // Initialize slide based on page
    const storedGoalId = localStorage.getItem('selectedGoalId');
    console.log('Stored goal ID on load:', storedGoalId);
    const pathname = window.location.pathname.toLowerCase();
    console.log('Current pathname:', pathname);

    if (pathname.includes('newallocation.html')) {
        showSlide('create-goal-slide');
    } else if (pathname.includes('allocation.html')) {
        if (storedGoalId) {
            showSlide('allocation-section-slide');
        } else {
            showSlide('goal-selection-slide');
        }
    } else if (pathname.includes('expenditure.html')) {
        showSlide('expenditure-slide');
    } else if (pathname.includes('reports.html')) {
        showSlide('reports-slide');
    } else if (pathname.includes('view.html')) {
        showSlide('view-slide');
    } else if (
        pathname.includes('index.html') ||
        pathname.endsWith('/') ||
        pathname === '/collegebudget/college_budget/' ||
        pathname === '/collegebudget/college_budget'
    ) {
        showSlide('welcome-slide');
    } else {
        const firstSlide = document.querySelector('.slide');
        if (firstSlide) {
            showSlide(firstSlide.id);
        } else {
            showSlide('welcome-slide');
        }
    }
});