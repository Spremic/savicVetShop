// Load environment variables from .env file
require('dotenv').config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const compression = require("compression");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const port = process.env.PORT || 3000;
const app = express();

// Cloudinary configuration with validation
const cloudName = process.env.cloud_name;
const apiKey = process.env.cloudinary_api_key;
const apiSecret = process.env.cloudinary_api_secret;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  console.log("Cloudinary configured successfully");
} else {
  console.warn("Warning: Cloudinary credentials not found. Image loading from Cloudinary will not work.");
  console.warn("Please set the following environment variables:");
  console.warn("  - cloud_name");
  console.warn("  - cloudinary_api_key");
  console.warn("  - cloudinary_api_secret");
}

// Enable compression
app.use(compression());

// Body parser middleware for JSON (must be before API routes)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// EJS konfiguracija
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "static/views"));

// Static files - no cache headers
app.use(express.static(__dirname + "/static/css", {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));
app.use(express.static(__dirname + "/static/img", {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));
app.use(express.static(__dirname + "/static/js", {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));
app.use("/", express.static(path.join(__dirname, "static"), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/about.html"));
});
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/galery.html"));
});

app.get("/legal", (req, res) => {
    res.sendFile(path.join(__dirname, "/static/legal.html"));
  });

// Optimized JSON endpoint with proper headers for fast loading
app.get("/json/product.json", (req, res) => {
  const jsonPath = path.join(__dirname, "static/json/product.json");
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(jsonPath);
});

// API endpoint to get product images from Cloudinary (single product)
app.get("/api/product-images/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      return res.json({ images: [] });
    }

    // Search for resources in the folder named by product ID
    const result = await cloudinary.search
      .expression(`folder:${productId}`)
      .sort_by('created_at')
      .max_results(10)
      .execute();

    // Extract image URLs from the results
    const images = result.resources.map(resource => ({
      url: resource.secure_url,
      public_id: resource.public_id,
      width: resource.width,
      height: resource.height
    }));

    res.json({ images: images });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    res.json({ images: [] });
  }
});

// Batch API endpoint to get images for multiple products at once (optimized)
app.post("/api/product-images/batch", async (req, res) => {
  try {
    const productIds = req.body.productIds;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Product IDs array is required" });
    }

    // Check if Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      return res.json({ results: {} });
    }

    // Fetch all images in parallel
    const imagePromises = productIds.map(async (productId) => {
      try {
        const result = await cloudinary.search
          .expression(`folder:${productId}`)
          .sort_by('created_at')
          .max_results(10)
          .execute();

        const images = result.resources.map(resource => ({
          url: resource.secure_url,
          public_id: resource.public_id,
          width: resource.width,
          height: resource.height
        }));

        return { productId, images };
      } catch (error) {
        console.error(`Error fetching images for product ${productId}:`, error);
        return { productId, images: [] };
      }
    });

    const results = await Promise.all(imagePromises);
    
    // Convert to object for easier lookup
    const resultsObj = {};
    results.forEach(({ productId, images }) => {
      resultsObj[productId] = images;
    });

    res.json({ results: resultsObj });
  } catch (error) {
    console.error("Error fetching batch images from Cloudinary:", error);
    res.json({ results: {} });
  }
});

// Load products data
function loadProductsData() {
  try {
    const productsPath = path.join(__dirname, "static/json/product.json");
    const productsData = fs.readFileSync(productsPath, "utf8");
    return JSON.parse(productsData);
  } catch (error) {
    console.error("Error loading products data:", error);
    return [];
  }
}

// Slugify function to match URL slugs with product titles
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

app.get("/product/:slug", (req, res) => {
  const slug = req.params.slug;
  const products = loadProductsData();
  
  if (!slug) {
    return res.render("product", { product: null, recommendedProducts: [] });
  }
  
  // Find product by matching slugified title with URL slug
  const product = products.find(p => {
    const productSlug = slugify(p.title);
    return productSlug === slug;
  });
  
  if (!product) {
    return res.render("product", { product: null, recommendedProducts: [] });
  }
  
  // Get recommended products (same category, exclude current product)
  const recommendedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 8)
    .map(p => ({
      ...p,
      slug: slugify(p.title)
    }));
  
  res.render("product", { product, recommendedProducts, slugify });
});

