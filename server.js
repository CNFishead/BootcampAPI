import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import bootcampRoutes from "./routes/bootcampRoutes.js";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connnect to Database
connectDB();

const app = express();
// Body Parser, allows to accept body data
app.use(express.json());
// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {});
// API Routes
app.use("/api/v1/bootcamps", bootcampRoutes);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server has started on port: ${PORT}, in ${process.env.NODE_ENV}`.yellow
  )
);
