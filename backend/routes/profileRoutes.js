const express = require("express");
const {
  setupProfile,
  updateProfile,
  getProfileInfo,
} = require("../controllers/profileController");
const router = express.Router();

router.post("/setup", setupProfile);
router.post("/update", updateProfile);
router.get("/", getProfileInfo);
