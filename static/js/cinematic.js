/**
 * Wawona Cinematic Landing Page Logic
 * Powered by Lenis, GSAP, and Three.js
 */

function runCinematicSetup() {
    // Only run if we actually have a hero section on this page
    if (!document.getElementById('hero-section')) return;

    // 1. Initialize Lenis for Smooth Scrolling ONLY ONCE globally
    if (!window._cinematicLenis) {
        window._cinematicLenis = new Lenis({
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

        // 2. Integrate Lenis with GSAP ScrollTrigger
        window._cinematicLenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            window._cinematicLenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    // 3. Three.js Hero Particle Canvas (Handles its own caching)
    initHeroWebGL();

    // 4. GSAP Hero Entry Animations
    initHeroAnimations();

    // 5. GSAP Horizontal Scrollytelling
    initHorizontalScroll();

    // 6. Custom Magnetic Cursor
    initCustomCursor();

    console.log("Cinematic Experience Initialized");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCinematicSetup);
} else {
    runCinematicSetup();
}

// --- Navigation & SPA Logic ---
// Note: window.toggleMobileMenu is defined in base.html for global availability

// Prevent re-rendering/flashing when clicking a link to the current page
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const url = new URL(link.href, window.location.origin);
    if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash === window.location.hash) {
        // We are already here!
        // If it's the home page, we might want to scroll to top instead of doing nothing
        if (url.pathname === '/' || url.pathname === '/index.html') {
            if (window._cinematicLenis) {
                window._cinematicLenis.scrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Close menu if it's open
        const nav = document.querySelector('.right-nav');
        if (nav && nav.classList.contains('active')) {
            window.toggleMobileMenu();
        }

        e.preventDefault();
    }
});

// --- Custom Magnetic Cursor ---
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch devices

    // Cleanup old cursor if it exists from SPA routing
    if (document.querySelector('.custom-cursor')) {
        document.querySelector('.custom-cursor').remove();
    }

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    // Start hidden, only show in hero
    cursor.style.opacity = '0';
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    const heroSection = document.getElementById('hero-section');

    if (!heroSection) return;

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

    // Only show cursor when inside hero section
    heroSection.addEventListener('mouseenter', () => {
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
        // Hide default cursor in hero
        heroSection.style.cursor = 'none';

        // Hide cursor on interactive elements in hero too
        const interactiveElements = heroSection.querySelectorAll('a, button, .lp-btn');
        interactiveElements.forEach(el => {
            el.style.cursor = 'none';
        });
    });

    heroSection.addEventListener('mouseleave', () => {
        gsap.to(cursor, { opacity: 0, duration: 0.3 });
        cursor.classList.remove('is-hovering');
        // Restore default cursor outside hero
        heroSection.style.cursor = 'auto';

        const interactiveElements = heroSection.querySelectorAll('a, button, .lp-btn');
        interactiveElements.forEach(el => {
            el.style.cursor = 'pointer';
        });
    });

    // Hover states for links and buttons ONLY within the hero section
    const interactiveElements = heroSection.querySelectorAll('a, button, .lp-btn');
    interactiveElements.forEach(el => {
        // Initial setup for the elements inside the hero so they don't show the default pointer
        el.style.cursor = 'none';

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
            gsap.set(c, { opacity: 1, scale: 1 });
        } else {
            gsap.set(c, { opacity: 0.15, scale: 0.9 });
        }
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            // Add an extra 2 screens of scrolling distance to account for our huge deadzones,
            // so panning between cards still feels 1:1 with track size
            end: () => `+=${track.scrollWidth + (window.innerHeight * 2)}`,
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
    // Huge pause (absorbs 1 full screen of scrolling)
    tl.addLabel("card0");
    tl.to({}, { duration: 3.0 });

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
            // Huge pause for the very last card (absorbs 1 full screen of scrolling)
            tl.to({}, { duration: 3.0 });
        } else {
            // Tiny pause to help snapping between middle cards
            tl.to({}, { duration: 0.35 });
        }
    }

    // Dynamic fade-in/out scale depending on closest card perfectly aligned with scroll tracking
    tl.eventCallback("onUpdate", () => {

        let closestIndex = 0;
        let minDistance = Infinity;

        // trackX represents raw horizontal movement distance backwards. e.g. 0 to -3000px
        const currentScrollX = gsap.getProperty(track, "x") || 0;

        cards.forEach((card, i) => {
            // Evaluates mathematical perfect alignment of this card matching 5vw padding left
            const perfectAlignScrollX = -(card.offsetLeft - (window.innerWidth * 0.05));

            // Distance from where we are currently scrubbed vs where we need to be to center this card
            let scrubDistance = currentScrollX - perfectAlignScrollX;
            let absDistance = Math.abs(scrubDistance);

            // The bias math: If the user hasn't physically reached the card yet (scrubDistance > 0),
            // manually shrink its distance constraint early, allowing it to mathematically win focus much sooner 
            // than halfway. 
            if (scrubDistance > 0) {
                // Bias of 350px - the card wakes up extremely early!
                absDistance = Math.max(0, absDistance - 350);
            }

            if (absDistance < minDistance) {
                minDistance = absDistance;
                closestIndex = i;
            }
        });

        cards.forEach((c, i) => {
            if (i === closestIndex) {
                // Active leftmost card: crisp, glowing, full size (Removed blur per user request)
                gsap.to(c, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', overwrite: "auto" });
            } else {
                // Inactive cards deeply recede 
                gsap.to(c, { opacity: 0.15, scale: 0.9, duration: 0.4, ease: 'power2.out', overwrite: "auto" });
            }
        });
    });
}


