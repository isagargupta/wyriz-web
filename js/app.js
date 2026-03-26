document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const PRELOADER_MIN = 2000;
        const t0 = Date.now();
        const hidePreloader = () => preloader.classList.add('hidden');
        if (document.readyState === 'complete') {
            const elapsed = Date.now() - t0;
            setTimeout(hidePreloader, Math.max(0, PRELOADER_MIN - elapsed) + 200);
        } else {
            window.addEventListener('load', () => {
                const elapsed = Date.now() - t0;
                setTimeout(hidePreloader, Math.max(0, PRELOADER_MIN - elapsed) + 200);
            });
        }
    }

    // --- Parallax & Glow Scroll Effect ---
    const header = document.querySelector('.glass-header');
    const topGlow = document.querySelector('.top-glow');
    const bottomGlow = document.querySelector('.bottom-glow');

    let scrollRAF = null;

    const handleScroll = () => {
        if (scrollRAF) return;
        scrollRAF = requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            // Header blur
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Glow parallax
            if (topGlow && bottomGlow) {
                topGlow.style.transform = `translateY(${scrollY * 0.15}px)`;
                bottomGlow.style.transform = `translateY(${-scrollY * 0.1}px) translateX(${scrollY * 0.05}px)`;
            }

            scrollRAF = null;
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger on load
    handleScroll();

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.querySelector('.menu-open-icon');
    const menuCloseIcon = document.querySelector('.menu-close-icon');
    const mdNavLinks = document.querySelectorAll('.md-nav-link');

    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
            menuOpenIcon.classList.add('hidden');
            menuCloseIcon.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
            menuOpenIcon.classList.remove('hidden');
            menuCloseIcon.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking a link
    if (mdNavLinks.length > 0) {
        mdNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isMenuOpen) toggleMenu();
            });
        });
    }

    // --- Intersection Observer for Scroll Animations ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- Smooth Scrolling for internal anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Custom Cursor Logic ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Only run cursor logic on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {

        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;

        // Listen for mouse movement
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Instantly move the dot using transform (GPU-accelerated)
            cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
        });

        // Use requestAnimationFrame for smooth outline chasing (lerping)
        const renderCursor = () => {
            const prevX = outlineX;
            const prevY = outlineY;
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;

            // Only write to DOM when position changed meaningfully
            if (Math.abs(outlineX - prevX) > 0.05 || Math.abs(outlineY - prevY) > 0.05) {
                cursorOutline.style.transform = `translate(calc(${outlineX}px - 50%), calc(${outlineY}px - 50%))`;
            }

            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        // Use event delegation for cursor hover — works on all elements including overlay buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, .service-card, .pricing-card')) {
                document.body.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, .service-card, .pricing-card')) {
                document.body.classList.remove('cursor-hover');
            }
        });
    }

    // --- Riz Voice Agent ---
    const RIZ_AGENT_ID = 'agent_5101kkrw1zhgfdtbrvpgzvrk6xd4';

    const rizBtn = document.getElementById('riz-voice-btn');
    const rizOverlay = document.getElementById('riz-overlay');
    const rizEndBtn = document.getElementById('riz-end-btn');
    const rizOrb = document.getElementById('riz-orb');
    const rizStatusText = document.getElementById('riz-status-text');

    let rizConversation = null;

    const STATUS_LABELS = {
        connecting: 'Connecting…',
        listening: 'Listening…',
        speaking: 'Riz is speaking…',
        idle: 'Say something…',
        disconnected: 'Session ended',
        error: 'Connection failed — try again',
        'mic-denied': 'Microphone access denied',
    };

    function setRizStatus(key) {
        if (!rizStatusText) return;
        rizStatusText.textContent = STATUS_LABELS[key] || key;
        rizStatusText.classList.toggle('active', key !== 'disconnected' && key !== 'error');
    }

    function setRizOrbMode(mode) {
        if (!rizOrb) return;
        rizOrb.classList.remove('listening', 'speaking');
        if (mode === 'listening') rizOrb.classList.add('listening');
        if (mode === 'speaking') rizOrb.classList.add('speaking');
    }

    function openRizOverlay() {
        rizOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeRizOverlay() {
        rizOverlay.classList.remove('active');
        document.body.style.overflow = '';
        setRizOrbMode('idle');
    }

    async function startRizConversation() {
        if (rizConversation) return;

        openRizOverlay();
        setRizStatus('connecting');
        setRizOrbMode('idle');

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });

            const { Conversation } = await import('https://cdn.jsdelivr.net/npm/@elevenlabs/client@0.15.1/+esm');

            rizConversation = await Conversation.startSession({
                agentId: RIZ_AGENT_ID,
                connectionType: 'webrtc',
                onConnect: () => {
                    setRizStatus('listening');
                },
                onDisconnect: () => {
                    setRizOrbMode('idle');
                    setRizStatus('disconnected');
                    rizConversation = null;
                    setTimeout(closeRizOverlay, 1800);
                },
                onModeChange: ({ mode }) => {
                    setRizOrbMode(mode);
                    setRizStatus(mode);
                },
                onError: (err) => {
                    console.error('[Riz]', err);
                    setRizStatus('error');
                },
            });

        } catch (err) {
            console.error('[Riz] Failed to start session:', err);
            setRizStatus(err && err.name === 'NotAllowedError' ? 'mic-denied' : 'error');
        }
    }

    async function endRizConversation() {
        if (rizConversation) {
            try { await rizConversation.endSession(); } catch (_) { }
            rizConversation = null;
        }
        closeRizOverlay();
    }

    if (rizBtn) rizBtn.addEventListener('click', startRizConversation);
    if (rizEndBtn) rizEndBtn.addEventListener('click', endRizConversation);

    // Header voice buttons (desktop + mobile)
    const headerRizBtn = document.getElementById('header-riz-btn');
    if (headerRizBtn) headerRizBtn.addEventListener('click', startRizConversation);
    document.querySelectorAll('.mobile-riz-btn').forEach(btn => {
        btn.addEventListener('click', startRizConversation);
    });

    if (rizOverlay) {
        rizOverlay.addEventListener('click', (e) => {
            if (e.target === rizOverlay) endRizConversation();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && rizOverlay && rizOverlay.classList.contains('active')) {
            endRizConversation();
        }
    });

    // --- Card Spotlight Mouse Tracking ---
    // Activates the radial gradient spotlight that follows the cursor on service/pricing cards
    document.querySelectorAll('.service-card, .pricing-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // --- Stat Counter Animation ---
    // Counts numbers up when the results section scrolls into view
    const statCounters = document.querySelectorAll('.stat-counter');
    if (statCounters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const prefix = el.dataset.prefix || '';
                const suffix = el.dataset.suffix || '';
                const duration = 1600;
                const startTime = performance.now();

                const tick = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic for natural deceleration
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);
                    el.textContent = prefix + current + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            });
        }, { threshold: 0.7 });

        statCounters.forEach(el => counterObserver.observe(el));
    }

});
