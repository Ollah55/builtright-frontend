import React from "react";
import { Link } from "react-router-dom";
import "../SeoLanding/seoLanding.css";

const whatsappLink =
  "https://wa.me/2349134991239?text=Hello%20BuiltRight,%20I%20am%20interested%20in%20solar%20installation%20training%20in%20Lagos.";

function SolarTrainingLagos() {
  return (
    <main className="seo-landing-page">
      <section className="seo-landing-hero training fade-in">
        <div className="seo-landing-hero-content">
          <p className="section-label">BuiltRight Technical Workforce Training</p>
          <h1>Practical Solar Installation Training in Lagos</h1>
          <p>
            Build practical skills for solar and inverter projects with
            BuiltRight&apos;s technical workforce training. Our programmes are
            designed for technicians, tradespeople, facility teams, and people
            preparing for work in Nigeria&apos;s growing energy sector.
          </p>
          <div className="seo-landing-actions">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="seo-landing-primary">
              Ask About Training
            </a>
            <Link to="/contact" className="seo-landing-secondary">
              Contact BuiltRight
            </Link>
          </div>
        </div>
      </section>

      <section className="seo-landing-section fade-in">
        <div className="seo-landing-section-inner">
          <p className="section-label">Skills that transfer to the field</p>
          <h2>Learn the fundamentals behind safe solar projects</h2>
          <p className="seo-landing-section-intro">
            Training can be aligned to the needs of individuals, contractors,
            facilities, and teams that want stronger solar installation and
            maintenance capability.
          </p>
          <div className="seo-landing-grid">
            <article className="seo-landing-card">
              <h3>System fundamentals</h3>
              <ul>
                <li>Solar, battery, and inverter principles</li>
                <li>System sizing and load calculations</li>
                <li>Equipment selection and safe handling</li>
              </ul>
            </article>
            <article className="seo-landing-card">
              <h3>Installation practice</h3>
              <ul>
                <li>Mounting, cable routing, and protection</li>
                <li>Testing, commissioning, and documentation</li>
                <li>Worksite safety and quality checks</li>
              </ul>
            </article>
            <article className="seo-landing-card">
              <h3>Maintenance and operations</h3>
              <ul>
                <li>Fault finding and preventive maintenance</li>
                <li>Monitoring and performance checks</li>
                <li>Customer handover and service support</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="seo-landing-section alt fade-in">
        <div className="seo-landing-section-inner">
          <p className="section-label">For Lagos teams and individuals</p>
          <h2>Training that connects learning to real operations</h2>
          <div className="seo-landing-grid">
            <article className="seo-landing-card"><h3>Technicians and installers</h3><p>Strengthen practical installation, testing, and maintenance skills.</p></article>
            <article className="seo-landing-card"><h3>Facility and maintenance teams</h3><p>Understand solar assets, energy audits, safe operations, and service planning.</p></article>
            <article className="seo-landing-card"><h3>New energy professionals</h3><p>Build a foundation for a career supporting solar and inverter projects.</p></article>
          </div>
        </div>
      </section>

      <section className="seo-landing-section fade-in">
        <div className="seo-landing-callout">
          <div>
            <h2>Looking for solar training in Lagos?</h2>
            <p>Contact BuiltRight for the next available programme, audience, and schedule.</p>
          </div>
          <Link to="/services">See Our Services</Link>
        </div>
      </section>
    </main>
  );
}

export default SolarTrainingLagos;
