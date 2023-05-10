const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/static/css"));
app.use(express.static(__dirname + "/static/script"));
app.use(express.static(__dirname + "/static/img"));
app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
let server = app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
