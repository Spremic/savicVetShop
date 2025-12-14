const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const app = express();

// EJS konfiguracija
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "static/views"));

app.use(express.static(__dirname + "/static/css"));
app.use(express.static(__dirname + "/static/img"));
app.use(express.static(__dirname + "/static/js"));
app.use("/", express.static(path.join(__dirname, "static")));
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

app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
