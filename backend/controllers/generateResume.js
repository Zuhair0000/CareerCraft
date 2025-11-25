const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);

exports.generateResume = async (req, res) => {
  const userId = req.user.id;

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
      "SELECT * FROM skills WHERE user_id = $1",
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

    const prompt = `
    You are a professional resume writer and designer.  
    Generate a beautiful, ATS-friendly **HTML résumé** with modern clean styling.  

    Use this user data:

    Full Name: ${profile.full_name}
    Email: ${profile.email}
    Phone: ${profile.phone}
    Address: ${profile.address}
    LinkedIn: ${profile.linkedin}
    GitHub: ${profile.github}
    Portfolio: ${profile.portfolio}

    Summary:
    ${profile.summary}

    Skills:
    ${skills.join(", ")}

    Experience:
    ${JSON.stringify(experience, null, 2)}

    Projects:
    ${JSON.stringify(projects, null, 2)}

    Education:
    ${JSON.stringify(education, null, 2)}

    Certifications:
    ${JSON.stringify(certificates, null, 2)}

    FORMAT REQUIREMENTS:
    - Output must be pure HTML + inline CSS (no Tailwind)
    - Clean layout, good spacing, readable fonts
    - Use headings + bullet points
    - Do NOT add Javascript
    - Do NOT write markdown
    - Only return HTML
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);

    let html = result.response.text();
    html = html.replace(/```html|```/g, "").trim();

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    await browser.close();

    await pool.query(
      "INSERT INTO resumes (user_id, pdf) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET pdf = EXCLUDED.pdf, created_at = CURRENT_TIMESTAMP",
      [userId, pdfBuffer]
    );

    res
      .status(200)
      .json({ success: true, message: "Resume generated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
