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

document.addEventListener("DOMContentLoaded", function () {
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

  // Intersection Observer for Scroll Animations - DISABLED
  // const observerOptions = {
  //   root: null,
  //   rootMargin: "0px",
  //   threshold: 0.1,
  // };

  // const observer = new IntersectionObserver((entries, observer) => {
  //   entries.forEach((entry) => {
  //     if (entry.isIntersecting) {
  //       entry.target.classList.add("active");
  //       observer.unobserve(entry.target);
  //     }
  //   });
  // }, observerOptions);

  // const revealElements = document.querySelectorAll(".reveal");
  // revealElements.forEach((el) => observer.observe(el));

  // Add active class immediately without scroll animation
  const revealElements = document.querySelectorAll(".reveal");
  revealElements.forEach((el) => {
    el.classList.add("active");
  });

  // Hero Categories Click Handler
  const heroCategoryItems = document.querySelectorAll(".hero-category-item");
  heroCategoryItems.forEach((item) => {
    item.addEventListener("click", function () {
      const category = this.getAttribute("data-category");
      
      // Update category filter checkboxes
      const categoryCheckboxes = document.querySelectorAll(
        'input[name="category"]'
      );
      categoryCheckboxes.forEach((cb) => {
        if (category === "all") {
          cb.checked = cb.value === "all";
        } else {
          cb.checked = cb.value === category || cb.value === "all";
          if (cb.value === "all") cb.checked = false;
        }
      });

      // Trigger filter
      filterProducts();
      
      // Scroll to products
      document.querySelector(".products-grid")?.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    });
  });


  // Filter and Search Functionality
  const searchInput = document.getElementById("searchInput");
  const productCards = document.querySelectorAll(".product-card");
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const filtersSidebar = document.getElementById("filtersSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const filterCheckboxes = document.querySelectorAll(".filter-checkbox");

  // Sidebar Toggle
  function toggleSidebar() {
    filtersSidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.style.overflow = filtersSidebar.classList.contains("active")
      ? "hidden"
      : "";
  }

  function closeSidebar() {
    filtersSidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (filterToggleBtn) {
    filterToggleBtn.addEventListener("click", toggleSidebar);
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Filter Products Function
  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Get selected categories
    const selectedCategories = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((cb) => cb.value);

    // Get selected prices
    const selectedPrices = Array.from(
      document.querySelectorAll('input[name="price"]:checked')
    ).map((cb) => cb.value);

    // Get selected ratings
    const selectedRatings = Array.from(
      document.querySelectorAll('input[name="rating"]:checked')
    ).map((cb) => cb.value);

    productCards.forEach((card) => {
      const title = card
        .querySelector(".product-title")
        .textContent.toLowerCase();
      const brand = card
        .querySelector(".product-brand")
        .textContent.toLowerCase();
      const tags = Array.from(card.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.toLowerCase()
      );
      const category = card.getAttribute("data-category");
      const price = card.getAttribute("data-price");

      // Get rating from card
      const rating = parseFloat(card.getAttribute("data-rating")) || 0;

      // Search match
      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        tags.some((tag) => tag.includes(searchTerm));

      // Category match
      const matchesCategory =
        selectedCategories.includes("all") ||
        selectedCategories.length === 0 ||
        selectedCategories.includes(category);

      // Price match
      const matchesPrice =
        selectedPrices.includes("all") ||
        selectedPrices.length === 0 ||
        selectedPrices.includes(price);

      // Rating match
      let matchesRating = true;
      if (!selectedRatings.includes("all") && selectedRatings.length > 0) {
        matchesRating = selectedRatings.some((r) => {
          const minRating = parseFloat(r);
          return rating >= minRating;
        });
      }

      if (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesRating
      ) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  // Checkbox change listeners
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      // If "all" is checked, uncheck others in the same group
      if (this.value === "all" && this.checked) {
        const sameGroup = document.querySelectorAll(
          `input[name="${this.name}"]:not([value="all"])`
        );
        sameGroup.forEach((cb) => (cb.checked = false));
      } else if (this.checked && this.value !== "all") {
        // If a specific option is checked, uncheck "all"
        const allCheckbox = document.querySelector(
          `input[name="${this.name}"][value="all"]`
        );
        if (allCheckbox) allCheckbox.checked = false;
      }
      filterProducts();
    });
  });

  // Clear Filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", function () {
      filterCheckboxes.forEach((cb) => {
        if (cb.value === "all") {
          cb.checked = true;
        } else {
          cb.checked = false;
        }
      });
      if (searchInput) {
        searchInput.value = "";
      }
      filterProducts();
    });
  }

  // Add to cart animation (similar to index.js)
  const importButtons = document.querySelectorAll(".import-btn");
  const cartIcon = document.querySelector("#openCart");

  if (importButtons.length > 0 && cartIcon) {
    importButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();

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
        flyingElement.innerHTML = '<span class="material-symbols-outlined">add_shopping_cart</span>';

        // Add styles for flying item
        if (!document.querySelector('style[data-flying-item]')) {
          const style = document.createElement("style");
          style.setAttribute("data-flying-item", "true");
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
            .flying-item .material-symbols-outlined {
              font-size: 24px;
              color: #009900;
              filter: drop-shadow(0 0 8px rgba(0, 153, 0, 0.6));
            }
            @keyframes cartNotify {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
          `;
          document.head.appendChild(style);
        }

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

        // Add button animation
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "";
        }, 150);

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
  }

  // Add to cart animation for cart-icon-btn (small icon button)
  const cartIconButtons = document.querySelectorAll(".cart-icon-btn");
  const cartIconHeader = document.querySelector("#openCart");

  if (cartIconButtons.length > 0 && cartIconHeader) {
    cartIconButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();

        // Get button position
        const buttonRect = button.getBoundingClientRect();
        const buttonX = buttonRect.left + buttonRect.width / 2;
        const buttonY = buttonRect.top + buttonRect.height / 2;

        // Get cart position
        const cartRect = cartIconHeader.getBoundingClientRect();
        const cartX = cartRect.left + cartRect.width / 2;
        const cartY = cartRect.top + cartRect.height / 2;

        // Create flying element
        const flyingElement = document.createElement("div");
        flyingElement.className = "flying-item";
        flyingElement.innerHTML = '<span class="material-symbols-outlined">add_shopping_cart</span>';

        // Add styles for flying item (if not already added)
        if (!document.querySelector('style[data-flying-item]')) {
          const style = document.createElement("style");
          style.setAttribute("data-flying-item", "true");
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
            .flying-item .material-symbols-outlined {
              font-size: 24px;
              color: #009900;
              filter: drop-shadow(0 0 8px rgba(0, 153, 0, 0.6));
            }
            @keyframes cartNotify {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
          `;
          document.head.appendChild(style);
        }

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

        // Add button animation
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "";
        }, 150);

        // Add pulse effect to cart
        cartIconHeader.style.animation = "cartNotify 0.6s ease";
        setTimeout(() => {
          cartIconHeader.style.animation = "";
        }, 600);

        // Remove flying element after animation
        setTimeout(() => {
          flyingElement.remove();
        }, 800);
      });
    });
  }

  // Pagination functionality
  const productsGrid = document.querySelector(".products-grid");
  const paginationNumbers = document.getElementById("paginationNumbers");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  let currentPage = 1;
  const itemsPerPage = 9;
  const totalPages = 6;

  // Generate product data for all pages
  const generateProductData = (page) => {
    const products = [];
    const categories = ["food", "toys", "equipment", "accessories"];
    const brands = ["Royal Canin", "Monge", "Premil", "Happy Pets", "Travel Pro", "Comfort Fit", "Purina Pro", "Play Time", "Secure Walk", "PetCo", "FurReal", "Whiskers", "Pawfect", "BarkBox", "CatNip", "DogZone", "PetLife", "AnimalCare"];
    const foodTitles = ["Premium Dog Food", "Natural Cat Food", "Superpremium Granules", "Complete Nutrition", "Grain Free Formula", "Puppy Starter", "Senior Diet", "Weight Control", "Sensitive Stomach"];
    const toyTitles = ["Interactive Toy Set", "Feather Wand", "Chew Toy", "Puzzle Game", "Ball Set", "Rope Toy", "Squeaky Toy", "Laser Pointer", "Fetch Stick"];
    const equipmentTitles = ["Pet Carrier", "Travel Bag", "Dog Bed", "Cat Tree", "Litter Box", "Water Bowl", "Food Dispenser", "Crate", "Playpen"];
    const accessoryTitles = ["Leather Collar", "Retractable Leash", "Name Tag", "Harness", "Dog Coat", "Cat Scratching Post", "Pet Grooming Kit", "Travel Bottle", "ID Tag"];
    const prices = ["1,890", "2,100", "2,450", "2,800", "3,200", "3,500", "4,200", "4,500", "5,800"];
    const images = ["/img/pansion.jpg", "/img/granula.jpg", "/img/pas1.jpg", "/img/pas2.jpg", "/img/pas3.jpg", "/img/zec.jpg", "/img/pansionSlika.jpg"];

    for (let i = 0; i < itemsPerPage; i++) {
      const globalIndex = (page - 1) * itemsPerPage + i;
      const category = categories[globalIndex % categories.length];
      let title = "";
      if (category === "food") title = foodTitles[globalIndex % foodTitles.length];
      else if (category === "toys") title = toyTitles[globalIndex % toyTitles.length];
      else if (category === "equipment") title = equipmentTitles[globalIndex % equipmentTitles.length];
      else title = accessoryTitles[globalIndex % accessoryTitles.length];

      products.push({
        brand: brands[globalIndex % brands.length],
        title: title,
        price: prices[globalIndex % prices.length],
        category: category,
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        priceRange: globalIndex % 3 === 0 ? "low" : globalIndex % 3 === 1 ? "medium" : "high",
        image: images[globalIndex % images.length],
        description: `Premium quality product designed for your pet's comfort and wellbeing. Features high-quality materials and thoughtful design that ensures durability and functionality.`
      });
    }
    return products;
  };

  // Render products for current page
  const renderProducts = (page) => {
    const products = generateProductData(page);
    productsGrid.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.setAttribute("data-category", product.category);
      productCard.setAttribute("data-price", product.priceRange);
      productCard.setAttribute("data-rating", product.rating);

      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
        </div>
        <div class="product-info">
          <div class="product-brand">${product.brand}</div>
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">
            <span class="price-range">${product.price} RSD</span>
          </div>
          <p class="product-description">${product.description}</p>
          <div class="product-buttons">
            <button class="import-btn">
              <span class="material-symbols-outlined">shopping_bag</span>
              Buy Now
            </button>
            <button class="cart-icon-btn">
              <span class="material-symbols-outlined">add_shopping_cart</span>
            </button>
          </div>
        </div>
      `;

      productsGrid.appendChild(productCard);
    });

    // Reinitialize cart button animations for new products
    setTimeout(() => {
      const newImportButtons = productsGrid.querySelectorAll(".import-btn");
      const newCartIconButtons = productsGrid.querySelectorAll(".cart-icon-btn");
      const cartIconHeader = document.querySelector("#openCart");

      // Reattach event listeners for new buttons
      if (newImportButtons.length > 0 && cartIconHeader) {
        newImportButtons.forEach((button) => {
          button.addEventListener("click", function (e) {
            e.stopPropagation();
            const buttonRect = button.getBoundingClientRect();
            const buttonX = buttonRect.left + buttonRect.width / 2;
            const buttonY = buttonRect.top + buttonRect.height / 2;
            const cartRect = cartIconHeader.getBoundingClientRect();
            const cartX = cartRect.left + cartRect.width / 2;
            const cartY = cartRect.top + cartRect.height / 2;

            const flyingElement = document.createElement("div");
            flyingElement.className = "flying-item";
            flyingElement.innerHTML = '<span class="material-symbols-outlined">add_shopping_cart</span>';

            if (!document.querySelector('style[data-flying-item]')) {
              const style = document.createElement("style");
              style.setAttribute("data-flying-item", "true");
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
                .flying-item .material-symbols-outlined {
                  font-size: 24px;
                  color: #009900;
                  filter: drop-shadow(0 0 8px rgba(0, 153, 0, 0.6));
                }
                @keyframes cartNotify {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.15); }
                }
              `;
              document.head.appendChild(style);
            }

            document.body.appendChild(flyingElement);
            flyingElement.style.position = "fixed";
            flyingElement.style.left = buttonX + "px";
            flyingElement.style.top = buttonY + "px";
            flyingElement.style.pointerEvents = "none";
            flyingElement.style.zIndex = "9999";

            setTimeout(() => {
              flyingElement.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
              flyingElement.style.left = cartX + "px";
              flyingElement.style.top = cartY + "px";
              flyingElement.style.opacity = "0";
              flyingElement.style.transform = "scale(0.3)";
            }, 10);

            button.style.transform = "scale(0.95)";
            setTimeout(() => {
              button.style.transform = "";
            }, 150);

            cartIconHeader.style.animation = "cartNotify 0.6s ease";
            setTimeout(() => {
              cartIconHeader.style.animation = "";
            }, 600);

            setTimeout(() => {
              flyingElement.remove();
            }, 800);
          });
        });
      }

      if (newCartIconButtons.length > 0 && cartIconHeader) {
        newCartIconButtons.forEach((button) => {
          button.addEventListener("click", function (e) {
            e.stopPropagation();
            const buttonRect = button.getBoundingClientRect();
            const buttonX = buttonRect.left + buttonRect.width / 2;
            const buttonY = buttonRect.top + buttonRect.height / 2;
            const cartRect = cartIconHeader.getBoundingClientRect();
            const cartX = cartRect.left + cartRect.width / 2;
            const cartY = cartRect.top + cartRect.height / 2;

            const flyingElement = document.createElement("div");
            flyingElement.className = "flying-item";
            flyingElement.innerHTML = '<span class="material-symbols-outlined">add_shopping_cart</span>';

            if (!document.querySelector('style[data-flying-item]')) {
              const style = document.createElement("style");
              style.setAttribute("data-flying-item", "true");
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
                .flying-item .material-symbols-outlined {
                  font-size: 24px;
                  color: #009900;
                  filter: drop-shadow(0 0 8px rgba(0, 153, 0, 0.6));
                }
                @keyframes cartNotify {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.15); }
                }
              `;
              document.head.appendChild(style);
            }

            document.body.appendChild(flyingElement);
            flyingElement.style.position = "fixed";
            flyingElement.style.left = buttonX + "px";
            flyingElement.style.top = buttonY + "px";
            flyingElement.style.pointerEvents = "none";
            flyingElement.style.zIndex = "9999";

            setTimeout(() => {
              flyingElement.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
              flyingElement.style.left = cartX + "px";
              flyingElement.style.top = cartY + "px";
              flyingElement.style.opacity = "0";
              flyingElement.style.transform = "scale(0.3)";
            }, 10);

            button.style.transform = "scale(0.95)";
            setTimeout(() => {
              button.style.transform = "";
            }, 150);

            cartIconHeader.style.animation = "cartNotify 0.6s ease";
            setTimeout(() => {
              cartIconHeader.style.animation = "";
            }, 600);

            setTimeout(() => {
              flyingElement.remove();
            }, 800);
          });
        });
      }
    }, 100);
  };

  // Generate pagination numbers dynamically (max 4 numbers)
  // Simple sliding logic: always show 3 numbers that slide with current page
  const generatePaginationNumbers = () => {
    paginationNumbers.innerHTML = "";
    
    if (totalPages <= 4) {
      // If total pages <= 4, show all
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `pagination-number ${i === currentPage ? "active" : ""}`;
        btn.setAttribute("data-page", i.toString());
        btn.textContent = i.toString();
        paginationNumbers.appendChild(btn);
      }
      return;
    }

    // Calculate the 3 numbers to show around current page
    let startNum = Math.max(1, currentPage - 1);
    let endNum = Math.min(totalPages, currentPage + 1);
    
    // Adjust if we're at the beginning
    if (currentPage <= 2) {
      startNum = 1;
      endNum = 3;
    }
    // Adjust if we're at the end
    else if (currentPage >= totalPages - 1) {
      startNum = totalPages - 2;
      endNum = totalPages;
    }

    // Show first page only if we're at the start (pages 1-2)
    if (currentPage <= 2) {
      // No ellipsis needed, just show first 3 + last
      for (let i = startNum; i <= endNum; i++) {
        const btn = document.createElement("button");
        btn.className = `pagination-number ${i === currentPage ? "active" : ""}`;
        btn.setAttribute("data-page", i.toString());
        btn.textContent = i.toString();
        paginationNumbers.appendChild(btn);
      }
      
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination-ellipsis";
      ellipsis.textContent = "...";
      paginationNumbers.appendChild(ellipsis);

      const lastBtn = document.createElement("button");
      lastBtn.className = `pagination-number ${totalPages === currentPage ? "active" : ""}`;
      lastBtn.setAttribute("data-page", totalPages.toString());
      lastBtn.textContent = totalPages.toString();
      paginationNumbers.appendChild(lastBtn);
    }
    // Show last page only if we're at the end (pages 5-6)
    else if (currentPage >= totalPages - 1) {
      const firstBtn = document.createElement("button");
      firstBtn.className = `pagination-number ${1 === currentPage ? "active" : ""}`;
      firstBtn.setAttribute("data-page", "1");
      firstBtn.textContent = "1";
      paginationNumbers.appendChild(firstBtn);

      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination-ellipsis";
      ellipsis.textContent = "...";
      paginationNumbers.appendChild(ellipsis);

      for (let i = startNum; i <= endNum; i++) {
        const btn = document.createElement("button");
        btn.className = `pagination-number ${i === currentPage ? "active" : ""}`;
        btn.setAttribute("data-page", i.toString());
        btn.textContent = i.toString();
        paginationNumbers.appendChild(btn);
      }
    }
    // Middle pages (3-4): show 3 numbers + last = 4 numbers total
    else {
      // Show: ... 2 3 4 ... 6 or ... 3 4 5 ... 6 (3 numbers + last = 4 total)
      const ellipsis1 = document.createElement("span");
      ellipsis1.className = "pagination-ellipsis";
      ellipsis1.textContent = "...";
      paginationNumbers.appendChild(ellipsis1);

      // Show the 3 sliding numbers
      for (let i = startNum; i <= endNum; i++) {
        const btn = document.createElement("button");
        btn.className = `pagination-number ${i === currentPage ? "active" : ""}`;
        btn.setAttribute("data-page", i.toString());
        btn.textContent = i.toString();
        paginationNumbers.appendChild(btn);
      }

      const ellipsis2 = document.createElement("span");
      ellipsis2.className = "pagination-ellipsis";
      ellipsis2.textContent = "...";
      paginationNumbers.appendChild(ellipsis2);

      // Always show last page
      const lastBtn = document.createElement("button");
      lastBtn.className = `pagination-number ${totalPages === currentPage ? "active" : ""}`;
      lastBtn.setAttribute("data-page", totalPages.toString());
      lastBtn.textContent = totalPages.toString();
      paginationNumbers.appendChild(lastBtn);
    }
  };

  // Update pagination UI
  const updatePagination = () => {
    // Regenerate pagination numbers
    generatePaginationNumbers();
    
    // Reattach event listeners to new buttons
    const pageNumbers = paginationNumbers.querySelectorAll(".pagination-number");
    pageNumbers.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.getAttribute("data-page"));
        renderProducts(currentPage);
        updatePagination();
        window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: "smooth" });
      });
    });

    // Update prev/next buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  };

  // Event listeners for pagination
  if (paginationNumbers && prevBtn && nextBtn) {
    // Prev button
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts(currentPage);
        updatePagination();
        window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: "smooth" });
      }
    });

    // Next button
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts(currentPage);
        updatePagination();
        window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: "smooth" });
      }
    });

    // Initial render - render first page
    renderProducts(1);
    updatePagination();
  }
});