// Keep old route for backward compatibility
app.get("/product", (req, res) => {
  const productId = req.query.id;
  const products = loadProductsData();
  
  if (!productId) {
    return res.render("product", { product: null, recommendedProducts: [] });
  }
  
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.render("product", { product: null, recommendedProducts: [] });
  }
  
  const recommendedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 8)
    .map(p => ({
      ...p,
      slug: slugify(p.title)
    }));
  
  res.render("product", { product, recommendedProducts, slugify });
});

// Custom page routes - serve custom-page.html for category URLs
app.get("/custom-page", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/custom-page.html"));
});

app.get("/custom-page/*", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/custom-page.html"));
});

app.get("/shopping-cart", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/shopping-cart.html"));
});

// Special route for all-products (must be before product slug route)
app.get("/all-products", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/custom-page.html"));
});

// Product route by slug (must be before catch-all route)
app.get("/:slug", (req, res, next) => {
  const slug = req.params.slug;
  const products = loadProductsData();
  
  // Skip if it's a reserved route
  const reservedRoutes = ['about', 'gallery', 'legal', 'custom-page', 'shopping-cart', 'product', 'all-products', 'css', 'js', 'img', 'json', 'api'];
  if (reservedRoutes.includes(slug)) {
    return next();
  }
  
  if (!slug) {
    return next();
  }
  
  // Find product by matching slugified title with URL slug
  const product = products.find(p => {
    const productSlug = slugify(p.title);
    return productSlug === slug;
  });
  
  if (!product) {
    // Not a product, let it pass to catch-all route for categories
    return next();
  }
  
  // Get recommended products (same category, exclude current product)
  const recommendedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 20)
    .map(p => ({
      ...p,
      slug: slugify(p.title)
    }));
  
  res.render("product", { product, recommendedProducts, slugify });
});

// Catch all route for category URLs - serve custom-page.html
// This must be LAST in the routing order
app.get("*", (req, res) => {
  // Skip static assets
  if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/img/') || req.path.startsWith('/json/')) {
    return res.status(404).send('Not Found');
  }

  // Skip existing specific routes - let them fall through to 404 if not handled above
  const pathParts = req.path.split('/').filter(p => p);
  if (pathParts.length === 0) {
    return res.sendFile(path.join(__dirname, "/static/index.html"));
  }

  // Try to find category/subcategory match first
  const products = loadProductsData();
  
  // Parse path segments (e.g., /pet-food/fish-food -> ['pet-food', 'fish-food'])
  const pathSegments = pathParts.map(p => p.toLowerCase());
  
  // Check if it matches category/subcategory/type hierarchy
  const isCategory = products.some(p => {
    const pCat = p.category ? slugify(p.category).toLowerCase() : '';
    const pSub = p.subcategory ? slugify(p.subcategory).toLowerCase() : '';
    const pType = p.type ? slugify(p.type).toLowerCase() : '';
    
    // Match patterns:
    // 1 segment: category only
    if (pathSegments.length === 1) {
      return pCat === pathSegments[0];
    }
    // 2 segments: category/subcategory
    if (pathSegments.length === 2) {
      return pCat === pathSegments[0] && pSub === pathSegments[1];
    }
    // 3 segments: category/subcategory/type
    if (pathSegments.length === 3) {
      return pCat === pathSegments[0] && pSub === pathSegments[1] && pType === pathSegments[2];
    }
    return false;
  });

  // If it's a category, serve custom-page.html
  if (isCategory) {
    return res.sendFile(path.join(__dirname, "/static/custom-page.html"));
  }

  // If not a category and not a product (already checked in :slug route), serve 404
  res.status(404).sendFile(path.join(__dirname, "/static/404.html"));
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
