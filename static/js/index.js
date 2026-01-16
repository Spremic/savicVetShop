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

  // Slugify function to create product URLs
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

  // Featured Products Slider
  let featuredProducts = [];
  let currentSlideIndex = 0;
  const productsPerSlide = 3;
  let showSlideFunction = null; // Will store the showSlide function
  
  // Fallback images if Cloudinary fails
  const fallbackImages = [
    '/img/granula.jpg',
    '/img/pas1.jpg',
    '/img/pas2.jpg',
    '/img/pas3.jpg',
    '/img/pansion.jpg',
    '/img/zec.jpg',
    '/img/galerija/lokal1.jpg',
    '/img/galerija/lokal2.jpg',
    '/img/galerija/lokal3.jpg'
  ];

  // Fetch product images in batch (optimized - no cache)
  async function fetchProductImagesBatch(productIds) {
    try {
      const response = await fetch('/api/product-images/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds })
      });
      
      const data = await response.json();
      return data.results || {};
    } catch (error) {
      console.error('Error fetching batch images:', error);
      return {};
    }
  }

  // Load and display featured products (optimized)
  async function loadFeaturedProducts() {
    try {
      // Use preloaded JSON if available, otherwise fetch
      let allProducts;
      if (window.productJsonPromise) {
        allProducts = await window.productJsonPromise;
      } else {
        const response = await fetch('/json/product.json', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        allProducts = await response.json();
      }
      
      // Shuffle array and get random products
      const shuffled = allProducts.sort(() => 0.5 - Math.random());
      featuredProducts = shuffled.slice(0, 9); // Get 9 products (3 slides of 3)
      
      // Render products immediately with skeleton loaders
      renderProductsWithSkeletons();
      
      // Fetch images in batch (optimized)
      const productIds = featuredProducts.map(p => p.id);
      const imagesData = await fetchProductImagesBatch(productIds);
      
      // Update images when loaded
      updateProductImages(imagesData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  // Render products with skeleton loaders (optimized - immediate render)
  function renderProductsWithSkeletons() {
    const container = document.getElementById('featuredProductsContainer');
    if (!container) return;

    // Hide initial skeleton loaders immediately
    const skeletonCards = container.querySelectorAll('.skeleton-card');
    skeletonCards.forEach(card => {
      card.style.display = 'none';
      card.classList.add('hidden');
    });

    container.innerHTML = '';

    // Render all products immediately with skeleton image loaders
    featuredProducts.forEach((product, index) => {
      const price = product.salePrice && product.salePrice !== '/' ? product.salePrice : product.price;
      const hasDiscount = product.salePrice && product.salePrice !== '/' && product.percentage && product.percentage !== '/' && product.percentage !== '0%';
      const discountPercentage = hasDiscount ? product.percentage : '';
      const oldPriceValue = hasDiscount ? product.price : null;
      
      const cardHTML = `
        <div class="custom-card" data-product-id="${product.id}">
          <div class="image-c">
            <div class="image-skeleton"></div>
            <div class="image-error" style="display: none;">
              <div class="recommended-error-content">
                <span class="material-symbols-outlined recommended-error-icon">image_not_supported</span>
                <h4 class="recommended-error-title">Image Failed to Load</h4>
                <p class="recommended-error-message">We're having trouble loading this image. Please try again later.</p>
                <button class="recommended-error-retry">
                  <span class="material-symbols-outlined">refresh</span>
                  Try Again
                </button>
              </div>
            </div>
            ${hasDiscount ? `<div class="discount-badge">-${discountPercentage}</div>` : ''}
            <div class="arrow-image-left" style="display: none;">
              <span class="material-symbols-outlined">arrow_back_ios_new</span>
            </div>
            <div class="arrow-image-right" style="display: none;">
              <span class="material-symbols-outlined">arrow_forward_ios</span>
            </div>
            <div class="heart-container" data-product-id="${product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path class="heart-outline" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#009900" stroke-width="2"/>
                <path class="heart-filled" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009900" opacity="0"/>
              </svg>
            </div>
            <img src="" alt="${product.title}" loading="lazy" data-product-id="${product.id}" style="display: none;" />
          </div>
          <div class="content-c">
            <span class="product-brand">${product.brand}</span>
            <h4>${product.title}</h4>
            <div class="price-container">
              ${oldPriceValue ? `<div class="price-old">${oldPriceValue} $</div>` : ''}
              <div class="price">${price} $</div>
            </div>
            <div class="btns-flex">
              <button class="buy-now">Buy now</button>
              <button class="add-to-cart" data-product-id="${product.id}">
                <span class="material-symbols-outlined cart-icon">add_shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      `;
      
      container.innerHTML += cardHTML;
    });

    // Add click handlers to product cards after rendering
    const allCards = container.querySelectorAll('.custom-card');
    allCards.forEach((card, index) => {
      const product = featuredProducts[index];
      if (!product) return;
      
      const productSlug = slugify(product.title);
      const productUrl = `/${productSlug}`;
      
      // Set heart state if product is saved
      const heartContainer = card.querySelector('.heart-container');
      if (heartContainer) {
        // Wait for isProductSaved function to be available
        const checkHeartState = () => {
          if (typeof isProductSaved !== 'undefined' && isProductSaved(product.id)) {
            const heartFilled = heartContainer.querySelector('.heart-filled');
            const heartOutline = heartContainer.querySelector('.heart-outline');
            if (heartFilled && heartOutline) {
              heartFilled.style.opacity = "1";
              heartOutline.style.opacity = "0";
            }
          } else if (typeof isProductSaved === 'undefined') {
            // If function not yet available, try again after a short delay
            setTimeout(checkHeartState, 50);
          }
        };
        checkHeartState();
      }
      
      // Add click handler to card (except when clicking buttons)
      card.addEventListener("click", function(e) {
        // Don't navigate if clicking on buttons
        if (e.target.closest(".buy-now") || e.target.closest(".add-to-cart") || e.target.closest(".heart-container")) {
          return;
        }
        window.location.href = productUrl;
      });
      
      // Add click handler to Buy Now button
      const buyNowBtn = card.querySelector(".buy-now");
      if (buyNowBtn) {
        buyNowBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          // Add product to cart
          if (typeof addToCart !== 'undefined') {
            addToCart(product.id);
          }
          // Redirect to shopping cart
          window.location.href = '/shopping-cart';
        });
      }
      
      // Note: Heart container click is handled by global event listener below
      // which handles both toggle state and animation
      
      // Image carousel will be set up in updateProductImages() after images load
    });

    // Setup slider after rendering and store showSlide function
    showSlideFunction = setupSlider();
  }

  // Update product images when loaded from Cloudinary (optimized)
  function updateProductImages(imagesData) {
    featuredProducts.forEach((product) => {
      const card = document.querySelector(`.custom-card[data-product-id="${product.id}"]`);
      if (!card) return;

      const productImage = card.querySelector('img');
      const imageContainer = card.querySelector('.image-c');
      const skeleton = card.querySelector('.image-skeleton');
      const arrowLeft = card.querySelector('.arrow-image-left');
      const arrowRight = card.querySelector('.arrow-image-right');
      
      if (!productImage || !imageContainer) return;

      const productImages = imagesData[product.id] || [];
      const imageUrls = productImages.length > 0 
        ? productImages.map(img => img.url)
        : [];

      // Get or create error fallback element
      let errorFallback = imageContainer.querySelector('.image-error');
      if (!errorFallback) {
        errorFallback = document.createElement('div');
        errorFallback.className = 'image-error';
        errorFallback.style.display = 'none';
        errorFallback.innerHTML = `
          <div class="recommended-error-content">
            <span class="material-symbols-outlined recommended-error-icon">image_not_supported</span>
            <h4 class="recommended-error-title">Image Failed to Load</h4>
            <p class="recommended-error-message">We're having trouble loading this image. Please try again later.</p>
            <button class="recommended-error-retry">
              <span class="material-symbols-outlined">refresh</span>
              Try Again
            </button>
          </div>
        `;
        imageContainer.appendChild(errorFallback);
        
        // Setup retry button functionality
        const retryBtn = errorFallback.querySelector('.recommended-error-retry');
        if (retryBtn) {
          retryBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Hide error and show skeleton again
            if (errorFallback) {
              errorFallback.style.display = 'none';
            }
            if (skeleton) {
              skeleton.style.opacity = '1';
              skeleton.style.display = 'block';
              skeleton.classList.remove('hidden');
            }
            // Try loading image again - reload from API
            const currentProductId = card.getAttribute('data-product-id');
            if (currentProductId) {
              // Re-fetch images for this product
              fetchProductImagesBatch([currentProductId]).then(imagesData => {
                const retryImages = imagesData[currentProductId] || [];
                const retryImageUrls = retryImages.length > 0 
                  ? retryImages.map(img => img.url)
                  : [];
                
                if (retryImageUrls.length > 0) {
                  const retryImage = new Image();
                  retryImage.onload = () => {
                    productImage.src = retryImage.src;
                    productImage.style.display = 'block';
                    productImage.classList.add('loaded');
                    productImage.setAttribute('data-product-images', JSON.stringify(retryImageUrls));
                    productImage.setAttribute('data-current-image-index', '0');
                    if (skeleton) {
                      skeleton.style.opacity = '0';
                      setTimeout(() => {
                        skeleton.classList.add('hidden');
                        skeleton.style.display = 'none';
                      }, 300);
                    }
                    if (errorFallback) {
                      errorFallback.style.display = 'none';
                    }
                  };
                  retryImage.onerror = () => {
                    if (skeleton) {
                      skeleton.style.opacity = '0';
                      setTimeout(() => {
                        skeleton.classList.add('hidden');
                        skeleton.style.display = 'none';
                      }, 300);
                    }
                    if (errorFallback) {
                      errorFallback.style.display = 'flex';
                    }
                    productImage.style.display = 'none';
                  };
                  retryImage.src = retryImageUrls[0];
                } else {
                  // No images available - show error
                  if (skeleton) {
                    skeleton.style.opacity = '0';
                    setTimeout(() => {
                      skeleton.classList.add('hidden');
                      skeleton.style.display = 'none';
                    }, 300);
                  }
                  if (errorFallback) {
                    errorFallback.style.display = 'flex';
                  }
                  productImage.style.display = 'none';
                }
              }).catch(() => {
                // API error - show error message
                if (skeleton) {
                  skeleton.style.opacity = '0';
                  setTimeout(() => {
                    skeleton.classList.add('hidden');
                    skeleton.style.display = 'none';
                  }, 300);
                }
                if (errorFallback) {
                  errorFallback.style.display = 'flex';
                }
                productImage.style.display = 'none';
              });
            }
          });
        }
      }

      // If no images available, show error immediately
      if (imageUrls.length === 0) {
        // Hide skeleton
        if (skeleton) {
          skeleton.style.opacity = '0';
          skeleton.style.transition = 'opacity 0.3s ease';
          setTimeout(() => {
            skeleton.classList.add('hidden');
            skeleton.style.display = 'none';
          }, 300);
        }
        // Show error fallback
        if (errorFallback) {
          errorFallback.style.display = 'flex';
        }
        productImage.style.display = 'none';
        return;
      }

      // Store images in data attribute for carousel
      productImage.setAttribute('data-product-images', JSON.stringify(imageUrls));
      productImage.setAttribute('data-current-image-index', '0');

      // Load first image
      const firstImage = new Image();
      firstImage.onload = () => {
        productImage.src = firstImage.src;
        productImage.style.display = 'block';
        productImage.classList.add('loaded');
        // Hide skeleton with animation
        if (skeleton) {
          skeleton.style.opacity = '0';
          skeleton.style.transition = 'opacity 0.3s ease';
          setTimeout(() => {
            skeleton.classList.add('hidden');
            skeleton.style.display = 'none';
          }, 300);
        }
        // Hide error fallback if it was shown
        errorFallback.style.display = 'none';
      };
      firstImage.onerror = () => {
        // Hide skeleton
        if (skeleton) {
          skeleton.style.opacity = '0';
          skeleton.style.transition = 'opacity 0.3s ease';
          setTimeout(() => {
            skeleton.classList.add('hidden');
            skeleton.style.display = 'none';
          }, 300);
        }
        // Hide image and show error fallback
        productImage.style.display = 'none';
        errorFallback.style.display = 'flex';
      };
      firstImage.src = imageUrls[0];

      // Setup carousel if multiple images
      if (imageUrls.length > 1 && arrowLeft && arrowRight) {
        arrowLeft.style.display = 'flex';
        arrowRight.style.display = 'flex';
        
        let currentImageIndex = 0;
        
        const updateImage = (newIndex) => {
          if (newIndex >= 0 && newIndex < imageUrls.length) {
            currentImageIndex = newIndex;
            const newImage = new Image();
            newImage.onload = () => {
              productImage.src = newImage.src;
              productImage.setAttribute('data-current-image-index', currentImageIndex);
            };
            newImage.src = imageUrls[currentImageIndex];
          }
        };
        
        arrowLeft.addEventListener('click', (e) => {
          e.stopPropagation();
          const newIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
          updateImage(newIndex);
        });
        
        arrowRight.addEventListener('click', (e) => {
          e.stopPropagation();
          const newIndex = (currentImageIndex + 1) % imageUrls.length;
          updateImage(newIndex);
        });
      } else if (arrowLeft && arrowRight) {
        arrowLeft.style.display = 'none';
        arrowRight.style.display = 'none';
      }
    });
  }

  // Setup slider functionality
  function setupSlider() {
    const container = document.getElementById('featuredProductsContainer');
    const arrowLeft = document.querySelector('.arrow-l');
    const arrowRight = document.querySelector('.arrow-r');
    
    if (!container) return;

    // Check if we're on mobile (should show all products, no slider)
    const isMobile = window.innerWidth <= 1023;
    
    if (isMobile) {
      // On mobile, hide arrows and show all products
      if (arrowLeft) arrowLeft.style.display = 'none';
      if (arrowRight) arrowRight.style.display = 'none';
      
      // Show all cards on mobile with full opacity
      const allCards = container.querySelectorAll('.custom-card');
      allCards.forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
      });
      return;
    }

    if (!arrowLeft || !arrowRight) return;

    // Show arrows on desktop
    arrowLeft.style.display = 'grid';
    arrowRight.style.display = 'grid';

    const maxSlides = Math.ceil(featuredProducts.length / productsPerSlide);
    
    function showSlide(index, animate = false) {
      currentSlideIndex = index;
      const startIndex = currentSlideIndex * productsPerSlide;
      const endIndex = startIndex + productsPerSlide;
      
      const allCards = container.querySelectorAll('.custom-card');
      
      if (animate) {
        // First, fade out currently visible cards
        allCards.forEach((card) => {
          if (card.style.display === 'block' && card.style.opacity !== '0') {
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
          }
        });
        
        // After fade out, hide old cards and show new ones
        setTimeout(() => {
          allCards.forEach((card, i) => {
            if (i >= startIndex && i < endIndex) {
              // Show new cards with opacity 0
              card.style.display = 'block';
              card.style.opacity = '0';
              card.style.visibility = 'hidden';
              
              // Force reflow to ensure opacity 0 is applied
              card.offsetHeight;
              
              // Then fade in
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.visibility = 'visible';
              }, 20);
            } else {
              // Hide old cards
              card.style.display = 'none';
            }
          });
        }, 150); // Wait for fade out to complete (half of 300ms transition)
      } else {
        // Initial load - no animation
        allCards.forEach((card, i) => {
          if (i >= startIndex && i < endIndex) {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
          } else {
            card.style.display = 'none';
          }
        });
      }
    }
    
    // Store function for use in event handler
    showSlideFunction = showSlide;

    // Initialize first slide without animation
    showSlide(0, false);
    
    // Return showSlide function for external use
    return showSlide;
  }

  // Handle slider arrows with event delegation
  document.addEventListener('click', function(e) {
    const arrowLeft = e.target.closest('.arrow-l');
    const arrowRight = e.target.closest('.arrow-r');
    
    if ((arrowLeft || arrowRight) && window.innerWidth > 1023 && showSlideFunction) {
      e.preventDefault();
      const maxSlides = Math.ceil(featuredProducts.length / productsPerSlide);
      
      if (arrowLeft) {
        currentSlideIndex = (currentSlideIndex - 1 + maxSlides) % maxSlides;
      } else {
        currentSlideIndex = (currentSlideIndex + 1) % maxSlides;
      }
      
      // Use the showSlide function with animation
      showSlideFunction(currentSlideIndex, true);
    }
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Only re-setup slider, don't re-render products
      showSlideFunction = setupSlider();
    }, 250);
  });

  // Load products on page load
  loadFeaturedProducts();

  // Additional check to set heart states after everything is loaded
  // This ensures hearts are set even if clone.js loads after index.js
  function updateAllHeartStates() {
    if (typeof isProductSaved === 'undefined') {
      // If function not yet available, try again after a short delay
      setTimeout(updateAllHeartStates, 100);
      return;
    }

    const allHeartContainers = document.querySelectorAll('.heart-container');
    allHeartContainers.forEach(heartContainer => {
      const productId = heartContainer.getAttribute("data-product-id");
      if (productId && isProductSaved(productId)) {
        const heartFilled = heartContainer.querySelector('.heart-filled');
        const heartOutline = heartContainer.querySelector('.heart-outline');
        if (heartFilled && heartOutline) {
          heartFilled.style.opacity = "1";
          heartOutline.style.opacity = "0";
        }
      }
    });
  }

  // Run initial check after a short delay to ensure clone.js is loaded
  setTimeout(updateAllHeartStates, 200);
  
  // Also run when window is fully loaded
  window.addEventListener('load', updateAllHeartStates);

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

  // Add to cart animation - using event delegation for dynamically added products
  document.addEventListener("click", function (e) {
    const addToCartButton = e.target.closest(".add-to-cart");
    if (!addToCartButton) return;
    
    // Prevent event bubbling
    e.stopPropagation();
    
    // Get product ID
    const productId = addToCartButton.getAttribute("data-product-id");
    if (!productId) return;
    
    // Add to cart using localStorage
    if (typeof addToCart !== 'undefined') {
      addToCart(productId);
    }
    
    // Find cart icon each time (in case header loads after this script)
    const cartIcon = document.querySelector("#openCart");
    if (!cartIcon) {
      console.warn("Cart icon (#openCart) not found. Header may not be loaded yet.");
      return;
    }

    // Get button position
    const buttonRect = addToCartButton.getBoundingClientRect();
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

    // Add cart button animation
    addToCartButton.classList.add("adding");
    setTimeout(() => {
      addToCartButton.classList.remove("adding");
    }, 300);

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

  // Add to saved items animation - using event delegation for dynamically added products
  document.addEventListener("click", function (e) {
    const heartContainer = e.target.closest(".heart-container");
    if (!heartContainer) return;
    
    // Prevent event bubbling
    e.stopPropagation();
    
    // Get product ID
    const productId = heartContainer.getAttribute("data-product-id");
    if (!productId) return;
    
    // Toggle heart state (fill/unfill)
    const heartFilled = heartContainer.querySelector('.heart-filled');
    const heartOutline = heartContainer.querySelector('.heart-outline');
    
    if (!heartFilled || !heartOutline) return;
    
    // Check if heart is currently active (filled) before toggling
    const isActive = heartFilled.style.opacity === "1";
    
    // Update localStorage
    if (typeof addToSavedItems !== 'undefined' && typeof removeFromSavedItems !== 'undefined') {
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
    // Find saved icon each time (in case header loads after this script)
    const savedIcon = document.querySelector("#savedProduct");
    if (!savedIcon) {
      console.warn("Saved icon (#savedProduct) not found. Header may not be loaded yet.");
      return;
    }

    // Get heart container position
    const heartRect = heartContainer.getBoundingClientRect();
    const heartX = heartRect.left + heartRect.width / 2;
    const heartY = heartRect.top + heartRect.height / 2;

    // Get saved icon position
    const savedRect = savedIcon.getBoundingClientRect();
    const savedX = savedRect.left + savedRect.width / 2;
    const savedY = savedRect.top + savedRect.height / 2;

    // Create flying element
    const flyingElement = document.createElement("div");
    flyingElement.className = "flying-item";
    flyingElement.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="width: 24px; height: 24px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009900"/></svg>';
    document.body.appendChild(flyingElement);

    // Set initial position
    flyingElement.style.position = "fixed";
    flyingElement.style.left = heartX + "px";
    flyingElement.style.top = heartY + "px";
    flyingElement.style.pointerEvents = "none";
    flyingElement.style.zIndex = "9999";

    // Trigger animation
    setTimeout(() => {
      flyingElement.style.transition =
        "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      flyingElement.style.left = savedX + "px";
      flyingElement.style.top = savedY + "px";
      flyingElement.style.opacity = "0";
      flyingElement.style.transform = "scale(0.3)";
    }, 10);

    // Add heart container animation
    heartContainer.classList.add("adding");
    setTimeout(() => {
      heartContainer.classList.remove("adding");
    }, 600);

    // Add pulse effect to saved icon
    savedIcon.style.animation = "cartNotify 0.6s ease";
    setTimeout(() => {
      savedIcon.style.animation = "";
    }, 600);

    // Remove flying element after animation
    setTimeout(() => {
      flyingElement.remove();
    }, 800);
  });

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

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  revealElements.forEach(el => observer.observe(el));

  // Lightbox Functionality
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


