import React, { useState, useEffect, useRef } from "react";
import "./home.css";

// Hero images
import maintenance from "../../assets/maintenance.png";
import solar from "../../assets/solar.jpeg";

// Service card images
import facility from "../../assets/facility.jpg";
import energy from "../../assets/energy.png";
import consumer from "../../assets/consumer.jpg";
import cost from "../../assets/cost.jpg";
import maintenanceservice from "../../assets/maintenanceservice.png";
import Training from "../../assets/Training.png";

function Home() {
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef(null);

  const subscribeLink =
    "https://wa.me/2349134991239?text=Hello%20I%20want%20to%20subscribe%20to%20your%20maintenance%20service";

  const getStartedLink =
    "https://wa.me/2349134991239?text=Hello%20I%20am%20interested%20in%20your%20solar%20solutions";

  const services = [
    {
      title: "Facility Management",
      description:
        "Integrated hard and soft facility management services designed to ensure efficiency, safety, and seamless day-to-day operations.",
      image: facility,
    },
    {
      title: "Energy Solutions & Audits",
      description:
        "Smart energy audits and solar solutions that reduce costs, improve efficiency, and provide reliable power for your operations.",
      image: energy,
    },
    {
      title: "Consumer Market Solutions",
      description:
        "Delivering tailored products and services that meet the evolving needs of modern consumers and businesses.",
      image: consumer,
    },
    {
      title: "Cost Optimisation",
      description:
        "Strategic solutions that reduce operational expenses while maintaining performance, quality, and efficiency.",
      image: cost,
    },
    {
      title: "Preventive & Corrective Maintenance",
      description:
        "Proactive and reactive maintenance services that prevent downtime and ensure long-term asset reliability.",
      image: maintenanceservice,
    },
    {
      title: "Technical Workforce Training",
      description:
        "Hands-on training programs designed to equip technical teams with the skills needed for modern industry demands.",
      image: Training,
    },
  ];

  useEffect(() => {
  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const carousel = carouselRef.current;

  const interval = setInterval(() => {
    if (!carousel) return;

    carousel.scrollBy({
      left: 340, // move width of one card
      behavior: "smooth",
    });

    // Reset to start when reaching end
    if (
      carousel.scrollLeft + carousel.clientWidth >=
      carousel.scrollWidth - 10
    ) {
      carousel.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  }, 3000); // speed (3 seconds)

  return () => clearInterval(interval);
}, []);

  return (
    <div className="home">
      {/* HERO */}
      {/* HERO */}
<section
  className="hero"
  style={{
    backgroundImage: `url(${slide === 0 ? maintenance : solar})`,
  }}
>
  <div className="overlay"></div>

  <div className="hero-content">
    <div className="hero-badge">
      {slide === 0 ? "Facility Management & Maintenance" : "Solar & Energy Solutions"}
    </div>

    {slide === 0 ? (
      <>
        <h1>Reliable Facility Support for Modern Businesses</h1>
        <h2>
          Seamless maintenance and operational solutions that keep your
          business running at its best.
        </h2>

        <div className="hero-actions">
          <a
            href={subscribeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-link"
          >
            <button className="hero-btn primary-btn">Subscribe Now</button>
          </a>

          <a href="#services" className="hero-link">
            <button className="hero-btn secondary-btn">Explore Services</button>
          </a>
        </div>

        <div className="hero-meta">
          <span>Trusted support</span>
          <span>Operational efficiency</span>
          <span>Commercial solutions</span>
        </div>
      </>
    ) : (
      <>
        <h1>Smart Solar Power with Flexible Financing</h1>
        <h2>
          Dependable energy solutions designed to reduce cost, improve
          efficiency, and power long-term growth.
        </h2>

        <div className="hero-actions">
          <a
            href={getStartedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-link"
          >
            <button className="hero-btn primary-btn">Get Started</button>
          </a>

          <a href="/energy" className="hero-link">
            <button className="hero-btn secondary-btn">View Energy Solutions</button>
          </a>
        </div>

        <div className="hero-meta">
          <span>Solar solutions</span>
          <span>Flexible financing</span>
          <span>Reliable power</span>
        </div>
      </>
    )}

    <div className="hero-slider-indicator">
      <span className={slide === 0 ? "dot active" : "dot"}></span>
      <span className={slide === 1 ? "dot active" : "dot"}></span>
    </div>
  </div>
</section>

     {/* FEATURES */}
        <section className="features reveal fade-in">
        <div className="features-heading">
            <p className="section-label">Why choose us</p>
            <div className="about-hero-line"></div>
            <h2>Built for performance, reliability, and smarter operations</h2>
        </div>

        <div className="feature">
            <div className="feature-icon-wrap">
            <div className="feature-icon">⚙️</div>
            </div>
            <h3>Smart Solutions That Work Before You Need Them</h3>
            <p>
            We use proactive maintenance systems to keep your facility
            running smoothly, minimizing disruption and maximizing peace of mind.
            </p>
        </div>

        <div className="feature">
            <div className="feature-icon-wrap">
            <div className="feature-icon">📊</div>
            </div>
            <h3>Strategic Expertise, Tailored to Your Operations</h3>
            <p>
            We combine industry knowledge, data insights, and hands-on
            experience to craft solutions that align with your business goals.
            </p>
        </div>

        <div className="feature">
            <div className="feature-icon-wrap">
            <div className="feature-icon">💡</div>
            </div>
            <h3>Efficiency That Works for You</h3>
            <p>
            Round the clock monitoring, continous inspection and reports ensures minimal breakdown.
            </p>
        </div>
        </section>

     {/* WHO WE ARE */}
        <section className="who reveal fade-in">
        <div className="who-container">
            <div className="who-text">
            <p className="section-label">Who we are</p>
            <div className="about-hero-line"></div>
            <h2>Integrated Facility and Energy Solutions for Modern Businesses</h2>
            <p className="who-description">
                We are a Facility Management, Property Maintenance, and Energy
                Solutions company committed to supporting commercial and industrial
                operations with innovative, high-quality services. By combining
                technical expertise with forward-thinking energy solutions, we ensure
                our clients’ facilities are efficient, reliable, sustainable, and
                built for the future. BuiltRight Services Ltd operates in Lagos, Nigeria, providing reliable
                facility management, maintenance services, and solar energy solutions
                across Ikeja, Ogba, Lekki, Victoria Island, and surrounding areas.
            </p>
            <p className="who-description">
                From seamless maintenance to dependable solar power systems, we deliver
                integrated solutions that keep businesses performing at their best.
            </p>
            </div>

            <div className="who-side">
            <div className="reviews-card">
                <span className="reviews-tag">Trusted by clients</span>
                <h3>4.9 <span>★</span></h3>
                <p>2,488 Genuine Reviews</p>
            </div>

            <div className="who-points">
                <div className="who-point">
                <h4>Reliable Delivery</h4>
                <p>Consistent service execution across commercial and industrial projects.</p>
                </div>

                <div className="who-point">
                <h4>Energy Forward</h4>
                <p>Smart solar and energy solutions built for long-term efficiency.</p>
                </div>

                <div className="who-point">
                <h4>Operational Excellence</h4>
                <p>Maintenance and facility support designed to reduce downtime.</p>
                </div>
            </div>
            </div>
        </div>
        </section>
        <section className="core-divisions reveal fade-in">
  <div className="section-head center">
    <p className="section-label">Our Core Divisions</p>
    <div className="about-hero-line"></div>
    <h2>One Company, Multiple Solutions for Better Properties</h2>
    <p>
      BuiltRight brings together facility support, property maintenance, energy
      solutions, cost optimisation, and workforce development under one reliable
      service structure.
    </p>
  </div>

  <div className="core-divisions-grid">
    <div className="core-division-card">
      <span>01</span>
      <h3>Facility Management</h3>
      <p>
        Integrated hard and soft services that support daily operations,
        safety, comfort, and long-term property performance.
      </p>
    </div>

    <div className="core-division-card">
      <span>02</span>
      <h3>Property Maintenance</h3>
      <p>
        Preventive and corrective maintenance designed to reduce downtime,
        extend asset lifespan, and protect property value.
      </p>
    </div>

    <div className="core-division-card highlight">
      <span>03</span>
      <h3>Energy Solutions</h3>
      <p>
        Solar systems, energy audits, inverter solutions, and financing support
        that help clients reduce power costs and improve energy reliability.
      </p>
    </div>

    <div className="core-division-card">
      <span>04</span>
      <h3>Technical Training</h3>
      <p>
        Practical workforce training that equips technical teams and tradespeople
        with skills needed for modern service delivery.
      </p>
    </div>
  </div>
</section>

      {/* SERVICES */}
      <section className="services-preview reveal" id="services">
        <p className="section-label">What we do</p>
        <div className="about-hero-line"></div>
        <h2>Our Services</h2>

        <div className="services-carousel" ref={carouselRef}>
          {services.map((service, index) => (
            <div
              className="service-slide"
              key={index}
              style={{ backgroundImage: `url(${service.image})` }}
            >
              <div className="service-overlay"></div>

              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


<section className="who-we-serve reveal fade-in">
      <div className="section-head center">
        <p className="section-label">Who We Serve</p>
        <div className="about-hero-line"></div>
        <h2>Built for Commercial, Residential, and Industrial Environments</h2>
        <p>
          Our solutions are designed for property owners, facility managers,
          businesses, and institutions that need reliable maintenance, efficient
          operations, and smarter energy performance.
        </p>
      </div>

        <div className="serve-grid">
          <div className="serve-card">Commercial Buildings</div>
          <div className="serve-card">Hotels & Apartments</div>
          <div className="serve-card">Schools & Training Centres</div>
          <div className="serve-card">Offices & Retail Spaces</div>
          <div className="serve-card">Industrial Facilities</div>
          <div className="serve-card">Airbnbs & Short-Let Properties</div>
        </div>
</section>

<section className="operating-model reveal fade-in">
  <div className="operating-model-container">
      <div className="operating-model-text">
        <p className="section-label">Our Operating Model</p>
        <div className="about-hero-line"></div>
        <h2>We Don’t Just Respond — We Plan, Maintain, and Improve</h2>
        <p>
          BuiltRight works with clients through a structured process that helps
          prevent issues before they become expensive problems. From assessment to
          execution and support, our approach is designed for reliability.
        </p>
      </div>

    <div className="operating-steps">
        <div className="operating-step">
          <span>01</span>
          <h3>Assess</h3>
          <p>We inspect your facility, systems, risks, and operational needs.</p>
        </div>

      <div className="operating-step">
          <span>02</span>
          <h3>Plan</h3>
          <p>We recommend service plans, maintenance schedules, and energy improvements.</p>
      </div>

      <div className="operating-step">
        <span>03</span>
        <h3>Execute</h3>
        <p>Our team delivers maintenance, energy, and support services professionally.</p>
      </div>

      <div className="operating-step">
        <span>04</span>
        <h3>Support</h3>
        <p>We provide ongoing response, reporting, and improvement recommendations.</p>
      </div>
    </div>
  </div>
</section>

 <section className="home-energy-cta reveal fade-in">
    <div className="home-energy-cta-content">
      <p className="section-label">BuiltRight Energy</p>
      <div className="about-hero-line"></div>
      <h2>Need Reliable Power for Your Property?</h2>
      <p>
        Explore our solar energy solutions, inverter systems, energy audits, and
        flexible financing options designed for homes, businesses, schools, hotels,
        and commercial facilities.
      </p>

      <div className="home-energy-actions">
        <a href="/energy" className="home-energy-btn primary">
          Explore Energy Solutions
        </a>

        <a href="/financing" className="home-energy-btn secondary">
          Start Financing Request
        </a>
      </div>
  </div>
</section>

     {/* PACKAGES */}
<section className="packages reveal">
      <p className="section-label">Pricing</p>
      <h2>Our Packages</h2>
      <p className="packages-intro">
          Flexible maintenance plans designed for different property sizes and operational needs.
      </p>

    <div className="pkg-grid">
        <a
        href="https://wa.me/2349134991239?text=Hello%20I%20am%20interested%20in%20your%20Bronze%20Plan.%20I%20want%20to%20speak%20with%20a%20live%20agent."
        target="_blank"
        rel="noopener noreferrer"
        className="pkg-card"
        >
        <h3>Bronze Plan</h3>
        <p className="pkg-subtitle">Basic preventive maintenance</p>

        <ul className="pkg-list">
            <li>Plumbing Services</li>
            <li>Electrical Services</li>
        </ul>

        <div className="pkg-best-for">
            <span>Best for:</span> Small luxury apartments / Airbnbs
        </div>
        </a>

    <a
      href="https://wa.me/2349134991239?text=Hello%20I%20am%20interested%20in%20your%20Silver%20Plan.%20I%20want%20to%20speak%20with%20a%20live%20agent."
      target="_blank"
      rel="noopener noreferrer"
      className="pkg-card featured"
    >
      <span className="pkg-badge">Most Popular</span>
      <h3>Silver Plan</h3>
      <p className="pkg-subtitle">Comprehensive system protection</p>

      <ul className="pkg-list">
        <li>Plumbing Services</li>
        <li>Electrical Services</li>
        <li>Air Conditioning</li>
      </ul>

      <div className="pkg-best-for">
        <span>Best for:</span> Mid-size hotels / schools
      </div>
    </a>

    <a
      href="https://wa.me/2349134991239?text=Hello%20I%20am%20interested%20in%20your%20Gold%20Plan.%20I%20want%20to%20speak%20with%20a%20live%20agent."
      target="_blank"
      rel="noopener noreferrer"
      className="pkg-card"
    >
      <h3>Gold Plan</h3>
      <p className="pkg-subtitle">Advanced system protection</p>

      <ul className="pkg-list">
        <li>Plumbing Services</li>
        <li>Electrical Services</li>
        <li>Air Conditioning</li>
        <li>Priority maintenance response</li>
      </ul>

      <div className="pkg-best-for">
        <span>Best for:</span> Large hotels / commercial facilities
      </div>
    </a>

    <a
      href="https://wa.me/2349134991239?text=Hello%20I%20am%20interested%20in%20your%20Platinum%20Plan.%20I%20want%20to%20speak%20with%20a%20live%20agent."
      target="_blank"
      rel="noopener noreferrer"
      className="pkg-card premium"
    >
      <h3>Platinum Plan</h3>
      <p className="pkg-subtitle">
        Customizable comprehensive system protection tailored to your needs.
      </p>

      <ul className="pkg-list">
        <li>Custom maintenance scope</li>
        <li>Dedicated support structure</li>
        <li>Priority response and monitoring</li>
        <li>Tailored service coverage</li>
      </ul>

      <div className="pkg-best-for">
        <span>Best for:</span> Enterprises / large-scale operations
      </div>
    </a>
  </div>
</section>

{/* BLOG */}
<section className="blog reveal">
  <p className="section-label">Insights</p>
  <h2>Latest Insights</h2>
  <p className="blog-intro">
    Explore expert perspectives on facility management, smart energy, and workforce development shaping the future of modern operations.
  </p>

  <div className="blog-grid">
    <article className="blog-card">
        <div className="blog-tag">Maintenance</div>
        <h3>The Hidden Cost of Neglected Maintenance in Commercial Facilities</h3>
        <p className="blog-excerpt">
          Commercial facilities are the backbone of daily business operations, yet
          many organizations underestimate the long-term cost of delayed
          maintenance. From unexpected equipment failures to safety risks and
          operational downtime, neglecting routine upkeep can quietly erode
          profitability and service quality.
        </p>
        <div className="blog-meta">
          <span>15 September 2025</span>
          <span className="read-more">Read more →</span>
        </div>
    </article>

    <article className="blog-card">
        <div className="blog-tag">Technology</div>
        <h3>Smart Buildings, Smarter Savings: The Future of Facility Management</h3>
        <p className="blog-excerpt">
          Smart buildings are rapidly becoming the standard for modern facility
          management. By integrating automation, monitoring systems, and
          data-driven controls, businesses can reduce energy waste, improve
          operational efficiency, and create more responsive environments for
          occupants and teams.
        </p>
      <div className="blog-meta">
        <span>15 September 2025</span>
        <span className="read-more">Read more →</span>
      </div>
    </article>

    <article className="blog-card">
      <div className="blog-tag">Training</div>
      <h3>Upskilling Nigeria&apos;s Tradespeople: Why It Matters for Business Growth</h3>
      <p className="blog-excerpt">
        In today&apos;s competitive economy, business performance is closely tied to
        workforce capability. Investing in the development of skilled
        tradespeople not only improves service delivery and safety standards,
        but also strengthens productivity, reliability, and long-term business
        growth across industries.
      </p>
      <div className="blog-meta">
        <span>15 September 2025</span>
        <span className="read-more">Read more →</span>
      </div>
    </article>
  </div>
</section>
    </div>
  );
}

export default Home;
