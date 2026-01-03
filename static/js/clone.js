// clone.js - Dinamicko ucitavanje header-a i footer-a

// ========== LOCALSTORAGE UTILITY FUNCTIONS ==========
// Cart functions
function getCartItems() {
  try {
    const cart = localStorage.getItem('cart');
    if (!cart) return [];
    const parsed = JSON.parse(cart);
    // Migrate old format (array of IDs) to new format (array of objects)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      const newCart = parsed.map(id => ({ id: id, quantity: 1 }));
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
    return [];
  }
}

function addToCart(productId, quantity = 1) {
  const cart = getCartItems();
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity: quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  return true;
}

function removeFromCart(productId) {
  const cart = getCartItems();
  const index = cart.findIndex(item => item.id === productId);
  if (index > -1) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    return true;
  }
  return false;
}

function updateCartQuantity(productId, quantity) {
  const cart = getCartItems();
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    return true;
  }
  return false;
}

function getCartItemQuantity(productId) {
  const cart = getCartItems();
  const item = cart.find(item => item.id === productId);
  return item ? item.quantity : 0;
}

// Saved items functions
function getSavedItems() {
  try {
    const saved = localStorage.getItem('savedItems');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading savedItems from localStorage:', e);
    return [];
  }
}

function addToSavedItems(productId) {
  const saved = getSavedItems();
  if (!saved.includes(productId)) {
    saved.push(productId);
    localStorage.setItem('savedItems', JSON.stringify(saved));
    // Update all heart icons for this product across the page
    updateHeartIconsForProduct(productId);
    return true;
  }
  return false;
}

function removeFromSavedItems(productId) {
  const saved = getSavedItems();
  const index = saved.indexOf(productId);
  if (index > -1) {
    saved.splice(index, 1);
    localStorage.setItem('savedItems', JSON.stringify(saved));
    // Update all heart icons for this product across the page
    updateHeartIconsForProduct(productId);
    return true;
  }
  return false;
}

function isProductSaved(productId) {
  const saved = getSavedItems();
  return saved.includes(productId);
}

// Update all heart icons for a specific product across the page
function updateHeartIconsForProduct(productId) {
  const isSaved = isProductSaved(productId);
  
  // Update all heart-container elements (used in product cards)
  document.querySelectorAll(`.heart-container[data-product-id="${productId}"]`).forEach(heartContainer => {
    const heartFilled = heartContainer.querySelector('.heart-filled');
    const heartOutline = heartContainer.querySelector('.heart-outline');
    if (heartFilled && heartOutline) {
      heartFilled.style.opacity = isSaved ? "1" : "0";
      heartOutline.style.opacity = isSaved ? "0" : "1";
    }
  });
  
  // Update all recommended-heart-container elements
  document.querySelectorAll(`.recommended-heart-container[data-product-id="${productId}"]`).forEach(heartContainer => {
    const heartFilled = heartContainer.querySelector('.recommended-heart-filled');
    const heartOutline = heartContainer.querySelector('.recommended-heart-outline');
    if (heartFilled && heartOutline) {
      heartFilled.style.opacity = isSaved ? "1" : "0";
      heartOutline.style.opacity = isSaved ? "0" : "1";
    }
  });
  
  // Update btn-favorite elements (used on product detail page)
  document.querySelectorAll(`.btn-favorite[data-product-id="${productId}"]`).forEach(favoriteBtn => {
    const heartFilled = favoriteBtn.querySelector('.heart-filled');
    const heartOutline = favoriteBtn.querySelector('.heart-outline');
    if (heartFilled && heartOutline) {
      if (isSaved) {
        favoriteBtn.classList.add("active");
        heartFilled.style.opacity = "1";
        heartOutline.style.opacity = "0";
      } else {
        favoriteBtn.classList.remove("active");
        heartFilled.style.opacity = "0";
        heartOutline.style.opacity = "1";
      }
    } else {
      // Fallback for old structure with material-symbols-outlined span
      const icon = favoriteBtn.querySelector("span");
      if (isSaved) {
        favoriteBtn.classList.add("active");
        if (icon) {
          icon.textContent = "favorite";
        }
      } else {
        favoriteBtn.classList.remove("active");
        if (icon) {
          icon.textContent = "favorite_border";
        }
      }
    }
  });
}

