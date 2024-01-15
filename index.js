const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require('path');
require('dotenv').config()
require('./config/database');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  session({
    secret: "osdguocsdpxmdsfoisdhmoi",
    resave: true,
    saveUninitialized: true,
  })
);

const indexRoutes = require("./routes/home");
const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const adminRoutes = require("./routes/admin");
const imageRoutes = require("./routes/images");
const logoutRoutes = require("./routes/logout");
function isAuthenticated(req, res, next) {
  res.locals.user = req.session.user || null;
  if (res.locals.isAdmin === undefined) {
    res.locals.isAdmin = false;
  }
  next();
}
app.use(isAuthenticated);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use("/", indexRoutes);
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/admin", adminRoutes);
app.use('/images', imageRoutes);
app.use("/logout", logoutRoutes);
app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});