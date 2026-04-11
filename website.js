
//print(document.URL)
document.getElementsByClassName("header").innerHTML = "Hello World";

const headingEl = document.getElementById("heading");
if (headingEl) {
    headingEl.innerHTML = `
    <nav class="navbar">
        <div class="name_title nav_section">Jade Clement</div>
        <div class="navbar__container">
            <ul class="navbar__menu nav_section" id="navbar-menu">
                <li class="navbar_item">
                    <a href="./website.html" class="navbar__links" id="main-page">Home</a>
                </li>
                <li class="navbar_item">
                    <a href="./education.html" class="navbar__links" id="edu-page">Education</a>
                </li>
                <li class="navbar_item">
                    <a href="./projects.html" class="navbar__links" id="home-page">Experience</a>
                </li>
                <li class="navbar_item">
                    <a href="./about.html" class="navbar__links" id="about-page">About Me</a>
                </li>
            </ul>
        </div>
        <div class="navbar__toggle" id="mobile-menu" role="button" tabindex="0" aria-label="Open menu" aria-expanded="false" aria-controls="navbar-menu">
            <span class="navbar__toggle-bars" aria-hidden="true">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </span>
            <svg class="navbar__toggle-x" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <line x1="5" y1="5" x2="19" y2="19" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
                <line x1="19" y1="5" x2="5" y2="19" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
            </svg>
        </div>
    </nav>
`;
}

const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".navbar__menu")
const nav = document.querySelector(".navbar")
const name1 = document.querySelector(".name_title");

function setActiveNavLink() {
    const links = document.querySelectorAll(".navbar__links");
    if (!links.length) return;

    // Match current page by filename (e.g. "projects.html").
    // Treat "index.html" and "/" as the "Home" page.
    const pathname = (window.location.pathname || "").trim();
    let currentFile = pathname.replace(/\/+$/, "").split("/").pop() || "";
    if (!currentFile || currentFile === "/" || currentFile === "index.html") {
        currentFile = "website.html";
    }

    let anyActive = false;
    links.forEach((link) => {
        const hrefAttr = link.getAttribute("href") || "";
        let targetFile = "";
        try {
            targetFile = new URL(hrefAttr, window.location.href).pathname.split("/").pop() || "";
        } catch {
            targetFile = hrefAttr.split("/").pop() || "";
        }

        const isActive = currentFile === targetFile;
        link.classList.toggle("navbar__links--active", isActive);
        if (isActive) {
            anyActive = true;
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    // If we still couldn't match anything, default to Home.
    if (!anyActive) {
        const homeLink = document.getElementById("main-page") || document.querySelector('.navbar__links[href*="website.html"]');
        if (homeLink) {
            homeLink.classList.add("navbar__links--active");
            homeLink.setAttribute("aria-current", "page");
        }
    }
}


// Mobile nav breakpoint must match `website.css` (hamburger + collapsible menu).
const MOBILE_NAV_MQ = window.matchMedia("(max-width: 1200px)");

/** Close the mobile drawer if it is open (idempotent). */
function closeMobileMenu() {
    if (!menu || !menuLinks || !nav || !name1) return;
    if (!menu.classList.contains("is-activating")) return;
    menu.classList.remove("is-activating");
    menuLinks.classList.remove("activating");
    nav.classList.remove("activated");
    nav.removeAttribute("data-menu-open");
    name1.classList.remove("hide");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open menu");
    menuLinks.style.maxHeight = "";
}

function closeMobileMenuIfDesktop() {
    /* Only reset when leaving the mobile layout (wider than breakpoint). */
    if (MOBILE_NAV_MQ.matches) return;
    closeMobileMenu();
}

// display mobile menu (toggle hamburger / X)
const mobileMenu = () => {
    if (!menu || !menuLinks || !nav || !name1) return;
    if (!MOBILE_NAV_MQ.matches) return;

    const isOpen = menu.classList.toggle("is-activating");
    menuLinks.classList.toggle("activating", isOpen);
    nav.classList.toggle("activated", isOpen);
    if (isOpen) {
        nav.setAttribute("data-menu-open", "true");
    } else {
        nav.removeAttribute("data-menu-open");
    }
    name1.classList.toggle("hide", isOpen);
    menu.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menu.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
};

if (menu) {
    menu.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        mobileMenu();
    });
    menu.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            mobileMenu();
        }
    });
}

