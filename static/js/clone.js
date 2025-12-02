// clone.js - Dinamicko ucitavanje header-a i footer-a

document.addEventListener("DOMContentLoaded", function () {
  // Header HTML
  const headerHTML = `
    <header>
      <nav>
        <div class="left">
          <a href="/" class="logo-link"><img src="/img/happy animal.png" alt="Happy Animals logo" /></a>
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
                  <div class="mega-dropdown-content">
                    <div class="mega-column">
                      <h4><span class="material-symbols-outlined">restaurant</span> Food</h4>
                      <a href="/products?cat=dogs">Dog food</a>
                      <a href="/products?cat=cats">Cat food</a>
                      <a href="/products?cat=birds">Bird food</a>
                      <a href="/products?cat=rodents">Rodent food</a>
                    </div>
                    <div class="mega-column">
                      <h4><span class="material-symbols-outlined">pets</span> Gear</h4>
                      <a href="/products?cat=leashes">Leashes & collars</a>
                      <a href="/products?cat=carriers">Carriers</a>
                      <a href="/products?cat=cages">Cages</a>
                      <a href="/products?cat=dishes">Bowls & waterers</a>
                    </div>
                    <div class="mega-column">
                      <h4><span class="material-symbols-outlined">soap</span> Hygiene</h4>
                      <a href="/products?cat=shampoo">Shampoos</a>
                      <a href="/products?cat=brushes">Brushes</a>
                      <a href="/products?cat=litter">Cat litter</a>
                      <a href="/products?cat=other">Other</a>
                    </div>
                    <div class="mega-column">
                      <h4><span class="material-symbols-outlined">toys</span> Toys</h4>
                      <a href="/products?cat=dog-toys">Dog toys</a>
                      <a href="/products?cat=cat-toys">Cat toys</a>
                      <a href="/products?cat=interactive">Interactive toys</a>
                      <a href="/products?cat=balls">Balls & frisbees</a>
                    </div>
                    <div class="mega-column featured-column">
                        <div class="featured-image-container">
                          <img src="/img/dropdownImg.png" alt="Dropdown image" />
                          <div class="featured-overlay">
                            <h5>New Collection</h5>
                            <p>Premium quality for your pets</p>
                            <a href="/products?new=true" class="featured-btn">Shop Now <span class="material-symbols-outlined">arrow_forward</span></a>
                          </div>
                        </div>
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

  // ========== CART DRAWER LOGIC ==========
  const cartDrawerHTML = `
    <div class="cart-overlay-bg"></div>
    <div class="cart-drawer">
      <div class="cart-header">
        <h3>Your Cart <span class="cart-count">(2)</span></h3>
        <button class="close-cart">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="cart-items">
        <!-- Static Item 1 -->
        <div class="cart-item">
          <div class="item-img">
            <img src="/img/galerija/granula.jpg" alt="Premium Dog Food">
          </div>
          <div class="item-details">
            <h4>Premium Dog Food</h4>
            <p class="item-variant">15kg Bag</p>
            <div class="price-row">
              <span class="item-price">$45.00</span>
              <div class="qty-control">
                <button class="qty-btn minus">-</button>
                <input type="number" value="1" min="1" readonly>
                <button class="qty-btn plus">+</button>
              </div>
            </div>
          </div>
          <button class="remove-item">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>

        <!-- Static Item 2 -->
        <div class="cart-item">
          <div class="item-img">
            <img src="/img/galerija/pas1.jpg" alt="Dog Toy">
          </div>
          <div class="item-details">
            <h4>Interactive Dog Toy</h4>
            <p class="item-variant">Blue / Large</p>
            <div class="price-row">
              <span class="item-price">$15.50</span>
              <div class="qty-control">
                <button class="qty-btn minus">-</button>
                <input type="number" value="2" min="1" readonly>
                <button class="qty-btn plus">+</button>
              </div>
            </div>
          </div>
          <button class="remove-item">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>

      <div class="cart-footer">
        <div class="subtotal-row">
          <span>Subtotal</span>
          <span class="total-price">$76.00</span>
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
        <h3><span class="material-symbols-outlined">favorite</span> Wishlist <span class="saved-count">2</span></h3>
        <button class="close-saved">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="saved-items-grid">
        <!-- Static Item 1 -->
        <div class="saved-item-card">
          <button class="remove-saved-item">
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="saved-img">
            <img src="/img/galerija/pas2.jpg" alt="Dog Leash">
          </div>
          <div class="saved-details">
            <h4>Durable Dog Leash</h4>
            <p class="saved-variant">Red / 2m</p>
            <div class="saved-bottom">
              <span class="saved-price">$22.00</span>
              <button class="move-to-cart-btn">
                <span class="material-symbols-outlined">shopping_cart</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Static Item 2 -->
        <div class="saved-item-card">
          <button class="remove-saved-item">
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="saved-img">
            <img src="/img/galerija/pas3.jpg" alt="Cat Bed">
          </div>
          <div class="saved-details">
            <h4>Cozy Cat Bed</h4>
            <p class="saved-variant">Grey / Medium</p>
            <div class="saved-bottom">
              <span class="saved-price">$35.00</span>
              <button class="move-to-cart-btn">
                <span class="material-symbols-outlined">shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="saved-footer">
        <button class="move-all-btn">Move All to Cart</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", savedDrawerHTML);

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
  }

  function toggleCart() {
    // If saved is open, close it first
    if (savedDrawer.classList.contains("active")) {
        savedDrawer.classList.remove("active");
        cartDrawer.classList.add("active");
    } else {
        cartDrawer.classList.toggle("active");
        cartOverlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
    }
  }

  function toggleSaved() {
    // If cart is open, close it first
    if (cartDrawer.classList.contains("active")) {
        cartDrawer.classList.remove("active");
        savedDrawer.classList.add("active");
    } else {
        savedDrawer.classList.toggle("active");
        cartOverlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
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

  // Quantity Logic (Visual Only)
  const qtyBtns = document.querySelectorAll(".qty-btn");
  qtyBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      const input = this.parentElement.querySelector("input");
      let value = parseInt(input.value);
      if (this.classList.contains("plus")) {
        value++;
      } else if (this.classList.contains("minus") && value > 1) {
        value--;
      }
      input.value = value;
    });
  });
});
