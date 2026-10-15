document.addEventListener('DOMContentLoaded', function() {
    // Navigation toggle for mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            console.log('Nav menu toggled:', navMenu.classList.contains('active'));
        });
    }

    // Handle navigation link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const href = link.getAttribute('href');
            console.log('Nav link clicked:', href);
            navMenu.classList.remove('active'); // Close mobile menu

            // Map links to slide IDs
            const slideMap = {
                'index.html': 'welcome-slide',
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
        document.querySelectorAll('.slide').forEach(slide => {
            slide.style.display = 'none';
            slide.classList.remove('slide-active');
        });
        const targetSlide = document.getElementById(slideId);
        if (targetSlide) {
            targetSlide.style.display = 'block';
            targetSlide.classList.add('slide-active');
        } else {
            console.error('Slide not found:', slideId);
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

    if (pathname.includes('allocation.html')) {
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
        console.warn('Unrecognized pathname, defaulting to welcome-slide');
        showSlide('welcome-slide');
    }
});