// Helper functions for rendering
const fallbackImages = [
  "/img/granula.jpg",
  "/img/pas1.jpg",
  "/img/pas2.jpg",
  "/img/pas3.jpg",
  "/img/pansion.jpg",
  "/img/pansionSlika.jpg",
  "/img/zec.jpg",
  "/img/papagaj.png",
  "/img/pasPozadina.jpg",
  "/img/pozadinaMacka.jpg",
  "/img/galerija/lokal1.jpg",
  "/img/galerija/lokal2.jpg",
  "/img/galerija/lokal3.jpg",
  "/img/galerija/lokal4.jpg",
  "/img/galerija/lokal5.jpg",
  "/img/galerija/lokal6.jpg"
];

function pickImage(product) {
  if (product.image) return product.image;
  const key = `${product.id || ""}-${product.title || ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const idx = hash % fallbackImages.length;
  return fallbackImages[idx] || "/img/customPageBcg.png";
}

function formatPrice(product) {
  const price = product.salePrice && product.salePrice !== '/' ? product.salePrice : product.price;
  return price;
}

// Render cart drawer
async function renderCartDrawer() {
  const cartItems = getCartItems();
  const allProducts = await loadProductsData();
  
  // Create a map for quick product lookup
  const productMap = {};
  allProducts.forEach(p => { productMap[p.id] = p; });
  
  // Filter cart items to only include products that exist
  const validCartItems = cartItems.filter(item => productMap[item.id]);
  
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const totalPriceEl = document.querySelector('.total-price');
  
  if (!cartItemsContainer) return;
  
  if (validCartItems.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-state empty-cart">
        <div class="empty-icon">
          <span class="material-symbols-outlined">shopping_cart</span>
        </div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a href="/all-products" class="empty-cta-btn">
          <span class="material-symbols-outlined">shopping_bag</span>
          Shop
        </a>
      </div>
    `;
    if (cartCount) cartCount.textContent = '(0)';
    if (totalPriceEl) totalPriceEl.textContent = '$0.00';
    // Hide cart footer when empty
    const cartFooter = document.querySelector('.cart-footer');
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }
  
  // Show cart footer when not empty
  const cartFooterShow = document.querySelector('.cart-footer');
  if (cartFooterShow) cartFooterShow.style.display = 'block';
  
  let total = 0;
  let totalItems = 0;
  let html = '';
  
  validCartItems.forEach(cartItem => {
    const product = productMap[cartItem.id];
    const quantity = cartItem.quantity || 1;
    const price = parseFloat(formatPrice(product));
    const itemTotal = price * quantity;
    total += itemTotal;
    totalItems += quantity;
    const imageSrc = pickImage(product);
    
    html += `
      <div class="cart-item" data-product-id="${product.id}">
        <div class="item-img">
          <img src="${imageSrc}" alt="${product.title}" loading="lazy">
        </div>
        <div class="item-details">
          <h4>${product.title}</h4>
          <p class="item-variant">${product.brand || ''}</p>
          <div class="price-row">
            <span class="item-price">$${itemTotal.toFixed(2)}</span>
            <div class="qty-control">
              <button class="qty-btn minus" data-product-id="${product.id}">-</button>
              <input type="number" value="${quantity}" min="1" readonly data-product-id="${product.id}">
              <button class="qty-btn plus" data-product-id="${product.id}">+</button>
            </div>
          </div>
        </div>
        <button class="remove-item" data-product-id="${product.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  });
  
  cartItemsContainer.innerHTML = html;
  if (cartCount) cartCount.textContent = `(${totalItems})`;
  if (totalPriceEl) totalPriceEl.textContent = `$${total.toFixed(2)}`;
  
  // Attach remove handlers with animation
  cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const productId = this.getAttribute('data-product-id');
      const cartItem = this.closest('.cart-item');
      
      // Add removing class to trigger animation
      cartItem.classList.add('removing');
      
      // Wait for animation to complete before actually removing
      setTimeout(() => {
        performFlipDelete(
            cartItemsContainer,
            cartItem,
            () => removeFromCart(productId), // Update Data
            () => updateCartTotalsOnly()     // Update UI
        );
      }, 300); // Match animation duration
    });
  });
  
  // Attach quantity handlers
  cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const input = this.parentElement.querySelector('input');
      const currentQty = parseInt(input.value) || 1;
      updateCartQuantity(productId, currentQty + 1);
      renderCartDrawer();
    });
  });
  
  cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(btn => {
    btn.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const input = this.parentElement.querySelector('input');
      const currentQty = parseInt(input.value) || 1;
      if (currentQty > 1) {
        updateCartQuantity(productId, currentQty - 1);
        renderCartDrawer();
      }
    });
  });
  
  // Add click handler to navigate to product page when clicking on cart item
  cartItemsContainer.querySelectorAll('.cart-item').forEach(item => {
    item.addEventListener('click', function(e) {
      // Don't navigate if clicking on buttons or quantity controls
      if (e.target.closest('.remove-item') || 
          e.target.closest('.qty-btn') || 
          e.target.closest('.qty-control') ||
          e.target.closest('input')) {
        return;
      }
      
      const productId = this.getAttribute('data-product-id');
      const product = productMap[productId];
      if (product && product.title) {
        const productSlug = slugify(product.title);
        window.location.href = `/${productSlug}`;
      }
    });
  });
}

// Function to show cart notification (defined at top level for accessibility)
function showCartNotification(productName) {
  const toastElement = document.getElementById('cartToast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toastElement || !toastMessage) return;
  
  // Check if Bootstrap is available
  if (typeof bootstrap === 'undefined') {
    console.warn('Bootstrap is not loaded. Toast notification will not be shown.');
    return;
  }
  
  // Update message with product name
  toastMessage.textContent = `${productName} has been added to your cart!`;
  
  // Initialize and show Bootstrap toast
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000
  });
  toast.show();
}

// Helper function for FLIP animation (First, Last, Invert, Play)
// This enables smooth reordering of items when one is removed
function performFlipDelete(container, itemToRemove, updateDataCallback, updateUiCallback) {
  // 1. Snapshot positions of all remaining items (First)
  const siblings = Array.from(container.children).filter(el => 
      el !== itemToRemove && 
      el.style.display !== 'none' && 
      !el.classList.contains('removing')
  );
  
  const positions = siblings.map(el => {
      const rect = el.getBoundingClientRect();
      return { el, left: rect.left, top: rect.top };
  });

  // 2. Remove item from DOM
  itemToRemove.remove();

  // 3. Update data (localStorage)
  if (updateDataCallback) updateDataCallback();

  // 4. Update UI totals (counters, prices)
  if (updateUiCallback) updateUiCallback();

  // 5. FLIP animation
  requestAnimationFrame(() => {
      positions.forEach(pos => {
          // Measure new position (Last)
          const newRect = pos.el.getBoundingClientRect();
          const deltaX = pos.left - newRect.left;
          const deltaY = pos.top - newRect.top;

          // Only animate if position changed
          if (deltaX !== 0 || deltaY !== 0) {
              // Invert: Apply transform to put element back to old visual position
              pos.el.style.transition = 'none';
              pos.el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
              
              // Play: Remove transform and let CSS transition animate to new position
              requestAnimationFrame(() => {
                  pos.el.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                  pos.el.style.transform = '';
              });
          }
      });
  });
}

// Update cart totals without full re-render
async function updateCartTotalsOnly() {
  const cartItems = getCartItems();
  
  // If empty, full re-render to show empty state
  if (cartItems.length === 0) {
      renderCartDrawer();
      return;
  }

  const allProducts = await loadProductsData();
  const productMap = {};
  allProducts.forEach(p => { productMap[p.id] = p; });

  let total = 0;
  let totalItems = 0;

  cartItems.forEach(cartItem => {
      const product = productMap[cartItem.id];
      if (product) {
          const quantity = cartItem.quantity || 1;
          const price = parseFloat(formatPrice(product));
          total += price * quantity;
          totalItems += quantity;
      }
  });

  const cartCount = document.querySelector('.cart-count');
  const totalPriceEl = document.querySelector('.total-price');
  
  if (cartCount) cartCount.textContent = `(${totalItems})`;
  if (totalPriceEl) totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

// Update saved count without full re-render
function updateSavedCountOnly() {
  const savedItems = getSavedItems();
  
  // If empty, full re-render to show empty state
  if (savedItems.length === 0) {
      renderSavedDrawer();
      return;
  }

  const savedCount = document.querySelector('.saved-count');
  if (savedCount) savedCount.textContent = savedItems.length;
}

// Render saved items drawer
async function renderSavedDrawer() {
  const savedItems = getSavedItems();
  const allProducts = await loadProductsData();
  const savedProducts = allProducts.filter(p => savedItems.includes(p.id));
  
  const savedItemsContainer = document.querySelector('.saved-items-grid');
  const savedCount = document.querySelector('.saved-count');
  
  if (!savedItemsContainer) return;
  
  if (savedProducts.length === 0) {
    savedItemsContainer.innerHTML = `
      <div class="empty-state empty-saved">
        <div class="empty-icon">
          <span class="material-symbols-outlined">favorite</span>
        </div>
        <h3>Your wishlist is empty</h3>
        <p>Save your favorite products for later by clicking the heart icon.</p>
        <a href="/all-products" class="empty-cta-btn">
          <span class="material-symbols-outlined">explore</span>
          Browse
        </a>
      </div>
    `;
    if (savedCount) savedCount.textContent = '0';
    // Hide saved footer when empty
    const savedFooter = document.querySelector('.saved-footer');
    if (savedFooter) savedFooter.style.display = 'none';
    return;
  }
  
  // Show saved footer when not empty
  const savedFooterShow = document.querySelector('.saved-footer');
  if (savedFooterShow) savedFooterShow.style.display = 'block';
  
  let html = '';
  
  savedProducts.forEach(product => {
    const price = parseFloat(formatPrice(product));
    const imageSrc = pickImage(product);
    
    html += `
      <div class="saved-item-card" data-product-id="${product.id}">
        <button class="remove-saved-item" data-product-id="${product.id}">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="saved-img">
          <img src="${imageSrc}" alt="${product.title}" loading="lazy">
        </div>
        <div class="saved-details">
          <h4>${product.title}</h4>
          <p class="saved-variant">${product.brand || ''}</p>
          <div class="saved-bottom">
            <span class="saved-price">$${price.toFixed(2)}</span>
            <button class="move-to-cart-btn" data-product-id="${product.id}">
              <span class="material-symbols-outlined">shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  savedItemsContainer.innerHTML = html;
  if (savedCount) savedCount.textContent = savedProducts.length;
  
  // Attach remove handlers with animation
  savedItemsContainer.querySelectorAll('.remove-saved-item').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const productId = this.getAttribute('data-product-id');
      const savedCard = this.closest('.saved-item-card');
      
      // Add removing class to trigger fade-out animation
      savedCard.classList.add('removing');
      
      // Wait for fade-out animation to complete before re-layout
      setTimeout(() => {
        performFlipDelete(
            savedItemsContainer, 
            savedCard, 
            () => removeFromSavedItems(productId), // Update Data
            () => updateSavedCountOnly()           // Update UI
        );
      }, 300); // Match animation duration
    });
  });
  
  // Attach move to cart handlers with animation
  savedItemsContainer.querySelectorAll('.move-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const productId = this.getAttribute('data-product-id');
      const savedCard = this.closest('.saved-item-card');
      
      // Find the product to get its name for the notification
      const product = allProducts.find(p => p.id === productId);
      const productName = product ? product.title : 'Product';
      
      // Add to cart
      addToCart(productId);
      renderCartDrawer();
      
      // Add removing animation
      savedCard.classList.add('removing');
      
      // Wait for animation before removing from saved items
      setTimeout(() => {
        performFlipDelete(
            savedItemsContainer, 
            savedCard, 
            () => removeFromSavedItems(productId), // Update Data
            () => {
                updateSavedCountOnly();
                // Show Bootstrap toast notification after removal
                showCartNotification(productName);
            }
        );
      }, 300); // Match animation duration
    });
  });
  
  // Add click handler to navigate to product page when clicking on saved item card
  savedItemsContainer.querySelectorAll('.saved-item-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't navigate if clicking on buttons
      if (e.target.closest('.remove-saved-item') || 
          e.target.closest('.move-to-cart-btn')) {
        return;
      }
      
      const productId = this.getAttribute('data-product-id');
      const product = allProducts.find(p => p.id === productId);
      if (product && product.title) {
        const productSlug = slugify(product.title);
        window.location.href = `/${productSlug}`;
      }
    });
  });
}

