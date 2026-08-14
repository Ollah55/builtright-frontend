import React from "react";
import { Link } from "react-router-dom";
import "../SeoLanding/seoLanding.css";

const whatsappLink =
  "https://wa.me/2349134991239?text=Hello%20BuiltRight,%20I%20need%20solar%20installation%20in%20Lagos.";

function SolarInstallationLagos() {
  return (
    <main className="seo-landing-page">
      <section className="seo-landing-hero fade-in">
        <div className="seo-landing-hero-content">
          <p className="section-label">BuiltRight Energy · Lagos</p>
          <h1>Solar Installation in Lagos for Homes and Businesses</h1>
          <p>
            BuiltRight Services Ltd designs and installs practical solar and
            inverter systems for homes, offices, schools, hotels, and facilities
            across Lagos. We begin with a site inspection and load audit so the
            recommended system matches the property and the customer&apos;s real
            energy needs.
          </p>
          <div className="seo-landing-actions">
            <Link to="/financing" className="seo-landing-primary">
              Request a Solar Assessment
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="seo-landing-secondary">
              Speak with an Expert
            </a>
          </div>
        </div>
      </section>

      <section className="seo-landing-section fade-in">
        <div className="seo-landing-section-inner">
          <p className="section-label">End-to-end support</p>
          <h2>A solar project sized around your property</h2>
          <p className="seo-landing-section-intro">
            Our Lagos solar installation process covers system selection,
            inspection, load audit, quotation, professional installation,
            testing, commissioning, and ongoing maintenance support.
          </p>
          <div className="seo-landing-grid">
            <article className="seo-landing-card">
              <h3>Site inspection and load audit</h3>
              <p>
                We assess appliances, usage patterns, roof or ground space,
                cable routes, protection needs, and installation conditions.
              </p>
            </article>
            <article className="seo-landing-card">
              <h3>Solar and inverter system design</h3>
              <p>
                We recommend inverter capacity, batteries, panels, and safety
                accessories for your target backup and energy requirements.
              </p>
            </article>
            <article className="seo-landing-card">
              <h3>Installation and after-sales support</h3>
              <p>
                BuiltRight coordinates installation, testing, commissioning,
                maintenance, and remote monitoring support where available.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="seo-landing-section alt fade-in">
        <div className="seo-landing-section-inner">
          <p className="section-label">How it works</p>
          <h2>Clear steps from assessment to reliable power</h2>
          <div className="seo-landing-grid">
            <article className="seo-landing-card"><h3>01 · Consultation</h3><p>Tell us what you need to power and where the property is located.</p></article>
            <article className="seo-landing-card"><h3>02 · Inspection</h3><p>Our installer completes the inspection, due diligence, and load audit.</p></article>
            <article className="seo-landing-card"><h3>03 · Quotation</h3><p>We prepare a project quotation that includes the system and installation materials.</p></article>
          </div>
        </div>
      </section>

      <section className="seo-landing-section fade-in">
        <div className="seo-landing-callout">
          <div>
            <h2>Need solar installation in Lagos?</h2>
            <p>
              Start with an assessment and let BuiltRight help you choose the
              right path for outright payment or financing.
            </p>
          </div>
          <Link to="/energy">Explore Energy Solutions</Link>
        </div>
      </section>
    </main>
  );
}

export default SolarInstallationLagos;
