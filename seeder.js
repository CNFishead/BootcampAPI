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

// Connect to DB
await mongoose.connect(process.env.MONGO_URI);

// target the file, parse the data
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/data/courses.json`, "utf-8")
);

// Import data to db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log("Data was imported".green.inverse);
    process.exit();
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
};

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log("Data destroyed".red.inverse);
    process.exit();
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
};

if (process.argv[2] === "-D") {
  deleteData();
} else {
  importData();
}
