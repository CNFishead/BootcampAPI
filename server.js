import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import bootcampRoutes from "./routes/bootcampRoutes.js";
import morgan from "morgan";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/error.js";
import courseRoutes from "./routes/courseRoutes.js";
import fileupload from "express-fileupload";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import cors from "cors";

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connnect to Database
connectDB();

const app = express();
// Body Parser, allows to accept body data
app.use(express.json());
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading middleware
app.use(fileupload());
// Sanitize Data
app.use(mongoSanitize());
// Set Security headers
app.use(helmet());
// prevent XSS attacks
app.use(xss());
// Prevent hpp pollution
app.use(hpp());

// CORS
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Minutes
  max: 100,
});
app.use(limiter);

// Set static folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/v1/bootcamps", bootcampRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Init Middleware
// Has to be after routes, or the controllers cant use the middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server has started on port: ${PORT}, in ${process.env.NODE_ENV}`.yellow
  )
);
