require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT | 3001;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
