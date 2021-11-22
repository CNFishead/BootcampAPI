import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";
import Review from "../models/Review.js";
import Bootcamp from "../models/Bootcamp.js";

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @access    Public
export const getReviews = asyncHandler(async (req, res, next) => {
  // if there is a param for a bootcamp
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
export const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review found with ID: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: review });
});

// @desc      Add single review
// @route     POST /api/v1/bootcamps/:bootcampId/reviews
// @access    Private - user only
export const addReview = asyncHandler(async (req, res, next) => {
  // Add bootcampid to the body
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No Bootcamp with the ID: ${req.params.bootcampId}`,
        404
      )
    );
  }
  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
});

// @desc      Update single review
// @route     PUT /api/v1/reviews/:id
// @access    Private - user/admin only
export const updateReview = asyncHandler(async (req, res, next) => {
  // Find Review by id
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No Review with the ID: ${req.params.bootcampId}`, 404)
    );
  }
  // check if review belongs to user / or if user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update this Review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({ success: true, data: review });
});

// @desc      Delete single review
// @route     DELETE /api/v1/reviews/:id
// @access    Private - user/admin only
export const deleteReview = asyncHandler(async (req, res, next) => {
  // Find Review by id
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No Review with the ID: ${req.params.bootcampId}`, 404)
    );
  }
  // check if review belongs to user / or if user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update this Review`, 401));
  }

  await Review.findByIdAndDelete(req.params.id);
  res.status(201).json({ success: true, data: {} });
});
