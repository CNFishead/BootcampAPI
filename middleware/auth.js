import jwt from "jsonwebtoken";
import asyncHandler from "./async.js";
import ErrorResponse from "../utils/errorResponse.js";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  // init a variable
  let token;
  // Check for token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Split the Bearer and token into an array, and grab the token.
    token = req.headers.authorization.split(" ")[1];
  } //else if (req.cookies.token) {
  //token = req.cookies.token;
  //}

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }
  try {
    // verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // dev purposes
    console.log(decoded);
    // Find User
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    return next(
      new ErrorResponse(`Not authorized to access this route: ${e}`, 401)
    );
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    // check to see if role is included in the roles passed in
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