// Funkcija za učitavanje i parsiranje product.json
async function loadProductsData() {
  try {
    const response = await fetch('/json/product.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error loading product.json:', error);
    return [];
  }
}

// Funkcija za kreiranje strukture category iz JSON podataka
function parseCategories(products) {
  const categoryMap = {};

  // Mapiranje category na ikonice (na osnovu postojećeg koda)
  const categoryIcons = {
    "Pet Food": "restaurant",
    "Pet Toys": "toys",
    "Pet Supplies": "pets",
    "Pet Grooming": "soap"
  };

  // Mapiranje category na data-category atribute
  const categoryDataAttrs = {
    "Pet Food": "hrana",
    "Pet Toys": "igracke",
    "Pet Supplies": "oprema",
    "Pet Grooming": "higijena"
  };

  products.forEach(product => {
    const { category, subcategory, type } = product;

    if (!categoryMap[category]) {
      categoryMap[category] = {
        icon: categoryIcons[category] || "category",
        dataAttr: categoryDataAttrs[category] || category.toLowerCase().replace(/\s+/g, ''),
        subcategories: {}
      };
    }

    if (subcategory && !categoryMap[category].subcategories[subcategory]) {
      categoryMap[category].subcategories[subcategory] = {
        subcategories2: new Set()
      };
    }

    if (type && subcategory) {
      categoryMap[category].subcategories[subcategory].subcategories2.add(type);
    }
  });

  return categoryMap;
}

