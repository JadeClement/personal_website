
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
    // Treat "index.html" as the "Home" page.
    let currentFile = (window.location.pathname || "").split("/").pop() || "";
    if (currentFile === "index.html") currentFile = "website.html";

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
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
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

