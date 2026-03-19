let slideIndex = 1;
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
  setActiveCaption(slideIndex);
}

function setupScrollSync() {
  const captions = Array.from(document.querySelectorAll(".about-slide-caption[data-slide]"));
  if (captions.length === 0) return;
  if (!("IntersectionObserver" in window)) return;

  // The slideshow is sticky at `top: 20vh`, so we sync to the caption closest to that Y position.
  let targetY = window.innerHeight * 0.2;
  const distanceToTarget = new Map(); // slideIndex -> distance

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const idx = parseInt(entry.target.getAttribute("data-slide"), 10);
        if (Number.isNaN(idx)) continue;

        if (entry.isIntersecting) {
          const top = entry.boundingClientRect.top;
          distanceToTarget.set(idx, Math.abs(top - targetY));
        } else {
          distanceToTarget.delete(idx);
        }
      }

      if (distanceToTarget.size === 0) return;

      let bestIdx = slideIndex;
      let bestDist = Infinity;
      for (const [idx, dist] of distanceToTarget.entries()) {
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }

      if (bestIdx !== slideIndex) currentSlide(bestIdx);
    },
    {
      root: null,
      rootMargin: "-20vh 0px -60vh 0px",
      threshold: [0.05, 0.1, 0.25, 0.5, 0.75],
    }
  );

  captions.forEach((el) => observer.observe(el));

  window.addEventListener("resize", () => {
    targetY = window.innerHeight * 0.2;
    distanceToTarget.clear();
  });
}

setupScrollSync();