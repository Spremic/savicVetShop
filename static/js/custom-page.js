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
        flyingElement.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none"><path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#009900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

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
            .flying-item svg {
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
});
