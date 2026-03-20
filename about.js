let slideIndex = 1;

function layoutSlideshowTrack() {
  const track = document.querySelector(".slideshow-track");
  const slides = document.getElementsByClassName("mySlides");
  if (!track || !slides.length) return;
  const n = slides.length;
  track.style.width = `${n * 100}%`;
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.flex = `0 0 ${100 / n}%`;
  }
}

layoutSlideshowTrack();
showSlides(slideIndex);

function plusSlides(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function setActiveCaption(n) {
  const captions = document.querySelectorAll(".about-slide-caption[data-slide]");
  captions.forEach((el) => {
    const idx = parseInt(el.getAttribute("data-slide"), 10);
    if (!Number.isNaN(idx) && idx === n) el.classList.add("is-active");
    else el.classList.remove("is-active");
  });
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  const track = document.querySelector(".slideshow-track");
  if (!slides.length || !track) return;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  const pct = ((slideIndex - 1) / slides.length) * 100;
  track.style.transform = `translateX(-${pct}%)`;
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  if (dots[slideIndex-1]) dots[slideIndex-1].className += " active";
  setActiveCaption(slideIndex);
}

const slideshowRoot = document.querySelector(".slideshow-container");
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
let slideIntervalId = null;
const SLIDE_MS = 3000;

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

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoRotate();
  else startAutoRotate();
});

startAutoRotate();