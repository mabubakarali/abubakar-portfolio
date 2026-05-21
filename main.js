// Initialize Lenis for smooth scrollytelling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const hoverTargets = document.querySelectorAll('.hover-target, a, .menu-btn');

// GSAP quickTo for ultra-fast cursor and parallax updates without GC thrashing
const cursorX = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power2.out"});
const cursorY = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power2.out"});
const followerX = gsap.quickTo(follower, "x", {duration: 0.3, ease: "power2.out"});
const followerY = gsap.quickTo(follower, "y", {duration: 0.3, ease: "power2.out"});

const spidermanImg = document.querySelector('.spiderman-img');
let spiderRotY, spiderRotX, spiderX, spiderY;

if (spidermanImg) {
    spiderRotY = gsap.quickTo(spidermanImg, "rotationY", {duration: 1.5, ease: "power3.out"});
    spiderRotX = gsap.quickTo(spidermanImg, "rotationX", {duration: 1.5, ease: "power3.out"});
    spiderX = gsap.quickTo(spidermanImg, "x", {duration: 1.5, ease: "power3.out"});
    spiderY = gsap.quickTo(spidermanImg, "y", {duration: 1.5, ease: "power3.out"});
}

document.addEventListener('mousemove', (e) => {
    // Exact cursor position
    cursorX(e.clientX);
    cursorY(e.clientY);
    followerX(e.clientX);
    followerY(e.clientY);

    // Spider-Man Parallax Head Turn
    if (spidermanImg) {
        // Calculate normalized mouse position (-1 to 1)
        const xPos = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 2;

        spiderRotY(xPos * 25);
        spiderRotX(-yPos * 25);
        spiderX(xPos * -40);
        spiderY(yPos * -40);
    }
});

hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
        follower.classList.add('active');
        cursor.style.display = 'none'; // hide the dot
    });
    target.addEventListener('mouseleave', () => {
        follower.classList.remove('active');
        cursor.style.display = 'block';
    });
});

// Initial Hero Animation
const tl = gsap.timeline();

tl.to('.hero-word', {
    y: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power4.out',
    delay: 0.5
})
.to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out'
}, "-=0.8")
.to('.scroll-indicator', {
    opacity: 1,
    duration: 1
}, "-=0.5");

// Background subtle pulse
gsap.to('.hero-bg-glow', {
    scale: 1.1,
    opacity: 0.8,
    duration: 4,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut'
});

// Manifesto Text Reveal
const splitLines = document.querySelectorAll('.manifesto-text');
// Simulate text reveal by clipping or changing color dynamically
gsap.to('.manifesto-text', {
    color: 'rgba(255, 255, 255, 1)',
    scrollTrigger: {
        trigger: '.about',
        start: 'top 50%',
        end: 'bottom 80%',
        scrub: 1,
    }
});

// Logo & Nav Links disappearing on scroll, replaced by Hamburger
const scrollNavTl = gsap.timeline({
    scrollTrigger: {
        trigger: 'body',
        start: 'top -50', // Trigger when user has scrolled 50px down
        end: 'top -200',
        scrub: 1,
    }
});

scrollNavTl
    // 1. Fade out the logo and horizontal text links
    .to(['.logo', '.nav-links'], {
        y: -30,
        autoAlpha: 0, // Automatically handles opacity and visibility (pointer events)
        pointerEvents: 'none',
        duration: 1,
        ease: 'none'
    })
    // 2. Scale in the hamburger menu button to replace them
    .to('.menu-btn', {
        autoAlpha: 1,
        scale: 1,
        pointerEvents: 'auto',
        duration: 1,
        ease: 'none'
    }, "-=0.5");

// Manifesto Section Background Color Transition to Red
// The manifesto section turns red as the About Me section scrolls over it
gsap.fromTo('.about', 
    { backgroundColor: '#050505' }, 
    {
        backgroundColor: '#8a1d35', // Premium dark burgundy red
        immediateRender: false,
        scrollTrigger: {
            trigger: '.about-me', 
            start: 'top bottom', // Starts fading to red exactly as About Me enters from the bottom
            end: 'top top', // Fully red by the time About Me covers it
            scrub: true,
        }
    }
);

// Pin the Manifesto section so About Me scrolls over it
ScrollTrigger.create({
    trigger: '.about',
    start: 'top top', // Pin when the top of Manifesto hits the top of the viewport
    endTrigger: '.about-me',
    end: 'top top', // Unpin when the top of About Me reaches the top
    pin: true,
    pinSpacing: false // Prevent extra space, making About Me immediately scroll over it
});

