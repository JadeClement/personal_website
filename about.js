let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

// Auto-rotate slides (pause on hover).
// Skip when the user prefers reduced motion.
const slideshowRoot = document.querySelector(".slideshow-container");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
let slideIntervalId = null;
const SLIDE_MS = 4000;

function startAutoRotate() {
  if (prefersReducedMotion) return;
  if (slideIntervalId) return;
  slideIntervalId = setInterval(() => {
    plusSlides(1);
  }, SLIDE_MS);
}

function stopAutoRotate() {
  if (!slideIntervalId) return;
  clearInterval(slideIntervalId);
  slideIntervalId = null;
}

if (slideshowRoot) {
  slideshowRoot.addEventListener("mouseenter", stopAutoRotate);
  slideshowRoot.addEventListener("mouseleave", startAutoRotate);
}

// Also stop when the tab is not visible (saves resources).
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoRotate();
  else startAutoRotate();
});

startAutoRotate();