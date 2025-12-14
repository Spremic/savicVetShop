// legal.js - JavaScript funkcionalnosti za legal stranicu

document.addEventListener('DOMContentLoaded', function() {
  // Active link highlighting on scroll
  const sections = document.querySelectorAll('#legalContainer section[id]');
  const tocLinks = document.querySelectorAll('#legalContainer .toc a');
  
  if (sections.length === 0 || tocLinks.length === 0) {
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Also highlight on click
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      tocLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('#legalContainer a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
});
