import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./contact.css";
import { Helmet } from "react-helmet-async";

function Contact() {
  const formRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    service: "",
    subject: "",
    message: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage("");

    emailjs
      .sendForm(
        "service_xdbk6us",
        "template_51aeshk",
        formRef.current,
        "kydG3Yi8mHzZ1UIYo"
      )
      .then(() => {
        setStatusMessage("Message sent successfully. Opening WhatsApp...");

        const whatsappText = encodeURIComponent(
          `Hello BuiltRight,

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.location}
Service: ${formData.service}
Subject: ${formData.subject}

Message:
${formData.message}`
        );

        const whatsappLink = `https://wa.me/2349134991239?text=${whatsappText}`;

        setTimeout(() => {
          window.open(whatsappLink, "_blank");
        }, 800);

        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          service: "",
          subject: "",
          message: "",
        });

        formRef.current.reset();
        setIsSending(false);
      })
      .catch(() => {
        setStatusMessage("Failed to send message. Please try again.");
        setIsSending(false);
      });
  };

  return (
    <>
      <Helmet>
        <title>Contact BuiltRight Services | Lagos Nigeria</title>
        <meta
          name="description"
          content="Contact BuiltRight Services Ltd for facility management, maintenance, and solar solutions in Lagos Nigeria. Call, email, or chat on WhatsApp."
        />
      </Helmet>

      <div className="contact-page">
        <section className="contact-hero fade-in">
          <div className="contact-hero-content">
            <p className="section-label">Contact Us</p>
            <div className="about-hero-line"></div>
            <h1>Let’s Talk About Your Facility and Energy Needs</h1>
            <p className="contact-hero-text">
              Whether you need maintenance support, facility management, solar
              solutions, or technical guidance, our team is ready to help.
            </p>
          </div>
        </section>

        <section className="contact-main fade-in">
          <div className="contact-grid">
            <div className="contact-info">
              <p className="section-label">Get in touch</p>
              <div className="about-hero-line"></div>
              <h2>We’re Ready to Support Your Business</h2>
              <p className="contact-intro">
                Reach out to BuiltRight for enquiries, partnerships, service
                requests, and tailored operational support.
              </p>

              <div className="contact-card">
                <h3>Office Address</h3>
                <p>
                  1b Adeniji Street, Off Odusami Street,
                  <br />
                  Ogba, Lagos
                </p>
              </div>

              <div className="contact-card">
                <h3>Customer Care</h3>
                <p>
                  <a href="tel:+2349134991239">+234 913 499 1239</a>
                </p>
                <p>
                  <a href="tel:+2347015749737">+234 701 574 9737</a>
                </p>
              </div>

              <div className="contact-card">
                <h3>Email Support</h3>
                <p>
                  <a href="mailto:info@builtrightltd.com">
                    info@builtrightltd.com
                  </a>
                </p>
              </div>

              <div className="contact-card highlight">
                <h3>Need a Faster Response?</h3>
                <p>
                  Speak directly with a live agent on WhatsApp for quick support
                  and service enquiries.
                </p>
                <a
                  href="https://wa.me/2349134991239?text=Hello%20BuiltRight,%20I%20would%20like%20to%20make%20an%20enquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-whatsapp-btn"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="contact-form-wrap">
              <div className="contact-form">
                <p className="section-label">Send a message</p>
                <div className="about-hero-line"></div>
                <h2>Tell Us What You Need</h2>

                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="form-row">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name*"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email Address*"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number*"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="text"
                      name="location"
                      placeholder="Location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Service*</option>
                    <option value="Facility Management">
                      Facility Management
                    </option>
                    <option value="Energy Solutions">
                      Energy Solutions
                    </option>
                    <option value="Preventive Maintenance">
                      Preventive Maintenance
                    </option>
                    <option value="Cost Optimization">
                      Cost Optimization
                    </option>
                    <option value="Technical Workforce Training">
                      Technical Workforce Training
                    </option>
                  </select>

                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject (e.g. Facility Maintenance, Solar Installation)"
                    value={formData.subject}
                    onChange={handleChange}
                  />

                  <textarea
                    name="message"
                    placeholder="Your Message*"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>

                  <button type="submit" disabled={isSending}>
                    {isSending ? "Sending..." : "Send Message"}
                  </button>

                  {statusMessage && (
                    <p className="form-status">{statusMessage}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-map">
          <div className="map-container">
            <div className="map-header">
              <p className="section-label">Our Location</p>
              <h2>Find Us in Lagos</h2>
              <div className="map-line"></div>
              <p className="map-subtext">
                Visit our office or schedule a consultation with our team.
              </p>
            </div>

            <iframe
              src="https://www.google.com/maps?q=Ogba,Lagos&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="BuiltRight Location Map"
            ></iframe>
          </div>
        </section>
      </div>
    </>
  );
}

export default Contact;