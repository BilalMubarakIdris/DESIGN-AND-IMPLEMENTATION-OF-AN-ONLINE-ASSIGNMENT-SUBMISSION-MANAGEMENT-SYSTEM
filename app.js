require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("express-flash");
const methodOverride = require("method-override");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/admin");
// Replace bcrypt import if using bcryptjs

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// make user available in views
app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  if (req.session && req.session.userId) {
    // load user once per request for templates
    const User = require("./models/User");
    res.locals.currentUser = await User.findById(req.session.userId).lean();
  }
  next();
});

// 1️⃣ Home page (public)
// 1️⃣ Home page (public)
app.get("/", (req, res) => {
  if (req.session.userId) {
    // If user is logged in, redirect based on role
    const User = require("./models/User");
    User.findById(req.session.userId)
      .lean()
      .then((user) => {
        if (!user) return res.redirect("/login");

        if (user.role === "admin") {
          return res.redirect("/admin/dashboard");
        } else {
          return res.redirect("/dashboard");
        }
      })
      .catch((err) => {
        console.error(err);
        res.redirect("/login");
      });
  } else {
    // Public users see home page
    res.render("home", { title: "Home" });
  }
});

// Optional /home route
app.get("/home", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/home", (req, res) => {
  res.render("home"); // optional if you want /home URL
});

// 2️⃣ Auth routes (login, register, forgot password, etc.)
app.use("/", authRoutes);

// 3️⃣ Student dashboard routes
app.use("/dashboard", studentRoutes);

// 4️⃣ Admin routes
app.use("/admin", adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App running on http://localhost:${port}`));
