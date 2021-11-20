import ErrorResponse from "../utils/errorResponse.js";

const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log to console for dev
  console.log(err);

  // Mongoose Bad Object ID
  if (err.name === "CastError") {
    const message = `No Resource Found with id: ${error.value}`;
    err = new ErrorResponse(message, 404);
  }
  // Mongoose Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered Object already exists in database with value: ${err.keyValue.name}`;
    err = new ErrorResponse(message, 400);
  }
  // Mongoose Validation error
  if (err.message.includes("validation failed")) {
    const message = Object.values(err.errors).map((value) => value.message);
    err = new ErrorResponse(message, 400);
  }
  res
    .status(err.statusCode || 500)
    .json({ success: false, error: err.message || "Server Error" });
};

export default errorHandler;
