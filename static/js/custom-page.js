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
    console.error("Greška pri učitavanju product.json:", error);
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
  // Koristi window.location.pathname koji je već dekodovan od strane browsera
  // Ali ako ima URL-encoded karaktere, dekoduj ih
  const pathname = window.location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  // Skip known routes like 'about', 'gallery', 'legal', etc.
  const knownRoutes = ['about', 'gallery', 'legal', 'shopping-cart', 'product'];
  const filteredParts = parts.filter(p => !knownRoutes.includes(p.toLowerCase()));
  
  // Dekoduj URL-encoded karaktere (npr. %D0%B0 -> а)
  // window.location.pathname bi trebalo da bude već dekodovan, ali proveri
  const decodeSlug = (str) => {
    if (!str) return "";
    // Ako string sadrži % karaktere, pokušaj da dekoduješ
    if (str.includes('%')) {
      try {
        return decodeURIComponent(str);
      } catch (e) {
        // Ako ne uspe, vrati original
        return str;
      }
    }
    return str;
  };
  
  let slugCat = decodeSlug(filteredParts[0] || "");
  let slugSub = decodeSlug(filteredParts[1] || "");
  let slugSub2 = decodeSlug(filteredParts[2] || "");

  console.log("🌐 URL PARSIRANJE:", {
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
  // Normalizuj URL slug-ove pre poređenja
  const normalizedCat = slugCat ? slugify(slugCat) : "";
  const normalizedSub = slugSub ? slugify(slugSub) : "";
  const normalizedSub2 = slugSub2 ? slugify(slugSub2) : "";
  
  console.log("🔍 FILTRIRANJE:", {
    urlSlugs: { slugCat, slugSub, slugSub2 },
    normalized: { normalizedCat, normalizedSub, normalizedSub2 }
  });
  
  const filtered = products.filter((p) => {
    const pCat = slugify(p.kategorija || "");
    const pSub = slugify(p.potkategorija || "");
    const pSub2 = slugify(p.potkategorija2 || "");
    const matchCat = !normalizedCat || pCat === normalizedCat;
    const matchSub = !normalizedSub || pSub === normalizedSub;
    const matchSub2 = !normalizedSub2 || pSub2 === normalizedSub2;
    
    // Debug za proizvode sa "Hrana za ribe" i "ciklide"
    if (p.potkategorija && p.potkategorija.includes("ribe") && p.potkategorija2 && p.potkategorija2.includes("ciklide")) {
      console.log("🐟 Proizvod sa ribama/ciklidama:", {
        id: p.id,
        kategorija: p.kategorija,
        potkategorija: p.potkategorija,
        potkategorija2: p.potkategorija2,
        slugs: { pCat, pSub, pSub2 },
        matches: { matchCat, matchSub, matchSub2 }
      });
    }
    
    return matchCat && matchSub && matchSub2;
  });
  
  console.log(`📊 Pronađeno ${filtered.length} proizvoda od ${products.length} ukupno`);
  return filtered;
}

function pickImage(product) {
  if (product.slika) return product.slika;
  // Stable pseudo-random pick based on product id/name to keep image consistent
  const key = `${product.id || ""}-${product.naslov || ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const idx = hash % fallbackImages.length;
  return fallbackImages[idx] || "/img/customPageBcg.png";
}

function formatPrice(product) {
  const akcijska = product.akcijskaCena && product.akcijskaCena !== "/";
  const base = (product.cena || "").trim();
  const promo = akcijska ? (product.akcijskaCena || "").trim() : "";
  if (promo) {
    return `<span class="price-range akcijska">${promo} RSD</span> <span class="price-old">${base} RSD</span>`;
  }
  return `<span class="price-range">${base} RSD</span>`;
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-category", product.kategorija);
  card.setAttribute("data-subcategory", product.potkategorija);
  card.setAttribute("data-subcategory2", product.potkategorija2 || "");

  const badge = product.postotak && product.postotak !== "/" ? `<div class="product-badge">-${product.postotak}</div>` : "";

  card.innerHTML = `
    <div class="product-image">
      <img src="${pickImage(product)}" alt="${product.naslov}" loading="lazy" />
      ${badge}
    </div>
    <div class="product-info">
      <div class="product-brand">${product.brend || ""}</div>
      <h3 class="product-title">${product.naslov}</h3>
      <div class="product-price">
        ${formatPrice(product)}
      </div>
      <p class="product-description">${product.opis || ""}</p>
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

  // Slider controls (shown only kada ima potrebe)
  let sliderMode = false;
  let sliderControls = null;
  const createSliderControls = () => {
    if (!productsGrid || sliderControls) return;
    sliderControls = document.createElement("div");
    sliderControls.className = "products-slider-controls hidden";
    sliderControls.innerHTML = `
      <button class="slider-arrow slider-prev" aria-label="Prethodni proizvodi">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <button class="slider-arrow slider-next" aria-label="Sledeći proizvodi">
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
  
  // Zameni URL sa dekodovanom verzijom (bez % karaktera)
  const normalizeUrl = () => {
    if (selection.slugCat || selection.slugSub || selection.slugSub2) {
      // Koristi slugify da bi slug-ovi bili u istom formatu kao u clone.js
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
      
      // Ako trenutni path ima URL-encoded karaktere, zameni ga
      if (currentPath !== newPath && currentPath.includes("%")) {
        history.replaceState(null, "", newPath);
        console.log("🔗 URL normalizovan:", currentPath, "->", newPath);
      }
    }
  };
  
  normalizeUrl();
  
  // Hero kategorije se uvek prikazuju

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

    // Prikazuje samo poslednju kategoriju u hijerarhiji
    let title = "Product Catalog";
    if (selectionNames.subcat2) {
      title = selectionNames.subcat2;
    } else if (selectionNames.subcat) {
      title = selectionNames.subcat;
    } else if (selectionNames.cat) {
      title = selectionNames.cat;
    }

    pageTitle.textContent = title;

    // Sakrij page-description element
    if (pageDescription) {
      pageDescription.style.display = "none";
    }
  };

  const allProducts = await loadProductsData();
  if (!productsGrid) return;
  if (!allProducts.length) {
    productsGrid.innerHTML = "<p class='empty-state'>Nije moguće učitati proizvode.</p>";
    return;
  }

  selectionNames.cat = resolveName("kategorija", selection.slugCat);
  selectionNames.subcat = resolveName("potkategorija", selection.slugSub);
  selectionNames.subcat2 = resolveName("potkategorija2", selection.slugSub2);

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
        p.naslov,
        p.brend,
        p.kategorija,
        p.potkategorija,
        p.potkategorija2
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  function shouldUseSlider(count) {
    // koristi slider kada ima dovoljno proizvoda (npr. više od 6) ili više od jedne stranice
    return count > Math.max(6, itemsPerPage);
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
    console.log("🎨 RENDER PROIZVODA:", {
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

    console.log("📦 Lista za renderovanje:", listToRender.length, "proizvoda");

    if (!listToRender.length) {
      productsGrid.innerHTML = "<p class='empty-state'>Nema proizvoda za izabrani filter.</p>";
      console.log("❌ Nema proizvoda za renderovanje");
      return;
    }

    productsGrid.classList.toggle("slider-active", sliderMode);
    createSliderControls();
    sliderControls?.classList.toggle("hidden", !sliderMode);
    paginationContainer?.classList.toggle("hidden", sliderMode);

    listToRender.forEach((product) => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
      console.log("✅ Dodat proizvod:", product.id, product.naslov);
    });
    
    console.log("✅ Renderovanje završeno. Dodato kartica:", productsGrid.children.length);
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

  // Hero category cards lead to odgovarajucu kategoriju
  const heroCategoryItems = document.querySelectorAll(".hero-category-item");
  const heroMap = {
    food: "Hrana za životinje",
    toys: "Igračke za životinje",
    equipment: "Oprema za kućne ljubimce",
    accessories: "Kozmetika za životinje",
  };
  heroCategoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const catName = heroMap[item.dataset.category];
      if (!catName) return;
      window.location.href = `/${slugify(catName)}`;
    });
  });
});
