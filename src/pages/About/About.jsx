import React from "react";
import "./about.css";
import { Helmet } from "react-helmet-async";
import Founder from "../../assets/founder.jpg";

function About() {
  return (
    <>
      <Helmet>
        <title>About BuiltRight Services | Facility & Energy Experts Nigeria</title>
        <meta
          name="description"
          content="Learn about BuiltRight Services Ltd, a trusted provider of facility management, maintenance, and solar energy solutions across Nigeria."
        />
      </Helmet>

      <div className="about">
        <section className="about-hero fade-in">
          <div className="about-hero-content">
            <p className="section-label">About BuiltRight</p>
            <div className="about-hero-line"></div>

            <h1>
              Building Confidence Through Reliable Facility and Energy Solutions
            </h1>

            <p className="about-hero-text">
              BuiltRight Services Ltd. is a facility management, property maintenance,
              and energy solutions company committed to helping businesses operate
              efficiently, safely, and sustainably across Nigeria.
            </p>
          </div>
        </section>

        <section className="about-section about-intro fade-in">
          <div className="about-intro-grid">
            <div>
              <p className="section-label">Who we are</p>
              <div className="about-hero-line"></div>
              <h2>Supporting Better Operations, Smarter Maintenance, and Sustainable Growth</h2>
            </div>

            <div>
              <p>
                We focus on minimizing downtime, improving safety, and maximizing
                operational reliability through flexible service plans tailored to
                commercial and industrial environments.
              </p>
              <p>
                Our services span facility management, preventive and corrective
                maintenance, energy audits and solar solutions, technical
                workforce training, and operational support designed to protect
                long-term asset value.
              </p>
            </div>
          </div>
        </section>

        <section className="founder fade-in">
          <div className="founder-card">
            <img src={Founder} alt="Arc. Akinbiyi Oke" />
            <h3>Arc. Akinbiyi Oke</h3>
            <p>Founder &amp; CEO</p>
          </div>

          <div className="founder-message">
            <p className="section-label">Leadership</p>
            <div className="about-hero-line"></div>
            <h2>A Message from Our Founder</h2>
            <p>
              At BuiltRight Services Ltd., we do more than maintain buildings —
              we support environments where businesses grow, people thrive, and
              assets perform at their highest potential.
            </p>
            <p>
              Our commitment is simple: deliver reliable service, uphold quality
              standards, and provide proactive solutions that help our clients
              operate with confidence and minimal disruption.
            </p>
            <blockquote>
              “We pursue excellence with discipline, innovation, and a strong
              responsibility to every client we serve.”
            </blockquote>
          </div>
        </section>

        <section className="about-section fade-in">
          <div className="section-head center">
            <p className="section-label">Our business focus</p>
            <div className="about-hero-line"></div>
            <h2>What Drives Our Work</h2>
          </div>

          <div className="focus-grid">
            <div className="info-card">Reliability-Centric Maintenance</div>
            <div className="info-card">Customer Satisfaction</div>
            <div className="info-card">Quality Assurance</div>
            <div className="info-card">Sustainability</div>
            <div className="info-card">Innovation</div>
          </div>
        </section>

        <section className="about-section mission-vision fade-in">
          <div className="mv-card">
            <p className="section-label">Mission</p>
            <div className="about-hero-line"></div>
            <h2>Our Mission</h2>
            <ul>
              <li>Promote a stronger maintenance culture across built environments</li>
              <li>Enhance safety, functionality, and long-term asset performance</li>
              <li>Improve financial efficiency through proactive service delivery</li>
              <li>Empower technical professionals and tradesmen with practical skills</li>
            </ul>
          </div>

          <div className="mv-card">
            <p className="section-label">Vision</p>
            <div className="about-hero-line"></div>
            <h2>Our Vision</h2>
            <p>
              To be a leading global facility management and energy solutions
              company recognized for service excellence, innovation, reliability,
              and sustainable impact.
            </p>
          </div>
        </section>

        <section className="about-section fade-in">
          <div className="section-head center">
            <p className="section-label">Our values</p>
            <div className="about-hero-line"></div>
            <h2>The Principles That Define Us</h2>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <h3>Innovation</h3>
              <p>
                We embrace new ideas, smarter systems, and forward-thinking
                solutions that improve service delivery.
              </p>
            </div>

            <div className="value-card">
              <h3>Quality</h3>
              <p>
                We maintain high standards in execution, response, and project
                outcomes across every client engagement.
              </p>
            </div>

            <div className="value-card">
              <h3>Customer Satisfaction</h3>
              <p>
                We place client needs at the center of our work and build
                long-term relationships through trust and performance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default About;