MOBILE_NAV_MQ.addEventListener?.("change", closeMobileMenuIfDesktop);
// Safari < 14
if (!MOBILE_NAV_MQ.addEventListener) {
    MOBILE_NAV_MQ.addListener(closeMobileMenuIfDesktop);
}

setActiveNavLink();

// Collapse mobile menu when any nav link is clicked (delegation = reliable on all pages).
if (nav) {
    nav.addEventListener(
        "click",
        (e) => {
            const a = e.target.closest("a.navbar__links");
            if (!a || !nav.contains(a)) return;
            closeMobileMenu();
        },
        true
    );
}

// Inject shared footer links on all pages.
// Some pages load `website.js` before the `.footer` element exists, so we inject after DOM is ready.
const emailAddress = "jadecathclement@gmail.com";
const linkedInUrl = "https://www.linkedin.com/in/jadeclement-888/";
const instagramUrl = "https://www.instagram.com/jadeclement__/";
const resumeUrl = "Jade_Resume.pdf";

function injectFooterLinks() {
    const footerHtml = `
        <div class="footer_content">
            <div class="footer_connect_icons" aria-label="Contact links">
                <a class="footer_connect_icon" href="mailto:${emailAddress}" aria-label="Email Jade Clement">
                    <img class="footer_icon_img" src="images/mail.png" alt="" />
                </a>
                <a class="footer_connect_icon" href="${linkedInUrl}" target="_blank" rel="noopener noreferrer" aria-label="Jade Clement on LinkedIn">
                    <img class="footer_icon_img" src="images/linkedin.png" alt="" />
                </a>
                <a class="footer_connect_icon" href="${instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Jade Clement on Instagram">
                    <img class="footer_icon_img" src="images/instagram.png" alt="" />
                </a>
                <a class="footer_connect_icon footer_resume_icon" href="${resumeUrl}" target="_blank" rel="noopener noreferrer" aria-label="Jade Clement Resume">
                    <img class="footer_icon_img" src="images/resume-7.png" alt="" />
                </a>
            </div>
            <div class="footer_connect_line">
                Whether you want to work with me, grab coffee and chat, or climb a mountain together,<br>
                I love creating new connections and I can't wait to meet you!
            </div>
        </div>
    `;

    document.querySelectorAll(".footer").forEach((footer) => {
        footer.innerHTML = footerHtml;
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectFooterLinks);
} else {
    injectFooterLinks();
}

// Rotating typewriter title (home page only).
function initRoleTypewriter() {
    const roleEl = document.getElementById("typed-role");
    if (!roleEl) return; // only exists on the home page

    const roles = [
        "ML Engineer",
        "AI Safety Researcher",
        "Full-Stack Developer",
        "Triathlete",
        "Uoft Engineering Science Student",
    ];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        roleEl.textContent = roles[0];
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    // Speeds tuned to feel snappy without being distracting.
    const typeSpeedMs = 70;
    const deleteSpeedMs = 45;
    const pauseAfterTypeMs = 1200;
    const pauseAfterDeleteMs = 450;

    function tick() {
        const currentRole = roles[roleIndex];

        if (!isDeleting) {
            charIndex++;
            roleEl.textContent = currentRole.slice(0, charIndex);

            if (charIndex >= currentRole.length) {
                isDeleting = true;
                window.setTimeout(tick, pauseAfterTypeMs);
                return;
            }

            window.setTimeout(tick, typeSpeedMs);
            return;
        }

        // deleting
        charIndex--;
        roleEl.textContent = currentRole.slice(0, Math.max(0, charIndex));

        if (charIndex <= 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            window.setTimeout(tick, pauseAfterDeleteMs);
            return;
        }

        window.setTimeout(tick, deleteSpeedMs);
    }

    tick();
}

// Defer until DOM is ready (safe even though the script tag is `defer`).
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRoleTypewriter);
} else {
    initRoleTypewriter();
}

