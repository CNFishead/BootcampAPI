import express from "express";
import dotenv from "dotenv";
import colors from "colors";
// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server has started on port: ${PORT}, in ${process.env.NODE_ENV}`.yellow
  )
);
