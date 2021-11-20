// Import the filesystem module
import fs from "fs";
import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";
import path from "path";

// Load .env variables
dotenv.config({ path: "./config/config.env" });

const __dirname = path.resolve();

// Load model
import Bootcamp from "./models/Bootcamp.js";
import Course from "./models/Course.js";
import User from "./models/User.js";
import Review from "./models/Review.js";

// Connect to DB
await mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/data/bootcamps.json`, "utf-8")
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/data/courses.json`, "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, "utf-8")
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-D") {
  deleteData();
} else {
  importData();
}
