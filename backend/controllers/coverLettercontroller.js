const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../db");

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);
const puppeteer = require("puppeteer");

exports.generateCoverLetter = async (req, res) => {
  const userId = req.user.id;
  const { job_description } = req.body;

  if (!job_description) {
    return res.status(400).json({ message: "Job description is required" });
  }

  try {
    const profileResult = await pool.query(
      "SELECT * FROM user_profiles WHERE id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = profileResult.rows[0];

    const skillsResult = await pool.query(
      "SELECT * FROM skills WHERE id = $1",
      [userId]
    );
    const experienceResult = await pool.query(
      "SELECT * FROM experience WHERE user_id = $1",
      [userId]
    );
    const projectsResult = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1",
      [userId]
    );
    const educationResult = await pool.query(
      "SELECT * FROM education WHERE user_id = $1",
      [userId]
    );
    const certificatesResult = await pool.query(
      "SELECT * FROM certificates WHERE user_id = $1",
      [userId]
    );

    const skills = skillsResult.rows;
    const experience = experienceResult.rows;
    const projects = projectsResult.rows;
    const education = educationResult.rows;
    const certificates = certificatesResult.rows;

    const skillList = skills.map((skill) => skill.skill_name).join(", ");
    const prompt = `
    You are an AI specialized in writing professional, personalized cover letters.

    Using the information below, write a tailored cover letter that matches the job description and highlights the candidate’s most relevant strengths.

    ### USER PROFILE
    Full Name: ${profile.full_name}
    Email: ${profile.email}
    Phone: ${profile.phone}
    Address: ${profile.address}
    LinkedIn: ${profile.linkedin}
    GitHub: ${profile.github}
    Portfolio: ${profile.portfolio}


    Skills:
    ${skillList}

    Experience:
    ${JSON.stringify(experience, null, 2)}

    Projects:
    ${JSON.stringify(projects, null, 2)}

    Education:
    ${JSON.stringify(education, null, 2)}

    Certifications:
    ${JSON.stringify(certificates, null, 2)}

    Job Description:
    ${job_description}
    ---

    ### **INSTRUCTIONS**
    - Write a professional cover letter of 3–5 paragraphs.
    - Tailor the tone and content to match the job description.
    - Highlight the candidate’s most relevant skills, experiences, and projects.
    - If education or certifications directly support the role, include them naturally.
    - Do NOT repeat content unnecessarily.
    - Keep the tone confident, clear, and concise.
    - Use the candidate’s name in the signature.

    Return only the completed cover letter.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);

    let coverLetterText = result.response.text().trim();

    // Escape HTML-sensitive chars
    const escaped = coverLetterText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    // Wrap in HTML for PDF
    const html = `
      <html>
        <body style="font-family: Arial; white-space: pre-wrap; line-height: 1.6; font-size: 14px; padding: 20px;">
          ${escaped}
        </body>
      </html>
      `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await pool.query(
      "INSERT INTO cover_letters (user_id, pdf) VALUES ($1, $2)",
      [userId, pdfBuffer]
    );

    res.status(200).json({ message: "Cover letter generated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getConverLetters = async (req, res) => {
  const userId = req.user.id;

  try {
    const coverLetterResult = await pool.query(
      "SELECT * FROM cover_letters WHERE user_id = $1",
      [userId]
    );

    if (coverLetterResult.rows.length === 0) {
      return res.status(404).json({ message: "No cover letters found" });
    }

    const coverLetters = coverLetterResult.rows;

    res
      .status(200)
      .json({ message: "Cover letters fetched successfully", coverLetters });
  } catch (err) {
    console.log(err);
  }
};
