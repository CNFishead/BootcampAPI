import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";
import User from "../models/User.js";

/*
  @desc:  Register User
  @route: POST /api/v1/auth/register
  @access Public
*/
const register = asyncHandler(async (req, res, next) => {
  // Destructure body data
  const { name, email, password, role } = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenResponse(user, 200, res);
});

/*
  @desc:  Auth User
  @route: POST /api/v1/auth/register
  @access Public
*/
const login = asyncHandler(async (req, res, next) => {
  // Destructure body data
  const { email, password } = req.body;

  // Validate email/password
  if (!email || !password) {
    return next(new ErrorResponse(`Please send an email and a Password`, 400));
  }
  // Check if user in system
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }
  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create a cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();

  // options
  const options = {
    // expires in 30 days
    expires: new Date(Date.now + 30 * 24 * 60 * 60 * 1000),
    // accessible only by clientside script
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

/* @desc Get current logged in user
   @route POST /api/v1/auth/me
   @access Private
 */
const getMe = asyncHandler(async (req, res, nex) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});
export { register, login, getMe };
