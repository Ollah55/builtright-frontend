import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import EnergyCalculator from "../../components/EnergyCalculator/EnergyCalculator";
import "./energySolutions.css";

function EnergySolutions() {
  return (
    <div className="energy-page">
      <Helmet>
        <title>Solar & Energy Solutions Nigeria | BuiltRight Energy</title>
        <meta
          name="description"
          content="Get solar power systems, inverter solutions, electricity cost analysis, and flexible financing for homes and businesses in Nigeria."
        />
      </Helmet>

      {/* HERO */}
      <section className="energy-hero fade-in">
        <div className="energy-hero-overlay"></div>

        <div className="energy-hero-content">
          <p className="section-label">BuiltRight Energy Solutions</p>
          <div className="about-hero-line"></div>

          <h1>Reliable Solar Power Without the Upfront Stress</h1>

          <p>
            We help homes, businesses, schools, hotels, and facilities reduce
            energy costs with smart solar systems, inverter solutions, energy
            audits, and flexible financing options.
          </p>

          <div className="energy-hero-actions">
            <Link to="/financing" className="energy-primary-btn">
              Explore Financing
            </Link>

            <a
              href="https://wa.me/2349134991239?text=Hello%20BuiltRight,%20I%20would%20like%20to%20discuss%20solar%20energy%20solutions."
              target="_blank"
              rel="noopener noreferrer"
              className="energy-secondary-btn"
            >
              Speak with an Expert
            </a>
          </div>

          <div className="energy-trust-row">
            <span>Solar Installation</span>
            <span>Energy Audit</span>
            <span>Flexible Financing</span>
            <span>RichGreen Loan Support</span>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="energy-trust-section fade-in">
        <div className="energy-trust-grid">
          <div className="energy-trust-card">
            <h3>Tailored System Design</h3>
            <p>We assess your load, usage pattern, and backup needs before recommending a system.</p>
          </div>

          <div className="energy-trust-card">
            <h3>Flexible Payment Options</h3>
            <p>Choose outright payment or financing support through our partner process.</p>
          </div>

          <div className="energy-trust-card">
            <h3>Installation Support</h3>
            <p>Our team helps plan, install, and support reliable solar power systems.</p>
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="energy-offer fade-in">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">What We Offer</p>
            <div className="about-hero-line"></div>
            <h2>Energy Solutions Built Around Your Power Needs</h2>
          </div>

          <div className="energy-offer-grid">
            <div className="energy-card">
              <h3>Solar System Installation</h3>
              <p>
                End-to-end solar installation including system design,
                procurement, installation, and commissioning tailored to your
                energy needs.
              </p>
            </div>

            <div className="energy-card">
              <h3>Energy Audits</h3>
              <p>
                We analyze your current energy usage and identify opportunities
                to reduce cost, improve efficiency, and optimize consumption.
              </p>
            </div>

            <div className="energy-card highlight">
              <h3>Flexible Financing</h3>
              <p>
                Access solar power without heavy upfront costs. We help
                qualified customers process financing through our partner
                channel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="energy-benefits fade-in">
        <div className="section-head center">
          <p className="section-label">Why Solar</p>
          <div className="about-hero-line"></div>
          <h2>Why Homes and Businesses Are Switching to Solar</h2>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Lower Energy Costs</h3>
            <p>Reduce reliance on expensive grid electricity and diesel generators.</p>
          </div>

          <div className="benefit-card">
            <h3>Reliable Power Supply</h3>
            <p>Keep your home, office, or facility running with stable backup power.</p>
          </div>

          <div className="benefit-card">
            <h3>Cleaner Operations</h3>
            <p>Reduce noise, fuel dependency, and carbon emissions from generator use.</p>
          </div>

          <div className="benefit-card">
            <h3>Scalable Systems</h3>
            <p>Start with what you need today and expand your system as demand grows.</p>
          </div>
        </div>
      </section>

      {/* BAND A COST */}
      <section className="band-a-cost-section fade-in">
        <div className="band-a-container">
          <div className="band-a-head">
            <p className="section-label">Band A Cost Comparison</p>
            <h2>How Much Can a 2–3 Bedroom Apartment Spend on Electricity?</h2>
            <p>
              Band A customers are charged premium electricity rates because
              they are expected to receive longer daily supply. For homes using
              multiple TVs, refrigerators, freezers, and air conditioners,
              monthly electricity cost can become significant.
            </p>
          </div>

          <div className="band-a-grid">
            <div className="band-a-card">
              <h3>Typical Appliance Load</h3>
              <ul>
                <li>3 Televisions</li>
                <li>12 LED Bulbs</li>
                <li>1 Refrigerator</li>
                <li>1 Deep Freezer</li>
                <li>3 Units of 1.5HP Air Conditioners</li>
                <li>1 Microwave</li>
                <li>1 Washing Machine</li>
              </ul>
            </div>

            <div className="band-a-card highlight">
              <h3>Estimated Monthly Grid Cost</h3>
              <div className="big-cost">₦235k – ₦275k</div>
              <p>
                Based on estimated daily energy use of about 38kWh and Band A
                tariff assumptions. Actual cost depends on usage hours,
                appliance efficiency, location, and DisCo tariff.
              </p>
            </div>

            <div className="band-a-card">
              <h3>Recommended Solar Setup</h3>
              <ul>
                <li>10kVA – 12kVA Hybrid Inverter</li>
                <li>30kWh – 45kWh Lithium Battery Storage</li>
                <li>12kW – 15kW Solar Panel Array</li>
                <li>Professional installation and protection devices</li>
              </ul>
            </div>
          </div>

          <div className="band-a-savings-box">
            <div>
              <p className="section-label">Potential Savings</p>
              <h3>Solar can reduce long-term grid and generator spending.</h3>
              <p>
                A household spending around ₦240,000 monthly on electricity
                could spend close to ₦2.9 million yearly. With the right solar
                system, customers can reduce dependence on expensive grid power
                and enjoy more predictable energy costs.
              </p>
            </div>

            <Link to="/financing" className="band-a-btn">
              Explore Financing Options
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="energy-process fade-in">
        <div className="section-head center">
          <p className="section-label">How It Works</p>
          <div className="about-hero-line"></div>
          <h2>Simple and Transparent Process</h2>
        </div>

        <div className="process-steps">
          <div className="step">
            <span>01</span>
            <h3>Consultation</h3>
            <p>We understand your energy needs, budget, and current power challenges.</p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>Energy Audit</h3>
            <p>We assess your appliances, usage pattern, and backup requirements.</p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>System Recommendation</h3>
            <p>We recommend the right inverter, battery, solar panels, and payment option.</p>
          </div>

          <div className="step">
            <span>04</span>
            <h3>Installation & Support</h3>
            <p>We support installation, setup, maintenance, and long-term reliability.</p>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="energy-calculator-section fade-in">
        <EnergyCalculator />
      </section>

      {/* THIRD PARTY FINANCING */}
      <section className="third-party-financing fade-in">
        <div className="container">
          <div className="third-party-financing-content">
            <p className="section-label">Flexible Financing</p>
            <h2>Already Found a Solar System Elsewhere?</h2>

            <p className="third-party-intro">
              BuiltRight can still help qualified customers access financing
              for selected third-party solar systems through our financing
              partner process. Tell us what you are buying, who you are buying
              from, and we will guide you through the next steps.
            </p>

            <div className="third-party-grid">
              <div className="third-party-card">
                <h3>What We Can Help With</h3>
                <ul>
                  <li>Solar financing coordination</li>
                  <li>Connection with financing partners</li>
                  <li>System review and assessment</li>
                  <li>Installation planning support</li>
                  <li>Energy consultation</li>
                </ul>
              </div>

              <div className="third-party-card warning">
                <h3>Important Notice</h3>
                <p>
                  Products sourced outside the BuiltRight supplier network
                  remain the responsibility of their original vendors,
                  manufacturers, and installers.
                </p>
                <p>
                  BuiltRight acts solely as a financing facilitator for approved
                  third-party systems and does not assume responsibility for
                  product defects, warranty issues, or installation faults from
                  external vendors.
                </p>
              </div>
            </div>

            <div className="third-party-actions">
              <Link to="/financing" className="energy-primary-btn">
                Request Third-Party Financing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="energy-cta fade-in">
        <div className="energy-cta-content">
          <p className="section-label">Get Started</p>
          <div className="about-hero-line"></div>
          <h2>Ready to Switch to Reliable Power?</h2>
          <p>
            Speak with our team today and get a tailored solar solution for your
            home, business, school, hotel, or facility.
          </p>

          <div className="energy-cta-actions">
            <Link to="/financing" className="energy-primary-btn">
              Start Financing Request
            </Link>

            <a
              href="https://wa.me/2349134991239?text=Hello%20BuiltRight,%20I%20would%20like%20to%20get%20a%20solar%20solution%20quote."
              target="_blank"
              rel="noopener noreferrer"
              className="energy-secondary-light-btn"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EnergySolutions;