// Side Drawer Menu Logic
const menuBtn = document.querySelector('.menu-btn');
const closeBtn = document.querySelector('.menu-close-btn');
const menuOverlay = document.querySelector('.menu-overlay');
const menuInner = document.querySelector('.menu-inner');
const menuLinks = document.querySelectorAll('.menu-links li');
const menuSocials = document.querySelectorAll('.social-icon');

let isMenuOpen = false;
let menuTl = gsap.timeline({ paused: true });

// Build the timeline for opening the drawer
menuTl
    // Slide drawer in from right
    .to(menuOverlay, {
        x: '0%', // Translate to 0
        duration: 0.8,
        ease: 'power3.inOut'
    })
    // Pop in the separate red close button
    .to(closeBtn, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.5)'
    }, "-=0.4")
    // Show inner container 
    .set(menuInner, { opacity: 1 }, "-=0.4")
    // Stagger reveal the menu links coming up from below
    .from(menuLinks, {
        y: 40,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power3.out'
    }, "-=0.2")
    // Pop in the social icons
    .from(menuSocials, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: 'back.out(1.5)'
    }, "-=0.2");

const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        menuOverlay.style.pointerEvents = 'auto'; // Enable clicks inside drawer
        closeBtn.style.pointerEvents = 'auto'; // Enable close button
        lenis.stop(); // Prevent scrolling while menu is open
        menuTl.play();
    } else {
        menuOverlay.style.pointerEvents = 'none'; // Disable clicks
        closeBtn.style.pointerEvents = 'none'; 
        lenis.start(); // Resume scrolling
        menuTl.reverse();
    }
};

menuBtn.addEventListener('click', toggleMenu);
closeBtn.addEventListener('click', toggleMenu);

// Unified Smooth Scrolling and Menu Close Logic
document.querySelectorAll('.nav-links a, .menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault(); 
            
            // If the side menu is open and it's a menu link, close the menu first
            if (isMenuOpen && link.classList.contains('menu-link')) {
                toggleMenu(); 
                
                // Wait for the menu's reverse GSAP animation to completely finish (~800ms) before scrolling
                setTimeout(() => {
                    lenis.scrollTo(targetId, {
                        offset: 0,
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }, 800);
            } else {
                // If clicking from the regular top navbar, scroll immediately
                lenis.scrollTo(targetId, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        }
    });
});

// Active Menu Link Highlighting
const sections = document.querySelectorAll('section, footer');
const navLinks = document.querySelectorAll('.menu-link');

const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section is cleanly in the top half of the screen
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Selected Work Scroll Reveal
const projectsWrap = document.querySelector('.projects-wrapper');
const workImages = document.querySelectorAll('.work-image');
const workStories = document.querySelectorAll('.work-story');
const workServices = document.querySelectorAll('.work-service-list');
const workIndexNumbers = document.querySelectorAll('.work-index-number');
const workProgress = document.querySelector('.work-progress span');
const moreProjectsBtn = document.querySelector('.more-projects-btn');

const isMobile = () => window.innerWidth <= 768;

let activeWorkIndex = 0;

const setActiveWork = (index) => {
    if (index === activeWorkIndex) return;
    activeWorkIndex = index;

    [workImages, workStories, workServices, workIndexNumbers].forEach(group => {
        group.forEach((item, itemIndex) => {
            item.classList.toggle('active', itemIndex === index);
        });
    });

    // Show "More Projects" button only on the last project
    if (moreProjectsBtn && !isMobile()) {
        const isLast = index === workImages.length - 1;
        moreProjectsBtn.classList.toggle('visible', isLast);
    }
};

if (projectsWrap && workImages.length) {

    if (isMobile()) {
        // Mobile: show all projects stacked — each card + story visible
        workImages.forEach(img => img.classList.add('active'));
        workStories.forEach(story => story.classList.add('active'));
        if (moreProjectsBtn) moreProjectsBtn.classList.add('visible');
    } else {
        // Desktop: scroll-driven storytelling
        ScrollTrigger.create({
            trigger: projectsWrap,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.25,
            onUpdate: (self) => {
                const nextIndex = Math.min(
                    workImages.length - 1,
                    Math.floor(self.progress * workImages.length)
                );

                setActiveWork(nextIndex);

                if (workProgress) {
                    gsap.set(workProgress, { scaleX: self.progress });
                }
            }
        });

        gsap.from('.projects-stage', {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: projectsWrap,
                start: 'top 75%'
            }
        });
    }
}

