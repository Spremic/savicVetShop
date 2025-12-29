// clone.js - Dinamicko ucitavanje header-a i footer-a

document.addEventListener("DOMContentLoaded", function () {
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
                      <button class="category-btn active" data-category="hrana">
                        <span class="material-symbols-outlined">restaurant</span>
                        <span>Hrana za životinje</span>
                      </button>
                      <button class="category-btn" data-category="igracke">
                        <span class="material-symbols-outlined">toys</span>
                        <span>Igračke za životinje</span>
                      </button>
                      <button class="category-btn" data-category="oprema">
                        <span class="material-symbols-outlined">pets</span>
                        <span>Oprema za životinje</span>
                      </button>
                      <button class="category-btn" data-category="higijena">
                        <span class="material-symbols-outlined">soap</span>
                        <span>Higijena & Zdravlje</span>
                      </button>
                      <button class="category-btn" data-category="posude">
                        <span class="material-symbols-outlined">bowl</span>
                        <span>Posude i čaše</span>
                      </button>
                      <button class="category-btn" data-category="transport">
                        <span class="material-symbols-outlined">luggage</span>
                        <span>Transport i putovanje</span>
                      </button>
                      <button class="category-btn" data-category="odjeca">
                        <span class="material-symbols-outlined">checkroom</span>
                        <span>Odjeća i modni dodaci</span>
                      </button>
                      <button class="category-btn" data-category="kreveti">
                        <span class="material-symbols-outlined">bed</span>
                        <span>Kreveti i ležajevi</span>
                      </button>
                      <button class="category-btn" data-category="ogrebala">
                        <span class="material-symbols-outlined">stairs</span>
                        <span>Ogrebala i kule</span>
                      </button>
                      <button class="category-btn" data-category="male">
                        <span class="material-symbols-outlined">cruelty_free</span>
                        <span>Male životinje</span>
                      </button>
                      <button class="category-btn" data-category="akvarijumi">
                        <span class="material-symbols-outlined">water_drop</span>
                        <span>Akvarijumi i ribice</span>
                      </button>
                      <button class="category-btn" data-category="ptice">
                        <span class="material-symbols-outlined">nest</span>
                        <span>Ptičje kavezi</span>
                      </button>
                      <button class="category-btn" data-category="obuka">
                        <span class="material-symbols-outlined">school</span>
                        <span>Obuka i trening</span>
                      </button>
                      <button class="category-btn" data-category="knjige">
                        <span class="material-symbols-outlined">menu_book</span>
                        <span>Knjige i edukacija</span>
                      </button>
                    </div>

                    <!-- Right Content Area: Subcategories -->
                    <div class="categories-content">
                      <!-- Category 1: Hrana za životinje -->
                      <div class="category-panel active" data-category="hrana">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">restaurant</span>
                            Hrana za životinje
                          </h3>
                          <a href="/products?cat=Hrana za životinje" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Hrana za pse</h4>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za pse&subcat2=Suva hrana">Suva hrana</a>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za pse&subcat2=Vlažna hrana">Vlažna hrana</a>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za pse&subcat2=Poslastice">Poslastice</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Hrana za mačke</h4>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za mačke&subcat2=Suva hrana">Suva hrana</a>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za mačke&subcat2=Vlažna hrana">Vlažna hrana</a>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za mačke&subcat2=Poslastice">Poslastice</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Hrana za ptice</h4>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za ptice&subcat2=Seme">Seme</a>
                            <a href="/products?cat=Hrana za životinje&subcat=Hrana za ptice&subcat2=Peleti">Peleti</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 2: Igračke za životinje -->
                      <div class="category-panel" data-category="igracke">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">toys</span>
                            Igračke za životinje
                          </h3>
                          <a href="/products?cat=Igračke za životinje" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Igračke za pse</h4>
                            <a href="/products?cat=Igračke za životinje&subcat=Igračke za pse&subcat2=Žvakaće igračke">Žvakaće igračke</a>
                            <a href="/products?cat=Igračke za životinje&subcat=Igračke za pse&subcat2=Lopte">Lopte</a>
                            <a href="/products?cat=Igračke za životinje&subcat=Igračke za pse&subcat2=Plišane igračke">Plišane igračke</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Igračke za mačke</h4>
                            <a href="/products?cat=Igračke za životinje&subcat=Igračke za mačke&subcat2=Miševi">Miševi</a>
                            <a href="/products?cat=Igračke za životinje&subcat=Igračke za mačke&subcat2=Perje">Perje</a>
                            <a href="/products?cat=Igračke za životinje&subcat=Igračke za mačke&subcat2=Laser">Laser</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 3: Oprema za životinje -->
                      <div class="category-panel" data-category="oprema">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">pets</span>
                            Oprema za životinje
                          </h3>
                          <a href="/products?cat=Oprema za životinje" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Oprema za pse</h4>
                            <a href="/products?cat=Oprema za životinje&subcat=Oprema za pse&subcat2=Okovratnici">Okovratnici</a>
                            <a href="/products?cat=Oprema za životinje&subcat=Oprema za pse&subcat2=Povodci">Povodci</a>
                            <a href="/products?cat=Oprema za životinje&subcat=Oprema za pse&subcat2=Koševi">Koševi</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Oprema za mačke</h4>
                            <a href="/products?cat=Oprema za životinje&subcat=Oprema za mačke&subcat2=Ogrebala">Ogrebala</a>
                            <a href="/products?cat=Oprema za životinje&subcat=Oprema za mačke&subcat2=Krevetići">Krevetići</a>
                            <a href="/products?cat=Oprema za životinje&subcat=Oprema za mačke&subcat2=Toaleti">Toaleti</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 4: Higijena & Zdravlje -->
                      <div class="category-panel" data-category="higijena">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">soap</span>
                            Higijena & Zdravlje
                          </h3>
                          <a href="/products?cat=Higijena&subcat=Zdravlje" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Higijena</h4>
                            <a href="/products?cat=Higijena&subcat=Šamponi">Šamponi</a>
                            <a href="/products?cat=Higijena&subcat=Četke">Četke</a>
                            <a href="/products?cat=Higijena&subcat=Toalet potrepštine">Toalet potrepštine</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Zdravlje</h4>
                            <a href="/products?cat=Zdravlje&subcat=Vitamini">Vitamini</a>
                            <a href="/products?cat=Zdravlje&subcat=Antiparazitici">Antiparazitici</a>
                            <a href="/products?cat=Zdravlje&subcat=Dodaci ishrani">Dodaci ishrani</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 5: Posude i čaše -->
                      <div class="category-panel" data-category="posude">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">bowl</span>
                            Posude i čaše
                          </h3>
                          <a href="/products?cat=Posude i čaše" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Hranilice</h4>
                            <a href="/products?cat=Posude i čaše&subcat=Hranilice&subcat2=Keramičke">Keramičke</a>
                            <a href="/products?cat=Posude i čaše&subcat=Hranilice&subcat2=Staklene">Staklene</a>
                            <a href="/products?cat=Posude i čaše&subcat=Hranilice&subcat2=Plastične">Plastične</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Posude za vodu</h4>
                            <a href="/products?cat=Posude i čaše&subcat=Posude za vodu&subcat2=Fontane">Fontane</a>
                            <a href="/products?cat=Posude i čaše&subcat=Posude za vodu&subcat2=Čaše">Čaše</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 6: Transport i putovanje -->
                      <div class="category-panel" data-category="transport">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">luggage</span>
                            Transport i putovanje
                          </h3>
                          <a href="/products?cat=Transport i putovanje" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Nosiljke</h4>
                            <a href="/products?cat=Transport i putovanje&subcat=Nosiljke&subcat2=Za pse">Za pse</a>
                            <a href="/products?cat=Transport i putovanje&subcat=Nosiljke&subcat2=Za mačke">Za mačke</a>
                            <a href="/products?cat=Transport i putovanje&subcat=Nosiljke&subcat2=Univerzalne">Univerzalne</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Auto oprema</h4>
                            <a href="/products?cat=Transport i putovanje&subcat=Auto oprema&subcat2=Sedišta">Sedišta</a>
                            <a href="/products?cat=Transport i putovanje&subcat=Auto oprema&subcat2=Sigurnosni pojasevi">Sigurnosni pojasevi</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 7: Odjeća i modni dodaci -->
                      <div class="category-panel" data-category="odjeca">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">checkroom</span>
                            Odjeća i modni dodaci
                          </h3>
                          <a href="/products?cat=Odjeća i modni dodaci" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Odjeća</h4>
                            <a href="/products?cat=Odjeća i modni dodaci&subcat=Odjeća&subcat2=Kaputići">Kaputići</a>
                            <a href="/products?cat=Odjeća i modni dodaci&subcat=Odjeća&subcat2=Haljine">Haljine</a>
                            <a href="/products?cat=Odjeća i modni dodaci&subcat=Odjeća&subcat2=Majice">Majice</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Dodaci</h4>
                            <a href="/products?cat=Odjeća i modni dodaci&subcat=Dodaci&subcat2=Ogrtaci">Ogrtaci</a>
                            <a href="/products?cat=Odjeća i modni dodaci&subcat=Dodaci&subcat2=Kape">Kape</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 8: Kreveti i ležajevi -->
                      <div class="category-panel" data-category="kreveti">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">bed</span>
                            Kreveti i ležajevi
                          </h3>
                          <a href="/products?cat=Kreveti i ležajevi" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Kreveti za pse</h4>
                            <a href="/products?cat=Kreveti i ležajevi&subcat=Kreveti za pse&subcat2=Ortopedski">Ortopedski</a>
                            <a href="/products?cat=Kreveti i ležajevi&subcat=Kreveti za pse&subcat2=Plišani">Plišani</a>
                            <a href="/products?cat=Kreveti i ležajevi&subcat=Kreveti za pse&subcat2=Podignuti">Podignuti</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Kreveti za mačke</h4>
                            <a href="/products?cat=Kreveti i ležajevi&subcat=Kreveti za mačke&subcat2=Zatvoreni">Zatvoreni</a>
                            <a href="/products?cat=Kreveti i ležajevi&subcat=Kreveti za mačke&subcat2=Otvoreni">Otvoreni</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 9: Ogrebala i kule -->
                      <div class="category-panel" data-category="ogrebala">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">stairs</span>
                            Ogrebala i kule
                          </h3>
                          <a href="/products?cat=Ogrebala i kule" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Ogrebala</h4>
                            <a href="/products?cat=Ogrebala i kule&subcat=Ogrebala&subcat2=Vertikalna">Vertikalna</a>
                            <a href="/products?cat=Ogrebala i kule&subcat=Ogrebala&subcat2=Horizontalna">Horizontalna</a>
                            <a href="/products?cat=Ogrebala i kule&subcat=Ogrebala&subcat2=Kombinovana">Kombinovana</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Kule i kompleti</h4>
                            <a href="/products?cat=Ogrebala i kule&subcat=Kule i kompleti&subcat2=Visoke kule">Visoke kule</a>
                            <a href="/products?cat=Ogrebala i kule&subcat=Kule i kompleti&subcat2=Kompleti">Kompleti</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 10: Male životinje -->
                      <div class="category-panel" data-category="male">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">cruelty_free</span>
                            Male životinje
                          </h3>
                          <a href="/products?cat=Male životinje" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Hrana</h4>
                            <a href="/products?cat=Male životinje&subcat=Hrana&subcat2=Za zeke">Za zeke</a>
                            <a href="/products?cat=Male životinje&subcat=Hrana&subcat2=Za hrčke">Za hrčke</a>
                            <a href="/products?cat=Male životinje&subcat=Hrana&subcat2=Za zamorce">Za zamorce</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Oprema</h4>
                            <a href="/products?cat=Male životinje&subcat=Oprema&subcat2=Kavezi">Kavezi</a>
                            <a href="/products?cat=Male životinje&subcat=Oprema&subcat2=Igračke">Igračke</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 11: Akvarijumi i ribice -->
                      <div class="category-panel" data-category="akvarijumi">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">water_drop</span>
                            Akvarijumi i ribice
                          </h3>
                          <a href="/products?cat=Akvarijumi i ribice" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Akvarijumi</h4>
                            <a href="/products?cat=Akvarijumi i ribice&subcat=Akvarijumi&subcat2=Mali">Mali</a>
                            <a href="/products?cat=Akvarijumi i ribice&subcat=Akvarijumi&subcat2=Srednji">Srednji</a>
                            <a href="/products?cat=Akvarijumi i ribice&subcat=Akvarijumi&subcat2=Veliki">Veliki</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Oprema</h4>
                            <a href="/products?cat=Akvarijumi i ribice&subcat=Oprema&subcat2=Filteri">Filteri</a>
                            <a href="/products?cat=Akvarijumi i ribice&subcat=Oprema&subcat2=Grejanje">Grejanje</a>
                            <a href="/products?cat=Akvarijumi i ribice&subcat=Oprema&subcat2=Hrana">Hrana</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 12: Ptičje kavezi -->
                      <div class="category-panel" data-category="ptice">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">nest</span>
                            Ptičje kavezi
                          </h3>
                          <a href="/products?cat=Ptičje kavezi" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Kavezi</h4>
                            <a href="/products?cat=Ptičje kavezi&subcat=Kavezi&subcat2=Mali">Mali</a>
                            <a href="/products?cat=Ptičje kavezi&subcat=Kavezi&subcat2=Srednji">Srednji</a>
                            <a href="/products?cat=Ptičje kavezi&subcat=Kavezi&subcat2=Veliki">Veliki</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Oprema</h4>
                            <a href="/products?cat=Ptičje kavezi&subcat=Oprema&subcat2=Stolice">Stolice</a>
                            <a href="/products?cat=Ptičje kavezi&subcat=Oprema&subcat2=Ogledala">Ogledala</a>
                            <a href="/products?cat=Ptičje kavezi&subcat=Oprema&subcat2=Igračke">Igračke</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 13: Obuka i trening -->
                      <div class="category-panel" data-category="obuka">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">school</span>
                            Obuka i trening
                          </h3>
                          <a href="/products?cat=Obuka i trening" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Trening oprema</h4>
                            <a href="/products?cat=Obuka i trening&subcat=Trening oprema&subcat2=Klikeri">Klikeri</a>
                            <a href="/products?cat=Obuka i trening&subcat=Trening oprema&subcat2=Nagrade">Nagrade</a>
                            <a href="/products?cat=Obuka i trening&subcat=Trening oprema&subcat2=Agilnost">Agilnost</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Knjige i vodiči</h4>
                            <a href="/products?cat=Obuka i trening&subcat=Knjige i vodiči&subcat2=Obuka">Obuka</a>
                            <a href="/products?cat=Obuka i trening&subcat=Knjige i vodiči&subcat2=Ponašanje">Ponašanje</a>
                          </div>
                        </div>
                      </div>

                      <!-- Category 14: Knjige i edukacija -->
                      <div class="category-panel" data-category="knjige">
                        <div class="category-header">
                          <h3>
                            <span class="material-symbols-outlined">menu_book</span>
                            Knjige i edukacija
                          </h3>
                          <a href="/products?cat=Knjige i edukacija" class="view-all-link">Pogledaj sve →</a>
                        </div>
                        <div class="subcategories-grid">
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Knjige</h4>
                            <a href="/products?cat=Knjige i edukacija&subcat=Knjige&subcat2=Nega">Nega</a>
                            <a href="/products?cat=Knjige i edukacija&subcat=Knjige&subcat2=Zdravlje">Zdravlje</a>
                            <a href="/products?cat=Knjige i edukacija&subcat=Knjige&subcat2=Obuka">Obuka</a>
                          </div>
                          <div class="subcategory-column">
                            <h4 class="subcategory-title">Vodiči</h4>
                            <a href="/products?cat=Knjige i edukacija&subcat=Vodiči&subcat2=Za početnike">Za početnike</a>
                            <a href="/products?cat=Knjige i edukacija&subcat=Vodiči&subcat2=Napredni">Napredni</a>
                          </div>
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

    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const availableHeight = Math.max(260, window.innerHeight - headerBottom - safePadding);
    const needsScroll = megaDropdown.scrollHeight > availableHeight;

    megaDropdown.style.maxHeight = `${availableHeight}px`;
    megaDropdown.classList.toggle("enable-scroll", needsScroll);
  }

  if (productsDropdown && megaDropdown) {
    productsDropdown.addEventListener("mouseenter", adjustMegaDropdownPosition);
    productsDropdown.addEventListener("focusin", adjustMegaDropdownPosition);
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
        <h3>Your Cart <span class="cart-count">(2)</span></h3>
        <button class="close-cart">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="cart-items">
        <!-- Static Item 1 -->
        <div class="cart-item">
          <div class="item-img">
            <img src="/img/granula.jpg" alt="Premium Dog Food" loading="lazy">
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
            <img src="/img/pas1.jpg" alt="Dog Toy" loading="lazy">
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
            <img src="/img/pas2.jpg" alt="Dog Leash" loading="lazy">
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
            <img src="/img/pas3.jpg" alt="Cat Bed" loading="lazy">
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
