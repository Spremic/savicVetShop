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
            <a href="/cart"><button id="openCart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30px"
              height="30px"
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

            My cart
          </button></a>

          <a href="/saved"><button id="savedProduct">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30px"
              height="30px"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z"
                fill="#000000"
              />
            </svg>

            Saved items
          </button></a>
        </div>
      </nav>
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
});
