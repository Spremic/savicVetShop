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

document.addEventListener("DOMContentLoaded", async function () {
  console.log('[PRODUCT] DOMContentLoaded - initializing product page');
  const productContainer = document.querySelector('.product-container');
  const productId = productContainer?.getAttribute('data-product-id');
  const mainImage = document.getElementById('mainProductImage');
  const mainImageSkeleton = document.querySelector('.main-image-skeleton');
  const thumbnailContainer = document.querySelector('.thumbnail-container');
  
  console.log('[PRODUCT] Initial state:', {
    productId: productId,
    hasMainImage: !!mainImage,
    hasSkeleton: !!mainImageSkeleton,
    hasThumbnailContainer: !!thumbnailContainer
  });
  
  // Simple skeleton hide function - aggressive hiding
  function hideSkeleton(skeleton) {
    if (!skeleton) {
      console.log('[SKELETON] hideSkeleton called but skeleton is null/undefined');
      return;
    }
    
    console.log('[SKELETON] Hiding skeleton:', {
      element: skeleton,
      className: skeleton.className,
      parentNode: skeleton.parentNode,
      currentDisplay: window.getComputedStyle(skeleton).display,
      currentOpacity: window.getComputedStyle(skeleton).opacity,
      currentZIndex: window.getComputedStyle(skeleton).zIndex
    });
    
    // Add hidden class
    skeleton.classList.add('hidden');
    
    // Force hide with inline styles
    skeleton.style.display = 'none';
    skeleton.style.opacity = '0';
    skeleton.style.visibility = 'hidden';
    skeleton.style.pointerEvents = 'none';
    skeleton.style.zIndex = '0';
    skeleton.style.animation = 'none';
    skeleton.style.background = 'transparent';
    
    console.log('[SKELETON] After hiding - styles:', {
      display: skeleton.style.display,
      opacity: skeleton.style.opacity,
      visibility: skeleton.style.visibility,
      zIndex: skeleton.style.zIndex,
      hasHiddenClass: skeleton.classList.contains('hidden'),
      computedDisplay: window.getComputedStyle(skeleton).display,
      computedOpacity: window.getComputedStyle(skeleton).opacity
    });
    
    // Remove from DOM after a short delay to ensure it's hidden
    setTimeout(() => {
      if (skeleton && skeleton.parentNode) {
        console.log('[SKELETON] Removing skeleton from DOM');
        skeleton.remove();
      } else {
        console.log('[SKELETON] Skeleton already removed or has no parent');
      }
    }, 100);
  }
  
  // Simplified and stable image loading function
  function loadImage(imgElement, imageUrl, skeleton, imageType = 'unknown') {
    if (!imgElement || !imageUrl || imageUrl.trim() === '') {
      // If no valid URL, show error immediately
      if (skeleton) {
        skeleton.classList.add('hidden');
        skeleton.style.display = 'none';
        setTimeout(() => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
        }, 100);
      }
      // Show error for main image
      if (imgElement.id === 'mainProductImage' || imgElement.classList.contains('main-image')) {
        const mainImageContainer = imgElement.closest('.main-image-container');
        if (mainImageContainer) {
          let errorFallback = mainImageContainer.querySelector('.main-image-error');
          if (!errorFallback) {
            errorFallback = document.createElement('div');
            errorFallback.className = 'main-image-error';
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
            mainImageContainer.appendChild(errorFallback);
          }
          errorFallback.style.display = 'flex';
        }
        imgElement.style.display = 'none';
      }
      // Show error for thumbnails
      const isThumbnail = imgElement.closest('.thumbnail');
      if (isThumbnail) {
        const thumbnail = imgElement.closest('.thumbnail');
        let thumbnailError = thumbnail.querySelector('.thumbnail-image-error');
        if (!thumbnailError) {
          thumbnailError = document.createElement('div');
          thumbnailError.className = 'thumbnail-image-error';
          thumbnailError.innerHTML = `
            <span class="material-symbols-outlined">image_not_supported</span>
          `;
          thumbnail.appendChild(thumbnailError);
        }
        thumbnailError.style.display = 'flex';
        imgElement.style.display = 'none';
      }
      return;
    }
    
    // Start with image completely hidden (no alt text visible) - skeleton should be visible
    imgElement.style.opacity = '0';
    imgElement.style.visibility = 'hidden';
    imgElement.style.display = 'block'; // Keep display block so image can load
    
    // Flag to prevent multiple showImage calls
    let imageShown = false;
    let timeoutId = null; // Store timeout ID for cleanup
    
    // Function to show image and hide skeleton
    const showImage = () => {
      // Prevent multiple calls
      if (imageShown) return;
      
      // First ensure image is loaded and ready
      if (!imgElement.complete || imgElement.naturalWidth === 0) {
        return;
      }
      
      imageShown = true;
      
      // Show image with fade in animation
      imgElement.style.visibility = 'visible';
      imgElement.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      imgElement.style.opacity = '1';
      imgElement.style.display = 'block';
      imgElement.classList.add('loaded');
      
      // Hide skeleton with animation
      if (skeleton) {
        skeleton.style.opacity = '0';
        skeleton.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          skeleton.classList.add('hidden');
          skeleton.style.display = 'none';
        }, 300);
      }
      
      // Hide error fallback if it exists
      if (imgElement.id === 'mainProductImage' || imgElement.classList.contains('main-image')) {
        const mainImageContainer = imgElement.closest('.main-image-container');
        if (mainImageContainer) {
          const errorFallback = mainImageContainer.querySelector('.main-image-error');
          if (errorFallback) {
            errorFallback.style.display = 'none';
          }
        }
      }
    };
    
    // Handle load event
    const handleLoad = () => {
      // Clear timeout if image loaded successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      // Double check that image is actually loaded before showing
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
          showImage();
        });
      } else {
        // If not complete yet, wait a bit and check again
        setTimeout(() => {
          if (imgElement.complete && imgElement.naturalWidth > 0) {
            requestAnimationFrame(() => {
              showImage();
            });
          }
        }, 50);
      }
    };
    
    // Handle error
    const handleError = () => {
      // Clear timeout if error occurred
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      // For thumbnails, show error message like Recommended Products
      const isThumbnail = imgElement.closest('.thumbnail');
      if (isThumbnail) {
        const thumbnail = imgElement.closest('.thumbnail');
        // Hide skeleton
        if (skeleton) {
          skeleton.classList.add('hidden');
          skeleton.style.display = 'none';
          setTimeout(() => {
            if (skeleton && skeleton.parentNode) {
              skeleton.remove();
            }
          }, 100);
        }
        // Show error fallback for thumbnails - simple icon only
        let thumbnailError = thumbnail.querySelector('.thumbnail-image-error');
        if (!thumbnailError) {
          thumbnailError = document.createElement('div');
          thumbnailError.className = 'thumbnail-image-error';
          thumbnailError.innerHTML = `
            <span class="material-symbols-outlined">image_not_supported</span>
          `;
          thumbnail.appendChild(thumbnailError);
        }
        thumbnailError.style.display = 'flex';
        imgElement.style.display = 'none';
        return;
      }
      
      // For main image, hide skeleton and show error
      if (skeleton) {
        skeleton.classList.add('hidden');
        skeleton.style.display = 'none';
        setTimeout(() => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
        }, 100);
      }
      // Show error fallback for main image
      if (imgElement.id === 'mainProductImage' || imgElement.classList.contains('main-image')) {
        const mainImageContainer = imgElement.closest('.main-image-container');
        if (mainImageContainer) {
          let errorFallback = mainImageContainer.querySelector('.main-image-error');
          const currentImageUrl = imgElement.src || imageUrl || '';
          if (!errorFallback) {
            errorFallback = document.createElement('div');
            errorFallback.className = 'main-image-error';
            errorFallback.setAttribute('data-image-url', currentImageUrl);
            errorFallback.innerHTML = `
              <div class="recommended-error-content">
                <span class="material-symbols-outlined recommended-error-icon">image_not_supported</span>
                <h4 class="recommended-error-title">Image Failed to Load</h4>
                <p class="recommended-error-message">We're having trouble loading this image. Please try again later.</p>
                <button class="recommended-error-retry" data-image-url="${currentImageUrl}">
                  <span class="material-symbols-outlined">refresh</span>
                  Try Again
                </button>
              </div>
            `;
            mainImageContainer.appendChild(errorFallback);
            
            // Setup retry button for main image
            const retryBtn = errorFallback.querySelector('.recommended-error-retry');
            if (retryBtn && currentImageUrl) {
              retryBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // Hide error and show skeleton again
                errorFallback.style.display = 'none';
                const mainImageSkeleton = mainImageContainer.querySelector('.main-image-skeleton');
                if (mainImageSkeleton) {
                  mainImageSkeleton.style.opacity = '1';
                  mainImageSkeleton.style.display = 'block';
                  mainImageSkeleton.classList.remove('hidden');
                }
                
                // Try loading image again
                imgElement.style.opacity = '0';
                imgElement.style.visibility = 'hidden';
                imgElement.style.display = 'block';
                
                const retryImage = new Image();
                retryImage.onload = () => {
                  imgElement.src = retryImage.src;
                  imgElement.style.visibility = 'visible';
                  imgElement.style.opacity = '1';
                  imgElement.classList.add('loaded');
                  if (mainImageSkeleton) {
                    mainImageSkeleton.style.opacity = '0';
                    setTimeout(() => {
                      mainImageSkeleton.classList.add('hidden');
                      mainImageSkeleton.style.display = 'none';
                    }, 300);
                  }
                };
                retryImage.onerror = () => {
                  if (mainImageSkeleton) {
                    mainImageSkeleton.style.opacity = '0';
                    setTimeout(() => {
                      mainImageSkeleton.classList.add('hidden');
                      mainImageSkeleton.style.display = 'none';
                    }, 300);
                  }
                  errorFallback.style.display = 'flex';
                };
                retryImage.src = currentImageUrl;
              });
            }
          } else {
            // Update existing error fallback with current image URL
            errorFallback.setAttribute('data-image-url', currentImageUrl);
            const retryBtn = errorFallback.querySelector('.recommended-error-retry');
            if (retryBtn) {
              retryBtn.setAttribute('data-image-url', currentImageUrl);
              // Remove any existing event listeners by cloning the button
              const newRetryBtn = retryBtn.cloneNode(true);
              retryBtn.parentNode.replaceChild(newRetryBtn, retryBtn);
              
              // Setup retry button for existing error fallback
              if (currentImageUrl) {
                newRetryBtn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  // Hide error and show skeleton again
                  errorFallback.style.display = 'none';
                  const mainImageSkeleton = mainImageContainer.querySelector('.main-image-skeleton');
                  if (mainImageSkeleton) {
                    mainImageSkeleton.style.opacity = '1';
                    mainImageSkeleton.style.display = 'block';
                    mainImageSkeleton.classList.remove('hidden');
                  }
                  
                  // Try loading image again
                  imgElement.style.opacity = '0';
                  imgElement.style.visibility = 'hidden';
                  imgElement.style.display = 'block';
                  
                  const retryImage = new Image();
                  retryImage.onload = () => {
                    imgElement.src = retryImage.src;
                    imgElement.style.visibility = 'visible';
                    imgElement.style.opacity = '1';
                    imgElement.classList.add('loaded');
                    if (mainImageSkeleton) {
                      mainImageSkeleton.style.opacity = '0';
                      setTimeout(() => {
                        mainImageSkeleton.classList.add('hidden');
                        mainImageSkeleton.style.display = 'none';
                      }, 300);
                    }
                  };
                  retryImage.onerror = () => {
                    if (mainImageSkeleton) {
                      mainImageSkeleton.style.opacity = '0';
                      setTimeout(() => {
                        mainImageSkeleton.classList.add('hidden');
                        mainImageSkeleton.style.display = 'none';
                      }, 300);
                    }
                    errorFallback.style.display = 'flex';
                  };
                  retryImage.src = currentImageUrl;
                });
              }
            }
          }
          errorFallback.style.display = 'flex';
          imgElement.style.display = 'none';
        }
      }
    };
    
    // Normalize URLs for comparison (remove query params, fragments, etc.)
    const normalizeUrl = (url) => {
      try {
        const urlObj = new URL(url, window.location.href);
        return urlObj.href.split('?')[0].split('#')[0];
      } catch {
        return url;
      }
    };
    
    const currentSrc = normalizeUrl(imgElement.src || '');
    const targetSrc = normalizeUrl(imageUrl);
    
    // Check if image is already loaded with the target URL (cached)
    if (currentSrc === targetSrc && imgElement.complete && imgElement.naturalWidth > 0) {
      // Image already loaded - show immediately
      requestAnimationFrame(() => {
        showImage();
      });
      return;
    }
    
    // CRITICAL: Attach event listeners FIRST before setting src
    imgElement.addEventListener('load', handleLoad, { once: true });
    imgElement.addEventListener('error', handleError, { once: true });
    
    // Set up timeout to show error if image doesn't load within 5 seconds
    const timeoutDuration = 5000; // 5 seconds
    const handleTimeout = () => {
      // Remove event listeners to prevent them from firing after timeout
      imgElement.removeEventListener('load', handleLoad);
      imgElement.removeEventListener('error', handleError);
      // Call handleError to show error message
      handleError();
    };
    
    // Set src to trigger loading
    imgElement.src = imageUrl;
    
    // Start timeout
    timeoutId = setTimeout(handleTimeout, timeoutDuration);
    
    // Check immediately after setting src (for synchronous cache loads)
    // Use multiple checks to catch all cases
    const checkLoaded = () => {
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        // Verify it's the right image
        const newSrc = normalizeUrl(imgElement.src || '');
        if (newSrc === targetSrc) {
          handleLoad();
          return true;
        }
      }
      return false;
    };
    
    // Check immediately
    if (checkLoaded()) {
      return;
    }
    
    // Check after a microtask (for very fast cache loads)
    setTimeout(() => {
      if (checkLoaded()) {
        return;
      }
      
      // If still not loaded, set up periodic check as fallback
      let checkCount = 0;
      const maxChecks = 50;
      const checkInterval = setInterval(() => {
        checkCount++;
        if (checkLoaded()) {
          clearInterval(checkInterval);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          // Final fallback: if image has src and is complete, show it anyway
          if (imgElement.src && imgElement.complete && imgElement.naturalWidth > 0) {
            const finalSrc = normalizeUrl(imgElement.src || '');
            if (finalSrc === targetSrc || finalSrc.includes(targetSrc.split('/').pop())) {
              requestAnimationFrame(() => {
                showImage();
              });
            }
          }
        }
      }, 100);
    }, 0);
  }
  
  if (productId && mainImage && thumbnailContainer) {
    console.log('[PRODUCT] Starting to load product images for productId:', productId);
    // Start with main image completely hidden (no alt text visible) and skeleton visible
    mainImage.style.opacity = '0';
    mainImage.style.visibility = 'hidden';
    if (mainImageSkeleton) {
      mainImageSkeleton.style.opacity = '1';
      mainImageSkeleton.style.display = 'block';
      mainImageSkeleton.classList.remove('hidden');
    }
    
    // Show temporary skeleton loaders for thumbnails immediately
    const tempSkeletonCount = 4; // Show 4 skeleton loaders initially
    thumbnailContainer.innerHTML = '';
    for (let i = 0; i < tempSkeletonCount; i++) {
      const tempThumbnail = document.createElement('div');
      tempThumbnail.className = 'thumbnail';
      const tempSkeleton = document.createElement('div');
      tempSkeleton.className = 'thumbnail-skeleton';
      tempThumbnail.appendChild(tempSkeleton);
      thumbnailContainer.appendChild(tempThumbnail);
    }
    
    try {
      // Fetch images from API
      console.log('[PRODUCT] Fetching images from API:', `/api/product-images/${productId}`);
      const response = await fetch(`/api/product-images/${productId}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error(`API response not OK: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[PRODUCT] API response:', data);
      const productImages = data.images || [];
      console.log('[PRODUCT] Found', productImages.length, 'images');
      
      if (productImages.length > 0) {
        // Clear container
        thumbnailContainer.innerHTML = '';
        
        // Load main image first
        const firstImage = productImages[0];
        if (firstImage && firstImage.url) {
          loadImage(mainImage, firstImage.url, mainImageSkeleton, 'main');
        } else {
          // No images available - hide skeleton
          hideSkeleton(mainImageSkeleton);
        }
        
        // Create all thumbnails first (DOM structure)
        const thumbnailElements = [];
        const validImages = productImages.filter(img => img && img.url && img.url.trim() !== '');
        
        // If no valid images, show 4 error messages for thumbnails
        if (validImages.length === 0) {
          thumbnailContainer.innerHTML = '';
          for (let i = 0; i < 4; i++) {
            const errorThumbnail = document.createElement('div');
            errorThumbnail.className = 'thumbnail';
            errorThumbnail.innerHTML = `
              <div class="thumbnail-image-error">
                <span class="material-symbols-outlined">image_not_supported</span>
              </div>
            `;
            thumbnailContainer.appendChild(errorThumbnail);
          }
        } else {
          productImages.forEach((imageData, index) => {
            if (!imageData || !imageData.url || imageData.url.trim() === '') return;
          
          const thumbnail = document.createElement('div');
          thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
          thumbnail.setAttribute('data-image', imageData.url);
          
          // Create skeleton
          const skeleton = document.createElement('div');
          skeleton.className = 'thumbnail-skeleton';
          
          // Create image
          const img = document.createElement('img');
          img.alt = `Thumbnail ${index + 1}`;
          // Start with image completely hidden (no alt text visible) but display block so it can load
          img.style.opacity = '0';
          img.style.visibility = 'hidden';
          img.style.display = 'block';
          // Don't use lazy loading for first few images to ensure they load immediately
          if (index > 2) {
            img.loading = 'lazy';
          }
          
          // Ensure skeleton is visible initially and stays visible until image loads
          skeleton.style.opacity = '1';
          skeleton.style.display = 'block';
          skeleton.classList.remove('hidden');
          
          thumbnail.appendChild(skeleton);
          thumbnail.appendChild(img);
          thumbnailContainer.appendChild(thumbnail);
          
          thumbnailElements.push({ img, skeleton, url: imageData.url, index });
          });
        }
        
        // Now load all images - first one immediately, others with small delay
        if (thumbnailElements.length > 0) {
          console.log('[PRODUCT IMAGES] Loading', thumbnailElements.length, 'thumbnails');
          thumbnailElements.forEach(({ img, skeleton, url, index }) => {
          console.log(`[PRODUCT IMAGES] Processing thumbnail ${index}:`, { url, hasSkeleton: !!skeleton, skeletonClass: skeleton?.className });
          if (index === 0) {
            // First thumbnail loads immediately
            console.log(`[PRODUCT IMAGES] Loading thumbnail ${index} immediately`);
            loadImage(img, url, skeleton, `thumbnail-${index}`);
          } else {
            // Use requestAnimationFrame to ensure DOM is ready before loading
            console.log(`[PRODUCT IMAGES] Scheduling thumbnail ${index} load with delay:`, index * 20);
            requestAnimationFrame(() => {
              // Small delay between each image to prevent race conditions
              setTimeout(() => {
                console.log(`[PRODUCT IMAGES] Loading thumbnail ${index} after delay`);
                loadImage(img, url, skeleton, `thumbnail-${index}`);
              }, index * 20);
            });
          }
          });
          
          // Safety check: after 6 seconds, show errors for any thumbnails that still have skeletons
          setTimeout(() => {
            thumbnailElements.forEach(({ img, skeleton, url, index }) => {
              const thumbnail = img.closest('.thumbnail');
              if (thumbnail) {
                // Check if skeleton is still visible (meaning image didn't load)
                const stillHasSkeleton = thumbnail.querySelector('.thumbnail-skeleton:not(.hidden)');
                const imgNotLoaded = !img.classList.contains('loaded') && (!img.complete || img.naturalWidth === 0);
                const noErrorShown = !thumbnail.querySelector('.thumbnail-image-error');
                
                if (stillHasSkeleton || (imgNotLoaded && noErrorShown)) {
                  console.log(`[PRODUCT IMAGES] Thumbnail ${index} timeout - showing error`);
                  // Hide skeleton
                  if (skeleton) {
                    skeleton.classList.add('hidden');
                    skeleton.style.display = 'none';
                    setTimeout(() => {
                      if (skeleton && skeleton.parentNode) {
                        skeleton.remove();
                      }
                    }, 100);
                  }
                  // Show error
                  let thumbnailError = thumbnail.querySelector('.thumbnail-image-error');
                  if (!thumbnailError) {
                    thumbnailError = document.createElement('div');
                    thumbnailError.className = 'thumbnail-image-error recommended-image-error';
                    thumbnailError.innerHTML = `
                      <span class="material-symbols-outlined">image_not_supported</span>
                    `;
                    thumbnail.appendChild(thumbnailError);
                  }
                  thumbnailError.style.display = 'flex';
                  img.style.display = 'none';
                }
              }
            });
          }, 6000); // 6 seconds safety timeout
        }
        
        // Update lens if it exists
        if (typeof updateLensImage === 'function') {
          setTimeout(() => {
            updateLensImage();
          }, 100);
        }
        
        // Show/hide arrows
        const arrowLeft = document.querySelector(".image-arrow-left");
        const arrowRight = document.querySelector(".image-arrow-right");
        if (productImages.length <= 1) {
          if (arrowLeft) arrowLeft.style.display = 'none';
          if (arrowRight) arrowRight.style.display = 'none';
        } else {
          if (arrowLeft) arrowLeft.style.display = '';
          if (arrowRight) arrowRight.style.display = '';
        }
        
        // Setup thumbnail handlers after images have time to initialize
        // Use longer delay to ensure all images are properly set up
        setTimeout(() => {
          setupThumbnailHandlers();
        }, 300);
      } else {
        // No images - show error messages for main and 4 thumbnails
        console.log('[PRODUCT] No images found, showing error');
        if (mainImageSkeleton) {
          hideSkeleton(mainImageSkeleton);
        }
        if (mainImage) {
          mainImage.style.display = 'none';
          const mainImageContainer = mainImage.closest('.main-image-container');
          if (mainImageContainer) {
            let errorFallback = mainImageContainer.querySelector('.main-image-error');
            if (!errorFallback) {
              errorFallback = document.createElement('div');
              errorFallback.className = 'main-image-error';
              errorFallback.innerHTML = `
                <div class="recommended-error-content">
                  <span class="material-symbols-outlined recommended-error-icon">image_not_supported</span>
                  <h4 class="recommended-error-title">Image Failed to Load</h4>
                  <p class="recommended-error-message">We're having trouble loading this image. Please try again later.</p>
                  <button class="recommended-error-retry compact" aria-label="Try again">
                    <span class="material-symbols-outlined">refresh</span>
                  </button>
                </div>
              `;
              mainImageContainer.appendChild(errorFallback);
            }
            errorFallback.style.display = 'flex';
          }
        }
        
        // Clear thumbnails and show 4 error messages
        thumbnailContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) {
          const errorThumbnail = document.createElement('div');
          errorThumbnail.className = 'thumbnail';
          errorThumbnail.innerHTML = `
            <div class="thumbnail-image-error">
              <span class="material-symbols-outlined">image_not_supported</span>
            </div>
          `;
          thumbnailContainer.appendChild(errorThumbnail);
        }
        
        const arrowLeft = document.querySelector(".image-arrow-left");
        const arrowRight = document.querySelector(".image-arrow-right");
        if (arrowLeft) arrowLeft.style.display = 'none';
        if (arrowRight) arrowRight.style.display = 'none';
      }
    } catch (error) {
      console.error('[PRODUCT] Error loading product images:', error);
      // Show error message on error instead of fallback image
      if (mainImageSkeleton) {
        hideSkeleton(mainImageSkeleton);
      }
      if (mainImage) {
        mainImage.style.display = 'none';
        const mainImageContainer = mainImage.closest('.main-image-container');
        if (mainImageContainer) {
          let errorFallback = mainImageContainer.querySelector('.main-image-error');
          if (!errorFallback) {
            errorFallback = document.createElement('div');
            errorFallback.className = 'main-image-error';
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
            mainImageContainer.appendChild(errorFallback);
          }
          errorFallback.style.display = 'flex';
        }
      }
      
      // Clear thumbnails and show 4 error messages
      thumbnailContainer.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const errorThumbnail = document.createElement('div');
        errorThumbnail.className = 'thumbnail';
        errorThumbnail.innerHTML = `
          <div class="thumbnail-image-error">
            <span class="material-symbols-outlined">image_not_supported</span>
          </div>
        `;
        thumbnailContainer.appendChild(errorThumbnail);
      }
      
      const arrowLeft = document.querySelector(".image-arrow-left");
      const arrowRight = document.querySelector(".image-arrow-right");
      if (arrowLeft) arrowLeft.style.display = 'none';
      if (arrowRight) arrowRight.style.display = 'none';
    }
  } else {
    // No product ID or missing elements
    console.warn('[PRODUCT] Missing productId or elements:', {
      productId: productId,
      mainImage: !!mainImage,
      thumbnailContainer: !!thumbnailContainer
    });
    if (mainImageSkeleton) {
      hideSkeleton(mainImageSkeleton);
    }
    if (mainImage) {
      mainImage.style.display = 'none';
      const mainImageContainer = mainImage.closest('.main-image-container');
      if (mainImageContainer) {
        let errorFallback = mainImageContainer.querySelector('.main-image-error');
        if (!errorFallback) {
          errorFallback = document.createElement('div');
          errorFallback.className = 'main-image-error';
          errorFallback.innerHTML = `
            <div class="recommended-error-content">
              <span class="material-symbols-outlined recommended-error-icon">image_not_supported</span>
              <h4 class="recommended-error-title">Image Failed to Load</h4>
              <p class="recommended-error-message">We're having trouble loading this image. Please try again later.</p>
              <button class="recommended-error-retry compact" aria-label="Try again">
                <span class="material-symbols-outlined">refresh</span>
              </button>
            </div>
          `;
          mainImageContainer.appendChild(errorFallback);
        }
        errorFallback.style.display = 'flex';
      }
    }
    setTimeout(() => {
      setupThumbnailHandlers();
    }, 100);
  }
  
  // Final safety check: ensure all images that are loaded are visible
  // This catches any edge cases where images loaded before JavaScript ran
  // Run multiple checks to catch all cases
  const ensureImagesVisible = () => {
    // Check main image - if already loaded, show it with fade-in
    if (mainImage && mainImage.complete && mainImage.naturalWidth > 0 && mainImage.src) {
      const currentOpacity = window.getComputedStyle(mainImage).opacity;
      if (currentOpacity === '0' || mainImage.style.opacity === '0' || !mainImage.classList.contains('loaded')) {
        mainImage.style.visibility = 'visible';
        mainImage.style.transition = 'opacity 0.3s ease';
        mainImage.style.opacity = '1';
        mainImage.classList.add('loaded');
        // Hide skeleton if it exists
        if (mainImageSkeleton) {
          hideSkeleton(mainImageSkeleton);
        }
      }
    }
    
    // Check all thumbnail images
    const allThumbnailImages = document.querySelectorAll('.thumbnail img');
    allThumbnailImages.forEach(img => {
      if (img.complete && img.naturalWidth > 0 && img.src) {
        const currentOpacity = window.getComputedStyle(img).opacity;
        if (currentOpacity === '0' || img.style.opacity === '0' || !img.classList.contains('loaded')) {
          img.style.visibility = 'visible';
          img.style.transition = 'opacity 0.3s ease';
          img.style.opacity = '1';
          img.classList.add('loaded');
          // Hide skeleton if it exists
          const thumbnail = img.closest('.thumbnail');
          if (thumbnail) {
            const skeleton = thumbnail.querySelector('.thumbnail-skeleton');
            if (skeleton) {
              hideSkeleton(skeleton);
            }
          }
        }
      }
    });
    
    // Check all recommended product images
    const allRecommendedImages = document.querySelectorAll('.recommended-card img');
    allRecommendedImages.forEach(img => {
      if (img.complete && img.naturalWidth > 0 && img.src) {
        const currentOpacity = window.getComputedStyle(img).opacity;
        if (currentOpacity === '0' || img.style.opacity === '0' || !img.classList.contains('loaded')) {
          img.style.visibility = 'visible';
          img.style.transition = 'opacity 0.3s ease';
          img.style.opacity = '1';
          img.style.display = 'block';
          img.classList.add('loaded');
          // Hide skeleton if it exists
          const card = img.closest('.recommended-card');
          if (card) {
            const skeleton = card.querySelector('.recommended-image-skeleton');
            if (skeleton) {
              skeleton.style.opacity = '0';
              skeleton.style.transition = 'opacity 0.3s ease';
              setTimeout(() => {
                skeleton.classList.add('hidden');
                skeleton.style.display = 'none';
              }, 300);
            }
          }
        }
      }
    });
  };
  
  // Run safety check multiple times to catch all edge cases
  setTimeout(ensureImagesVisible, 50);
  setTimeout(ensureImagesVisible, 200);
  setTimeout(ensureImagesVisible, 500);
  setTimeout(ensureImagesVisible, 1000);
  
  // Also run on window load event
  window.addEventListener('load', ensureImagesVisible);
  
  // MutationObserver to watch for images that get loaded but remain hidden
  // This catches edge cases where images load but opacity stays 0
  const imageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const img = mutation.target;
        if (img.tagName === 'IMG' && img.complete && img.naturalWidth > 0) {
          const currentOpacity = window.getComputedStyle(img).opacity;
          if (currentOpacity === '0' || img.style.opacity === '0') {
            // Image is loaded but opacity is 0 - fix it
            img.style.visibility = 'visible';
            img.style.opacity = '1';
            img.classList.add('loaded');
            // Hide skeleton if it exists
            const thumbnail = img.closest('.thumbnail');
            if (thumbnail) {
              const skeleton = thumbnail.querySelector('.thumbnail-skeleton');
              if (skeleton) {
                hideSkeleton(skeleton);
              }
            }
            const card = img.closest('.recommended-card');
            if (card) {
              const skeleton = card.querySelector('.recommended-image-skeleton');
              if (skeleton) {
                skeleton.style.opacity = '0';
                setTimeout(() => {
                  skeleton.classList.add('hidden');
                  skeleton.style.display = 'none';
                }, 300);
              }
            }
          }
        }
      }
    });
  });
  
  // Observe all images in the product page
  const allImages = document.querySelectorAll('.product-page img');
  allImages.forEach(img => {
    imageObserver.observe(img, { attributes: true, attributeFilter: ['src'] });
  });
  
  // Also observe images added dynamically
  const containerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'IMG') {
            imageObserver.observe(node, { attributes: true, attributeFilter: ['src'] });
            // Check immediately if already loaded
            if (node.complete && node.naturalWidth > 0) {
              const currentOpacity = window.getComputedStyle(node).opacity;
              if (currentOpacity === '0' || node.style.opacity === '0') {
                node.style.visibility = 'visible';
                node.style.opacity = '1';
                node.classList.add('loaded');
              }
            }
          }
          // Also check for images inside added nodes
          const images = node.querySelectorAll && node.querySelectorAll('img');
          if (images) {
            images.forEach(img => {
              imageObserver.observe(img, { attributes: true, attributeFilter: ['src'] });
              if (img.complete && img.naturalWidth > 0) {
                const currentOpacity = window.getComputedStyle(img).opacity;
                if (currentOpacity === '0' || img.style.opacity === '0') {
                  img.style.visibility = 'visible';
                  img.style.opacity = '1';
                  img.classList.add('loaded');
                }
              }
            });
          }
        }
      });
    });
  });
  
  // Observe product container and recommended products container for dynamically added images
  // Use the already declared productContainer from line 37
  const recommendedContainer = document.getElementById('recommendedProducts');
  if (productContainer) {
    containerObserver.observe(productContainer, { childList: true, subtree: true });
  }
  if (recommendedContainer) {
    containerObserver.observe(recommendedContainer, { childList: true, subtree: true });
  }
  
  // Function to setup thumbnail handlers (will be called after images are loaded)
  function setupThumbnailHandlers() {
    const thumbnails = document.querySelectorAll(".thumbnail");
    const thumbnailContainer = document.querySelector(".thumbnail-container");
    
    thumbnails.forEach((thumbnail, index) => {
      // Remove existing listeners by cloning
      const newThumbnail = thumbnail.cloneNode(true);
      thumbnail.parentNode.replaceChild(newThumbnail, thumbnail);
      
      // Add click handler
      newThumbnail.addEventListener("click", function () {
        // Remove active class from all thumbnails
        document.querySelectorAll(".thumbnail").forEach((t) => t.classList.remove("active"));
        
        // Add active class to clicked thumbnail
        this.classList.add("active");
        
        // Update main image
        const imageSrc = this.getAttribute("data-image");
        if (imageSrc && mainImage) {
          // Load new image directly without changing opacity
          // Fade out current image
          mainImage.style.opacity = '0';
          
          const newImg = new Image();
          newImg.onload = () => {
            mainImage.src = newImg.src;
            // Fade in new image
            mainImage.style.transition = 'opacity 0.3s ease';
            mainImage.style.opacity = '1';
            mainImage.classList.add('loaded');
            updateLensImage();
          };
          newImg.src = imageSrc;
        }
        
        // Scroll behavior based on screen size
        if (thumbnailContainer) {
          const isMobile = window.innerWidth < 1024;
          
          if (isMobile) {
            // Horizontal scroll for mobile/tablet
            const isLastThumbnail = index === thumbnails.length - 1;
            
            if (isLastThumbnail) {
              const thumbnailWidth = 100;
              const gap = 10;
              const scrollAmount = thumbnailWidth + gap;
              const currentScrollLeft = thumbnailContainer.scrollLeft;
              const maxScrollLeft = thumbnailContainer.scrollWidth - thumbnailContainer.clientWidth;
              
              if (currentScrollLeft < maxScrollLeft) {
                const newScrollLeft = Math.min(currentScrollLeft + scrollAmount, maxScrollLeft);
                thumbnailContainer.scrollTo({
                  left: newScrollLeft,
                  behavior: 'smooth'
                });
              }
            } else {
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
            const containerHeight = 486;
            const itemHeight = thumbnailHeight + gap;
            const targetPosition = containerHeight - thumbnailHeight - 50;
            const thumbnailPosition = index * itemHeight;
            const scrollPosition = thumbnailPosition - targetPosition;
            const finalScrollPosition = Math.max(0, scrollPosition);
            
            thumbnailContainer.scrollTo({
              top: finalScrollPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

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
  // mainImage and thumbnailContainer are already declared above
  const mainImageContainer = document.querySelector(".main-image-container");

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
    const thumbnails = document.querySelectorAll(".thumbnail:not([style*='display: none'])");
    let currentIndex = 0;
    thumbnails.forEach((thumb, index) => {
      const thumbSrc = thumb.getAttribute("data-image");
      if (thumbSrc) {
        // Compare full URLs or just the image filename
        if (currentSrc === thumbSrc || currentSrc.includes(thumbSrc.split('/').pop())) {
          currentIndex = index;
        }
      }
    });
    return currentIndex;
  }
  
  // Function to switch image
  function switchImage(direction) {
    const thumbnails = document.querySelectorAll(".thumbnail:not([style*='display: none'])");
    if (thumbnails.length === 0) return;
    
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
      // Get product ID from product container
      const productContainer = document.querySelector(".product-container");
      const productId = productContainer?.getAttribute("data-product-id");
      
      if (productId && typeof addToCart !== 'undefined') {
        addToCart(productId);
      }
      
      // Redirect to shopping cart
      window.location.href = '/shopping-cart';
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



  // Fallback images for product page
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
      console.log('[BATCH IMAGES] Fetching images for', productIds.length, 'products');
      const response = await fetch('/api/product-images/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds }),
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Batch API response not OK: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[BATCH IMAGES] Received data for', Object.keys(data.results || {}).length, 'products');
      return data.results || {};
    } catch (error) {
      console.error('[BATCH IMAGES] Error fetching batch images:', error);
      return {};
    }
  }

  // Load and display recommended products (optimized)
  async function loadRecommendedProducts() {
    console.log('[RECOMMENDED] Loading recommended products...');
    const container = document.getElementById('recommendedProducts');
    if (!container) {
      console.warn('[RECOMMENDED] Container not found');
      return;
    }
    
    // Hide initial skeleton loaders that are already in HTML
    const skeletonCards = container.querySelectorAll('.recommended-skeleton-card');
    skeletonCards.forEach(card => {
      card.style.display = 'none';
      card.classList.add('hidden');
    });
    
    try {
      // Use preloaded JSON if available, otherwise fetch
      let products;
      if (window.productJsonPromise) {
        console.log('[RECOMMENDED] Using preloaded JSON');
        products = await window.productJsonPromise;
      } else {
        console.log('[RECOMMENDED] Fetching JSON from server');
        const response = await fetch('/json/product.json', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        products = await response.json();
      }
      console.log('[RECOMMENDED] Products loaded:', products.length);

      // Get current product ID from URL or data attribute
      const productContainer = document.querySelector('.product-container');
      const currentProductId = productContainer?.getAttribute('data-product-id') || 
                               new URLSearchParams(window.location.search).get('id');

      // Filter out current product and get random products
      const availableProducts = products.filter(product => product.id !== currentProductId);
      const recommendedProducts = [];

      // Get 20 random products for 5 slajders (4 products per slajd)
      const numProducts = Math.min(20, availableProducts.length);
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      recommendedProducts.push(...shuffled.slice(0, numProducts));

      // Remove skeleton cards and display recommended products immediately with skeleton loaders
      container.innerHTML = '';
      displayRecommendedProducts(recommendedProducts);

      // Fetch images in batch (optimized)
      const productIds = recommendedProducts.map(p => p.id);
      console.log('[RECOMMENDED] Fetching images for', productIds.length, 'products');
      const imagesData = await fetchProductImagesBatch(productIds);
      console.log('[RECOMMENDED] Images data received:', Object.keys(imagesData).length, 'products have images');
      
      // Update images when loaded
      updateRecommendedProductImages(imagesData, recommendedProducts);

      // Initialize carousel after products are loaded
      initializeRecommendedCarousel();

    } catch (error) {
      console.error('[RECOMMENDED] Error loading recommended products:', error);
      // Hide skeleton cards on error
      const skeletonCards = container.querySelectorAll('.recommended-skeleton-card');
      skeletonCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          card.remove();
        }, 300);
      });
      
      // Show error message to user
      if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><p>Unable to load recommended products. Please try refreshing the page.</p></div>';
      }
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
        }, 250);

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
        // Get product ID from the card
        const card = btn.closest(".recommended-card");
        const productId = card?.getAttribute("data-product-id");
        
        // Add product to cart
        if (productId && typeof addToCart !== 'undefined') {
          addToCart(productId);
        }
        
        // Redirect to shopping cart
        window.location.href = '/shopping-cart';
      });
    });
  }

  function displayRecommendedProducts(products) {
    console.log('Displaying recommended products:', products.length);
    const container = document.getElementById('recommendedProducts');
    console.log('Container found:', !!container);
    if (!container) return;

    container.innerHTML = products.map((product, index) => {
      const price = product.salePrice && product.salePrice !== '/' ? product.salePrice : product.price;
      const hasDiscount = product.salePrice && product.salePrice !== '/' && product.percentage && product.percentage !== '/' && product.percentage !== '0%';
      const discountPercentage = hasDiscount ? product.percentage : '';
      const oldPriceValue = hasDiscount ? product.price : null;

      return `
        <div class="recommended-card" data-product-id="${product.id}">
          <div class="recommended-image-c">
            <div class="recommended-image-skeleton"></div>
            <div class="recommended-image-error" style="display: none;">
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
            ${hasDiscount ? `<div class="recommended-discount-badge">-${discountPercentage}</div>` : ''}
            <div class="recommended-heart-container" data-product-id="${product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path class="recommended-heart-outline" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#009900" stroke-width="2" />
                <path class="recommended-heart-filled" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009900" opacity="0" />
              </svg>
            </div>
            <img src="" alt="${product.title}" loading="lazy" data-product-id="${product.id}" style="display: none;" />
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

  // Update recommended product images when loaded from Cloudinary
  function updateRecommendedProductImages(imagesData, products) {
    products.forEach((product) => {
      const card = document.querySelector(`.recommended-card[data-product-id="${product.id}"]`);
      if (!card) return;

      const productImage = card.querySelector('.recommended-image-c img');
      const imageContainer = card.querySelector('.recommended-image-c');
      const skeleton = card.querySelector('.recommended-image-skeleton');
      
      if (!productImage || !imageContainer) return;

      const productImages = imagesData[product.id] || [];
      const imageUrls = productImages.length > 0 
        ? productImages.map(img => img.url)
        : [];

      // Start with image hidden and skeleton visible
      productImage.style.opacity = '0';
      if (skeleton) {
        skeleton.style.opacity = '1';
        skeleton.style.display = 'block';
        skeleton.classList.remove('hidden');
      }

      // Get error fallback element
      const errorFallback = card.querySelector('.recommended-image-error');
      const retryButton = errorFallback?.querySelector('.recommended-error-retry');

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

      // Load first image
      const firstImage = new Image();
      let imageShown = false;
      
      const showRecommendedImage = () => {
        if (imageShown) return;
        imageShown = true;
        
        productImage.src = firstImage.src;
        productImage.classList.add('loaded');
        // Show image with fade in
        productImage.style.visibility = 'visible';
        productImage.style.opacity = '1';
        productImage.style.display = 'block';
        productImage.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
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
        if (errorFallback) {
          errorFallback.style.display = 'none';
        }
      };
      
      firstImage.onload = () => {
        // Double check that image is actually loaded
        if (firstImage.complete && firstImage.naturalWidth > 0) {
          requestAnimationFrame(() => {
            showRecommendedImage();
          });
        } else {
          setTimeout(() => {
            if (firstImage.complete && firstImage.naturalWidth > 0) {
              requestAnimationFrame(() => {
                showRecommendedImage();
              });
            }
          }, 50);
        }
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
        if (errorFallback) {
          errorFallback.style.display = 'flex';
        }
      };
      
      firstImage.src = imageUrls[0];
      
      // Check if image is already cached and loaded
      if (firstImage.complete && firstImage.naturalWidth > 0) {
        requestAnimationFrame(() => {
          showRecommendedImage();
        });
      }

      // Setup retry button functionality
      if (retryButton && imageUrls.length > 0) {
        retryButton.addEventListener('click', function(e) {
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
          // Try loading image again
          const retryImage = new Image();
          retryImage.onload = () => {
            productImage.src = retryImage.src;
            productImage.style.display = 'block';
            productImage.style.opacity = '1';
            if (skeleton) {
              skeleton.style.opacity = '0';
              setTimeout(() => {
                skeleton.classList.add('hidden');
                skeleton.style.display = 'none';
              }, 300);
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
          };
          retryImage.src = imageUrls[0];
        });
      }
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
    console.log('[RECOMMENDED] Attempting to load recommended products');
    const container = document.getElementById('recommendedProducts');
    if (container) {
      console.log('[RECOMMENDED] Container found, loading products');
      loadRecommendedProducts();
    } else {
      console.warn('[RECOMMENDED] Recommended products container not found. Retrying...');
      // Retry after a short delay
      setTimeout(() => {
        const retryContainer = document.getElementById('recommendedProducts');
        if (retryContainer) {
          console.log('[RECOMMENDED] Container found on retry, loading products');
          loadRecommendedProducts();
        } else {
          console.error('[RECOMMENDED] Recommended products container still not found after retry.');
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
