import React from "react";
import "./services.css";
import { Helmet } from "react-helmet-async";

function Services() {
  const whatsappLink =
    "https://wa.me/2349134991239?text=Hello%20I%20am%20interested%20in%20your%20services.%20I%20would%20like%20to%20speak%20with%20a%20live%20agent.";

  const services = [
    {
      title: "Energy Audits & Solutions",
      description:
        "Smart energy audits, solar solutions, and flexible financing support to reduce energy costs, improve efficiency, and ensure reliable power.",
      highlight: true,
    },
    {
      title: "Preventive & Corrective Maintenance",
      description:
        "Planned, Proactive, and reactive maintenance solutions designed to reduce downtime, extend asset lifespan, and keep operations running smoothly.",
    },
    {
      title: "Facility Management",
      description:
        "Integrated hard and soft facility management services that ensure safe, efficient, and seamless day-to-day operations across your properties.",
    },
    {
      title: "Cost Optimisation Solutions",
      description:
        "Strategic operational improvements that help reduce waste, control expenses, and maintain service quality without compromising performance.",
    },
    {
      title: "Technical Workforce Training",
      description:
        "Practical training and development programs that equip technicians and tradespeople with the skills required for modern industry demands.",
    },
    {
      title: "Consumer Market Solutions",
      description:
        "Tailored support services for residential and consumer-facing environments, designed to improve customer experience and service reliability.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Our Services | Facility Management, Maintenance & Solar Solutions Nigeria</title>
        <meta
          name="description"
          content="Explore BuiltRight services including facility management, preventive maintenance, cost optimization, and solar energy solutions in Nigeria."
        />
      </Helmet>

      <div className="services-page">
        <section className="services-hero fade-in">
          <div className="services-hero-content">
            <p className="section-label">Our Services</p>
            <div className="about-hero-line"></div>
            <h1>Integrated Solutions for Smarter, More Reliable Operations</h1>
            <p className="services-hero-text">
              BuiltRight delivers facility management, maintenance, training, and
              energy solutions designed to keep residential, commercial, and
              industrial environments efficient, sustainable, and future-ready.
            </p>
          </div>
        </section>

        <section className="services-intro fade-in">
          <div className="services-intro-grid">
            <div>
              <p className="section-label">What we offer</p>
              <div className="about-hero-line"></div>
              <h2>Comprehensive Services Built Around Performance and Reliability</h2>
            </div>

            <div>
              <p>
                Our services are structured to help organizations reduce
                disruption, improve system performance, optimize cost, and create
                more dependable built environments.
              </p>
              <p>
                From maintenance and facility support to energy solutions and
                technical workforce development, we provide end-to-end services
                tailored to modern operational needs.
              </p>
            </div>
          </div>
        </section>

        <section className="services-section fade-in">
          <div className="section-head center">
            <p className="section-label">Service Areas</p>
            <div className="about-hero-line"></div>
            <h2>What We Can Do for You</h2>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article
                className={`service-card ${service.highlight ? "highlight" : ""}`}
                key={index}
              >
                {service.highlight && <span className="service-badge">Featured</span>}
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="services-benefits fade-in">
          <div className="section-head center">
            <p className="section-label">Why BuiltRight</p>
            <div className="about-hero-line"></div>
            <h2>Why Clients Choose Our Service Approach</h2>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Reliable Delivery</h3>
              <p>
                We focus on proactive support, timely response, and consistent
                execution across every service touchpoint.
              </p>
            </div>

            <div className="benefit-card">
              <h3>Operational Efficiency</h3>
              <p>
                Our solutions are designed to reduce downtime, improve asset
                performance, and support long-term cost control.
              </p>
            </div>

            <div className="benefit-card">
              <h3>Energy Forward Thinking</h3>
              <p>
                We combine maintenance expertise with practical energy solutions
                that help clients operate more sustainably.
              </p>
            </div>
          </div>
        </section>

        <section className="services-cta fade-in">
          <div className="services-cta-content">
            <p className="section-label">Let’s work together</p>
            <h2>Need a Tailored Solution for Your Facility or Business?</h2>
            <p>
              Speak with our team today and discover how BuiltRight can support
              your operations with reliable, efficient, and scalable service
              solutions.
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="services-cta-btn"
            >
              Chat with a Live Agent
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

export default Services;