/**
 * Whether flip cards should use mouseenter/mouseleave “peek” (desktop mouse/trackpad).
 * Uses only CSS interaction media — never viewport width — to infer touch-first vs fine-pointer:
 * - (pointer: coarse) → finger is primary (typical phone / iPad touch)
 * - (hover: none) → no reliable hover (same class of devices)
 * MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
 */
function flipCardsShouldUseHoverPeek() {
    if (typeof window.matchMedia !== "function") return false;
    if (window.matchMedia("(pointer: coarse)").matches) return false;
    if (window.matchMedia("(hover: none)").matches) return false;
    return (
        window.matchMedia("(hover: hover)").matches &&
        window.matchMedia("(pointer: fine)").matches
    );
}

// Flip cards: tap/click always toggles `.is-flipped`. Hover peek uses `.flip-card--hover` only when flipCardsShouldUseHoverPeek().
function initTapFlipCards() {
    const flipCards = document.querySelectorAll(".recently_cards .flip-card");
    if (!flipCards.length) return;

    const canHoverPeek = flipCardsShouldUseHoverPeek();

    flipCards.forEach((card) => {
        if (!card.hasAttribute("aria-expanded")) card.setAttribute("aria-expanded", "false");

        const updateAriaExpanded = () => {
            const showingBack =
                card.classList.contains("is-flipped") || card.classList.contains("flip-card--hover");
            card.setAttribute("aria-expanded", String(showingBack));
        };

        const toggleFlip = () => {
            card.classList.toggle("is-flipped");
            updateAriaExpanded();
        };

        if (canHoverPeek) {
            card.addEventListener("mouseenter", () => {
                card.classList.add("flip-card--hover");
                updateAriaExpanded();
            });
            card.addEventListener("mouseleave", () => {
                card.classList.remove("flip-card--hover");
                updateAriaExpanded();
            });
        }

        card.addEventListener("click", () => {
            toggleFlip();
        });

        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFlip();
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTapFlipCards);
} else {
    initTapFlipCards();
}

// Automatic image loading strategy across all pages.
// - Keep the first important in-view image eager for fast paint.
// - Load the rest lazily and decode asynchronously.
function initAutoImageLoading() {
    const images = Array.from(document.querySelectorAll("img"));
    if (!images.length) return;

    // Prefer obvious hero/profile images as high-priority if present.
    const prioritySelectors = [
        "#mountain_img",
        "#profile_img",
        ".animated_image",
        ".mySlides img",
        ".school_icon",
    ];

    let priorityImage = null;
    for (const selector of prioritySelectors) {
        const match = document.querySelector(selector);
        if (match && match.tagName === "IMG") {
            priorityImage = match;
            break;
        }
    }
    if (!priorityImage) priorityImage = images[0];

    images.forEach((img) => {
        // Respect any explicit per-image overrides already set in HTML.
        if (!img.hasAttribute("decoding")) {
            img.setAttribute("decoding", "async");
        }

        if (img === priorityImage) {
            if (!img.hasAttribute("loading")) {
                img.setAttribute("loading", "eager");
            }
            if (!img.hasAttribute("fetchpriority")) {
                img.setAttribute("fetchpriority", "high");
            }
            return;
        }

        if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", "lazy");
        }
        if (!img.hasAttribute("fetchpriority")) {
            img.setAttribute("fetchpriority", "low");
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoImageLoading);
} else {
    initAutoImageLoading();
}

