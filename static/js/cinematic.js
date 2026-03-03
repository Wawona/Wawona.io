/**
 * Wawona Cinematic Landing Page Logic
 * Powered by Lenis, GSAP, and Three.js
 */

function runCinematicSetup() {
    // Only run if we actually have a hero section on this page
    if (!document.getElementById('hero-section')) return;

    // Kill any stale GSAP ScrollTrigger instances from a previous page load
    // (critical for SPA navigation — prevents dead pinned sections from stacking)
    if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach(t => t.kill());
    }

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

// Expose globally so the SPA router can call it after each navigation to /
window.runCinematicSetup = runCinematicSetup;

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
    // Start hidden
    cursor.style.opacity = '0';
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Global functions to toggle states from other scripts
    window.setCustomCursorHover = (state) => {
        if (state) cursor.classList.add('is-hovering');
        else cursor.classList.remove('is-hovering');
    };

    window.setCustomCursorSwiping = (state) => {
        if (state) cursor.classList.add('is-swiping');
        else cursor.classList.remove('is-swiping');
    };

    // Follow mouse globally
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

    const activeSections = [
        document.getElementById('hero-section'),
        document.querySelector('.lp-showcase-frame')
    ].filter(Boolean);

    activeSections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            gsap.to(cursor, { opacity: 1, duration: 0.3 });
            section.style.cursor = 'none';

            // Hide default cursor on interactive elements within these sections
            const interactive = section.querySelectorAll('a, button, .lp-btn, .lp-showcase-slide');
            interactive.forEach(el => {
                el.style.cursor = 'none';
                if (!el.dataset.cursorBound) {
                    el.addEventListener('mouseenter', () => window.setCustomCursorHover(true));
                    el.addEventListener('mouseleave', () => window.setCustomCursorHover(false));
                    el.dataset.cursorBound = "true";
                }
            });
        });

        section.addEventListener('mouseleave', () => {
            gsap.to(cursor, { opacity: 0, duration: 0.3 });
            window.setCustomCursorHover(false);
            section.style.cursor = 'auto';
        });
    });
}


