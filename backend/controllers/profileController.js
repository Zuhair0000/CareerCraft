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
      const {
        job_title,
        company_name,
        start_date,
        end_date,
        currentlyWorking,
        achievements,
      } = exp;

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
      "SELECT full_name, email, phone, address, linkedin, github, portfolio, summary FROM user_profiles WHERE id = $1",
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
    projects,
    education,
    certification,
  } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();

  try {
    await pool.query("BEIGN");

    //user profile
    await client.query("DELETE FROM user_profiles WHERE id = $1", [userId]);

    await client.query(
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
     updated_at = NOW()
     RETURNING *`,
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
    await client.query("DELETE FROM skills WHERE user_id = $1", [userId]);

    for (const skill of skills) {
      const { name } = skill;

      await client.query(
        "INSERT INTO skills(user_id, skill_name) VALUES($1, $2)",
        [userId, name]
      );
    }

    // Experience
    await client.query("DELETE FROM experience WHERE user_id = $1", [userId]);

    for (const exp of experience) {
      const {
        job_title,
        company_name,
        currentlyWorking,
        achievements,
        start_date,
        end_date,
      } = exp;

      await client.query(
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
    await client.query("DELETE FROM projects WHERE user_id = $1", [userId]);

    for (const project of projects) {
      const { project_title, description, tech_stack, github_link, live_link } =
        project;

      await client.query(
        "INSERT INTO projects(user_id, project_title, description, tech_stack, github_link, live_link) VALUES($1, $2, $3, $4, $5, $6)",
        [userId, project_title, description, tech_stack, github_link, live_link]
      );
    }

    //Education
    await client.query("DELETE FROM education WHERE user_id = $1", [userId]);

    for (const edu of education) {
      const { degree, school_name, graduation_year } = edu;

      await client.query(
        "INSERT INTO education(user_id, degree, school_name, graduation_year) VALUES($1, $2, $3, $4)",
        [userId, degree, school_name, graduation_year]
      );
    }

    // Certificates
    await client.query("DELETE FROM certificates WHERE user_id = $1", [userId]);

    for (const certificate of certification) {
      const { title, issuer, issue_date } = certificate;

      await client.query(
        "INSERT INTO certificates(user_id, title, issuer, issue_date) VALUES($1, $2, $3, $4)",
        [userId, title, issuer, issue_date]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "Updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
