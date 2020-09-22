const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Te dhena te futura gabim. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Ju lutem hyni perseri!", 401);

const handleJWTExpiredError = () =>
  new AppError("Token juaj ka skaduar. Ju lutem hyni perseri.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //probleme operacionale
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //probleme programimi ose probleme te tjera te panjohura
  } else {
    //1) log error
    console.error("ERROR", err);
    //2) dergimi i pergjigjes
    res.status(500).json({
      status: "error",
      message: "Dicka shkoi shume keq!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  sendErrorDev(err, res);
};
