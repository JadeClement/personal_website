
//print(document.URL)
document.getElementsByClassName("header").innerHTML = "Hello World";

document.getElementById("heading").innerHTML = `
    <nav class = "navbar">
    <div class="name_title nav_section ">Jade Clement</div>
    <div class = "navbar_container"></div>
        <div class="navbar__toggle" id="mobile-menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <ul class="navbar__menu nav_section">
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
            <li class="navbar_item">
                <a href="./connect.html" class="navbar__links" id="connect-page">Connect</a>
            </li>
            
        </ul>
    </div>
    </nav>
`;

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


//display mobile menu
const mobileMenu = () => {
    // Keep in sync with `#mobile-menu.is-activating` styles in `website.css`
    menu.classList.toggle("is-activating")
    menuLinks.classList.toggle("activating")
    nav.classList.toggle("activated")
    name1.classList.toggle('hide')
}

menu.addEventListener("click", mobileMenu);

setActiveNavLink();

// Inject shared footer links on all pages.
// Some pages load `website.js` before the `.footer` element exists, so we inject after DOM is ready.
const emailAddress = "jadecathclement@gmail.com";
const linkedInUrl = "https://www.linkedin.com/in/jadeclement-888/";

function injectFooterLinks() {
    const footerHtml = `
        <div class="footer_links">
            <a class="footer_link" href="mailto:${emailAddress}" aria-label="Email Jade Clement">${emailAddress}</a>
            <span class="footer_separator">|</span>
            <a class="footer_link" href="${linkedInUrl}" target="_blank" rel="noopener noreferrer" aria-label="Jade Clement on LinkedIn">LinkedIn</a>
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

// Flip cards on mobile tap.
function initTapFlipCards() {
    const flipCards = document.querySelectorAll(".recently_cards .flip-card");
    if (!flipCards.length) return;

    flipCards.forEach((card) => {
        // Default state for assistive technologies.
        if (!card.hasAttribute("aria-expanded")) card.setAttribute("aria-expanded", "false");

        const toggleFlip = () => {
            const isFlipped = card.classList.toggle("is-flipped");
            card.setAttribute("aria-expanded", String(isFlipped));
        };

        card.addEventListener("click", (e) => {
            // If the browser handles this as a “click after scroll”, it won't fire; safe to toggle on click.
            toggleFlip();
        });

        // Keyboard support (Enter/Space), since cards are focusable via `tabindex="0"`.
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

// Responsive hero title lift (home page only).
function initIntroTitleLift() {
    const introLine = document.querySelector(".intro_line");
    if (!introLine) return;

    const startWidthPx = 1000;
    const pixelsUpPerPxWidthDecrease = 10 / 40; // 10px up per 40px width decrease
    const maxLiftPx = 400; // safety cap so it doesn't drift off-screen

    function update() {
        const width = window.innerWidth;
        const widthDecrease = startWidthPx - width; // positive when below startWidthPx
        const rawLiftPx = widthDecrease * pixelsUpPerPxWidthDecrease;
        const liftPx = Math.max(0, Math.min(maxLiftPx, rawLiftPx));
        // Move the entire hero title upwards smoothly by adjusting the Y translate.
        introLine.style.transform = `translateY(${-liftPx}px)`;
    }

    update();
    window.addEventListener("resize", update);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIntroTitleLift);
} else {
    initIntroTitleLift();
}

