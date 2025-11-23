const pool = require("../db");

exports.setupProfile = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    address,
    linkedin,
    github,
    portfolio,
    summary,
    skills,
    experience,
    currentlyWorking,
    achievements,
    projects,
    education,
    certification,
  } = req.body;
  const userId = req.user.id;

  try {
    // User Profile
    await pool.query(
      `INSERT INTO user_profiles
     (id, full_name, email, phone, address, linkedin, github, portfolio, summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET
     phone = EXCLUDED.phone,
     address = EXCLUDED.address,
     linkedin = EXCLUDED.linkedin,
     github = EXCLUDED.github,
     portfolio = EXCLUDED.portfolio,
     summary = EXCLUDED.summary,
     updated_at = NOW()`,
      [
        userId,
        fullName,
        email,
        phone,
        address,
        linkedin,
        github,
        portfolio,
        summary,
      ]
    );

    // Skills
    for (const skill of skills) {
      const { name } = skill;

      await pool.query(
        "INSERT INTO skills(user_id, skill_name) VALUES($1, $2)",
        [userId, name]
      );
    }

    // Experience
    for (const exp of experience) {
      const { job_title, company_name, start_date, end_date } = exp;

      await pool.query(
        "INSERT INTO experience(user_id, job_title, company_name, start_date, end_date, currently_working, achievements) VALUES($1, $2, $3, $4, $5, $6, $7)",
        [
          userId,
          job_title,
          company_name,
          start_date,
          end_date,
          currentlyWorking,
          achievements,
        ]
      );
    }

    // Projects
    for (const project of projects) {
      const { project_title, description, tech_stack, github_link, live_link } =
        project;

      await pool.query(
        "INSERT INTO projects(user_id, project_title, description, tech_stack, github_link, live_link) VALUES($1, $2, $3, $4, $5, $6)",
        [userId, project_title, description, tech_stack, github_link, live_link]
      );
    }

    //Education
    for (const edu of education) {
      const { degree, school_name, graduation_year } = edu;

      await pool.query(
        "INSERT INTO education(user_id, degree, school_name, graduation_year) VALUES($1, $2, $3, $4)",
        [userId, degree, school_name, graduation_year]
      );
    }

    // Certificates
    for (const certificate of certification) {
      const { title, issuer, issue_date } = certificate;

      await pool.query(
        "INSERT INTO certificates(user_id, title, issuer, issue_date) VALUES($1, $2, $3, $4)",
        [userId, title, issuer, issue_date]
      );
    }

    res.status(201).json("Profile set up successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getProfileInfo = async (req, res) => {
  const userId = req.user.id;

  try {
    const personalInfo = await pool.query(
      "SELECT (full_name, email, phone, address, linkedin, github, portfolio, summary) FROM user_profile WHERE id = $1",
      [userId]
    );

    if (personalInfo.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const skillsResult = await pool.query(
      "SELECT skill_name FROM skills WHERE user_id = $1",
      [userId]
    );

    const experienceResult = await pool.query(
      "SELECT * FROM experience WHERE user_id = $1",
      [userId]
    );

    const educationResult = await pool.query(
      "SELECT * FROM education WHERE user_id = $1",
      [userId]
    );

    const projectsResult = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1",
      [userId]
    );

    const certificatesResult = await pool.query(
      "SELECT * FROM certificates WHERE user_id = $1",
      [userId]
    );

    const data = {
      userInfo: personalInfo.rows[0],
      skills: skillsResult.rows,
      experience: experienceResult.rows,
      education: educationResult.rows,
      projects: projectsResult.rows,
      certificates: certificatesResult.rows,
    };

    res.status(200).json({ message: "Fetched successfully", data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    address,
    linkedin,
    github,
    portfolio,
    summary,
    skills,
    experience,
    currentlyWorking,
    achievements,
    projects,
    education,
    certification,
  } = req.body;
  const userId = req.user.id;

  try {
  } catch (err) {
    console.log(err);
  }
};
