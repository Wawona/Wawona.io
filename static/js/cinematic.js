/**
 * Wawona Cinematic Landing Page Logic
 * Powered by Lenis, GSAP, and Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window._cinematicInitialized) return;
    window._cinematicInitialized = true;

    // 1. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // 2. Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 3. Three.js Hero Particle Canvas
    initHeroWebGL();

    // 4. GSAP Hero Entry Animations
    initHeroAnimations();

    // 5. GSAP Horizontal Scrollytelling
    initHorizontalScroll();

    // 6. Custom Magnetic Cursor
    initCustomCursor();

    console.log("Cinematic Experience Initialized");
});

// --- Custom Magnetic Cursor ---
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch devices

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Follow mouse
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Hover states for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .lp-btn');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('is-hovering');
        });
    });
}


// --- Horizontal Scrollytelling ---
function initHorizontalScroll() {
    const wrapper = document.getElementById('features-scroll-wrapper');
    const track = document.getElementById('features-track');
    const cards = gsap.utils.toArray('.lp-feature-card');

    if (!wrapper || !track || cards.length === 0 || !window.gsap) return;

    cards.forEach((c, i) => {
        if (i === 0) {
            gsap.set(c, { opacity: 1, scale: 1, filter: 'blur(0px)' });
        } else {
            gsap.set(c, { opacity: 0.15, scale: 0.9, filter: 'blur(4px)' });
        }
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `+=${track.scrollWidth}`, // 1:1 scroll speed
            pin: true,
            scrub: 1.5,
            snap: {
                snapTo: "labels",
                duration: { min: 0.3, max: 0.8 },
                ease: "power2.inOut",
                delay: 0.1
            },
            invalidateOnRefresh: true
        }
    });

    // Start label: deadzone before moving
    tl.addLabel("card0");
    tl.to({}, { duration: 1.0 });

    for (let i = 1; i < cards.length; i++) {
        tl.to(track, {
            x: () => {
                const cardLeft = cards[i].offsetLeft;
                // Align to 5vw margin to match the "The Architecture" header perfectly
                const leftAlignOffset = window.innerWidth * 0.05;

                return -(cardLeft - leftAlignOffset);
            },
            ease: "none",
            duration: 1
        });

        // Exact left-aligned label
        tl.addLabel(`card${i}`);
        // Pause at label to hold focus over scroll
        if (i === cards.length - 1) {
            // Extra long pause for the very last card
            tl.to({}, { duration: 1.0 });
        } else {
            tl.to({}, { duration: 0.35 });
        }
    }

    // Dynamic fade-in/out scale depending on closest card to the LEFT of the screen
    tl.eventCallback("onUpdate", () => {
        // Our activation line is 5vw (the left padding) + roughly half a card width
        // to gracefully transition as the full card sweeps into the reading zone
        const activationLine = window.innerWidth * 0.05 + 100;

        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            // Measure distance based on the left edge of the card
            const distance = Math.abs(rect.left - activationLine);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        });

        cards.forEach((c, i) => {
            if (i === closestIndex) {
                // Active leftmost card: crisp, glowing, full size
                gsap.to(c, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out', overwrite: "auto" });
            } else {
                // Inactive cards deeply recede
                gsap.to(c, { opacity: 0.15, scale: 0.9, filter: 'blur(4px)', duration: 0.4, ease: 'power2.out', overwrite: "auto" });
            }
        });
    });
}


// --- WebGL Hero Background ---
function initHeroWebGL() {
    const canvasBG = document.getElementById('hero-canvas-bg');
    const canvasFG = document.getElementById('hero-canvas-fg');
    if (!canvasBG || !canvasFG || !window.THREE) return;

    // Use a shared single scene to ensure particles only compute rotation once
    const scene = new THREE.Scene();

    // The DOM text conceptually sits at the intersection plane (distance=1000 from camera)
    // BG Camera sees from Z=1000 to Z=5000 (Behind the text)
    const cameraBG = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1000, 5000);
    cameraBG.position.z = 1000;

    // FG Camera sees from Z=1 to Z=1000 (In front of the text)
    const cameraFG = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    cameraFG.position.z = 1000;

    // Vibrant colors (HDR bloom is removed, relying on soft texture blending)
    const colorPrimary = new THREE.Color(0xff3344);
    const colorWhite = new THREE.Color(0xffffff);
    const colorDark = new THREE.Color(0xaa2233);

    // Setup Renderers (No EffectComposer to preserve perfect Alpha transparency over the DOM)
    function createRenderer(canvas) {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, premultipliedAlpha: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // True transparent background
        return renderer;
    }

    const rendererBG = createRenderer(canvasBG);
    const rendererFG = createRenderer(canvasFG);

    // Create a procedural glowing square particle texture
    function createSquareGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128; // Increased resolution for smoother wide glow
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Faint outer square glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(16, 16, 96, 96);

        // Mid square glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(32, 32, 64, 64);

        // Core glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(48, 48, 32, 32);

        // Crisp inner square pixel
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.fillRect(56, 56, 16, 16);

        const tex = new THREE.Texture(canvas);
        tex.needsUpdate = true;
        return tex;
    }
    const particleTexture = createSquareGlowTexture();

    // Create a unified particle system
    const geometry = new THREE.BufferGeometry();
    const particleCount = 8000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < positions.length; i += 3) {
        // Expand the sphere so particles fly around the camera at (0,0,1000)
        const r = 800 + Math.random() * 1200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = r * Math.cos(phi);

        // Mix colors
        const rand = Math.random();
        let mixedColor;
        if (rand > 0.20) {
            mixedColor = colorWhite;   // 80% white
        } else if (rand > 0.05) {
            mixedColor = colorPrimary; // 15% red
        } else {
            mixedColor = colorDark;    // 5% dark
        }

        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 30.0, // Scale so the inner crisp square resolves beautifully, with its giant bloom aura
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        blending: THREE.NormalBlending, // NormalBlending allows red to strictly occlude white text natively!
        depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Handle Resize
    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;

        cameraBG.aspect = aspect;
        cameraBG.updateProjectionMatrix();
        rendererBG.setSize(window.innerWidth, window.innerHeight);

        cameraFG.aspect = aspect;
        cameraFG.updateProjectionMatrix();
        rendererFG.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    let camPosX = 0;
    let camPosY = 0;

    function animate() {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        // Rotate the unified scene
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.001;

        // Camera smoothly follows mouse
        camPosX += (targetX - camPosX) * 0.02;
        camPosY += (- targetY - camPosY) * 0.02;

        // Sync both cameras identically
        cameraBG.position.x = camPosX;
        cameraBG.position.y = camPosY;
        cameraBG.lookAt(0, 0, 0); // Focus on origin

        cameraFG.position.x = camPosX;
        cameraFG.position.y = camPosY;
        cameraFG.lookAt(0, 0, 0); // Focus on origin

        rendererBG.render(scene, cameraBG);
        rendererFG.render(scene, cameraFG);
    }

    animate();
}

// --- GSAP Hero Entry Animations ---
function initHeroAnimations() {
    if (!window.gsap) return;

    // Initial state
    gsap.set('.lp-hero-anim', { y: 50, opacity: 0, filter: 'blur(10px)' });

    // Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

    tl.to('.lp-hero-anim', {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.15,
        delay: 0.2 // Wait a beat after load
    });

    // Parallax the hero content on scroll
    gsap.to('#hero-content', {
        yPercent: 40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}