// --- Horizontal Scrollytelling ---
function initHorizontalScroll() {
    const wrapper = document.getElementById('features-scroll-wrapper');
    const track = document.getElementById('features-track');
    const cards = gsap.utils.toArray('.lp-feature-card');
    const tlSteps = document.querySelectorAll('.lp-sb-tl-step');
    const tlFill = document.getElementById('sb-tl-fill');
    const tlRow = document.querySelector('.lp-sb-tl-row');

    if (!wrapper || !track || cards.length === 0 || !window.gsap) return;

    cards.forEach((c, i) => {
        if (i === 0) {
            gsap.set(c, { opacity: 1, scale: 1 });
        } else {
            gsap.set(c, { opacity: 0.15, scale: 0.9 });
        }
    });

    let tlFillPcts = [];

    function calculateTlPcts() {
        if (!tlRow || tlSteps.length === 0) return;
        const rowRect = tlRow.getBoundingClientRect();
        const rowWidth = rowRect.width;

        tlFillPcts = Array.from(tlSteps).map(step => {
            const dot = step.querySelector('.lp-sb-tl-dot');
            const dotRect = dot.getBoundingClientRect();
            // Center of dot relative to row start
            const dotCenter = (dotRect.left + dotRect.width / 2) - rowRect.left;
            return (dotCenter / rowWidth) * 100;
        });
    }

    // Initial calculation
    calculateTlPcts();
    window.addEventListener('resize', calculateTlPcts);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `+=${track.scrollWidth + window.innerHeight}`,
            pin: true,
            scrub: 0.2,
            invalidateOnRefresh: true,
            onLeave: () => {
                // Ensure completion on exit
                if (tlSteps.length && tlFill) {
                    tlSteps.forEach(step => {
                        step.classList.remove('active');
                        step.classList.add('visited');
                    });
                    gsap.to(tlFill, { width: '100%', duration: 0.3, overwrite: "auto" });
                }
            },
            onEnterBack: () => {
                // Return will be handled by onUpdate
            },
            snap: {
                snapTo: (value) => {
                    const totalDuration = tl.totalDuration();
                    const progressLabels = [0, 1, ...Object.values(tl.labels).map(t => t / totalDuration)].sort((a, b) => a - b);

                    let closest = progressLabels[0];
                    let minDiff = Math.abs(value - closest);
                    for (let i = 1; i < progressLabels.length; i++) {
                        const diff = Math.abs(value - progressLabels[i]);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closest = progressLabels[i];
                        }
                    }
                    return closest;
                },
                duration: { min: 0.2, max: 0.6 },
                ease: "power2.inOut",
                delay: 0.3
            }
        }
    });

    // Entry animation
    tl.fromTo(track, { opacity: 0, y: 50 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
    });
    tl.addLabel("card0");

    // Track whether we have reached the "exiting" phase (past the last card)
    let tlCompleted = false;

    function setTlCompleted(val) {
        tlCompleted = val;
        if (!tlSteps.length || !tlFill) return;
        if (val) {
            tlSteps.forEach(step => {
                step.classList.remove('active');
                step.classList.add('visited');
            });
            gsap.to(tlFill, { width: '100%', duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        }
    }

    for (let i = 1; i < cards.length; i++) {
        tl.to(track, {
            x: () => {
                const cardLeft = cards[i].offsetLeft;
                const leftAlignOffset = window.innerWidth * 0.05;
                return -(cardLeft - leftAlignOffset);
            },
            ease: "none",
            duration: 1
        });
        tl.addLabel(`card${i}`);
        if (i === cards.length - 1) {
            tl.to(track, {
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: "power2.in",
                onStart: () => setTlCompleted(true),
                onReverseComplete: () => setTlCompleted(false)
            });
        } else {
            tl.to({}, { duration: 0.35 });
        }
    }

    tl.eventCallback("onUpdate", () => {
        let closestIndex = 0;
        let minDistance = Infinity;
        const currentScrollX = gsap.getProperty(track, "x") || 0;

        cards.forEach((card, i) => {
            const perfectAlignScrollX = -(card.offsetLeft - (window.innerWidth * 0.05));
            let scrubDistance = currentScrollX - perfectAlignScrollX;
            let absDistance = Math.abs(scrubDistance);
            if (scrubDistance > 0) absDistance = Math.max(0, absDistance - 350);
            if (absDistance < minDistance) {
                minDistance = absDistance;
                closestIndex = i;
            }
        });

        cards.forEach((c, i) => {
            if (i === closestIndex && !tlCompleted) {
                gsap.to(c, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', overwrite: "auto" });
            } else {
                gsap.to(c, { opacity: 0.15, scale: 0.9, duration: 0.4, ease: 'power2.out', overwrite: "auto" });
            }
        });

        // Only update indicator if NOT in completed state (setTlCompleted handles that)
        if (!tlCompleted && tlSteps.length && tlFill) {
            tlSteps.forEach((step, i) => {
                step.classList.toggle('active', i === closestIndex);
                step.classList.toggle('visited', i < closestIndex);
            });
            gsap.to(tlFill, {
                width: (tlFillPcts[closestIndex] || 0) + '%',
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        }
    });

    // --- Mobile Swipe Navigation ---
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    let currentActiveIndex = 0;
    // targetCardIndex is the authoritative index: updated ONLY on confirmed navigations.
    // This avoids drift from the biased currentActiveIndex used for visual effects.
    let targetCardIndex = 0;

    function navigateToIndex(index, duration = 0.6) {
        const labelName = `card${index}`;
        const st = tl.scrollTrigger;
        if (!st) return;

        const labelTime = tl.labels[labelName];
        let progress = 0;

        if (labelTime !== undefined) {
            progress = labelTime / tl.totalDuration();
        } else {
            console.warn("Label not found", labelName);
            progress = index / (cards.length - 1);
        }

        // Lock destination before async scroll
        targetCardIndex = index;
        const scrollTarget = st.start + (st.end - st.start) * progress;

        // Debugging to ensure clicks are registering
        console.log(`Navigating to ${labelName} (Index ${index}), Target: ${scrollTarget}px, Progress: ${progress}`);

        if (window._cinematicLenis) {
            // Do not call .stop() here as it may abort the programmatic scrollTo.
            window._cinematicLenis.scrollTo(scrollTarget, {
                duration: duration,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        }
    }

    // === Click-to-Navigate on timeline dots ===
    tlSteps.forEach((step, i) => {
        // Ensure steps can receive clicks even if overlap is tricky
        step.style.pointerEvents = 'auto';
        step.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigateToIndex(i);
        });
    });

    // === Swipe Listeners (Mobile Direct Control) ===
    let swipeIntent = null; // 'horizontal' | 'vertical' | null
    let lastX = 0;

    wrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        lastX = startX;
        swipeIntent = null;
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        const diffX = startX - curX;
        const diffY = startY - curY;
        const dX = Math.abs(diffX);
        const dY = Math.abs(diffY);

        // Classify intent carefully
        if (!swipeIntent && (dX > 5 || dY > 5)) {
            if (dY > dX) {
                swipeIntent = 'vertical';
                return;
            } else {
                swipeIntent = 'horizontal';
            }
        }

        if (swipeIntent === 'horizontal') {
            if (e.cancelable) e.preventDefault();

            // Calculate incremental movement for fluid "scrubbing"
            const deltaX = lastX - curX;
            lastX = curX;

            // Map horizontal delta to vertical scroll
            // We scale it so one swipe across the screen moves roughly one card
            const st = tl.scrollTrigger;
            if (st) {
                const scrollRange = st.end - st.start;
                const scrollStretch = scrollRange / (cards.length - 1);
                const sensitivity = scrollStretch / (window.innerWidth * 0.8);

                const scrollDelta = deltaX * sensitivity * 0.8;

                if (window._cinematicLenis) {
                    window._cinematicLenis.scrollTo(window.scrollY + scrollDelta, { immediate: true });
                } else {
                    window.scrollBy(0, scrollDelta);
                }
            }
        }
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
        swipeIntent = null;
    }, { passive: true });

    wrapper.addEventListener('touchcancel', () => {
        swipeIntent = null;
    }, { passive: true });

    // === Scrollwheel Mapping ===
    wrapper.addEventListener('wheel', (e) => {
        const dX = e.deltaX;
        const dY = e.deltaY;

        // If user is clearly scrolling horizontally (trackpad / shift+scroll)
        if (Math.abs(dX) > Math.abs(dY) && Math.abs(dX) > 5) {
            e.preventDefault();
            const scrollDelta = dX * 1.2;

            if (window._cinematicLenis) {
                window._cinematicLenis.scrollTo(window.scrollY + scrollDelta, { immediate: true });
            } else {
                window.scrollBy(0, scrollDelta);
            }
        }
    }, { passive: false });

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

    // --- Theme-aware particle palettes ---
    // Dark mode: white sparkles with red accents (brilliant against black background)
    const dark_colorMain = new THREE.Color(0xffffff); // 80% brilliant white
    const dark_colorAccent = new THREE.Color(0xff3344); // 15% saturated red
    const dark_colorDeep = new THREE.Color(0xaa2233); //  5% deep crimson
    // Light mode: deep blue/purple — dark enough that HDR bloom stays vivid, never white.
    // Close (HDR-boosted) particles glow as rich cobalt/violet; far particles read dark against white bg.
    const light_colorMain = new THREE.Color(0x1d4ed8); // 65% deep cobalt — blooms to vivid electric blue
    const light_colorAccent = new THREE.Color(0x6d28d9); // 25% deep violet — blooms to vivid purple
    const light_colorDeep = new THREE.Color(0x0c0a1e); // 10% near-black navy — far specks on white bg

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

    // Create a procedural glowing square pixel star texture
    function createSquareStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; // High resolution for wide bloom gradients
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // 1. Extreme Outer Square Glow (faint aura)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(32, 32, 192, 192);

        // 2. Main Star Body (brighter square bloom)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(64, 64, 128, 128);

        // 3. Persistent Core (the star pixel)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(96, 96, 64, 64);

        // 4. Brilliant inner core
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.fillRect(112, 112, 32, 32);

        // 5. High-intensity center pixel
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.fillRect(122, 122, 12, 12);

        const tex = new THREE.Texture(canvas);
        tex.needsUpdate = true;
        return tex;
    }
    const particleTexture = createSquareStarTexture();

    // Create a unified particle system
    const geometry = new THREE.BufferGeometry();
    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    // Pre-generate one random value per particle and reuse it forever.
    // This ensures colors are truly "set once" — re-calling fillParticleColors
    // (e.g. on theme toggle) maps the same palette to the same particles.
    const particleRands = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        particleRands[i] = Math.random();
    }

    for (let i = 0; i < positions.length; i += 3) {
        // Expand the sphere so particles fly around the camera at (0,0,1000)
        const r = 800 + Math.random() * 1200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = r * Math.cos(phi);

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Fill vertex colors from the correct palette for the active theme.
    // Uses pre-seeded particleRands so the per-particle color bucket never changes.
    function fillParticleColors(dark) {
        const cMain = dark ? dark_colorMain : light_colorMain;
        const cAccent = dark ? dark_colorAccent : light_colorAccent;
        const cDeep = dark ? dark_colorDeep : light_colorDeep;
        for (let p = 0; p < particleCount; p++) {
            const rand = particleRands[p];
            const c = rand > 0.20 ? cMain : rand > 0.05 ? cAccent : cDeep;
            colors[p * 3] = c.r;
            colors[p * 3 + 1] = c.g;
            colors[p * 3 + 2] = c.b;
        }
        geometry.attributes.color.needsUpdate = true;
    }

    const isDark = document.documentElement.classList.contains('dark');

    // Seed initial colors
    fillParticleColors(isDark);

    const material = new THREE.PointsMaterial({
        size: 40.0, // Scale so the radial bloom resolves beautifully
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        sizeAttenuation: true,
        blending: THREE.NormalBlending,
        depthWrite: false
    });

    // In light mode, tint the material with a deep blue so the HDR intensity multiplier
    // can never blow the RGB channels into white — the tint clamps R & G to safe levels.
    if (!isDark) {
        material.color.set(0x4466ff); // Blue tint: R=0.27, G=0.40, B=1.0 — maxes out at vivid blue
        material.opacity = 1.0;
    }

    // Custom shader injection for HDR depth brightness, gloom/blur, and alpha fading
    material.onBeforeCompile = (shader) => {
        shader.vertexShader = `
            varying float vDepth;
            varying float vAlphaFade;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            `#include <project_vertex>`,
            `#include <project_vertex>
             vDepth = - mvPosition.z;
             
             // Distance ratio (0.0 when far away, up to 2.0 when right at camera plane)
             float distRatio = max(0.0, (1000.0 - vDepth) / 500.0);
             
             // Bloom effect: Near-camera particles expand their glow area massively 
             // to allow the fragment shader to render a wide, blurred gloom effect.
             gl_PointSize *= ( 1.0 + 3.0 * pow(distRatio, 2.8) );
             
             // Fade out particles that get too close to the screen, but keep them semi-transparent
             vAlphaFade = mix(0.2, 1.0, smoothstep(50.0, 600.0, vDepth));`
        );

        shader.fragmentShader = `
            varying float vDepth;
            varying float vAlphaFade;
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
            `#include <color_fragment>`,
            `#include <color_fragment>
              // Distance metric for close-up HDR effects
              float distRatio = max(0.0, (1000.0 - vDepth) / 500.0);

              // HDR distance multiplier: objects closer than the camera plane shine like brilliant stars
              // Exponential intensity creates vibrant blooming hot-spots
              float intensity = 1.0 + 15.0 * pow(distRatio, 3.2);
              
              // Procedural Blur & Gloom for particles entering bounds near camera
              // We map gl_PointCoord to center
              vec2 pCoord = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y) - 0.5;
              
              // Calculate distances to morph from crisp Square (far) to soft Radial Bloom (near)
              float dSq = max(abs(pCoord.x), abs(pCoord.y)) * 2.0;
              float dRad = length(pCoord) * 2.0;
              
              // As the particle gets closer, we heavily blur the edges into a radial bloom/gloom halo
              // The smoothstep 'edge' drops as the particle gets closer, mathematically softening it.
              float bloomSoftness = mix(1.0, 0.1, min(1.0, distRatio * 1.2)); 
              float morphToRadial = min(1.0, distRatio * 1.5);
              
              float gloomAlpha = 1.0 - smoothstep(bloomSoftness - 0.1, 1.0, mix(dSq, dRad, morphToRadial));

              diffuseColor.rgb *= intensity;
              
              // Apply the gloom blur mix. Distant stars use original texture alpha; near stars are overtaken by the radial bloom halo.
              diffuseColor.a *= vAlphaFade * mix(1.0, gloomAlpha, min(1.0, distRatio * 2.0));
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

        targetX = mouseX * 0.28;  // middle-ground sensitivity
        targetY = mouseY * 0.28;

        // Rotate the unified scene (minimal idle drift)
        particleSystem.rotation.x += 0.0001;
        particleSystem.rotation.y += 0.0002;

        // Camera gently drifts toward mouse
        camPosX += (targetX - camPosX) * 0.012;
        camPosY += (- targetY - camPosY) * 0.012;

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

    // Apply the correct opacity tint for initial theme
    if (!isDarkTheme()) material.opacity = 1.0;

    // Watch for theme toggle — re-seed vertex colors, reset material tint and opacity
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const dark = isDarkTheme();
                fillParticleColors(dark);
                if (dark) {
                    // Dark: white material tint (neutral), full opacity
                    material.color.set(0xffffff);
                    material.opacity = 1.0;
                } else {
                    // Light: blue tint prevents HDR blowout to white
                    material.color.set(0x4466ff);
                    material.opacity = 1.0;
                }
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
