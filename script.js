// Mobile menu toggle
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};
// Close menu when clicking on a link
navbar.querySelectorAll('a').forEach(link => {
    link.onclick = () => {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    };
});
// Close menu when scrolling
window.onscroll = () => {
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};
// Typed.js initialization
document.addEventListener('DOMContentLoaded', function() {
    const typed = new Typed('.multiple-text', {
        strings: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Web Designer', 'Full Stack Developer'],
        typeSpeed: 100,
        backSpeed: 80,
        backDelay: 1200,
        loop: true,
    });
});
// Dark mode toggle
let darkModeToggle = document.querySelector('#dark-mode-toggle');
// Check for saved dark mode preference
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.classList.remove('bx-moon');
    darkModeToggle.classList.add('bx-sun');
}
darkModeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.classList.remove('bx-moon');
        darkModeToggle.classList.add('bx-sun');
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        darkModeToggle.classList.remove('bx-sun');
        darkModeToggle.classList.add('bx-moon');
        localStorage.setItem('dark-mode', 'disabled');
    }
};
// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
// Active nav link on scroll
window.addEventListener('scroll', () => {
    let sections = document.querySelectorAll('section');
    let navLinks = document.querySelectorAll('.navbar a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Skills progress bar animation
const skillProgressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBar = entry.target.querySelector('.skill-progress');
            const width = progressBar.getAttribute('data-width');
            progressBar.style.width = width + '%';
            skillProgressObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.skill-card').forEach(card => {
    skillProgressObserver.observe(card);
});
