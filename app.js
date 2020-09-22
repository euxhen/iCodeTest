const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helemet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(cors());

//filet statike
app.use(express.static(path.join(__dirname, "public")));

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// Middlewares
app.use(helemet()); //http headers security
// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limitimi i requesteve
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000, // per nje ore
  message: "Shume kerkesa nga kjo IP. Ju lutem provoni me vone pas 1 ore",
}); // nr i Ip te lejuara per request
app.use("/api", limiter);

// body parser, leximi i te dhenave nga body ne req.body
app.use(express.json());

// data sanitization kunder NoSql query injection
app.use(mongoSanitize());
// data sanitization kunder
app.use(xss());

app.use(compression());

// Routes

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

//kapja e unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Nuk mund te gjendet ${req.originalUrl} ne server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
