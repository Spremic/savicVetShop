const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const compression = require("compression");
const port = process.env.PORT || 3000;
const app = express();

// Enable compression
app.use(compression());

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

app.get("/product", (req, res) => {
  res.render("product");
});

// Custom page routes - serve custom-page.html for category URLs
app.get("/custom-page", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/custom-page.html"));
});

app.get("/custom-page/*", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/custom-page.html"));
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

  // For any other path, serve custom-page.html
  res.sendFile(path.join(__dirname, "/static/custom-page.html"));
});

app.get("/shopping-cart", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/shopping-cart.html"));
});

app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
