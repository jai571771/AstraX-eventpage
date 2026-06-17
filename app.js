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
    "debate": {
        year: "Debate",
        title: "AI Technical Debate",
        subtitle: "Brain vs Algorithm",
        image: "assets/event-debate.png",
        stats: {
            participants: "200+",
            projects: "40+ Debaters",
            prizePool: "₹40,000"
        },
        description: "An intense battle of minds pitching human logic against artificial intelligence algorithms. Competitors debated hot-button issues in machine learning, neural ethics, and futuristic engineering, judged by industry leading panels.",
        highlights: [
            "Deep discussions on artificial consciousness.",
            "Judged by expert AI scientists and ethicists.",
            "Automated AI chatbot acting as a third rebuttal element."
        ]
    },
    "tva": {
        year: "Quest",
        title: "TVA: Variant Hunt",
        subtitle: "Multiverse Treasure Hunt",
        image: "assets/event-tva.png",
        stats: {
            participants: "500+",
            projects: "15+ Timelines",
            prizePool: "₹60,000"
        },
        description: "A high-speed multiverse treasure hunt across complex temporal nodes. Participants decrypted code strings, resolved temporal anomalies, and located timeline variants to save the cosmic grid from collapsing.",
        highlights: [
            "Cryptic puzzle clues scattered across interactive game rooms.",
            "Custom simulated database terminals mimicking time-travel logs.",
            "Live leaderboard tracking chronological variant disruptions."
        ]
    },
    "technova": {
        year: "Tech",
        title: "Technova",
        subtitle: "Innovation Challenge",
        image: "assets/event-technova.png",
        stats: {
            participants: "350+",
            projects: "80+ Ideas",
            prizePool: "₹80,000"
        },
        description: "A design and prototyping challenge aimed at bringing innovative tech solutions to life. Students collaborated under pressure to build hardware and software projects solving local environmental and logistics issues.",
        highlights: [
            "Stark-like innovation hubs with hardware/IoT testing tools.",
            "Pitching sessions to venture capitalists and startup incubator managers.",
            "Sustainable eco-tech ideas taking top positions."
        ]
    },
    "neural": {
        year: "Tech",
        title: "Neural Knockout",
        subtitle: "Algonquin Combat Arena",
        image: "assets/event-neural.png",
        stats: {
            participants: "300+",
            projects: "120+ Submissions",
            prizePool: "₹50,000"
        },
        description: "A deep learning battle arena where custom neural network models competed in a virtual knockout tournament. Competitors trained reinforcement learning bots to outmaneuver opponents in simulated strategy environments.",
        highlights: [
            "Live model clashes streamed on virtual arena interfaces.",
            "Intense competitive optimization challenges.",
            "Special reward for the most memory-efficient network."
        ]
    },
    "pixel": {
        year: "Design",
        title: "Pixel Whisper",
        subtitle: "Design by Voice",
        image: "assets/event-pixel.png",
        stats: {
            participants: "250+",
            projects: "90+ Canvas Art",
            prizePool: "₹45,000"
        },
        description: "Where design parameters were generated purely by vocal commands. Competitors used advanced voice-to-vector interfaces to design logos, websites, and layouts within strict timed sprints.",
        highlights: [
            "Unique voice-controlled interface design mechanics.",
            "Ken Burns visual galleries displaying completed vector artwork.",
            "Judged on voice command efficiency and visual clarity."
        ]
    },
    "nexus": {
        year: "Quest",
        title: "Nexus Grid",
        subtitle: "Tech Bingo Challenge",
        image: "assets/event-nexus.png",
        stats: {
            participants: "400+",
            projects: "200+ Grids",
            prizePool: "₹35,000"
        },
        description: "A high-speed cyber bingo event that tested algorithmic speed and basic tech trivia. Players hacked grid nodes and solved quick-fire coding challenges to unlock coordinates and line up their boards.",
        highlights: [
            "Real-time multiplayer web sockets grid board.",
            "Speed coding and logic riddle triggers.",
            "Climactic final leaderboard chase between top cyber players."
        ]
    },
    "ideathon": {
        year: "Flagship",
        title: "Ideathon",
        subtitle: "Flagship Challenge",
        image: "assets/event-ideathon.png",
        stats: {
            participants: "600+",
            projects: "150+ Solutions",
            prizePool: "₹1,00,000"
        },
        description: "The crowning flagship event of Astra-X. Teams pitched revolutionary product concepts to address industrial safety, clean energy, and quantum computing. A showcase of future-tech ideas that can redefine the industry.",
        highlights: [
            "Intense 36-hour design, research, and pitch sprint.",
            "Mentorship from top tech entrepreneurs.",
            "Incubation opportunities for winning project teams."
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
