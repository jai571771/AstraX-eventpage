/* ==========================================================================
   ASTRA-X MARVEL-THEMED EVENTS PAGE INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initPortalSlider();
    initModal();
    initTimeline();
    initStatsCounter();
});

/* ==========================================================================
   1. COSMIC PARTICLES BACKGROUND (HTML5 CANVAS)
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let mouse = { x: null, y: null, radius: 120 };

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track Mouse for interaction
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle template
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = -Math.random() * 0.6 - 0.1; // slow upward drift
            this.color = this.getRandomColor();
            this.alpha = Math.random() * 0.6 + 0.2;
        }

        getRandomColor() {
            // Marvel themed colors: Red, Gold, Orange, Cyan
            const colors = [
                'rgba(240, 19, 30, ', // Red
                'rgba(245, 196, 0, ', // Gold
                'rgba(255, 106, 0, ', // Orange
                'rgba(0, 217, 255, ',  // Cyan
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Loop bottom to top
            if (this.y < 0) {
                this.y = canvas.height;
                this.x = Math.random() * canvas.width;
            }
            if (this.x < 0 || this.x > canvas.width) {
                this.speedX = -this.speedX;
            }

            // Mouse Push / Magnet Interaction
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    // Move away from mouse
                    this.x -= forceDirectionX * force * 1.5;
                    this.y -= forceDirectionY * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    // Populate particles
    function init() {
        particlesArray = [];
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    init();
    window.addEventListener('resize', init);

    // Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   2. NAVBAR SCROLL EFFECT & HAMBURGER TOGGLE
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Scroll Styling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            menu.classList.toggle('open');
        });
    }

    // Close mobile menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (toggle && menu) {
                toggle.classList.remove('open');
                menu.classList.remove('open');
            }
        });
    });
}

/* ==========================================================================
   3. MYSTICAL PORTAL SLIDER LOGIC
   ========================================================================== */
function initPortalSlider() {
    const cards = document.querySelectorAll('.portal-card');
    const prevBtn = document.querySelector('.portal-nav-btn.prev');
    const nextBtn = document.querySelector('.portal-nav-btn.next');
    
    if (cards.length === 0) return;

    let activeIndex = 0;
    const totalCards = cards.length;

    function updateSlider() {
        cards.forEach((card, index) => {
            card.classList.remove('active', 'next', 'prev', 'hidden');

            if (index === activeIndex) {
                card.classList.add('active');
            } else if (index === (activeIndex + 1) % totalCards) {
                card.classList.add('next');
            } else if (index === (activeIndex - 1 + totalCards) % totalCards) {
                card.classList.add('prev');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Initialize state
    updateSlider();

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            activeIndex = (activeIndex + 1) % totalCards;
            updateSlider();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            updateSlider();
        });
    }

    // Direct card clicking (clicking next or prev shifts the slider)
    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('next')) {
                activeIndex = index;
                updateSlider();
                e.stopPropagation(); // prevent triggering modal explore
            } else if (card.classList.contains('prev')) {
                activeIndex = index;
                updateSlider();
                e.stopPropagation();
            }
        });
        
        // Add 3D Tilt interaction on active portal card
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('active')) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((centerY - y) / centerY) * 15;
            const rotateY = ((x - centerX) / centerX) * 15;
            
            const img = card.querySelector('.portal-image-holder');
            if (img) {
                img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            const img = card.querySelector('.portal-image-holder');
            if (img) {
                img.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            }
        });
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            activeIndex = (activeIndex + 1) % totalCards;
            updateSlider();
        } else if (e.key === 'ArrowLeft') {
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            updateSlider();
        }
    });
}

/* ==========================================================================
   5. DETAIL DOSSIER MODAL & DATABASE
   ========================================================================== */
