// Suppress browser extension async listener errors
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('asynchronous response') && e.message.includes('message channel closed')) {
    e.preventDefault();
    return false;
  }
}, true);

// Suppress unhandled promise rejections from browser extensions
window.addEventListener('unhandledrejection', function(e) {
  if (e.reason && e.reason.message && e.reason.message.includes('asynchronous response') && e.reason.message.includes('message channel closed')) {
    e.preventDefault();
    return false;
  }
});

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

async function loadProductsData() {
  try {
    const response = await fetch("/json/product.json");
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error loading product.json:", error);
    return [];
  }
}

function decodeSlug(value) {
  if (!value) return "";
  return decodeURIComponent(value.replace(/-/g, " "));
}

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

  result = result
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return result;
}

function getSelectionFromUrl() {
  // Use window.location.pathname which is already decoded by the browser
  // But if it has URL-encoded characters, decode them
  const pathname = window.location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  // Skip known routes like 'about', 'gallery', 'legal', etc.
  const knownRoutes = ['about', 'gallery', 'legal', 'shopping-cart', 'product', 'all-products'];
  const filteredParts = parts.filter(p => !knownRoutes.includes(p.toLowerCase()));
  
  // Decode URL-encoded characters (e.g. %D0%B0 -> а)
  // window.location.pathname should already be decoded, but check
  const decodeSlug = (str) => {
    if (!str) return "";
    // If string contains % characters, try to decode
    if (str.includes('%')) {
      try {
        return decodeURIComponent(str);
      } catch (e) {
        // If it fails, return original
        return str;
      }
    }
    return str;
  };
  
  let slugCat = decodeSlug(filteredParts[0] || "");
  let slugSub = decodeSlug(filteredParts[1] || "");
  let slugSub2 = decodeSlug(filteredParts[2] || "");

  console.log("🌐 URL PARSING:", {
    pathname,
    parts,
    filteredParts,
    decoded: { slugCat, slugSub, slugSub2 }
  });

  return {
    slugCat,
    slugSub,
    slugSub2
  };
}

function filterBySelection(products, selection) {
  const { slugCat, slugSub, slugSub2 } = selection;
  // Normalize URL slugs before comparison
  const normalizedCat = slugCat ? slugify(slugCat) : "";
  const normalizedSub = slugSub ? slugify(slugSub) : "";
  const normalizedSub2 = slugSub2 ? slugify(slugSub2) : "";
  
  console.log("🔍 FILTERING:", {
    urlSlugs: { slugCat, slugSub, slugSub2 },
    normalized: { normalizedCat, normalizedSub, normalizedSub2 }
  });
  
  const filtered = products.filter((p) => {
    const pCat = slugify(p.category || "");
    const pSub = slugify(p.subcategory || "");
    const pSub2 = slugify(p.type || "");
    const matchCat = !normalizedCat || pCat === normalizedCat;
    const matchSub = !normalizedSub || pSub === normalizedSub;
    const matchSub2 = !normalizedSub2 || pSub2 === normalizedSub2;
    
    return matchCat && matchSub && matchSub2;
  });
  
  console.log(`📊 Found ${filtered.length} products out of ${products.length} total`);
  return filtered;
}

