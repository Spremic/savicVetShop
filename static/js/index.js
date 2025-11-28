// Header scroll effect
window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Mega dropdown menu
document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.querySelector(".dropdown");
  
  if (dropdown) {
    const menu = dropdown.querySelector(".mega-dropdown");
    
    dropdown.addEventListener("mouseenter", function () {
      if (menu) {
        menu.style.display = "block";
        setTimeout(() => {
          menu.style.opacity = "1";
          menu.style.visibility = "visible";
        }, 10);
      }
    });

    dropdown.addEventListener("mouseleave", function () {
      if (menu) {
        menu.style.opacity = "0";
        menu.style.visibility = "hidden";
        setTimeout(() => {
          menu.style.display = "none";
        }, 400);
      }
    });
  }

  // Add to cart animation
  const cartButtons = document.querySelectorAll(".add-to-cart");
  const cartIcon = document.querySelector("#openCart");

  cartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Get button position
      const buttonRect = button.getBoundingClientRect();
      const buttonX = buttonRect.left + buttonRect.width / 2;
      const buttonY = buttonRect.top + buttonRect.height / 2;

      // Get cart position
      const cartRect = cartIcon.getBoundingClientRect();
      const cartX = cartRect.left + cartRect.width / 2;
      const cartY = cartRect.top + cartRect.height / 2;

      // Create flying element
      const flyingElement = document.createElement("div");
      flyingElement.className = "flying-item";
      flyingElement.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none"><path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#009900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
      document.body.appendChild(flyingElement);

      // Set initial position
      flyingElement.style.position = "fixed";
      flyingElement.style.left = buttonX + "px";
      flyingElement.style.top = buttonY + "px";
      flyingElement.style.pointerEvents = "none";
      flyingElement.style.zIndex = "9999";

      // Trigger animation
      setTimeout(() => {
        flyingElement.style.transition =
          "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        flyingElement.style.left = cartX + "px";
        flyingElement.style.top = cartY + "px";
        flyingElement.style.opacity = "0";
        flyingElement.style.transform = "scale(0.3)";
      }, 10);

      // Add cart button animation
      button.classList.add("adding");
      setTimeout(() => {
        button.classList.remove("adding");
      }, 600);

      // Add pulse effect to cart
      cartIcon.style.animation = "cartNotify 0.6s ease";
      setTimeout(() => {
        cartIcon.style.animation = "";
      }, 600);

      // Remove flying element after animation
      setTimeout(() => {
        flyingElement.remove();
      }, 800);
    });
  });
});

// Add styles for flying item
const style = document.createElement("style");
style.textContent = `
  .flying-item {
    display: grid;
    place-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(0, 153, 0, 0.3), rgba(0, 153, 0, 0.1));
    border: 2px solid #009900;
    border-radius: 50%;
  }

  .flying-item svg {
    filter: drop-shadow(0 0 8px rgba(0, 153, 0, 0.6));
  }

  @keyframes cartNotify {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }
`;
document.head.appendChild(style);

// Intersection Observer for Scroll Animations
function initAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  revealElements.forEach(el => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Lightbox Functionality
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.querySelector('.lightbox-image');
  const closeBtn = document.querySelector('.close-lightbox');
  const prevBtn = document.querySelector('.prev-lightbox');
  const nextBtn = document.querySelector('.next-lightbox');
  
  // Get all image containers from the object section
  const imageContainers = Array.from(document.querySelectorAll('.objectIMG'));
  const images = imageContainers.map(container => container.querySelector('img'));
  
  let currentIndex = 0;

  function openLightbox(index) {
    if (!modal || !modalImg) return;
    currentIndex = index;
    modal.style.display = 'block';
    // Small delay to allow display:block to apply before adding show class for transition
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    updateImage();
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300); // Wait for transition
    document.body.style.overflow = ''; // Restore scrolling
  }

  function updateImage() {
    if (images[currentIndex] && modalImg) {
        modalImg.src = images[currentIndex].src;
        modalImg.alt = images[currentIndex].alt;
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  // Event Listeners
  imageContainers.forEach((container, index) => {
    container.addEventListener('click', () => openLightbox(index));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  
  if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
      });
  }
  
  if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
      });
  }

  // Close on click outside image
  if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('lightbox-content')) {
          closeLightbox();
        }
      });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'block') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
  });
});

