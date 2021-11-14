import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";
import Course from "../models/Course.js";
import Bootcamp from "../models/Bootcamp.js";

/*
  @Desc:   Return All courses
  @Route:  GET /api/v1/courses
  @Route:  GET /api/v1/bootcamps/:bootcampId/courses
  @Access: Public
*/
const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/*
  @Desc:   Return Single Course
  @Route:  GET /api/v1/courses/:id
  @Access: Public
*/
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course) {
    return next(new ErrorResponse(`No course with id: ${req.params.id}`), 404);
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

/*
  @Desc:   Create Single Course
  @Route:  POST /api/v1/bootcamps/:bootcampId/courses
  @Access: Private
*/
const createNewCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`),
      404
    );
  }
  // Make sure user is owner, or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User: ${req.user.id} is not authorized to add a course to bootcamp`,
        401
      )
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});
/*
  @Desc:   Update Single Course
  @Route:  Put /api/v1/courses/:id
  @Access: Private
*/
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse(`No course with id: ${req.params.id}`), 404);
  }
  // Make sure user is owner, or admin
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User: ${req.user.id} is not authorized to update course: ${course.id}`,
        401
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: course,
  });
});
/*
  @Desc:   Delete Single Course
  @Route:  Put /api/v1/courses/:id
  @Access: Private
*/
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse(`No course with id: ${req.params.id}`), 404);
  }
  // Make sure user is owner, or admin
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User: ${req.user.id} is not authorized to delete course: ${course.id}`,
        401
      )
    );
  }
  await course.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});

export { getCourses, getCourse, createNewCourse, updateCourse, deleteCourse };
