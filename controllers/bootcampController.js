import Bootcamp from "../models/Bootcamp.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";
import geocoder from "../utils/geoCoder.js";
import path from "path";
import slugify from "slugify";
import { mkdir } from "fs";

/*
  @Desc:   Return All bootcamps
  @Route:  GET /api/v1/bootcamps
  @Access: Public
*/
const getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
/*
  @Desc:   Return single bootcamp
  @Route:  GET /api/v1/bootcamps/:id
  @Access: Public
*/
const getBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id);
  if (!data) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(`No Bootcamp Found with id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: data });
});
/*
  @Desc:   update bootcamp
  @Route:  PUT /api/v1/bootcamps
  @Access: Private
*/
const updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(`No Bootcamp Found with id: ${req.params.id}`, 404)
    );
  }
  // Make sure user is owner, or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User: ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
});
/*
  @Desc:   DELETE bootcamp
  @Route:  DELETE /api/v1/bootcamps
  @Access: Private
*/
const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(`No Bootcamp Found with id: ${req.params.id}`, 404)
    );
  }
  // Make sure user is owner, or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User: ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});
/*
  @Desc:   Create new bootcamp
  @Route:  POST /api/v1/bootcamps
  @Access: Private
*/
const createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  // IF user is not an admin they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID: ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

/*
  @Desc:   GET bootcamps within a radius
  @Route:  GET /api/v1/bootcamps/radius/:zipcode/:distance
  @Access: Private
*/
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng  from geoCoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // calc radius using radians
  // Divide distance by radius of earth.
  // Earth radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

/*
  @Desc:   Upload photo for bootcamp
  @Route:  Put /api/v1/bootcamps/id/photo
  @Access: Private
*/
const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(`No Bootcamp Found with id: ${req.params.id}`, 404)
    );
  }
  // Make sure user is owner, or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User: ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }
  if (!req.files) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(`Please upload a file`, 400)
    );
  }
  const file = req.files.file;
  // make sure image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(`File is of the wrong type`, 400)
    );
  }
  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      // Correctly formatted, but not in the database
      new ErrorResponse(
        `File was too large, please upload an image less than ${process.env.MAX_FILE_UPLOAD} or 1MB`,
        400
      )
    );
  }

  // ***NOTE*** Path.parse() returns a {}, youll need to .name to access {name: String} for slugify
  const fileName = path.parse(file.name);

  // Create custom filename
  file.name =
    slugify(`${fileName.name}`, { lower: true }) +
    `-photo-${bootcamp._id}${path.parse(file.name).ext}`;

  // resolve __dirname not being defined
  const __dirname = path.resolve();
  // Create bootcamp directory if it doesnt exist
  mkdir(
    path.join(__dirname, `./public/uploads/${bootcamp.name}${bootcamp._id}`),
    (err) => {
      if (err) {
        return console.log(err);
      }
    }
  );
  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/${bootcamp.name}${bootcamp._id}/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(
          // Correctly formatted, but not in the database
          new ErrorResponse(`Problem with file being moved to filesystem.`, 500)
        );
      }
      // insert filename into database
      // if you go to (http://localhost:5000/uploads/:filename) itll display the image.
      // In production change localhost to whatever the servername is and itll serve up the image from the uploads
      // folder
      console.log(
        `${process.env.FILE_UPLOAD_PATH}/${bootcamp.name}${bootcamp._id}/${file.name}`
      );
      await Bootcamp.findByIdAndUpdate(req.params.id, {
        photo: `${proccess.env.SERVER_NAME}/uploads/${bootcamp.name}${bootcamp._id}/${file.name}`,
      });
      res.status(200).json({
        success: true,
        data: file.name,
      });
    }
  );
});

export {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
};
