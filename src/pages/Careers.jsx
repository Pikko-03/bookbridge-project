export default function Careers() {
  const jobs = [
    {
      title: "Frontend Developer",
      location: "Remote",
      type: "Full-time",
      description:
        "Help us build intuitive and beautiful user experiences for readers around the world.",
    },
    {
      title: "Backend Developer",
      location: "Remote",
      type: "Full-time",
      description:
        "Design scalable systems and APIs to support our growing book platform.",
    },
    {
      title: "UI/UX Designer",
      location: "Remote",
      type: "Contract",
      description:
        "Craft clean, modern interfaces that make discovering books delightful.",
    },
  ];

  return (
    <div className="careers-page">
      {/* HERO */}
      <section className="careers-hero">
        <h1>Join Our Team</h1>
        <p>
          We’re building the future of book discovery. Come build it with us.
        </p>
      </section>

      {/* JOB LIST */}
      <section className="careers-list">
        {jobs.map((job, index) => (
          <div className="career-card" key={index}>
            <div className="career-header">
              <h3>{job.title}</h3>
              <span className="career-type">{job.type}</span>
            </div>

            <p className="career-location">{job.location}</p>

            <p className="career-description">{job.description}</p>

            <a
              href="mailto:bookbridge.team@gmail.com"
              className="career-cta"
            >
              Apply via Email
            </a>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="careers-footer">
        <h2>Don’t see a role that fits?</h2>
        <p>
          We’re always looking for passionate people. Send us your resume anytime.
        </p>

        <a href="mailto:bookbridge.team@gmail.com" className="career-main-cta">
          Contact Us
        </a>
      </section>
    </div>
  );
}