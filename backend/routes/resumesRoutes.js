const express = require("express");
const { generateResume, getResumes } = require("../controllers/generateResume");
const router = express.Router();

router.post("/generate", generateResume);
router.get("/", getResumes);

module.exports = router;
