(function() {
    /* ─── First page: scroll lock until all pictures seen, then slow scroll ─── */
    const FIRST_PAGE_CONFIG = {
        pictureViewports: 5,     /* How many viewports to scroll through all 5 pictures */
        scrollSpeedFactor: 0.6   /* Wheel delta * this = px scrolled */
    };

    /* ─── Icon fall animation config (easy to tweak) ─── */
    const FALL_CONFIG = {
        delayMinMs: 0,
        delayMaxMs: 400,
        overshootPx: 5
    };

    const IDENTITIES = ['student', 'developer', 'triathlete', 'creator', 'adventurer'];
    const IMAGE_MAP = {
        student: 'img1.PNG',
        developer: 'img4.PNG',
        triathlete: 'img5.PNG',
        creator: 'img6.PNG',
        adventurer: 'mountain1.jpg'
    };

    const rotatingWord = document.getElementById('rotating-word');
    const centerImage = document.getElementById('center-image');
    const centerVisual = document.getElementById('center-visual');
    const heroBgImage = document.getElementById('hero-bg-image');
    const hero = document.getElementById('hero');
    const iconsOrbit = document.getElementById('icons-orbit');
    const introText = document.querySelector('.intro-text');

    // Landing icon elements - order matches scroll landing sequence
    const landingIconIds = ['developer-icon-landing', 'student-icon-landing', 'triathlete-icon-landing', 'creator-icon-landing', 'adventurer-icon-landing'];
    const landingIcons = landingIconIds.map(id => document.getElementById(id)?.querySelector('.landing-icon'));

    let lastIdentityIndex = -1;

    // Update identity based on scroll (pictures change as user scrolls through them)
    function updateIdentityFromScroll(scrollY, windowHeight) {
        const pictureScrollStart = 350;  /* Match effectMaxScroll - orbit appears here */
        const pictureScrollEnd = windowHeight * FIRST_PAGE_CONFIG.pictureViewports;
        if (scrollY < pictureScrollStart) return;

        const pictureRange = pictureScrollEnd - pictureScrollStart;
        const scrollIntoPictures = Math.min(scrollY - pictureScrollStart, pictureRange);
        const progress = pictureRange > 0 ? scrollIntoPictures / pictureRange : 0;
        const identityIndex = Math.min(Math.floor(progress * IDENTITIES.length), IDENTITIES.length - 1);

        if (identityIndex !== lastIdentityIndex) {
            lastIdentityIndex = identityIndex;
            const identity = IDENTITIES[identityIndex];
            const displayName = identity.charAt(0).toUpperCase() + identity.slice(1);

            rotatingWord.style.opacity = '0';
            setTimeout(() => {
                rotatingWord.textContent = displayName;
                rotatingWord.style.opacity = '1';
            }, 150);

            const imgPath = IMAGE_MAP[identity];
            if (imgPath) {
                centerImage.style.opacity = '0';
                setTimeout(() => {
                    centerImage.src = imgPath;
                    centerImage.alt = displayName;
                    centerImage.style.opacity = '1';
                }, 150);
            }
        }
    }

    // Scroll-based effects
    function handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Fade, shrink, and circular crop the full-viewport mountain image as user scrolls
        const effectMaxScroll = 350;  /* Orbit/center appear at 350px - gives time to see icons before fall */
        const progress = Math.min(scrollY / effectMaxScroll, 1);
        const opacity = 1 - progress; // Fade from 100% to 0% (fully transparent)
        const scale = 1 - progress * 0.7; // Shrink from 100% to 30%
        const borderRadius = progress * 50; // 0% -> 50% (rectangle edges round to circle)

        if (heroBgImage) {
            heroBgImage.style.opacity = opacity;
            heroBgImage.style.transform = `scale(${scale})`;
            heroBgImage.style.borderRadius = `${borderRadius}%`;
        }

        // Icons and center visual only appear when the circle is completely transparent
        const showIconsAndCenter = progress >= 1;

        if (centerVisual) {
            if (showIconsAndCenter) {
                centerVisual.classList.add('visible');
                centerVisual.style.transform = 'translate(-50%, -50%)';
            } else {
                centerVisual.classList.remove('visible');
                centerVisual.style.transform = 'translate(-50%, -50%)';
            }
        }

        if (hero) {
            if (showIconsAndCenter) {
                hero.classList.add('icons-visible');
            } else {
                hero.classList.remove('icons-visible');
            }
        }

        // Picture and text change based on scroll (user scrolls through each identity)
        if (showIconsAndCenter) {
            updateIdentityFromScroll(scrollY, windowHeight);
        }

        // Move intro text up as picture shrinks so it stays visible above the center visual
        if (introText) {
            const moveUp = progress * 120; // Move up 120px max - keeps text visible, avoids clipping
            introText.style.transform = `translateY(-${moveUp}px)`;
        }

        // Dock + fall trigger when picture cycle completes (5 viewports)
        const scrollAwayThreshold = windowHeight * FIRST_PAGE_CONFIG.pictureViewports;
        const dockVisible = scrollY >= scrollAwayThreshold;
        document.body.classList.toggle('dock-visible', dockVisible);

        // Trigger fall: add icons-fall-triggered next frame so browser paints starting position before animation
        if (scrollY >= scrollAwayThreshold && !document.body.classList.contains('icons-fall-triggered')) {
            requestAnimationFrame(() => {
                document.body.classList.add('icons-fall-triggered');
            });
        }

        // Horizontal carousel - scroll drives position, no overlap, uses more space
        const carouselTrack = document.getElementById('carousel-track');
        const carouselContainer = document.getElementById('carousel-3d');
        const developerWrapper = document.getElementById('developer-sticky-wrapper');
        if (carouselTrack && carouselContainer && developerWrapper) {
            const wrapperTop = developerWrapper.offsetTop;
            const scrollDistance = 2400;
            const progress = Math.min(1, Math.max(0, (scrollY - wrapperTop) / scrollDistance));
            const cards = carouselTrack.querySelectorAll('.carousel-card');
            const numCards = cards.length;
            const cardWidth = cards[0]?.offsetWidth ?? 300;
            const gap = parseFloat(getComputedStyle(carouselTrack).gap) || 40;
            const trackWidth = numCards * cardWidth + (numCards - 1) * gap;
            const containerWidth = carouselContainer.clientWidth;
            const maxTranslate = Math.max(0, trackWidth - containerWidth);

            // Center the active card: progress 0 = first card, progress 1 = last card
            const activeIndex = progress * (numCards - 1);
            const targetScroll = activeIndex * (cardWidth + gap);
            const translateX = containerWidth / 2 - (targetScroll + cardWidth / 2);
            const clampedX = Math.max(-maxTranslate, Math.min(0, translateX));

            carouselTrack.style.transform = `translateX(${clampedX}px)`;

            cards.forEach((card, i) => {
                const offset = i - progress * (numCards - 1);
                const centerFactor = Math.max(0, 1 - Math.abs(offset) * 0.4);
                const scale = 0.88 + 0.12 * centerFactor;
                const opacity = 0.7 + 0.3 * centerFactor;

                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                card.classList.toggle('active', Math.abs(offset) < 0.5);
            });
        }

        // Landing icons fall into place based on scroll position
        const landingSection = document.getElementById('landing-sections');
        if (!landingSection) return;

        // Each icon lands when its row comes into view
        const rows = landingSection.querySelectorAll('.landing-row');
        rows.forEach((row, index) => {
            const icon = landingIcons[index];
            if (!icon) return;

            const rowRect = row.getBoundingClientRect();
            const rowTop = rowRect.top;

            // Icon "lands" when the row is in view - visible at bottom, then locks into place
            const landThreshold = windowHeight * 0.85;
            const hasLanded = rowTop < landThreshold;

            if (hasLanded) {
                icon.classList.remove('falling');
                icon.classList.add('landed');
            } else {
                icon.classList.add('falling');
                icon.classList.remove('landed');
            }
        });
    }

    // Assign random fall delay to each icon (0–400ms)
    function initLandingIcons() {
        const { delayMinMs, delayMaxMs } = FALL_CONFIG;
        landingIcons.forEach(icon => {
            if (icon) {
                icon.classList.add('falling');
                const delayMs = delayMinMs + Math.random() * (delayMaxMs - delayMinMs);
                icon.style.setProperty('--fall-delay', `${delayMs}ms`);
            }
        });
    }

    // IntersectionObserver: trigger fall when sentinel enters viewport
    function setupFallTrigger() {
        const sentinel = document.getElementById('fall-trigger-sentinel');
        if (!sentinel) return;

        let observer;
        function triggerFall() {
            document.body.classList.add('icons-fall-triggered');
            if (observer) observer.disconnect();
        }

        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        triggerFall();
                        break;
                    }
                }
            },
            { threshold: 0, rootMargin: '0px' }
        );
        observer.observe(sentinel);

        // Fallback: if already scrolled past (e.g. refresh while scrolled), trigger immediately
        if (window.scrollY >= window.innerHeight * FIRST_PAGE_CONFIG.pictureViewports) triggerFall();
    }

    // Throttled scroll handler
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Scroll lock: can't scroll past first page until all pictures seen; slow scroll speed
    function setupScrollLock() {
        const pictureScrollStart = 350;
        function getScrollLockThreshold() {
            return window.innerHeight * FIRST_PAGE_CONFIG.pictureViewports;
        }

        function onWheel(e) {
            const scrollY = window.scrollY;
            const threshold = getScrollLockThreshold();
            if (scrollY >= threshold) return; /* Past first page - allow normal scroll */

            e.preventDefault();
            const delta = e.deltaY;
            const speed = FIRST_PAGE_CONFIG.scrollSpeedFactor;
            const newScroll = Math.max(0, Math.min(scrollY + delta * speed, threshold));
            window.scrollTo(0, newScroll);
        }

        document.addEventListener('wheel', onWheel, { passive: false });
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        initLandingIcons();
        setupFallTrigger();
        setupScrollLock();

        // Set initial image and text
        centerImage.src = IMAGE_MAP.student;
        centerImage.alt = 'Student';
        rotatingWord.textContent = 'Student';

        window.addEventListener('scroll', onScroll);
        handleScroll(); // Initial call
    });
})();