function pickImage(product) {
  if (product.image) return product.image;
  // Stable pseudo-random pick based on product id/name to keep image consistent
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
  return `<div class="price-range">${price} $</div>`;
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-category", product.category);
  card.setAttribute("data-subcategory", product.subcategory);
  card.setAttribute("data-subcategory2", product.type || "");

  const hasDiscount = product.salePrice && product.salePrice !== '/' && product.percentage && product.percentage !== '/' && product.percentage !== '0%';
  const badge = hasDiscount ? `<div class="product-badge">-${product.percentage}</div>` : "";
  const oldPriceOnImage = hasDiscount ? `<div class="product-old-price-on-image">${product.price} $</div>` : "";
  
  // Create slug from product title for URL
  const productSlug = slugify(product.title);
  const productUrl = `/${productSlug}`;

  card.innerHTML = `
    <div class="product-image">
      <img src="${pickImage(product)}" alt="${product.title}" loading="lazy" />
      ${badge}
      ${oldPriceOnImage}
      <div class="heart-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path class="heart-outline" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#009900" stroke-width="2"/>
          <path class="heart-filled" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009900" opacity="0"/>
        </svg>
      </div>
    </div>
    <div class="product-info">
      <div class="product-brand">${product.brand || ""}</div>
      <h3 class="product-title">${product.title}</h3>
      <div class="product-price">
        ${formatPrice(product)}
      </div>
      <p class="product-description">${product.description || ""}</p>
      <div class="product-buttons">
        <button class="import-btn" data-product-url="${productUrl}">
          <span class="material-symbols-outlined">shopping_bag</span>
          Buy Now
        </button>
        <button class="cart-icon-btn">
          <span class="material-symbols-outlined">add_shopping_cart</span>
        </button>
      </div>
    </div>
  `;
  
  // Add click handler to navigate to product page
  card.addEventListener("click", function(e) {
    // Don't navigate if clicking on buttons or heart
    if (e.target.closest(".import-btn") || e.target.closest(".cart-icon-btn") || e.target.closest(".heart-container")) {
      return;
    }
    window.location.href = productUrl;
  });
  
  // Add click handler to Buy Now button
  const buyNowBtn = card.querySelector(".import-btn");
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      window.location.href = productUrl;
    });
  }

  // Note: Heart container click is handled by global event listener below
  // which handles both toggle state and animation
  
  return card;
}