// Funkcija za generisanje dinamičkog HTML-a za dropdown
function generateDynamicDropdownHTML(categoryMap) {
  let sidebarHTML = '';
  let contentHTML = '';

  const slugify = (value) => {
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
  };

  Object.entries(categoryMap).forEach(([categoryName, categoryData], index) => {
    const isActive = index === 0 ? 'active' : '';
    const { icon, dataAttr, subcategories } = categoryData;

    // Sidebar dugmad
    sidebarHTML += `
      <button class="category-btn ${isActive}" data-category="${dataAttr}">
        <span class="material-symbols-outlined">${icon}</span>
        <span>${categoryName}</span>
      </button>
    `;

    // Content paneli
    let subcategoriesHTML = '';
    const subcats = Object.keys(subcategories);

    // Podeli potkategorije u kolone (maksimalno 3 kolone)
    const columns = [];
    const itemsPerColumn = Math.ceil(subcats.length / 3);

    for (let i = 0; i < subcats.length; i += itemsPerColumn) {
      const columnSubcats = subcats.slice(i, i + itemsPerColumn);
      let columnHTML = '';

      columnSubcats.forEach(subcat => {
        const subcatData = subcategories[subcat];
        const subcatHref = `/${slugify(categoryName)}/${slugify(subcat)}`;
        columnHTML += `<a class="subcategory-title" href="${subcatHref}">${subcat}</a>`;

        // Sortiraj potkategorije2
        const sortedSubcat2 = Array.from(subcatData.subcategories2).sort();

        sortedSubcat2.forEach(subcat2 => {
          const subcat2Href = `/${slugify(categoryName)}/${slugify(subcat)}/${slugify(subcat2)}`;
          columnHTML += `<a href="${subcat2Href}">${subcat2}</a>`;
        });
      });

      if (columnHTML) {
        columns.push(`<div class="subcategory-column">${columnHTML}</div>`);
      }
    }

    subcategoriesHTML = `<div class="subcategories-grid">${columns.join('')}</div>`;

    contentHTML += `
      <div class="category-panel ${isActive}" data-category="${dataAttr}">
        <div class="category-header">
          <h3>
            <span class="material-symbols-outlined">${icon}</span>
            ${categoryName}
          </h3>
          <a href="/${slugify(categoryName)}" class="view-all-link">View all →</a>
        </div>
        ${subcategoriesHTML}
      </div>
    `;
  });

  return { sidebarHTML, contentHTML };
}