// --- WebGL Hero Background ---
let _heroRendererBG, _heroRendererFG;

function initHeroWebGL() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    // Check if we already initialized WebGL. If so, just re-append the cached canvases and return.
    if (_heroRendererBG && _heroRendererFG) {
        if (!document.getElementById('hero-canvas-bg')) {
            heroSection.insertBefore(_heroRendererBG.domElement, heroSection.firstChild);
        }
        if (!document.getElementById('hero-canvas-fg')) {
            heroSection.appendChild(_heroRendererFG.domElement);
        }
        return;
    }

    if (!window.THREE) return;

    // Create the canvases dynamically so we own them
    const canvasBG = document.createElement('canvas');
    canvasBG.id = 'hero-canvas-bg';
    heroSection.insertBefore(canvasBG, heroSection.firstChild);

    const canvasFG = document.createElement('canvas');
    canvasFG.id = 'hero-canvas-fg';
    heroSection.appendChild(canvasFG);

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
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // True transparent background
        return renderer;
    }

    _heroRendererBG = createRenderer(canvasBG);
    _heroRendererFG = createRenderer(canvasFG);

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
    const particleCount = 3500;
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

    // Custom shader injection for HDR depth brightness and alpha fading
    material.onBeforeCompile = (shader) => {
        shader.vertexShader = `
            varying float vDepth;
            varying float vAlphaFade;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            `#include <project_vertex>`,
            `#include <project_vertex>
             vDepth = - mvPosition.z;
             // Fade out particles that get too close to the screen, but keep them semi-transparent
             vAlphaFade = mix(0.4, 1.0, smoothstep(100.0, 500.0, vDepth));`
        );

        shader.fragmentShader = `
            varying float vDepth;
            varying float vAlphaFade;
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
            `#include <color_fragment>`,
            `#include <color_fragment>
             // HDR distance multiplier: particles closer than 1000 units glow vastly brighter
             float intensity = 1.0 + max(0.0, (1100.0 - vDepth) / 100.0);
             diffuseColor.rgb *= intensity;
             diffuseColor.a *= vAlphaFade;
            `
        );
    };

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
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;

        cameraBG.aspect = window.innerWidth / window.innerHeight;
        cameraBG.updateProjectionMatrix();
        _heroRendererBG.setSize(window.innerWidth, window.innerHeight);

        cameraFG.aspect = window.innerWidth / window.innerHeight;
        cameraFG.updateProjectionMatrix();
        _heroRendererFG.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    let camPosX = 0;
    let camPosY = 0;

    function animate() {
        requestAnimationFrame(animate);

        // If the section isn't in the DOM at all anymore, pause rendering to save battery
        if (!document.getElementById('hero-section')) return;

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

        _heroRendererBG.render(scene, cameraBG);
        _heroRendererFG.render(scene, cameraFG);
    }

    animate();

    // --- Thematic Color Switching ---
    const isDarkTheme = () => document.documentElement.classList.contains('dark');

    // On dark theme: brilliant white and saturated red glowing against black
    const darkThemeColor = new THREE.Color(0xffffff);
    // On light theme: sophisticated, muted ruby red glowing against white
    const lightThemeColor = new THREE.Color(0xd12a42);

    // Set initial colors based on current theme state
    if (!isDarkTheme()) {
        material.color.copy(lightThemeColor);
        // Slightly lower opacity for light mode
        material.opacity = 0.85;
    }

    // Watch for theme toggle changes
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const dark = isDarkTheme();
                material.color.copy(dark ? darkThemeColor : lightThemeColor);
                material.opacity = dark ? 0.95 : 0.85;
            }
        });
    });

    themeObserver.observe(document.documentElement, { attributes: true });
}

// --- GSAP Hero Entry Animations ---
function initHeroAnimations() {
    if (!window.gsap) return;

    // Check if user has already seen the animation this session
    const isCached = sessionStorage.getItem('wawona_hero_rendered') === 'true';

    if (isCached) {
        // Just show everything immediately with no intro delay
        gsap.set('.lp-hero-anim', { y: 0, opacity: 1, filter: 'blur(0px)' });
    } else {
        // Initial state
        gsap.set('.lp-hero-anim', { y: 50, opacity: 0, filter: 'blur(10px)' });

        // Timeline
        const tl = gsap.timeline({
            defaults: { ease: 'power4.out', duration: 1.2 },
            onComplete: () => {
                sessionStorage.setItem('wawona_hero_rendered', 'true');
            }
        });

        tl.to('.lp-hero-anim', {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.15,
            delay: 0.2 // Wait a beat after load
        });
    }

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
