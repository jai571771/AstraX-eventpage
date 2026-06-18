/* ==========================================================================
   ASTRA-X MARVEL-THEMED EVENTS PAGE INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // initParticles();
    initNavbar();
    initTimeline();
    initStatsCounter();
    initMirrorSlider();
});

/* ==========================================================================
   1. COSMIC PARTICLES BACKGROUND (HTML5 CANVAS)
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let timelineThreads = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initThreads();
    }
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

    // Timeline Thread template
    class TimelineThread {
        constructor(baseX) {
            this.baseX = baseX;
            this.amplitude = Math.random() * 25 + 15;
            this.wavelength = Math.random() * 150 + 120;
            this.phase = Math.random() * 100;
            this.speed = (Math.random() * 0.01 + 0.003) * (Math.random() < 0.5 ? 1 : -1);
            this.color = Math.random() < 0.35 ? 'rgba(230, 184, 0, ' : 'rgba(0, 255, 136, '; // Gold or Green threads
            this.alpha = Math.random() * 0.15 + 0.08;
            this.thickness = Math.random() * 1.5 + 0.6;
            
            // Add nodes along this thread
            this.nodes = [];
            const numNodes = Math.floor(canvas.height / 220);
            for (let i = 0; i < numNodes; i++) {
                this.nodes.push({
                    yOffsetPercent: (i + Math.random()) / numNodes, // position along height
                    size: Math.random() * 3.5 + 1.5,
                    pulseSpeed: Math.random() * 0.03 + 0.01,
                    pulsePhase: Math.random() * Math.PI
                });
            }
        }

        update() {
            this.phase += this.speed;
        }

        draw() {
            // Draw the thread wave
            ctx.beginPath();
            ctx.lineWidth = this.thickness;
            
            let isFirst = true;
            for (let y = 0; y <= canvas.height; y += 15) {
                // Calculate wave position
                let waveX = this.baseX + Math.sin(y / this.wavelength + this.phase) * this.amplitude;
                
                // Mouse interaction - warp the thread slightly towards cursor
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - waveX;
                    let dy = mouse.y - y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        waveX += dx * force * 0.35;
                    }
                }

                if (isFirst) {
                    ctx.moveTo(waveX, y);
                    isFirst = false;
                } else {
                    ctx.lineTo(waveX, y);
                }
            }
            
            ctx.strokeStyle = this.color + this.alpha + ')';
            ctx.stroke();

            // Draw the nodes along this thread
            this.nodes.forEach(node => {
                let nodeY = node.yOffsetPercent * canvas.height;
                let nodeX = this.baseX + Math.sin(nodeY / this.wavelength + this.phase) * this.amplitude;
                
                // Apply mouse warp to node position
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - nodeX;
                    let dy = mouse.y - nodeY;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        nodeX += dx * force * 0.35;
                    }
                }

                node.pulsePhase += node.pulseSpeed;
                let currentSize = node.size + Math.sin(node.pulsePhase) * 1.5;
                
                ctx.beginPath();
                ctx.arc(nodeX, nodeY, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (this.alpha + 0.3) + ')';
                ctx.shadowColor = this.color.includes('230') ? 'rgba(230, 184, 0, 0.8)' : 'rgba(0, 255, 136, 0.8)';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0; // reset shadow
            });
        }
    }

    // Populate threads
    function initThreads() {
        timelineThreads = [];
        const gap = 160;
        const totalThreads = Math.ceil(canvas.width / gap) + 1;
        for (let i = 0; i < totalThreads; i++) {
            let baseX = (i - 0.5) * gap;
            timelineThreads.push(new TimelineThread(baseX));
        }
    }

    // Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < timelineThreads.length; i++) {
            timelineThreads[i].update();
            timelineThreads[i].draw();
        }
        requestAnimationFrame(animate);
    }
    
    resizeCanvas();
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
    const handleScroll = () => {
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
                    node.classList.add('visible');
                } else {
                    node.classList.remove('active-marker');
                }
            });
        } else {
            progressLine.style.height = '0%';
            nodes.forEach(node => node.classList.remove('active-marker'));
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
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

/* ==========================================================================
   8. DOCTOR STRANGE MIRROR DIMENSION SHOWCASE SLIDER
   ========================================================================== */
