import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
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

/* @desc   log user out, destroy cookie
   @route  GET /api/v1/auth/logout
   @access Private
 */
export const logout = asyncHandler(async (req, res, nex) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
  });
});

/* @desc   Get current logged in user
   @route  POST /api/v1/auth/me
   @access Private
 */
const getMe = asyncHandler(async (req, res, nex) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

/* @desc   Update password
   @route  POST /api/v1/auth/updatepassword
   @access Private
 */
const updatePassword = asyncHandler(async (req, res, nex) => {
  // find user, and add password to returned object
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return nex(new ErrorResponse("Password is incorrect", 401));
  }
  // set password, password will hash itself before saving
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/* @desc   Update user details
   @route  PUT /api/v1/auth/updatedetails
   @access Private
 */
const updateDetails = asyncHandler(async (req, res, nex) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

/* @desc    Forgot password
   @route   POST /api/v1/auth/forgotpassword
   @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`There is no user with that Email`, 404));
  }
  // Get reset token
  const resetToken = await user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Password Reset Token`,
      message: message,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

/* @desc    Reset Password
   @route   PUT /api/v1/auth/resetpassword/:resettoken
   @access  Public
 */
const resetPassword = asyncHandler(async (req, res, nex) => {
  // Get hashed token
  const resetPassToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  const user = await User.findOne({
    resetPassToken: resetPassToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  // doesnt exist or password token expired
  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
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

export {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
};
