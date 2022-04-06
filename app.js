var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true })); // Encode x-www-form-urlencoded
app.use(bodyParser.json()); // Encode JSON format
app.use(
  cors({
    // origin: ["http://localhost:3001", "https://localhost:3001"],
    origin: true, // reflect (enable) the requested origin in the CORS response
    credentials: true,
    exposedHeaders: ["Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept", "Set-Cookie"],
  })
);
// app.use(helmet());

//=======================================================================
const mongoose = require("mongoose");
const config = require("./config/key");

console.log(process.env.NODE_ENV, process.env.DATABASE_NAME);

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to "%s"', config.mongoURI))
  .catch((err) => console.log(err));

//=======================================================================

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/product", productRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