document.addEventListener("DOMContentLoaded", async function () {
  // Učitaj podatke o proizvodima
  const products = await loadProductsData();
  const categoryMap = parseCategories(products);
  const { sidebarHTML, contentHTML } = generateDynamicDropdownHTML(categoryMap);

  // Header HTML
  const headerHTML = `
    <header>
      <nav>
        <div class="left">
          <a href="/" class="logo-link"><img src="/img/happy animal.png" alt="Happy Animals logo" loading="eager" fetchpriority="high" /></a>
          <h1><a href="/" class="logo-link">Happy Animals</a></h1>
        </div>

        <div class="mid">
          <nav>
            <ul>
              <a href="/" class="active"><li>Home</li></a>
              <a href="/about"><li>About</li></a>
              <a href="/gallery"><li>Gallery</li></a>
              <li class="dropdown">
                <a href="/products">Products</a>
                <div class="mega-dropdown">
                  <div class="mega-dropdown-wrapper">
                    <!-- Left Sidebar: Categories List -->
                    <div class="categories-sidebar">
                      ${sidebarHTML}
                    </div>

                    <!-- Right Content Area: Subcategories -->
                    <div class="categories-content">
                      ${contentHTML}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>

        <div class="right">
            <button id="openCart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <span class="btn-text">My cart</span>
          </button>

          <button id="savedProduct">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z"
                fill="#000000"
              />
            </svg>

            <span class="btn-text">Saved items</span>
          </button>
        </div>

        <div class="hamburger">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </nav>
      <div class="mobile-menu-overlay"></div>
    </header>
  `;

  // Footer HTML
  const footerHTML = `
    <footer>
      <div class="footerTopContent">
        <h4>Follow us:</h4>
        <div class="footerTopIcons">
          <a href="https://www.facebook.com/profile.php?id=100017595854060">
            <i class="fab fa-facebook ig" aria-hidden="true"></i>
          </a>
          <a href="https://www.instagram.com/savic_vet_shop_cuprija/">
            <i class="fab fa-instagram fb" aria-hidden="true"></i>
          </a>
        </div>
        <a href="#body" id="scrollToTop"
          >Scroll to top <i class="fa fa-arrow-up" aria-hidden="true"></i
        ></a>
      </div>

      <div class="footerBottomContent">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/gallery">Gallery</a>
      <a href="/legal">Legal</a>
      </div>
    </footer>
  `;

  // Ubaci header na pocetak body-a
  document.body.insertAdjacentHTML("afterbegin", headerHTML);

  // Ubaci footer na kraj body-a (pre lightbox modala ako postoji)
  const lightboxModal = document.getElementById("lightbox-modal");
  if (lightboxModal) {
    lightboxModal.insertAdjacentHTML("beforebegin", footerHTML);
  } else {
    document.body.insertAdjacentHTML("beforeend", footerHTML);
  }

  // Scroll effect za header
  const header = document.querySelector("header");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Set active nav link based on current path
  function setActiveNav() {
    let path = window.location.pathname || '/';
    // Normalize paths by removing .html
    const normalize = (p) => {
      if (!p) return '/';
      if (p.endsWith('/index.html')) return '/';
      return p.replace(/\.html$/, '');
    };
    path = normalize(path);
    const anchors = document.querySelectorAll('header nav .mid ul a');
    anchors.forEach((a) => {
      a.classList.remove('active');
      try {
        const hrefPath = normalize(new URL(a.href, window.location.origin).pathname);
        if (hrefPath === path) {
          a.classList.add('active');
        }
      } catch (e) {
        // ignore invalid URLs
      }
    });
  }

  setActiveNav();
  window.addEventListener('popstate', setActiveNav);

  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".mid");
  const overlay = document.querySelector(".mobile-menu-overlay");
  const body = document.body;

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
      overlay.classList.toggle("active");
      body.classList.toggle("no-scroll");
    });
  }
  
  if (overlay) {
      overlay.addEventListener("click", () => {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          overlay.classList.remove("active");
          body.classList.remove("no-scroll");
      });
  }

  // Mobile dropdown toggle
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach(dropdown => {
      const link = dropdown.querySelector("a");
      // Prevent default link behavior on mobile to allow toggling dropdown
      link.addEventListener("click", (e) => {
          if (window.innerWidth <= 1024) { // Mobile/Tablet breakpoint
              // Check if it's the main products link
              if (dropdown.classList.contains("dropdown")) {
                  // If dropdown is not active, prevent navigation and toggle it
                  if (!dropdown.classList.contains("active")) {
                      e.preventDefault();
                      dropdown.classList.add("active");
                  } 
                  // If it IS active, let the link work (go to /products) or toggle off?
                  // Usually clicking again toggles off.
                  else {
                      e.preventDefault();
                      dropdown.classList.remove("active");
                  }
              }
          }
      });
  });

  // Desktop mega dropdown positioning + overflow guard (before hamburger kicks in)
  const productsDropdown = document.querySelector("header ul li.dropdown");
  const megaDropdown = productsDropdown?.querySelector(".mega-dropdown");

  function resetMegaDropdownStyles() {
    if (!megaDropdown) return;
    megaDropdown.style.left = "";
    megaDropdown.style.right = "";
    megaDropdown.style.transform = "";
    megaDropdown.style.maxHeight = "";
    megaDropdown.style.overflowY = "";
    megaDropdown.classList.remove("enable-scroll");
    
    // Reset wrapper styles
    const wrapper = megaDropdown.querySelector('.mega-dropdown-wrapper');
    if (wrapper) {
      wrapper.style.height = "";
      wrapper.style.maxHeight = "";
    }
    
    // Reset sidebar styles
    const sidebar = megaDropdown.querySelector('.categories-sidebar');
    if (sidebar) {
      sidebar.style.height = "";
      sidebar.style.maxHeight = "";
      sidebar.style.overflowY = "";
      sidebar.style.overflowX = "";
    }
  }

  function adjustMegaDropdownPosition() {
    if (!megaDropdown || !productsDropdown) return;

    // Do not override mobile layout
    if (window.innerWidth <= 1024) {
      resetMegaDropdownStyles();
      return;
    }

    // Start from the centered default so measurements are correct
    megaDropdown.style.left = "50%";
    megaDropdown.style.transform = "translateX(-50%)";
    megaDropdown.style.right = "";
    megaDropdown.classList.remove("enable-scroll");

    const triggerRect = productsDropdown.getBoundingClientRect();
    const dropdownWidth = megaDropdown.offsetWidth;
    const viewportWidth = window.innerWidth;
    const safePadding = 16;

    const idealLeft = triggerRect.left + triggerRect.width / 2 - dropdownWidth / 2;
    const clampedLeft = Math.max(
      safePadding,
      Math.min(idealLeft, viewportWidth - dropdownWidth - safePadding)
    );
    const relativeLeft = clampedLeft - triggerRect.left;

    megaDropdown.style.left = `${relativeLeft}px`;
    megaDropdown.style.transform = "translateX(0)";

    // Available height based on dropdown trigger position
    const availableHeight = Math.max(
      200,
      window.innerHeight - triggerRect.bottom - safePadding
    );

    // Limit overall dropdown height
    megaDropdown.style.maxHeight = `${availableHeight}px`;

    // Use availableHeight directly for children so they don't exceed viewport
    const usableHeight = availableHeight;

    const needsScroll = megaDropdown.scrollHeight > usableHeight;
    megaDropdown.classList.toggle("enable-scroll", needsScroll);

    // Set height for wrapper and sidebar to enable overflow when needed
    const wrapper = megaDropdown.querySelector('.mega-dropdown-wrapper');
    const sidebar = megaDropdown.querySelector('.categories-sidebar');
    
    if (wrapper) {
      wrapper.style.height = `${usableHeight}px`;
      wrapper.style.maxHeight = `${usableHeight}px`;
    }
    
    if (sidebar) {
      // Match the dropdown height so the scrollbar appears whenever needed
      sidebar.style.height = `${usableHeight}px`;
      sidebar.style.maxHeight = `${usableHeight}px`;
      sidebar.style.overflowY = 'auto';
      sidebar.style.overflowX = 'hidden';
    }
  }

  if (productsDropdown && megaDropdown) {
    // Wrap adjustMegaDropdownPosition to ensure it runs after render
    const adjustMegaDropdownPositionDelayed = () => {
      requestAnimationFrame(() => {
        adjustMegaDropdownPosition();
        // Call again after a short delay to ensure it works after CSS transitions
        setTimeout(() => {
          adjustMegaDropdownPosition();
        }, 50);
      });
    };
    
    productsDropdown.addEventListener("mouseenter", adjustMegaDropdownPositionDelayed);
    productsDropdown.addEventListener("focusin", adjustMegaDropdownPositionDelayed);

    // Prevent default click behavior on products link
    const productsLink = productsDropdown.querySelector('a');
    if (productsLink) {
      productsLink.addEventListener('click', function(e) {
        e.preventDefault();
      });
    }
  }

  window.addEventListener("resize", adjustMegaDropdownPosition);

  // ========== CATEGORY SWITCHING LOGIC ==========
  const categoryBtns = document.querySelectorAll('.category-btn');
  const categoryPanels = document.querySelectorAll('.category-panel');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      
      // Remove active class from all buttons and panels
      categoryBtns.forEach(b => b.classList.remove('active'));
      categoryPanels.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked button and corresponding panel
      btn.classList.add('active');
      const targetPanel = document.querySelector(`.category-panel[data-category="${category}"]`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // ========== CART DRAWER LOGIC ==========
  const cartDrawerHTML = `
    <div class="cart-overlay-bg"></div>
    <div class="cart-drawer">
      <div class="cart-header">
        <h3>Your Cart <span class="cart-count">(0)</span></h3>
        <button class="close-cart">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="cart-items">
        <!-- Cart items will be dynamically rendered here -->
      </div>

      <div class="cart-footer">
        <div class="subtotal-row">
          <span>Subtotal</span>
          <span class="total-price">$0.00</span>
        </div>
        <p class="shipping-note">Shipping & taxes calculated at checkout</p>
        <button class="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", cartDrawerHTML);

  // ========== SAVED ITEMS DRAWER LOGIC ==========
  const savedDrawerHTML = `
    <div class="saved-drawer">
      <div class="saved-header">
        <h3><span class="material-symbols-outlined">favorite</span> Wishlist <span class="saved-count">0</span></h3>
        <button class="close-saved">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="saved-items-grid">
        <!-- Saved items will be dynamically rendered here -->
      </div>

      <div class="saved-footer">
        <button class="move-all-btn">Move All to Cart</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", savedDrawerHTML);

  // ========== TOAST NOTIFICATION CONTAINER ==========
  const toastContainerHTML = `
    <div class="toast-container position-fixed" style="bottom: 20px; right: 20px; z-index: 10000;">
      <div id="cartToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="background-color: #000; color: #fff;">
        <div class="toast-header" style="background-color: #009900; color: #fff; border-bottom: 1px solid #333;">
          <span class="material-symbols-outlined me-2" style="color: #fff;">check_circle</span>
          <span class="me-auto" style="color: #fff;">Success</span>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body" style="background-color: #000; color: #fff;">
          <span id="toastMessage">Product added to cart!</span>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", toastContainerHTML);

  const openCartBtn = document.getElementById("openCart");
  const openSavedBtn = document.getElementById("savedProduct");
  
  const cartDrawer = document.querySelector(".cart-drawer");
  const savedDrawer = document.querySelector(".saved-drawer");
  const cartOverlay = document.querySelector(".cart-overlay-bg");
  
  const closeCartBtn = document.querySelector(".close-cart");
  const closeSavedBtn = document.querySelector(".close-saved");

  function closeAllDrawers() {
    cartDrawer.classList.remove("active");
    savedDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
  }

  function toggleCart() {
    // If saved is open, close it first
    if (savedDrawer.classList.contains("active")) {
        savedDrawer.classList.remove("active");
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
        document.body.classList.add("no-scroll");
        document.documentElement.classList.add("no-scroll");
    } else {
        cartDrawer.classList.toggle("active");
        cartOverlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
        document.documentElement.classList.toggle("no-scroll");
    }
    // Render cart when opened
    if (cartDrawer.classList.contains("active")) {
      renderCartDrawer();
    }
  }

  function toggleSaved() {
    // If cart is open, close it first
    if (cartDrawer.classList.contains("active")) {
        cartDrawer.classList.remove("active");
        savedDrawer.classList.add("active");
        cartOverlay.classList.add("active");
        document.body.classList.add("no-scroll");
        document.documentElement.classList.add("no-scroll");
    } else {
        savedDrawer.classList.toggle("active");
        cartOverlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
        document.documentElement.classList.toggle("no-scroll");
    }
    // Render saved items when opened
    if (savedDrawer.classList.contains("active")) {
      renderSavedDrawer();
    }
  }

  if (openCartBtn) {
    openCartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleCart();
    });
  }

  if (openSavedBtn) {
    openSavedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSaved();
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeAllDrawers);
  }

  if (closeSavedBtn) {
    closeSavedBtn.addEventListener("click", closeAllDrawers);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeAllDrawers);
  }

  // Quantity logic is now handled in renderCartDrawer() with localStorage integration

  // Move all to cart button
  const moveAllBtn = document.querySelector(".move-all-btn");
  if (moveAllBtn) {
    moveAllBtn.addEventListener("click", function() {
      const savedCards = document.querySelectorAll('.saved-item-card');
      const savedItems = getSavedItems();
      
      if (savedItems.length === 0) return;

      // Disable button during animation
      moveAllBtn.style.pointerEvents = 'none';
      moveAllBtn.style.opacity = '0.7';
      moveAllBtn.textContent = 'Moving...';

      // Staggered animation
      savedCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('bulk-removing');
        }, index * 70); // 70ms delay between each item
      });

      // Calculate total time needed
      // (N-1) * stagger + animation_duration (300ms) + buffer
      const totalAnimationTime = (savedCards.length > 0 ? (savedCards.length - 1) * 70 : 0) + 300;

      setTimeout(() => {
        // Move items to cart logic
        savedItems.forEach(id => {
          addToCart(id, 1);
        });

        // Clear saved items
        localStorage.setItem('savedItems', JSON.stringify([]));
        
        // Update all heart icons
        savedItems.forEach(id => updateHeartIconsForProduct(id));

        // Close Saved Drawer
        if (savedDrawer.classList.contains("active")) {
            savedDrawer.classList.remove("active");
            cartOverlay.classList.remove("active");
            document.body.classList.remove("no-scroll");
            document.documentElement.classList.remove("no-scroll");
        }

        // Wait a brief moment for drawer closing animation, then open cart
        setTimeout(() => {
            // Re-render UI
            renderSavedDrawer();
            renderCartDrawer();
            
            // Open Cart Drawer
            cartDrawer.classList.add("active");
            cartOverlay.classList.add("active");
            document.body.classList.add("no-scroll");
            document.documentElement.classList.add("no-scroll");
            
            // Show notification
            showCartNotification("All saved items");

            // Reset button state
            moveAllBtn.style.pointerEvents = '';
            moveAllBtn.style.opacity = '';
            moveAllBtn.textContent = 'Move All to Cart';
        }, 400); // Wait for saved drawer close animation

      }, totalAnimationTime);
    });
  }
});
