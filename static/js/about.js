document.addEventListener("DOMContentLoaded", function () {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.getAttribute("data-animation") || "animate__fadeInUp";
        const delay = element.getAttribute("data-delay") || "0s";
        
        element.style.animationDelay = delay;
        element.classList.add("animate__animated", animation);
        element.style.opacity = "1"; // Ensure element is visible after animation starts
        
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
  elementsToAnimate.forEach((el) => {
    el.style.opacity = "0"; // Hide initially
    observer.observe(el);
  });
});
