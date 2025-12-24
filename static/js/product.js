// product.js - Product page functionality

document.addEventListener("DOMContentLoaded", function () {
  // Header scroll effect
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (header && window.scrollY > 50) {
      header.classList.add("scrolled");
    } else if (header) {
      header.classList.remove("scrolled");
    }
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

    .flying-item .cart-icon {
      filter: drop-shadow(0 0 8px rgba(0, 153, 0, 0.6));
      font-size: 24px;
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
  // Thumbnail image switching
  const thumbnails = document.querySelectorAll(".thumbnail");
  const mainImage = document.getElementById("mainProductImage");
  const mainImageContainer = document.querySelector(".main-image-container");

  const thumbnailContainer = document.querySelector(".thumbnail-container");

  // --- Hover magnifier setup for main image ---
  const zoomLevel = 2.4;
  const lensBaseSize = 180;
  let magnifierLens = null;
  let isHoveringArrow = false;

  function updateLensImage() {
    if (magnifierLens && mainImage?.src) {
      magnifierLens.style.backgroundImage = `url('${mainImage.src}')`;
    }
  }

  function createLens() {
    if (!mainImage || !mainImageContainer || magnifierLens) return;

    magnifierLens = document.createElement("div");
    magnifierLens.classList.add("image-magnifier-lens");
    magnifierLens.setAttribute("aria-hidden", "true");
    mainImageContainer.appendChild(magnifierLens);

    updateLensImage();
  }

  function handleLensMove(event) {
    if (!magnifierLens || !mainImage || !mainImageContainer) return;

    // If hovering over arrow, hide lens and don't show it
    if (isHoveringArrow) {
      magnifierLens.classList.remove("is-active");
      return;
    }

    const rect = mainImage.getBoundingClientRect();
    const containerRect = mainImageContainer.getBoundingClientRect();
    const lensSize =
      window.innerWidth < 768 ? Math.max(140, lensBaseSize - 40) : lensBaseSize;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // If cursor is outside the image, hide lens
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      magnifierLens.classList.remove("is-active");
      return;
    }

    // Clamp focus point so zoomed area always fills the lens (prevents empty bands)
    const halfVisible = lensSize / (2 * zoomLevel);
    const clampedX = Math.max(halfVisible, Math.min(rect.width - halfVisible, x));
    const clampedY = Math.max(halfVisible, Math.min(rect.height - halfVisible, y));

    // Position lens slightly above the cursor, keep it inside container
    const targetLeft = clampedX - lensSize / 2;
    const targetTop = clampedY - lensSize - 12; // "above the mouse" effect

    const minLeft = 0;
    const maxLeft = containerRect.width - lensSize;
    const minTop = 0;
    const maxTop = containerRect.height - lensSize;

    const finalLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));
    const finalTop = Math.max(minTop, Math.min(maxTop, targetTop));

    magnifierLens.style.width = `${lensSize}px`;
    magnifierLens.style.height = `${lensSize}px`;
    magnifierLens.style.left = `${finalLeft}px`;
    magnifierLens.style.top = `${finalTop}px`;
    magnifierLens.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;

    const bgPosX = -(clampedX * zoomLevel - lensSize / 2);
    const bgPosY = -(clampedY * zoomLevel - lensSize / 2);
    magnifierLens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;

    magnifierLens.classList.add("is-active");
  }

  function attachLensHandlers() {
    if (!mainImage || !mainImageContainer) return;
    createLens();

    mainImageContainer.addEventListener("mouseenter", (e) => {
      updateLensImage();
      handleLensMove(e);
    });

    mainImageContainer.addEventListener("mousemove", handleLensMove);

    mainImageContainer.addEventListener("mouseleave", () => {
      if (magnifierLens) {
        magnifierLens.classList.remove("is-active");
      }
    });

    // Update lens when image finishes loading (after thumbnail change)
    mainImage.addEventListener("load", updateLensImage);
  }

  attachLensHandlers();
  
  // Function to get current image index
  function getCurrentImageIndex() {
    if (!mainImage) return 0;
    const currentSrc = mainImage.src;
    let currentIndex = 0;
    thumbnails.forEach((thumb, index) => {
      const thumbSrc = thumb.getAttribute("data-image");
      if (thumbSrc) {
        // Get just the filename from both paths
        const currentFileName = currentSrc.split('/').pop();
        const thumbFileName = thumbSrc.split('/').pop();
        if (currentFileName === thumbFileName) {
          currentIndex = index;
        }
      }
    });
    return currentIndex;
  }
  
  // Function to switch image
  function switchImage(direction) {
    const currentIndex = getCurrentImageIndex();
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % thumbnails.length;
    } else {
      newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    }
    
    // Trigger click on the thumbnail to update everything
    if (thumbnails[newIndex]) {
      thumbnails[newIndex].click();
    }
  }
  
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", function () {
      // Remove active class from all thumbnails
      thumbnails.forEach((t) => t.classList.remove("active"));
      
      // Add active class to clicked thumbnail
      this.classList.add("active");
      
      // Update main image
      const imageSrc = this.getAttribute("data-image");
      if (imageSrc && mainImage) {
        mainImage.src = imageSrc;
        mainImage.style.opacity = "0";
        setTimeout(() => {
          mainImage.style.opacity = "1";
        }, 150);
        updateLensImage();
      }
      
      // Scroll behavior based on screen size
      if (thumbnailContainer) {
        const isMobile = window.innerWidth < 1024;
        
        if (isMobile) {
          // Horizontal scroll for mobile/tablet
          const isLastThumbnail = index === thumbnails.length - 1;
          
          if (isLastThumbnail) {
            // If clicking the last thumbnail, scroll one thumbnail width to the right
            const thumbnailWidth = 100; // Fixed width from CSS
            const gap = 10; // Gap from CSS for mobile
            const scrollAmount = thumbnailWidth + gap;
            const currentScrollLeft = thumbnailContainer.scrollLeft;
            const maxScrollLeft = thumbnailContainer.scrollWidth - thumbnailContainer.clientWidth;
            
            // Only scroll if there's more content to show
            if (currentScrollLeft < maxScrollLeft) {
              const newScrollLeft = Math.min(currentScrollLeft + scrollAmount, maxScrollLeft);
              thumbnailContainer.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
              });
            }
          } else {
            // For other thumbnails, center the clicked one if possible
            const thumbnailWidth = 100;
            const gap = 10;
            const thumbnailLeft = index * (thumbnailWidth + gap);
            const containerWidth = thumbnailContainer.clientWidth;
            const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
            
            thumbnailContainer.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        } else {
          // Vertical scroll for desktop
          const thumbnailHeight = 100;
          const gap = 12;
          const containerHeight = 486; // 4 thumbnails + 50px partial = 400 + 36 + 50
          const itemHeight = thumbnailHeight + gap;
          
          // Calculate scroll position to place clicked thumbnail at the bottom of visible area
          // We want the clicked thumbnail to be the 4th visible (last fully visible)
          // So it should be at position: containerHeight - thumbnailHeight - 50px (for partial next)
          const targetPosition = containerHeight - thumbnailHeight - 50;
          const thumbnailPosition = index * itemHeight;
          const scrollPosition = thumbnailPosition - targetPosition;
          
          // Ensure scroll position is not negative (for first few thumbnails)
          const finalScrollPosition = Math.max(0, scrollPosition);
          
          thumbnailContainer.scrollTo({
            top: finalScrollPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Arrow navigation
  const arrowLeft = document.querySelector(".image-arrow-left");
  const arrowRight = document.querySelector(".image-arrow-right");
  
  if (arrowLeft) {
    arrowLeft.addEventListener("click", function (e) {
      e.stopPropagation();
      switchImage('prev');
    });
    
    // Hide zoom lens when hovering over left arrow
    arrowLeft.addEventListener("mouseenter", function () {
      isHoveringArrow = true;
      if (magnifierLens) {
        magnifierLens.classList.remove("is-active");
      }
    });
    
    arrowLeft.addEventListener("mouseleave", function () {
      isHoveringArrow = false;
    });
  }
  
  if (arrowRight) {
    arrowRight.addEventListener("click", function (e) {
      e.stopPropagation();
      switchImage('next');
    });
    
    // Hide zoom lens when hovering over right arrow
    arrowRight.addEventListener("mouseenter", function () {
      isHoveringArrow = true;
      if (magnifierLens) {
        magnifierLens.classList.remove("is-active");
      }
    });
    
    arrowRight.addEventListener("mouseleave", function () {
      isHoveringArrow = false;
    });
  }

  // Size selection
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      sizeButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Favorite button toggle
  const favoriteBtn = document.querySelector(".btn-favorite");
  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", function () {
      this.classList.toggle("active");
      const icon = this.querySelector("span");
      if (this.classList.contains("active")) {
        icon.textContent = "favorite";
      } else {
        icon.textContent = "favorite_border";
      }
    });
  }

  // Add to cart functionality with flying animation
  const addToCartBtn = document.querySelector(".btn-add-cart");
  const cartIcon = document.querySelector("#openCart");
  
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      // Get button position
      const buttonRect = addToCartBtn.getBoundingClientRect();
      const buttonX = buttonRect.left + buttonRect.width / 2;
      const buttonY = buttonRect.top + buttonRect.height / 2;

      // Get cart position (if cart icon exists)
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const cartX = cartRect.left + cartRect.width / 2;
        const cartY = cartRect.top + cartRect.height / 2;

        // Create flying element
        const flyingElement = document.createElement("div");
        flyingElement.className = "flying-item";
        flyingElement.innerHTML =
          '<span class="material-symbols-outlined cart-icon">add_shopping_cart</span>';
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

        // Add pulse effect to cart
        cartIcon.style.animation = "cartNotify 0.6s ease";
        setTimeout(() => {
          cartIcon.style.animation = "";
        }, 600);

        // Remove flying element after animation
        setTimeout(() => {
          flyingElement.remove();
        }, 800);
      }

      // Add button animation
      this.classList.add("adding");
      setTimeout(() => {
        this.classList.remove("adding");
      }, 600);

      // Get selected options
      const selectedSize = document.querySelector(".size-btn.active")?.getAttribute("data-size");

      console.log("Added to cart:", {
        size: selectedSize,
      });

      // TODO: Implement actual cart functionality
    });
  }

  // Buy now functionality
  const buyNowBtn = document.querySelector(".btn-buy-now");
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", function () {
      const selectedSize = document.querySelector(".size-btn.active")?.getAttribute("data-size");

      console.log("Buy now:", {
        size: selectedSize,
      });

      // TODO: Implement checkout functionality
    });
  }

  // Image zoom button (placeholder - can be enhanced with lightbox)
  const zoomBtn = document.querySelector(".image-zoom-btn");
  
  if (zoomBtn && mainImageContainer) {
    zoomBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      // TODO: Implement lightbox/modal for image zoom
      console.log("Zoom image");
    });
  }

  if (mainImageContainer) {
    mainImageContainer.addEventListener("click", function () {
      // TODO: Implement lightbox on main image click
      console.log("Open image in lightbox");
    });
  }

  // View more seller button
  const viewMoreBtn = document.querySelector(".view-more-btn");
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", function () {
      // TODO: Navigate to seller page or show seller details
      console.log("View seller details");
    });
  }

  // Recommended Products Carousel
  const recommendedMid = document.querySelector(".recommended-mid");
  const recommendedArrowL = document.querySelector(".recommended-arrow-l");
  const recommendedArrowR = document.querySelector(".recommended-arrow-r");

  if (recommendedMid && recommendedArrowL && recommendedArrowR) {
    const cards = Array.from(recommendedMid.querySelectorAll(".recommended-card"));
    let isScrolling = false;
    let currentIndex = 0;
    
    // Function to calculate cards per view based on actual card width (minimum 315px)
    function getCardsPerView() {
      const width = window.innerWidth;
      
      // Ispod 1024px: prikaži sve kartice sa horizontalnim scrollom
      if (width < 1024) {
        return -1; // Specijalna vrednost za "prikaži sve"
      }
      
      // Od 1024px do 1280px: fiksno 2 kartice
      if (width >= 1024 && width <= 1280) {
        return 2;
      }
      
      // Preko 1280px: kalkuliši na osnovu stvarne širine kartice
      const containerWidth = recommendedMid.offsetWidth || recommendedMid.clientWidth;
      const gap = 20;
      const minCardWidth = 315;
      
      // Računaj širinu kartice ako bi bilo 4 kartice
      const cardWidthWith4 = (containerWidth - (3 * gap)) / 4;
      
      // Ako je širina kartice >= 315px sa 4 kartice, koristi 4, inače 3
      if (cardWidthWith4 >= minCardWidth) {
        return 4; // 4 kartice - širina kartice je >= 315px
      } else {
        return 3; // 3 kartice - širina kartice bi bila < 315px sa 4 kartice
      }
    }
    
    let cardsPerView = getCardsPerView();

    // Function to update card widths based on cardsPerView
    function updateCardWidths() {
      const gap = 20;
      const minCardWidth = 315;
      let flexBasis, width, maxWidth, minWidth;
      
      if (cardsPerView === -1) {
        // Ispod 1024px: prikaži sve kartice sa scrollom - postavi fiksne širine
        const mobileCardWidth = 280;
        cards.forEach(card => {
          if (card) {
            // Postavi fiksne širine za mobile scroll
            card.style.flexBasis = `${mobileCardWidth}px`;
            card.style.width = `${mobileCardWidth}px`;
            card.style.maxWidth = `${mobileCardWidth}px`;
            card.style.minWidth = `${mobileCardWidth}px`;
          }
        });
        return;
      } else if (cardsPerView === 4) {
        // 4 kartice: calc((100% - 60px) / 4)
        flexBasis = `calc((100% - ${3 * gap}px) / 4)`;
        width = `calc((100% - ${3 * gap}px) / 4)`;
        maxWidth = `calc((100% - ${3 * gap}px) / 4)`;
        minWidth = `${minCardWidth}px`; // Osiguraj minimum 315px
      } else if (cardsPerView === 3) {
        // 3 kartice: calc((100% - 40px) / 3)
        flexBasis = `calc((100% - ${2 * gap}px) / 3)`;
        width = `calc((100% - ${2 * gap}px) / 3)`;
        maxWidth = `calc((100% - ${2 * gap}px) / 3)`;
        minWidth = '0'; // Nema minimum za 3 kartice
      } else if (cardsPerView === 2) {
        // 2 kartice (1024px-1280px): calc((100% - 20px) / 2)
        flexBasis = `calc((100% - ${gap}px) / 2)`;
        width = `calc((100% - ${gap}px) / 2)`;
        maxWidth = `calc((100% - ${gap}px) / 2)`;
        minWidth = '0';
      }
      
      // Postavi širine na sve kartice
      cards.forEach(card => {
        if (card) {
          card.style.flexBasis = flexBasis;
          card.style.width = width;
          card.style.maxWidth = maxWidth;
          if (cardsPerView === 4) {
            card.style.minWidth = minWidth; // Minimum 315px za 4 kartice
          } else {
            card.style.minWidth = minWidth;
          }
        }
      });
    }
    
    // Function to update cardsPerView and reset if needed
    function updateCardsPerView() {
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        // Reset to first page if current index is out of bounds (samo ako nije -1)
        if (cardsPerView !== -1) {
          const maxIndex = Math.max(0, cards.length - cardsPerView);
          if (currentIndex > maxIndex) {
            currentIndex = 0;
          }
        } else {
          // Ako je -1, resetuj na početak
          currentIndex = 0;
        }
        updateCardWidths(); // Ažuriraj širine kartica
        updateVisibleCards();
        updateArrowVisibility();
      } else {
        // Ažuriraj širine čak i ako se cardsPerView nije promenio (za slučaj resize-a)
        updateCardWidths();
      }
    }
    
    function getVisibleCardIndices() {
      // Calculate which cards should be visible based on currentIndex
      const visibleIndices = [];
      
      // Ako je cardsPerView === -1, prikaži sve kartice
      if (cardsPerView === -1) {
        for (let i = 0; i < cards.length; i++) {
          visibleIndices.push(i);
        }
        return visibleIndices;
      }
      
      for (let i = currentIndex; i < Math.min(currentIndex + cardsPerView, cards.length); i++) {
        visibleIndices.push(i);
      }
      return visibleIndices;
    }

    function updateVisibleCards() {
      // Ako je cardsPerView === -1, prikaži sve kartice (ispod 1024px sa scrollom)
      if (cardsPerView === -1) {
        cards.forEach((card) => {
          if (card) {
            card.classList.remove('scrolling-out', 'scrolling-in');
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.style.visibility = 'visible';
            card.style.display = '';
          }
        });
        return;
      }
      
      // Update visibility of all cards - use opacity instead of visibility to keep layout
      cards.forEach((card, index) => {
        const isVisible = index >= currentIndex && index < currentIndex + cardsPerView;
        if (isVisible) {
          // Remove any classes that might hide the card
          card.classList.remove('scrolling-out', 'scrolling-in');
          card.style.opacity = '1';
          card.style.pointerEvents = 'auto';
          card.style.visibility = 'visible';
          card.style.display = '';
        } else {
          // Hide card but keep it in layout using opacity
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          card.style.visibility = 'hidden';
          card.style.display = 'none'; // Use display none for hidden cards
        }
      });
    }

    function scrollCarousel(direction) {
      if (isScrolling) return;
      
      // Ako je cardsPerView === -1, ne radi scroll (koristi se CSS scroll)
      if (cardsPerView === -1) return;
      
      const maxIndex = Math.max(0, cards.length - cardsPerView);
      
      let newIndex;
      if (direction === 'right') {
        newIndex = Math.min(currentIndex + cardsPerView, maxIndex);
        if (newIndex === currentIndex) return; // Already at end
      } else {
        newIndex = Math.max(currentIndex - cardsPerView, 0);
        if (newIndex === currentIndex) return; // Already at start
      }

      isScrolling = true;

      // Get currently visible cards and fade them out smoothly
      const currentVisibleIndices = getVisibleCardIndices();
      currentVisibleIndices.forEach(index => {
        if (cards[index]) {
          cards[index].classList.add('scrolling-out');
          cards[index].style.opacity = '0';
        }
      });

      // After fade out, switch to new cards
      setTimeout(() => {
        // Hide old cards completely
        currentVisibleIndices.forEach(index => {
          if (cards[index]) {
            cards[index].style.display = 'none';
            cards[index].style.visibility = 'hidden';
            cards[index].style.pointerEvents = 'none';
            cards[index].classList.remove('scrolling-out');
          }
        });

        // Update current index
        currentIndex = newIndex;
        
        // Calculate which cards should be visible now (based on newIndex)
        const newVisibleIndices = [];
        for (let i = newIndex; i < Math.min(newIndex + cardsPerView, cards.length); i++) {
          newVisibleIndices.push(i);
        }
        
        // Show new cards with fade in
        newVisibleIndices.forEach((index) => {
          if (cards[index]) {
            // First, make sure card is visible and in layout
            cards[index].style.display = '';
            cards[index].style.visibility = 'visible';
            cards[index].style.pointerEvents = 'none';
            cards[index].style.opacity = '0';
            cards[index].classList.add('scrolling-in');
          }
        });
        
        // Force reflow to ensure styles are applied
        void recommendedMid.offsetHeight;
        
        // Trigger fade in for all new cards simultaneously
        newVisibleIndices.forEach((index) => {
          if (cards[index]) {
            // Change opacity to 1 to trigger fade in
            cards[index].style.opacity = '1';
            cards[index].style.pointerEvents = 'auto';
            
            // Remove class after animation
            setTimeout(() => {
              cards[index].classList.remove('scrolling-in');
            }, 350);
          }
        });
        
        isScrolling = false;
        updateArrowVisibility();
      }, 350); // Wait for fade out to complete
    }

    recommendedArrowL.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      scrollCarousel('left');
    });

    recommendedArrowR.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      scrollCarousel('right');
    });

    // Update arrow visibility based on current index
    function updateArrowVisibility() {
      // Ako je cardsPerView === -1, sakrij strelice (koristi se CSS scroll)
      if (cardsPerView === -1) {
        recommendedArrowL.style.opacity = "0";
        recommendedArrowL.style.pointerEvents = "none";
        recommendedArrowR.style.opacity = "0";
        recommendedArrowR.style.pointerEvents = "none";
        return;
      }
      
      const maxIndex = Math.max(0, cards.length - cardsPerView);

      if (currentIndex <= 0) {
        recommendedArrowL.style.opacity = "0.5";
        recommendedArrowL.style.pointerEvents = "none";
      } else {
        recommendedArrowL.style.opacity = "1";
        recommendedArrowL.style.pointerEvents = "auto";
      }

      if (currentIndex >= maxIndex) {
        recommendedArrowR.style.opacity = "0.5";
        recommendedArrowR.style.pointerEvents = "none";
      } else {
        recommendedArrowR.style.opacity = "1";
        recommendedArrowR.style.pointerEvents = "auto";
      }
    }

    // Initialize - show first cards based on screen size
    currentIndex = 0;
    
    // Set initial state - first cards visible, rest hidden
    function initializeCards() {
      // Ako je cardsPerView === -1, prikaži sve kartice
      if (cardsPerView === -1) {
        cards.forEach((card) => {
          if (card) {
            card.classList.remove('scrolling-out', 'scrolling-in');
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.pointerEvents = 'auto';
            card.style.display = '';
          }
        });
        return;
      }
      
      cards.forEach((card, index) => {
        if (card) {
          // Remove any classes
          card.classList.remove('scrolling-out', 'scrolling-in');
          
          const isVisible = index < cardsPerView;
          if (isVisible) {
            // Show first cards immediately
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.pointerEvents = 'auto';
            card.style.display = '';
          } else {
            // Hide rest of cards
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.pointerEvents = 'none';
            card.style.display = 'none';
          }
        }
      });
    }
    
    // Postavi početne širine kartica
    updateCardWidths();
    
    initializeCards();
    
    // Update arrow visibility
    updateArrowVisibility();
    
    // Listen for window resize to update cards per view
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        updateCardsPerView();
        initializeCards();
      }, 250);
    });
  }

  // Recommended card heart functionality
  const recommendedHeartContainers = document.querySelectorAll(".recommended-heart-container");
  recommendedHeartContainers.forEach((container) => {
    container.addEventListener("click", function (e) {
      e.stopPropagation();
      const heartFilled = this.querySelector(".recommended-heart-filled");
      const heartOutline = this.querySelector(".recommended-heart-outline");
      
      if (heartFilled && heartOutline) {
        const isActive = heartFilled.style.opacity === "1";
        heartFilled.style.opacity = isActive ? "0" : "1";
        heartOutline.style.opacity = isActive ? "1" : "0";
      }
    });
  });

  // Recommended add to cart functionality with flying animation
  const recommendedAddToCartBtns = document.querySelectorAll(".recommended-add-to-cart");
  recommendedAddToCartBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      
      // Get button position
      const buttonRect = btn.getBoundingClientRect();
      const buttonX = buttonRect.left + buttonRect.width / 2;
      const buttonY = buttonRect.top + buttonRect.height / 2;

      // Get cart position (if cart icon exists)
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const cartX = cartRect.left + cartRect.width / 2;
        const cartY = cartRect.top + cartRect.height / 2;

        // Create flying element
        const flyingElement = document.createElement("div");
        flyingElement.className = "flying-item";
        flyingElement.innerHTML =
          '<span class="material-symbols-outlined cart-icon">add_shopping_cart</span>';
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

        // Add pulse effect to cart
        cartIcon.style.animation = "cartNotify 0.6s ease";
        setTimeout(() => {
          cartIcon.style.animation = "";
        }, 600);

        // Remove flying element after animation
        setTimeout(() => {
          flyingElement.remove();
        }, 800);
      }

      // Add button animation
      this.classList.add("adding");
      setTimeout(() => {
        this.classList.remove("adding");
      }, 600);

      // TODO: Implement actual cart functionality
      console.log("Added recommended product to cart");
    });
  });

  // Recommended buy now functionality
  const recommendedBuyNowBtns = document.querySelectorAll(".recommended-buy-now");
  recommendedBuyNowBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      // TODO: Implement checkout functionality
      console.log("Buy now recommended product");
    });
  });

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  // Special observer for recommended cards - triggers later (when more of the element is visible)
  const recommendedObserverOptions = {
    root: null,
    rootMargin: "-300px 0px", // Element must be 300px into viewport before animating
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const recommendedObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, recommendedObserverOptions);

  // Separate recommended cards from other reveal elements
  const recommendedCards = document.querySelectorAll(".recommended-card.reveal");
  const otherRevealElements = document.querySelectorAll(".reveal:not(.recommended-card), .reveal-left, .reveal-right, .reveal-scale");
  
  // Function to check if element is visible in viewport (more lenient check)
  function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0
    );
  }

  // Check and activate other reveal elements already visible
  otherRevealElements.forEach(el => {
    // Check if element is already visible on page load
    if (isElementVisible(el)) {
      // Small delay to ensure CSS is loaded and allow for initial render
      setTimeout(() => {
        el.classList.add("active");
      }, 150);
    } else {
      // Observe elements not yet visible
      observer.observe(el);
    }
  });

  // Handle recommended cards separately - they should animate later
  recommendedCards.forEach(el => {
    // Don't auto-activate recommended cards even if visible - wait for scroll
    recommendedObserver.observe(el);
  });
});
