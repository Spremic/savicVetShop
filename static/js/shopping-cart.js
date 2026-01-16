// shopping-cart.js - Dinamičko učitavanje proizvoda u korpi

// Slugify function (same as in other files)
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

// fallbackImages, pickImage, and formatPrice are defined in clone.js which loads before this file
// We'll use those functions directly

// Store productMap globally for use in event handlers
let productMap = {};

// Render cart items dynamically
async function renderCartItems() {
  // Check if functions are available
  if (typeof getCartItems === 'undefined' || typeof loadProductsData === 'undefined') {
    console.warn('Shopping cart: Waiting for clone.js to load...');
    setTimeout(renderCartItems, 200);
    return;
  }
  
  const cartItems = getCartItems();
  console.log('Cart items from localStorage:', cartItems);
  
  if (!cartItems || cartItems.length === 0) {
    console.log('Cart is empty');
  }
  
  const allProducts = await loadProductsData();
  console.log('Loaded products:', allProducts.length);
  
  if (!allProducts || allProducts.length === 0) {
    console.error('No products loaded from JSON');
    return;
  }
  
  // Create a map for quick product lookup (handle both string and number IDs)
  productMap = {};
  allProducts.forEach(p => {
    // Store with both string and number keys to handle type mismatches
    const id = p.id;
    productMap[id] = p;
    productMap[String(id)] = p;
    productMap[Number(id)] = p;
  });
  
  // Filter cart items to only include products that exist
  const validCartItems = cartItems.filter(item => {
    // Try both string and number ID lookups
    const id = item.id;
    const exists = productMap[id] || productMap[String(id)] || productMap[Number(id)];
    if (!exists) {
      console.warn('Product not found in JSON:', id, 'Type:', typeof id);
      // Log available IDs for debugging
      const availableIds = Object.keys(productMap).slice(0, 5);
      console.log('Sample available product IDs:', availableIds);
    }
    return exists;
  });
  console.log('Valid cart items:', validCartItems.length, 'out of', cartItems.length);
  
  const orderDetails = document.querySelector('.order-details');
  const orderTitle = document.querySelector('.order-title');
  const productCount = document.querySelector('.product-count');
  const orderTotal = document.querySelector('.order-total');
  
  if (!orderDetails) {
    console.warn('Shopping cart: .order-details not found');
    return;
  }
  
  // If cart is empty, show empty state
  if (validCartItems.length === 0) {
    orderDetails.innerHTML = `
      <div class="empty-cart-message" style="text-align: center; padding: 60px 20px; color: #e0e0e0;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: #009900; margin-bottom: 20px; display: block;">shopping_cart</span>
        <h3 style="margin-bottom: 10px;">Your cart is empty</h3>
        <p style="margin-bottom: 30px; color: #a0a0a0;">Looks like you haven't added anything to your cart yet.</p>
        <a href="/all-products" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #009900, #007700); color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Continue Shopping</a>
      </div>
    `;
    if (productCount) productCount.textContent = '0';
    if (orderTotal) orderTotal.textContent = 'Total: $0.00';
    return;
  }
  
  // Calculate totals
  let total = 0;
  let totalItems = 0; // Total quantity of all items
  let uniqueProducts = validCartItems.length; // Number of different products
  let html = '';
  
  validCartItems.forEach(cartItem => {
    const product = productMap[cartItem.id];
    if (!product) return;
    
    const quantity = cartItem.quantity || 1;
    // Use formatPrice from clone.js, but ensure it returns a number
    const priceValue = product.salePrice && product.salePrice !== '/' ? product.salePrice : product.price;
    const price = parseFloat(priceValue) || 0;
    const itemTotal = price * quantity;
    total += itemTotal;
    totalItems += quantity;
    const productSlug = slugify(product.title);
    
    html += `
      <div class="order-item" data-product-id="${product.id}">
        <button class="remove-item" aria-label="Remove item" data-product-id="${product.id}">×</button>
        <div class="item-image">
          <div class="item-image-skeleton"></div>
          <div class="item-image-error" style="display: none;">
            <span class="material-symbols-outlined">image_not_supported</span>
          </div>
          <img src="" alt="${product.title}" loading="lazy" style="opacity: 0; display: block;">
        </div>
        <div class="item-info">
          <h4 class="item-title">${product.title}</h4>
          <p class="item-brand">${product.brand || ''}</p>
          <div class="item-footer">
            <span class="item-price">$${itemTotal.toFixed(2)}</span>
            <div class="quantity-controls">
              <button class="quantity-btn minus" aria-label="Decrease quantity" data-product-id="${product.id}">-</button>
              <span class="quantity" data-product-id="${product.id}">${quantity}</span>
              <button class="quantity-btn plus" aria-label="Increase quantity" data-product-id="${product.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  orderDetails.innerHTML = html;
  
  // Update totals - show number of different products, not total quantity
  if (productCount) productCount.textContent = uniqueProducts;
  if (orderTotal) orderTotal.textContent = `Total: $${total.toFixed(2)}`;
  
  // Fetch images from Cloudinary and update
  if (validCartItems.length > 0) {
    loadShoppingCartImagesFromCloudinary(validCartItems, productMap);
  }
  
  // Attach event handlers
  attachCartEventHandlers();
}

// Attach event handlers for cart items
function attachCartEventHandlers() {
  // Quantity controls
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const quantitySpan = document.querySelector(`.quantity[data-product-id="${productId}"]`);
      let quantity = parseInt(quantitySpan.textContent);
      
      if (this.classList.contains('plus')) {
        quantity++;
        updateCartQuantity(productId, quantity);
      } else if (this.classList.contains('minus') && quantity > 1) {
        quantity--;
        updateCartQuantity(productId, quantity);
      }
      
      // Re-render to update prices
      renderCartItems();
    });
  });
  
  // Remove item functionality with FLIP animation (same as cart drawer)
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const productId = this.getAttribute('data-product-id');
      const orderItem = this.closest('.order-item');
      const orderDetails = document.querySelector('.order-details');
      
      if (!orderItem || !orderDetails) return;
      
      // Add removing class to trigger animation
      orderItem.classList.add('removing');
      
      // Wait for animation to complete before actually removing
      setTimeout(() => {
        // Use performFlipDelete from clone.js if available, otherwise use simple removal
        if (typeof performFlipDelete !== 'undefined') {
          performFlipDelete(
            orderDetails,
            orderItem,
            () => removeFromCart(productId), // Update Data
            () => renderCartItems()          // Update UI
          );
        } else {
          // Fallback: simple removal and re-render
          removeFromCart(productId);
          renderCartItems();
        }
      }, 300); // Match animation duration
    });
  });
  
  // Make order items clickable to navigate to product page
  document.querySelectorAll('.order-item').forEach(item => {
    item.addEventListener('click', function(e) {
      // Don't navigate if clicking on buttons
      if (e.target.closest('.remove-item') || 
          e.target.closest('.quantity-btn') || 
          e.target.closest('.quantity-controls')) {
        return;
      }
      
      const productId = this.getAttribute('data-product-id');
      const product = productMap && productMap[productId];
      if (product && product.title) {
        const productSlug = slugify(product.title);
        window.location.href = `/${productSlug}`;
      }
    });
  });
}

// Initialize on page load
function initializeShoppingCart() {
  // Wait for clone.js to load (which provides getCartItems, updateCartQuantity, removeFromCart, loadProductsData)
  if (typeof getCartItems === 'undefined' || typeof loadProductsData === 'undefined') {
    // Retry after a short delay
    setTimeout(initializeShoppingCart, 100);
    return;
  }
  
  // Make sure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCartItems);
  } else {
    // DOM already loaded
    renderCartItems();
  }
}

// Fetch product images in batch from Cloudinary
async function fetchProductImagesBatch(productIds) {
  try {
    const response = await fetch('/api/product-images/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productIds }),
      cache: 'no-store'
    });
    
    const data = await response.json();
    return data.results || {};
  } catch (error) {
    console.error('Error fetching batch images:', error);
    return {};
  }
}

// Load shopping cart images from Cloudinary
async function loadShoppingCartImagesFromCloudinary(cartItems, productMap) {
  const productIds = cartItems.map(item => item.id);
  const imagesData = await fetchProductImagesBatch(productIds);
  
  cartItems.forEach(cartItem => {
    const product = productMap[cartItem.id];
    if (!product) return;
    
    const orderItem = document.querySelector(`.order-item[data-product-id="${product.id}"]`);
    if (!orderItem) return;
    
    const imgElement = orderItem.querySelector('.item-image img');
    const skeleton = orderItem.querySelector('.item-image-skeleton');
    const itemImageContainer = orderItem.querySelector('.item-image');
    
    if (!imgElement) return;
    
    const productImages = imagesData[product.id] || [];
    const imageUrls = productImages.length > 0 
      ? productImages.map(img => img.url)
      : [];
    
    let itemError = itemImageContainer?.querySelector('.item-image-error');
    
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
      // Show error
      if (!itemError) {
        itemError = document.createElement('div');
        itemError.className = 'item-image-error';
        itemError.innerHTML = `
          <span class="material-symbols-outlined">image_not_supported</span>
        `;
        itemImageContainer.appendChild(itemError);
      }
      itemError.style.display = 'flex';
      imgElement.style.display = 'none';
      return;
    }
    
    // Load image
    const imageLoader = new Image();
    imageLoader.onload = () => {
      imgElement.src = imageLoader.src;
      imgElement.style.opacity = '1';
      imgElement.style.transition = 'opacity 0.3s ease';
      
      // Hide skeleton
      if (skeleton) {
        skeleton.style.opacity = '0';
        skeleton.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          skeleton.classList.add('hidden');
          skeleton.style.display = 'none';
        }, 300);
      }
      // Hide error if it was shown
      if (itemError) {
        itemError.style.display = 'none';
      }
    };
    imageLoader.onerror = () => {
      // Hide skeleton
      if (skeleton) {
        skeleton.style.opacity = '0';
        skeleton.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          skeleton.classList.add('hidden');
          skeleton.style.display = 'none';
        }, 300);
      }
      // Show error
      if (!itemError) {
        itemError = document.createElement('div');
        itemError.className = 'item-image-error';
        itemError.innerHTML = `
          <span class="material-symbols-outlined">image_not_supported</span>
        `;
        itemImageContainer.appendChild(itemError);
      }
      itemError.style.display = 'flex';
      imgElement.style.display = 'none';
    };
    imageLoader.src = imageUrls[0];
  });
}

// Start initialization
initializeShoppingCart();

// Also try after window load as fallback
window.addEventListener('load', function() {
  if (typeof getCartItems !== 'undefined' && typeof loadProductsData !== 'undefined') {
    renderCartItems();
  }
});