// Skills section — no entrance animation, cards are static

// Parallax Section — desktop only
const p1 = document.querySelector('.parallax-img.p1');
const p2 = document.querySelector('.parallax-img.p2');

if (!isMobile() && p1 && p2) {
    gsap.to(p1, {
        y: () => -150 * p1.dataset.speed,
        ease: "none",
        scrollTrigger: {
            trigger: '.parallax-section',
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    gsap.to(p2, {
        y: () => -150 * p2.dataset.speed,
        ease: "none",
        scrollTrigger: {
            trigger: '.parallax-section',
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
}

// Footer Reveal Effect
gsap.from('.footer-content', {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: 'power4.out',
    scrollTrigger: {
        trigger: '.footer',
        start: "top 80%",
    }
});

// Magnetic Button Effect — desktop only
const magneticBtn = document.querySelector('.magnetic-btn');

if (magneticBtn && !isMobile()) {
    const magX = gsap.quickTo(magneticBtn, "x", {duration: 0.3, ease: 'power2.out'});
    const magY = gsap.quickTo(magneticBtn, "y", {duration: 0.3, ease: 'power2.out'});
    
    let centerX, centerY;

    magneticBtn.addEventListener('mouseenter', function() {
        // Calculate the static center of the button, subtracting any current transforms
        const rect = magneticBtn.getBoundingClientRect();
        const currentX = gsap.getProperty(magneticBtn, "x") || 0;
        const currentY = gsap.getProperty(magneticBtn, "y") || 0;
        centerX = (rect.left - currentX) + rect.width / 2;
        centerY = (rect.top - currentY) + rect.height / 2;
    });

    magneticBtn.addEventListener('mousemove', function(e) {
        if (!centerX) return;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        magX(x * 0.3);
        magY(y * 0.3);
    });

    magneticBtn.addEventListener('mouseleave', function() {
        centerX = null;
        centerY = null;
        gsap.to(magneticBtn, {
            duration: 0.6,
            x: 0,
            y: 0,
            ease: 'elastic.out(1, 0.3)',
            overwrite: 'auto'
        });
    });
}

// Footer Spotlight Text Effect
const footer = document.querySelector('.footer');
const footerTitle = document.querySelector('.footer-title');

if (footer && footerTitle) {
    // High-performance GSAP setters for CSS variables
    const spotX = gsap.quickTo(footerTitle, "--x", {duration: 0.2, ease: "power2.out"});
    const spotY = gsap.quickTo(footerTitle, "--y", {duration: 0.2, ease: "power2.out"});

    footer.addEventListener('mousemove', (e) => {
        const rect = footerTitle.getBoundingClientRect();
        // Calculate mouse position relative to the text element's top-left corner
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spotX(x); // Will pass plain numbers to CSS, we'll append 'px' via calc() in CSS
        spotY(y);
    });

    footer.addEventListener('mouseleave', () => {
        // Move spotlight gently off-screen when mouse leaves footer
        spotX(-1000);
        spotY(-1000);
    });
}

// Skills Card Spotlight Effects
const skillCards = document.querySelectorAll('.skill-card');

skillCards.forEach(card => {
    const cardSpotX = gsap.quickTo(card, "--mouse-x", {duration: 0.2, ease: "power2.out"});
    const cardSpotY = gsap.quickTo(card, "--mouse-y", {duration: 0.2, ease: "power2.out"});

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardSpotX(x);
        cardSpotY(y);
    });
});

// Skills section — header and cards are static, no animations

skillCards.forEach((card) => {
    const cardImage = card.querySelector('.skill-bg img');
    const meter = card.querySelector('.skill-meter span');
    const tools = card.querySelectorAll('.skill-tools span');

    gsap.from(card, {
        y: 80,
        scale: 0.94,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 82%',
            toggleActions: 'play none none reverse'
        }
    });

    if (cardImage) {
        gsap.to(cardImage, {
            scale: 1.12,
            ease: 'none',
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    if (meter) {
        gsap.from(meter, {
            scaleX: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 65%'
            }
        });
    }

    if (tools.length) {
        gsap.from(tools, {
            y: 18,
            opacity: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 68%'
            }
        });
    }
});