const eventDatabase = {
    "2025": {
        year: "2025",
        title: "Astra-X 2025",
        subtitle: "Multiverse of Innovation",
        image: "assets/event-2025.png",
        stats: {
            participants: "600+",
            projects: "120+",
            prizePool: "₹2,00,000"
        },
        description: "Our latest flagship national-level tech expo & hackathon. Teams from all over the country assembled to construct tech prototypes addressing real-world crises in health, climate, and security. We witnessed a convergence of ideas across multiple technological dimensions, mentored by tech leaders from top-tier firms.",
        highlights: [
            "Special guest lecture on Quantum Computing and Machine Learning futures.",
            "24-Hour Non-stop hacking Arena evaluated by automated testing grids.",
            "Live project demonstrations showcasing innovative IoT and robotic architectures."
        ]
    },
    "2024": {
        year: "2024",
        title: "Astra-X 2024",
        subtitle: "Age of Robotics",
        image: "assets/event-2024.png",
        stats: {
            participants: "450+",
            projects: "80+ Robots",
            prizePool: "₹1,50,000"
        },
        description: "A mechanical battlefield where metal met metal. Featuring intense heavyweight Robowars, obstacles, and drone racing. Astra-X 2024 was entirely dedicated to mechanical innovation and automation, pushing participants' fabrication and pilot capabilities to their absolute limits.",
        highlights: [
            "Heavyweight Robowar (30kg category) held in a reinforced bulletproof steel cage.",
            "Obstacle-course drone racing using FPV video goggles for immersive piloting.",
            "Smart autonomous maze solvers utilizing micro-sensors and real-time algorithms."
        ]
    },
    "2023": {
        year: "2023",
        title: "Astra-X 2023",
        subtitle: "Infinity Coding",
        image: "assets/event-2023.png",
        stats: {
            participants: "500+",
            projects: "3000+ Codes",
            prizePool: "₹1,00,000"
        },
        description: "A battle of algorithms, competitive coding, and cybersecurity hackathons. Coders completed challenges to lock down the infinity stones of logic. Speed programmers raced against the clock while security enthusiasts solved complex cryptographic puzzles in our custom Capture The Flag (CTF) cyber grid.",
        highlights: [
            "12-hour CTF arena with custom-coded cyber security exploits.",
            "Speed-coding tournaments structured as single-elimination brackets.",
            "Expert panel discussions addressing global developments in Cyber Defense."
        ]
    },
    "2022": {
        year: "2022",
        title: "Astra-X 2022",
        subtitle: "Cosmic Canvas",
        image: "assets/event-2022.png",
        stats: {
            participants: "350+",
            projects: "70+ Games",
            prizePool: "₹80,000"
        },
        description: "Where technology met artistry. Cosmic Canvas 2022 provided the ultimate playground for UI/UX designers, artists, and game developers. Participants built responsive layouts for futuristic star-maps or created short playable indie games under intense time limits.",
        highlights: [
            "Futuristic spaceship UI/UX dashboard design sprint.",
            "48-hour Game Jam with live public playtesting of student prototypes.",
            "Digital concept-art and character modeling masterclass led by studio veterans."
        ]
    },
    "2021": {
        year: "2021",
        title: "Astra-X 2021",
        subtitle: "Quantum Quest",
        image: "assets/event-2021.png",
        stats: {
            participants: "800+",
            projects: "15+ Stages",
            prizePool: "₹70,000"
        },
        description: "The inaugural virtual event that started the legacy. Quantum Quest was a massive cryptographic treasure hunt and science trivia arena designed to bridge students during lockdowns. Teams worked across shared screens to decode coordinates and hack digital locks.",
        highlights: [
            "Multistage encrypted digital treasure hunt with highly-challenging puzzles.",
            "Integrated live leaderboard monitoring real-time puzzle progression.",
            "Grand finale broadcasted to over 1000 viewers checking the final chase."
        ]
    }
};