function initMirrorSlider() {
    const eventDatabase = [
        {
            id: "debate",
            badge: "Tech Saga",
            title: "AI Technical Debate",
            image: "assets/event-debate.png",
            prize: "₹40,000",
            participants: "200+",
            description: "An intense battle of minds pitching human logic against artificial intelligence algorithms. Competitors will debate hot-button issues in machine learning, neural ethics, and futuristic engineering."
        },
        {
            id: "tva",
            badge: "Quest Saga",
            title: "TVA: Variant Hunt",
            image: "assets/event-tva.png",
            prize: "₹60,000",
            participants: "500+",
            description: "A high-speed multiverse treasure hunt across complex temporal nodes. Decrypt code strings, resolve temporal anomalies, and locate timeline variants to save the cosmic grid."
        },
        {
            id: "technova",
            badge: "Innovation Challenge",
            title: "Technova",
            image: "assets/event-technova.png",
            prize: "₹80,000",
            participants: "350+",
            description: "A design and prototyping challenge aimed at bringing innovative tech solutions to life. Collaborate under pressure to build hardware and software projects solving local environmental issues."
        },
        {
            id: "neural",
            badge: "Tech Saga",
            title: "Neural Knockout",
            image: "assets/event-neural.png",
            prize: "₹50,000",
            participants: "300+",
            description: "A deep learning battle arena where custom neural network models will compete in a virtual knockout tournament. Train reinforcement learning bots to outmaneuver opponents."
        },
        {
            id: "pixel",
            badge: "Design Saga",
            title: "Pixel Whisper",
            image: "assets/event-pixel.png",
            prize: "₹45,000",
            participants: "250+",
            description: "Where design parameters are generated purely by vocal commands. Use advanced voice-to-vector interfaces to design logos, websites, and layouts within strict timed sprints."
        },
        {
            id: "nexus",
            badge: "Quest Saga",
            title: "Nexus Grid",
            image: "assets/event-nexus.png",
            prize: "₹35,000",
            participants: "400+",
            description: "A high-speed cyber bingo event designed to test algorithmic speed and basic tech trivia. Hack grid nodes and solve quick-fire coding challenges to unlock coordinates."
        },
        {
            id: "ideathon",
            badge: "Flagship Saga",
            title: "Ideathon",
            image: "assets/event-ideathon.png",
            prize: "₹1,00,000",
            participants: "600+",
            description: "The crowning flagship event of Astra-X. Pitch revolutionary product concepts addressing industrial safety, clean energy, and quantum computing to a panel of expert judges."
        }
    ];

    let currentIdx = 0;
    let isAnimating = false;
    let isDetailsOpen = false; // Track if the event details card is currently shown

    // DOM Elements
    const frame = document.querySelector('.mirror-frame');
    if (!frame) return;

    const activeImg = document.getElementById('mirror-active-image');
    const activeImgContainer = document.querySelector('.mirror-active-image-container');
    const slicesContainer = document.querySelector('.mirror-slices-container');
    const ghostsContainer = document.querySelector('.mirror-ghosts-container');
    const voidGrid = document.querySelector('.mirror-void');
    const prevBtn = document.querySelector('.mirror-nav-btn.prev');
    const nextBtn = document.querySelector('.mirror-nav-btn.next');
    const energyBorder = document.querySelector('.frame-energy-border');
    const ambientGlow = document.querySelector('.frame-ambient-glow');
    
    // Details Card Elements
    const detailBadge = document.getElementById('details-badge');
    const detailTitle = document.getElementById('details-title');
    const detailDesc = document.getElementById('details-description');
    const detailPrize = document.getElementById('details-prize');
    const detailParticipants = document.getElementById('details-participants');
    const detailsCard = document.querySelector('.mirror-details-card');

    // Hide details card by default
    if (detailsCard) {
        gsap.set(detailsCard, {
            opacity: 0,
            y: 15,
            pointerEvents: 'none',
            visibility: 'hidden'
        });
    }

    // SVG cracks
    const crackPaths = document.querySelectorAll('.crack-path');

    // --- Particle Engine (Canvas) ---
    const canvas = document.getElementById('mirror-particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const particleCount = 50;
    let speedMultiplier = 1;

    function resizeCanvas() {
        if (!canvas.parentElement) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.6;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = -Math.random() * 0.7 - 0.1;
            this.opacity = Math.random() * 0.5 + 0.25;
            this.color = Math.random() < 0.4 ? 'rgba(0, 255, 136, ' : 'rgba(0, 204, 102, ';
        }
        update() {
            this.x += this.speedX * speedMultiplier;
            this.y += this.speedY * speedMultiplier;
            if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
                this.reset();
                this.y = canvas.height;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Helper: Split Image into 8 Vertical 3D Panels
    function createSlices(imageSrc, container, numSlices = 8) {
        container.innerHTML = '';
        const slices = [];
        for (let i = 0; i < numSlices; i++) {
            const slice = document.createElement('div');
            slice.className = 'mirror-slice';
            slice.style.left = `${(i / numSlices) * 100}%`;
            slice.style.width = `${100 / numSlices}%`;
            slice.style.backgroundImage = `url(${imageSrc})`;
            slice.style.backgroundSize = `${numSlices * 100}% 100%`;
            slice.style.backgroundPosition = `${(i / (numSlices - 1)) * 100}% 0%`;
            container.appendChild(slice);
            slices.push(slice);
        }
        return slices;
    }

    // Nav Trigger
    async function triggerMirrorTransition(nextIndex) {
        if (isAnimating) return;
        isAnimating = true;

        const currentData = eventDatabase[currentIdx];
        const nextData = eventDatabase[nextIndex];

        // Step 0: Fade details card out if open
        if (isDetailsOpen) {
            gsap.to(detailsCard, {
                opacity: 0,
                y: 15,
                duration: 0.35,
                ease: "power2.out"
            });
        }

        const timeline = gsap.timeline({
            onComplete: () => {
                currentIdx = nextIndex;
                isAnimating = false;
                
                // Show stable static next image
                activeImg.src = nextData.image;
                activeImg.alt = nextData.title;
                activeImgContainer.classList.add('active');
                
                // Clear slices & restore ambient glows
                slicesContainer.innerHTML = '';
                ghostsContainer.innerHTML = '';
                voidGrid.classList.remove('active');
                
                gsap.to(energyBorder, { opacity: 0, duration: 0.5 });
                gsap.to(ambientGlow, { opacity: 0.15, duration: 0.8 });
                
                // Set details card content & fade in
                detailBadge.textContent = nextData.badge;
                detailTitle.textContent = nextData.title;
                detailDesc.textContent = nextData.description;
                detailPrize.textContent = nextData.prize;
                detailParticipants.textContent = nextData.participants;
                
                if (isDetailsOpen) {
                    gsap.to(detailsCard, {
                        opacity: 1,
                        y: 0,
                        duration: 0.55,
                        ease: "power3.out"
                    });
                }
            }
        });

        // Time 0: Phase 1 starts (Reality Awakens)
        timeline.call(() => {
            speedMultiplier = 4.5;
            gsap.to(energyBorder, { opacity: 1, duration: 0.3 });
            
            // Volumetric vibration
            gsap.to(frame, {
                x: () => (Math.random() - 0.5) * 6,
                y: () => (Math.random() - 0.5) * 6,
                duration: 0.05,
                repeat: 8,
                yoyo: true,
                clearProps: "x,y",
                ease: "none"
            });
        }, null, 0);

        // Time 0.3: Phase 2 starts (Dimensional Fracturing)
        timeline.call(() => {
            gsap.to(crackPaths, {
                opacity: 0.9,
                duration: 0.4,
                stagger: {
                    each: 0.04,
                    from: "center"
                },
                ease: "sine.inOut"
            });
        }, null, 0.3);

        // Time 0.7: Phase 3 & 4 start (Mirror Dimension Folding & Void)
        timeline.call(() => {
            const currentSlices = createSlices(currentData.image, slicesContainer, 8);
            activeImgContainer.classList.remove('active');
            voidGrid.classList.add('active');
            
            // Max volumetric fog/light rays
            gsap.to('.volumetric-fog', {
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.16) 0%, transparent 80%)',
                duration: 0.4
            });

            // Fold current slices away
            gsap.to(currentSlices, {
                rotationY: (i) => i % 2 === 0 ? 50 + Math.random() * 20 : -50 - Math.random() * 20,
                rotationX: () => (Math.random() - 0.5) * 25,
                z: () => -350 - Math.random() * 200,
                y: (i) => i % 2 === 0 ? 55 : -55,
                x: (i) => (i - 3.5) * 20,
                opacity: 0,
                duration: 1.25,
                stagger: {
                    amount: 0.35,
                    from: "center"
                },
                ease: "power2.inOut"
            });

            // Ghost Layer 1 (Medium depth)
            const ghosts1 = createSlices(currentData.image, ghostsContainer, 8);
            gsap.set(ghosts1, { opacity: 0.25, z: -250 });
            gsap.to(ghosts1, {
                rotationY: (i) => i % 2 === 0 ? 65 : -65,
                z: -500,
                opacity: 0,
                duration: 1.1,
                stagger: 0.025,
                ease: "power2.inOut"
            });

            // Ghost Layer 2 (Deep depth)
            const ghosts2 = createSlices(currentData.image, document.createElement('div'), 8);
            ghostsContainer.appendChild(ghosts2[0].parentElement);
            gsap.set(ghosts2, { opacity: 0.12, z: -500 });
            gsap.to(ghosts2, {
                rotationY: (i) => i % 2 === 0 ? 75 : -75,
                z: -850,
                opacity: 0,
                duration: 1.2,
                stagger: 0.025,
                ease: "power2.inOut"
            });
        }, null, 0.7);

        // Time 1.2: Phase 5 starts (Reality Reconstruction)
        timeline.call(() => {
            const nextSlices = createSlices(nextData.image, slicesContainer, 8);
            gsap.set(nextSlices, {
                rotationY: (i) => i % 2 === 0 ? -60 : 60,
                rotationX: () => (Math.random() - 0.5) * 40,
                z: -800,
                y: (i) => i % 2 === 0 ? -85 : 85,
                x: (i) => (i - 3.5) * 30,
                opacity: 0
            });

            // Unfold into place
            gsap.to(nextSlices, {
                rotationY: 0,
                rotationX: 0,
                z: 0,
                y: 0,
                x: 0,
                opacity: 1,
                duration: 1.3,
                stagger: {
                    amount: 0.35,
                    from: "center"
                },
                ease: "power3.inOut"
            });
        }, null, 1.2);

        // Time 2.0: Phase 6 starts (Restore Reality)
        timeline.call(() => {
            gsap.to(crackPaths, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            });
            speedMultiplier = 1;
            gsap.to('.volumetric-fog', {
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 70%)',
                duration: 0.85
            });
        }, null, 2.0);

        // Keep timeline playing for 2.5s duration
        timeline.to({}, { duration: 2.5 });
    }

    // Button event listeners
    prevBtn.addEventListener('click', () => {
        const prevIdx = (currentIdx - 1 + eventDatabase.length) % eventDatabase.length;
        triggerMirrorTransition(prevIdx);
    });

    nextBtn.addEventListener('click', () => {
        const nextIdx = (currentIdx + 1) % eventDatabase.length;
        triggerMirrorTransition(nextIdx);
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            const nextIdx = (currentIdx + 1) % eventDatabase.length;
            triggerMirrorTransition(nextIdx);
        } else if (e.key === 'ArrowLeft') {
            const prevIdx = (currentIdx - 1 + eventDatabase.length) % eventDatabase.length;
            triggerMirrorTransition(prevIdx);
        }
    });

    // Ambient frame glow on hover
    frame.addEventListener('mouseenter', () => {
        if (!isAnimating) {
            gsap.to(ambientGlow, { opacity: 0.35, duration: 0.5 });
        }
    });
    frame.addEventListener('mouseleave', () => {
        if (!isAnimating) {
            gsap.to(ambientGlow, { opacity: 0.15, duration: 0.5 });
        }
    });

    // Toggle details card helper
    function toggleDetails(open) {
        isDetailsOpen = open;
        if (isDetailsOpen) {
            gsap.to(detailsCard, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out",
                onStart: () => {
                    detailsCard.style.pointerEvents = 'auto';
                    detailsCard.style.visibility = 'visible';
                }
            });
        } else {
            gsap.to(detailsCard, {
                opacity: 0,
                y: 15,
                duration: 0.4,
                ease: "power2.inOut",
                onComplete: () => {
                    detailsCard.style.pointerEvents = 'none';
                    detailsCard.style.visibility = 'hidden';
                }
            });
        }
    }

    // Click image to toggle details card
    const stage = document.querySelector('.mirror-stage');
    if (stage && detailsCard) {
        stage.addEventListener('click', () => {
            if (isAnimating) return;
            toggleDetails(!isDetailsOpen);
        });

        detailsCard.addEventListener('click', () => {
            if (isAnimating) return;
            toggleDetails(false); // Always close when clicked
        });
    }
}
