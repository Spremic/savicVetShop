// product.js - Product page functionality

// Slugify function (same as server-side)
function slugify(value) {
  if (!value) return "";
  
  const cyrToLat = {
    а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "dj", е: "e", ж: "z",
    з: "z", и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n",
    њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ћ: "c", у: "u",
    ф: "f", х: "h", ц: "c", ч: "c", џ: "dz", ш: "s",
    А: "a", Б: "b", В: "v", Г: "g", Д: "d", Ђ: "dj", Е: "e", Ж: "z",
    З: "z", И: "i", Ј: "j", К: "k", Л: "l", Љ: "lj", М: "m", Н: "n",
    Њ: "nj", О: "o", П: "p", Р: "r", С: "s", Т: "t", Ћ: "c", У: "u",
    Ф: "f", Х: "h", Ц: "c", Ч: "c", Џ: "dz", Ш: "s"
  };
  
  let result = value.toString();
  result = result.replace(/[а-яА-ЯђЂљЉњЊћЋџЏ]/g, ch => cyrToLat[ch] || ch);
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  result = result
    .replace(/đ/g, "dj").replace(/Đ/g, "dj")
    .replace(/ž/g, "z").replace(/Ž/g, "z")
    .replace(/č/g, "c").replace(/Č/g, "c")
    .replace(/ć/g, "c").replace(/Ć/g, "c")
    .replace(/š/g, "s").replace(/Š/g, "s");
  
  return result
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

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

  // Only attach zoom lens handlers for screens 1024px and above
  if (window.innerWidth >= 1024) {
    attachLensHandlers();
  }

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

  // Set initial favorite button state if product is saved
  // Use updateHeartIconsForProduct if available, otherwise set manually
  if (favoriteBtn) {
    const productId = favoriteBtn.getAttribute("data-product-id");
    if (productId) {
      // Wait for clone.js to load, then update state
      const updateInitialState = () => {
        if (typeof updateHeartIconsForProduct !== 'undefined') {
          updateHeartIconsForProduct(productId);
        } else if (typeof isProductSaved !== 'undefined' && isProductSaved(productId)) {
          // Fallback if updateHeartIconsForProduct is not available yet
          favoriteBtn.classList.add("active");
          const heartFilled = favoriteBtn.querySelector('.heart-filled');
          const heartOutline = favoriteBtn.querySelector('.heart-outline');
          if (heartFilled && heartOutline) {
            heartFilled.style.opacity = "1";
            heartOutline.style.opacity = "0";
          } else {
            // Fallback for old structure with material-symbols-outlined span
            const icon = favoriteBtn.querySelector("span");
            if (icon) {
              icon.textContent = "favorite";
            }
          }
        } else {
          // Try again after a short delay
          setTimeout(updateInitialState, 50);
        }
      };
      updateInitialState();
    }
  }

  function animateToSaved(sourceEl) {
    // Find saved icon each time (in case header loads after this script)
    const savedIcon = document.querySelector("#savedProduct");
    if (!savedIcon || !sourceEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;

    const savedRect = savedIcon.getBoundingClientRect();
    const savedX = savedRect.left + savedRect.width / 2;
    const savedY = savedRect.top + savedRect.height / 2;

    const flyingElement = document.createElement("div");
    flyingElement.className = "flying-item";
    flyingElement.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="width: 24px; height: 24px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009900"/></svg>';
    document.body.appendChild(flyingElement);

    flyingElement.style.position = "fixed";
    flyingElement.style.left = sourceX + "px";
    flyingElement.style.top = sourceY + "px";
    flyingElement.style.pointerEvents = "none";
    flyingElement.style.zIndex = "9999";

    setTimeout(() => {
      flyingElement.style.transition =
        "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      flyingElement.style.left = savedX + "px";
      flyingElement.style.top = savedY + "px";
      flyingElement.style.opacity = "0";
      flyingElement.style.transform = "scale(0.3)";
    }, 10);

    savedIcon.style.animation = "cartNotify 0.6s ease";
    setTimeout(() => {
      savedIcon.style.animation = "";
    }, 600);

    setTimeout(() => {
      flyingElement.remove();
    }, 800);
  }
  
  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", function () {
      // Get product ID from button data attribute
      const productId = favoriteBtn.getAttribute("data-product-id");
      if (!productId) return;
      
      // Check current state before toggling (don't toggle manually)
      const isCurrentlySaved = typeof isProductSaved !== 'undefined' && isProductSaved(productId);
      
      // Update localStorage
      if (typeof addToSavedItems !== 'undefined' && typeof removeFromSavedItems !== 'undefined') {
        if (isCurrentlySaved) {
          removeFromSavedItems(productId);
        } else {
          addToSavedItems(productId);
          // Animate to saved icon only when adding
          animateToSaved(this);
        }
        // updateHeartIconsForProduct is called inside addToSavedItems/removeFromSavedItems
        // so the button state will be updated automatically
      } else {
        // Fallback if functions are not available
        this.classList.toggle("active");
        const icon = this.querySelector("span");
        const isActive = this.classList.contains("active");
        if (isActive) {
          if (icon) icon.textContent = "favorite";
          this.classList.add("adding");
          setTimeout(() => {
            this.classList.remove("adding");
          }, 600);
          animateToSaved(this);
        } else {
          if (icon) icon.textContent = "favorite_border";
        }
      }
    });
  }

  // Add to cart functionality with flying animation
  const addToCartBtn = document.querySelector(".btn-add-cart");
  
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      // Get button position
      const buttonRect = addToCartBtn.getBoundingClientRect();
      const buttonX = buttonRect.left + buttonRect.width / 2;
      const buttonY = buttonRect.top + buttonRect.height / 2;

      // Find cart icon each time (in case header loads after this script)
      const cartIcon = document.querySelector("#openCart");
      if (!cartIcon) {
        console.warn("Cart icon (#openCart) not found. Header may not be loaded yet.");
        return;
      }
      
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

      // Add button animation
      this.classList.add("adding");
      setTimeout(() => {
        this.classList.remove("adding");
      }, 600);

      // Get product ID from button data attribute
      const productId = addToCartBtn.getAttribute("data-product-id");
      if (productId && typeof addToCart !== 'undefined') {
        addToCart(productId);
      }

      // Get selected options
      const selectedSize = document.querySelector(".size-btn.active")?.getAttribute("data-size");

      console.log("Added to cart:", {
        productId: productId,
        size: selectedSize,
      });
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
      // Only allow zoom on screens 1024px and above
      if (window.innerWidth >= 1024) {
        // TODO: Implement lightbox/modal for image zoom
        console.log("Zoom image");
      }
    });
  }

  if (mainImageContainer) {
    mainImageContainer.addEventListener("click", function () {
      // Only open zoom on screens 1024px and above
      if (window.innerWidth >= 1024) {
        // TODO: Implement lightbox on main image click
        console.log("Open image in lightbox");
      }
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



  // Load and display recommended products
  async function loadRecommendedProducts() {
    console.log('Loading recommended products...');
    try {
      const response = await fetch('/json/product.json');
      const products = await response.json();
      console.log('Products loaded:', products.length);

      // Get current product ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const currentProductId = urlParams.get('id');

      // Filter out current product and get random products
      const availableProducts = products.filter(product => product.id !== currentProductId);
      const recommendedProducts = [];

      // Get 20 random products for 5 slajders (4 products per slajd)
      const numProducts = Math.min(20, availableProducts.length);
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      recommendedProducts.push(...shuffled.slice(0, numProducts));

      // Display recommended products
      displayRecommendedProducts(recommendedProducts);

      // Initialize carousel after products are loaded
      initializeRecommendedCarousel();

    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  }

  // Recommended add to cart functionality with flying animation
  function setupRecommendedAddToCart() {
    const recommendedAddToCartBtns = document.querySelectorAll(".recommended-add-to-cart");
    
    recommendedAddToCartBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        
        // Get product ID from data attribute
        const productId = btn.getAttribute("data-product-id");
        if (productId && typeof addToCart !== 'undefined') {
          addToCart(productId);
        }
        
        // Get button position
        const buttonRect = btn.getBoundingClientRect();
        const buttonX = buttonRect.left + buttonRect.width / 2;
        const buttonY = buttonRect.top + buttonRect.height / 2;

        // Find cart icon each time (in case header loads after this script)
        const cartIcon = document.querySelector("#openCart");
        if (!cartIcon) {
          console.warn("Cart icon (#openCart) not found. Header may not be loaded yet.");
          return;
        }
        
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

        // Add button animation
        this.classList.add("adding");
        setTimeout(() => {
          this.classList.remove("adding");
        }, 600);

        // TODO: Implement actual cart functionality
        console.log("Added recommended product to cart");
      });
    });
  }

  // Recommended buy now functionality
  function setupRecommendedBuyNow() {
    const recommendedBuyNowBtns = document.querySelectorAll(".recommended-buy-now");
    recommendedBuyNowBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const productUrl = btn.getAttribute("data-product-url");
        if (productUrl) {
          window.location.href = productUrl;
        }
      });
    });
  }

  function displayRecommendedProducts(products) {
    console.log('Displaying recommended products:', products.length);
    const container = document.getElementById('recommendedProducts');
    console.log('Container found:', !!container);
    if (!container) return;

    container.innerHTML = products.map((product, index) => {
      const image = product.image || '/img/granula.jpg';
      const price = product.salePrice && product.salePrice !== '/' ? product.salePrice : product.price;
      const hasDiscount = product.salePrice && product.salePrice !== '/' && product.percentage && product.percentage !== '/' && product.percentage !== '0%';
      const discountPercentage = hasDiscount ? product.percentage : '';
      const oldPriceValue = hasDiscount ? product.price : null;

      return `
        <div class="recommended-card" data-product-id="${product.id}">
          <div class="recommended-image-c">
            ${hasDiscount ? `<div class="recommended-discount-badge">-${discountPercentage}</div>` : ''}
            <div class="recommended-heart-container" data-product-id="${product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path class="recommended-heart-outline" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#009900" stroke-width="2" />
                <path class="recommended-heart-filled" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009900" opacity="0" />
              </svg>
            </div>
            <img src="${image}" alt="${product.title}" loading="lazy" />
          </div>
          <div class="recommended-content-c">
            <span class="product-brand">${product.brand || 'Brand'}</span>
            <h4>${product.title}</h4>
            <div class="recommended-price-container">
              ${oldPriceValue ? `<div class="recommended-old-price">${oldPriceValue} $</div>` : ''}
              <div class="recommended-price">${price} $</div>
            </div>
            <div class="recommended-btns-flex">
              <button class="recommended-buy-now" data-product-url="/${slugify(product.title)}">
                Buy now
              </button>
              <button class="recommended-add-to-cart" data-product-id="${product.id}">
                <span class="material-symbols-outlined cart-icon">add_shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Setup recommended add to cart and buy now after products are displayed
    setupRecommendedAddToCart();
    setupRecommendedBuyNow();

    // Add click handlers to recommended product cards
    const recommendedCards = container.querySelectorAll('.recommended-card');
    recommendedCards.forEach((card) => {
      // Get product URL from the Buy Now button's data attribute
      const buyNowBtn = card.querySelector(".recommended-buy-now");
      if (!buyNowBtn) return;
      
      const productUrl = buyNowBtn.getAttribute("data-product-url");
      if (!productUrl) return;
      
      // Add click handler to card (except when clicking buttons)
      card.addEventListener("click", function(e) {
        // Don't navigate if clicking on buttons or heart
        if (e.target.closest(".recommended-buy-now") || e.target.closest(".recommended-add-to-cart") || e.target.closest(".recommended-heart-container")) {
          return;
        }
        window.location.href = productUrl;
      });
    });

    // Set initial heart states and add event listeners for heart buttons
    container.querySelectorAll('.recommended-heart-container').forEach(heartContainer => {
      const productId = heartContainer.getAttribute("data-product-id");
      const heartFilled = heartContainer.querySelector('.recommended-heart-filled');
      const heartOutline = heartContainer.querySelector('.recommended-heart-outline');
      
      // Set initial state if product is saved
      if (productId && heartFilled && heartOutline && typeof isProductSaved !== 'undefined' && isProductSaved(productId)) {
        heartFilled.style.opacity = "1";
        heartOutline.style.opacity = "0";
      }
      
      heartContainer.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (!heartFilled || !heartOutline) return;
        
        // Check if heart is currently active (filled) before toggling
        const isActive = heartFilled.style.opacity === "1";
        
        // Update localStorage
        if (productId && typeof addToSavedItems !== 'undefined' && typeof removeFromSavedItems !== 'undefined') {
          if (isActive) {
            removeFromSavedItems(productId);
          } else {
            addToSavedItems(productId);
          }
          // updateHeartIconsForProduct is called inside addToSavedItems/removeFromSavedItems
          // so all hearts for this product will be updated automatically
        } else {
          // Fallback: manually toggle this heart if functions not available
          heartFilled.style.opacity = isActive ? "0" : "1";
          heartOutline.style.opacity = isActive ? "1" : "0";
        }
        
        // Only animate if we're filling the heart (not unfilling)
        if (isActive) {
          // Heart is being unfilled - just return, no animation
          return;
        }
        
        // Heart is being filled - run animation
        this.classList.add("adding");
        setTimeout(() => {
          this.classList.remove("adding");
        }, 600);
        animateToSaved(this);
      });
    });
  }

  // Recommended Products Carousel - using old approach with display/opacity
  function initializeRecommendedCarousel() {
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
  }

  // Load recommended products when page loads
  // Wait a bit to ensure DOM is fully ready, especially for EJS templates
  setTimeout(() => {
    const container = document.getElementById('recommendedProducts');
    if (container) {
      loadRecommendedProducts();
    } else {
      console.warn('Recommended products container not found. Retrying...');
      // Retry after a short delay
      setTimeout(() => {
        if (document.getElementById('recommendedProducts')) {
          loadRecommendedProducts();
        } else {
          console.error('Recommended products container still not found after retry.');
        }
      }, 500);
    }
  }, 100);

  // Intersection Observer for Scroll Animations
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

  // Separate recommended cards from other reveal elements
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

});
