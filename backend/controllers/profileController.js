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
    // Users
    await pool.query(
      "UPDATE users SET full_name = $1, email = $2 WHERE id = $3",
      [fullName, email, userId]
    );

    // User Profile
    await pool.query(
      `INSERT INTO user_profiles
     (id, phone, address, linkedin, github, portfolio, summary)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
     phone = EXCLUDED.phone,
     address = EXCLUDED.address,
     linkedin = EXCLUDED.linkedin,
     github = EXCLUDED.github,
     portfolio = EXCLUDED.portfolio,
     summary = EXCLUDED.summary,
     updated_at = NOW()`,
      [userId, phone, address, linkedin, github, portfolio, summary]
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
  }
};