document.addEventListener("DOMContentLoaded", async function () {
  // Header scroll effect
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
  });

  const searchInput = document.getElementById("searchInput");
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const filtersSidebar = document.getElementById("filtersSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const productsGrid = document.querySelector(".products-grid");
  const paginationNumbers = document.getElementById("paginationNumbers");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const paginationContainer = document.querySelector(".pagination-container");

  // Slider controls (shown only when needed)
  let sliderMode = false;
  let sliderControls = null;
  const createSliderControls = () => {
    if (!productsGrid || sliderControls) return;
    sliderControls = document.createElement("div");
    sliderControls.className = "products-slider-controls hidden";
    sliderControls.innerHTML = `
      <button class="slider-arrow slider-prev" aria-label="Previous products">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <button class="slider-arrow slider-next" aria-label="Next products">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    `;
    productsGrid.insertAdjacentElement("beforebegin", sliderControls);

    const scrollByCards = (direction) => {
      const firstCard = productsGrid.querySelector(".product-card");
      const gap =
        parseFloat(getComputedStyle(productsGrid).columnGap || "16") ||
        parseFloat(getComputedStyle(productsGrid).gap || "16") ||
        16;
      const cardWidth = firstCard
        ? firstCard.getBoundingClientRect().width + gap
        : 320;
      productsGrid.scrollBy({
        left: direction * cardWidth * 2,
        behavior: "smooth",
      });
    };

    sliderControls
      .querySelector(".slider-prev")
      ?.addEventListener("click", () => scrollByCards(-1));
    sliderControls
      .querySelector(".slider-next")
      ?.addEventListener("click", () => scrollByCards(1));
  };

  // Sidebar Toggle (kept for mobile filters UX)
  const toggleSidebar = () => {
    filtersSidebar?.classList.toggle("active");
    sidebarOverlay?.classList.toggle("active");
    document.body.classList.toggle("filters-active");
    document.body.style.overflow = filtersSidebar?.classList.contains("active") ? "hidden" : "";
  };
  const closeSidebar = () => {
    filtersSidebar?.classList.remove("active");
    sidebarOverlay?.classList.remove("active");
    document.body.classList.remove("filters-active");
    document.body.style.overflow = "";
  };
  filterToggleBtn?.addEventListener("click", toggleSidebar);
  closeSidebarBtn?.addEventListener("click", closeSidebar);
  sidebarOverlay?.addEventListener("click", closeSidebar);

  const selection = getSelectionFromUrl();
  
  // Replace URL with decoded version (without % characters)
  const normalizeUrl = () => {
    if (selection.slugCat || selection.slugSub || selection.slugSub2) {
      // Use slugify so slugs are in the same format as in clone.js
      const cleanPath = [
        selection.slugCat,
        selection.slugSub,
        selection.slugSub2
      ]
        .filter(Boolean)
        .map(slug => slugify(slug))
        .join("/");
      
      const newPath = `/${cleanPath}`;
      const currentPath = window.location.pathname;
      
      // If current path has URL-encoded characters, replace it
      if (currentPath !== newPath && currentPath.includes("%")) {
        history.replaceState(null, "", newPath);
        console.log("🔗 URL normalized:", currentPath, "->", newPath);
      }
    }
  };
  
  normalizeUrl();
  
  // Hero categories are always displayed

  const resolveName = (field, slugValue) => {
    if (!slugValue) return "";
    const normalizedSlug = slugify(slugValue);
    const found = allProducts.find((p) => slugify(p[field] || "") === normalizedSlug);
    return found ? found[field] : decodeSlug(slugValue);
  };

  const selectionNames = {
    cat: "",
    subcat: "",
    subcat2: ""
  };

  const updateBreadcrumbs = () => {
    const breadcrumbs = document.querySelector(".breadcrumbs");
    if (!breadcrumbs) return;
    const parts = [];
    if (selectionNames.cat) {
      const catSlug = slugify(selectionNames.cat);
      parts.push({ label: selectionNames.cat, href: `/${catSlug}` });
    }
    if (selectionNames.subcat) {
      const catSlug = slugify(selectionNames.cat);
      const subSlug = slugify(selectionNames.subcat);
      parts.push({ label: selectionNames.subcat, href: `/${catSlug}/${subSlug}` });
    }
    if (selectionNames.subcat2) parts.push({ label: selectionNames.subcat2 });

    breadcrumbs.innerHTML = parts
      .map((part, idx) => {
        const isLast = idx === parts.length - 1;
        if (part.href && !isLast) {
          return `<a href="${part.href}">${part.label}</a><span class="breadcrumb-separator">/</span>`;
        }
        if (isLast) {
          return `<span class="breadcrumb-current">${part.label}</span>`;
        }
        return `<a href="${part.href}">${part.label}</a><span class="breadcrumb-separator">/</span>`;
      })
      .join(" ");
  };

  const updatePageTitle = () => {
    const pageTitle = document.querySelector(".page-title");
    const pageDescription = document.querySelector(".page-description");
    if (!pageTitle) return;

  // Display only the last category in the hierarchy
  let title = "Product Catalog";
  if (window.location.pathname === '/all-products') {
    title = "All Products";
  } else if (selectionNames.subcat2) {
    title = selectionNames.subcat2;
  } else if (selectionNames.subcat) {
    title = selectionNames.subcat;
  } else if (selectionNames.cat) {
    title = selectionNames.cat;
  }

    pageTitle.textContent = title;

    // Hide page-description element
    if (pageDescription) {
      pageDescription.style.display = "none";
    }
  };

  const allProducts = await loadProductsData();
  if (!productsGrid) return;
  if (!allProducts.length) {
    productsGrid.innerHTML = "<p class='empty-state'>Unable to load products.</p>";
    return;
  }

  selectionNames.cat = resolveName("category", selection.slugCat);
  selectionNames.subcat = resolveName("subcategory", selection.slugSub);
  selectionNames.subcat2 = resolveName("type", selection.slugSub2);

  updateBreadcrumbs();
  updatePageTitle();

  let filteredProducts = filterBySelection(allProducts, selection);
  let currentPage = 1;
  let itemsPerPage = getItemsPerPage();
  let totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  function getItemsPerPage() {
    if (window.innerWidth < 500) return 6;
    if (window.innerWidth < 1024) return 9;
    return 12;
  }

  function applySearch(list) {
    const term = (searchInput?.value || "").toLowerCase().trim();
    if (!term) return list;
    return list.filter((p) => {
      const haystack = [
        p.title,
        p.brand,
        p.category,
        p.subcategory,
        p.type
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  function shouldUseSlider(count) {
    // Use pagination instead of slider for better performance with many products
    // Slider is only used on mobile/tablet for small collections
    return false; // Always use pagination for better layout stability
  }

  function refreshData() {
    filteredProducts = applySearch(filterBySelection(allProducts, selection));
    sliderMode = shouldUseSlider(filteredProducts.length);
    totalPages = sliderMode
      ? 1
      : Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    renderProducts(currentPage);
    updatePagination();
  }

  function renderProducts(page) {
    console.log("🎨 RENDER PRODUCTS:", {
      page,
      filteredProductsCount: filteredProducts.length,
      sliderMode,
      itemsPerPage,
      totalPages
    });
    
    productsGrid.innerHTML = "";
    const start = (page - 1) * itemsPerPage;
    const listToRender = sliderMode
      ? filteredProducts
      : filteredProducts.slice(start, start + itemsPerPage);

    console.log("📦 List to render:", listToRender.length, "products");

    if (!listToRender.length) {
      productsGrid.innerHTML = "<p class='empty-state'>No products found for the selected filter.</p>";
      console.log("❌ No products to render");
      return;
    }

    productsGrid.classList.toggle("slider-active", sliderMode);
    createSliderControls();
    sliderControls?.classList.toggle("hidden", !sliderMode);
    paginationContainer?.classList.toggle("hidden", sliderMode);

    listToRender.forEach((product) => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
      console.log("✅ Added product:", product.id, product.title);
    });
    
    console.log("✅ Rendering completed. Added cards:", productsGrid.children.length);
  }

  function updatePagination() {
    if (!paginationNumbers || !prevBtn || !nextBtn) return;
    if (sliderMode) {
      paginationNumbers.innerHTML = "";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    paginationNumbers.innerHTML = "";

    const addPageBtn = (page) => {
      const btn = document.createElement("button");
      btn.className = `pagination-number ${page === currentPage ? "active" : ""}`;
      btn.dataset.page = page.toString();
      btn.textContent = page.toString();
      btn.addEventListener("click", () => {
        currentPage = page;
        renderProducts(currentPage);
        updatePagination();
        window.scrollTo({ top: productsGrid.offsetTop - 80, behavior: "smooth" });
      });
      paginationNumbers.appendChild(btn);
    };

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) addPageBtn(i);
    } else {
      addPageBtn(1);
      if (currentPage > 3) {
        const ellipsis1 = document.createElement("span");
        ellipsis1.className = "pagination-ellipsis";
        ellipsis1.textContent = "...";
        paginationNumbers.appendChild(ellipsis1);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) addPageBtn(i);

      if (currentPage < totalPages - 2) {
        const ellipsis2 = document.createElement("span");
        ellipsis2.className = "pagination-ellipsis";
        ellipsis2.textContent = "...";
        paginationNumbers.appendChild(ellipsis2);
      }
      addPageBtn(totalPages);
    }

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }


  searchInput?.addEventListener("input", () => {
    currentPage = 1;
    refreshData();
  });

  prevBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderProducts(currentPage);
      updatePagination();
      window.scrollTo({ top: productsGrid.offsetTop - 80, behavior: "smooth" });
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderProducts(currentPage);
      updatePagination();
      window.scrollTo({ top: productsGrid.offsetTop - 80, behavior: "smooth" });
    }
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newPerPage = getItemsPerPage();
      if (newPerPage !== itemsPerPage) {
        itemsPerPage = newPerPage;
        refreshData();
      }
    }, 200);
  });

  refreshData();

  // Hero category cards lead to corresponding category
  const heroCategoryItems = document.querySelectorAll(".hero-category-item");
  const heroMap = {
    food: "Pet Food",
    toys: "Pet Toys",
    equipment: "Pet Supplies",
    accessories: "Pet Grooming",
  };
  heroCategoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const catName = heroMap[item.dataset.category];
      if (!catName) return;
      window.location.href = `/${slugify(catName)}`;
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
    const addToCartButton = e.target.closest(".cart-icon-btn");
    if (!addToCartButton) return;
    
    // Prevent event bubbling
    e.stopPropagation();
    
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

  // Add to saved items animation - using event delegation for dynamically added products
  document.addEventListener("click", function (e) {
    const heartContainer = e.target.closest(".heart-container");
    if (!heartContainer) return;
    
    // Prevent event bubbling
    e.stopPropagation();
    
    // Toggle heart state (fill/unfill)
    const heartFilled = heartContainer.querySelector('.heart-filled');
    const heartOutline = heartContainer.querySelector('.heart-outline');
    
    if (!heartFilled || !heartOutline) return;
    
    // Check if heart is currently active (filled) before toggling
    const isActive = heartFilled.style.opacity === "1";
    
    // Toggle heart state
    heartFilled.style.opacity = isActive ? "0" : "1";
    heartOutline.style.opacity = isActive ? "1" : "0";
    
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
});