function initModal() {
    const modal = document.getElementById('event-modal');
    const closeBtn = document.querySelector('.modal-close');
    const exploreTrigger = document.getElementById('portal-explore-trigger');
    const portalCards = document.querySelectorAll('.portal-card');

    const mImage = document.getElementById('modal-image');
    const mYear = document.getElementById('modal-year');
    const mTitle = document.getElementById('modal-title');
    const mSubtitle = document.getElementById('modal-subtitle');
    const mStats = document.getElementById('modal-stats');
    const mDesc = document.getElementById('modal-description');
    const mHighlights = document.getElementById('modal-highlights');

    function openModal(yearId) {
        const data = eventDatabase[yearId];
        if (!data) return;

        // Set text & attributes
        mImage.src = data.image;
        mImage.alt = `${data.title} - ${data.subtitle} Poster`;
        mYear.textContent = data.year;
        mTitle.textContent = data.title;
        mSubtitle.textContent = data.subtitle;
        mDesc.textContent = data.description;

        // Build stats markup
        mStats.innerHTML = `
            <div class="modal-stat-item">HEROES: <strong>${data.stats.participants}</strong></div>
            <div class="modal-stat-item">DEPLOYED: <strong>${data.stats.projects}</strong></div>
            <div class="modal-stat-item">REWARD: <strong>${data.stats.prizePool}</strong></div>
        `;

        // Build highlights list
        mHighlights.innerHTML = '';
        data.highlights.forEach(highlight => {
            const li = document.createElement('li');
            li.textContent = highlight;
            mHighlights.appendChild(li);
        });

        // Trigger classes
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock scrolling
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Release scrolling
    }

    // Attach click events to active portal card
    portalCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) {
                const yearId = card.getAttribute('data-id');
                openModal(yearId);
            }
        });
    });

    // Attach click events to bottom action button
    if (exploreTrigger) {
        exploreTrigger.addEventListener('click', () => {
            const activeCard = document.querySelector('.portal-card.active');
            if (activeCard) {
                const yearId = activeCard.getAttribute('data-id');
                openModal(yearId);
            }
        });
    }

    // Close triggers
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC Key to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   6. TIMELINE SCROLL TRIGGERED PROGRESS & HIGHLIGHTS
   ========================================================================== */
function initTimeline() {
    const timeline = document.querySelector('.timeline-section');
    const nodes = document.querySelectorAll('.timeline-node');
    const progressLine = document.querySelector('.timeline-progress');
    const container = document.querySelector('.timeline-container');

    if (!timeline || nodes.length === 0 || !progressLine) return;

    // Intersection Observer to fade in nodes
    const nodeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // offset slightly before trigger
    });

    nodes.forEach(node => nodeObserver.observe(node));

    // Scroll calculations for central timeline laser glow height
    window.addEventListener('scroll', () => {
        const rect = container.getBoundingClientRect();
        const triggerPoint = window.innerHeight * 0.6; // trigger viewport line

        if (rect.top < triggerPoint) {
            const relativePosition = triggerPoint - rect.top;
            const percentage = Math.min(Math.max((relativePosition / rect.height) * 100, 0), 100);
            progressLine.style.height = `${percentage}%`;

            // Evaluate which nodes have been passed to glow them
            nodes.forEach(node => {
                const nodeRect = node.getBoundingClientRect();
                if (nodeRect.top < triggerPoint) {
                    node.classList.add('active-marker');
                } else {
                    node.classList.remove('active-marker');
                }
            });
        } else {
            progressLine.style.height = '0%';
            nodes.forEach(node => node.classList.remove('active-marker'));
        }
    });
}

/* ==========================================================================
   7. ACHIEVEMENTS STAT COUNTER ANIMATION
   ========================================================================== */
function initStatsCounter() {
    const statsContainer = document.getElementById('achievements');
    const numbers = document.querySelectorAll('.stat-number');

    if (!statsContainer || numbers.length === 0) return;

    let animated = false;

    function startCounting() {
        numbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds counting animation
            const increment = target / (duration / 16); // ~60fps step size
            let current = 0;

            const counterInterval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(counterInterval);
                    // format numbers with comma groupings for money
                    if (target >= 1000) {
                        num.textContent = target.toLocaleString('en-IN');
                    } else {
                        num.textContent = target;
                    }
                    // Add "+" if needed (for participants and projects)
                    if (target === 3000 || target === 500) {
                        num.textContent += '+';
                    }
                } else {
                    num.textContent = Math.floor(current).toLocaleString('en-IN');
                }
            }, 16);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                startCounting();
                animated = true;
            }
        });
    }, { threshold: 0.3 });

    observer.observe(statsContainer);
}
