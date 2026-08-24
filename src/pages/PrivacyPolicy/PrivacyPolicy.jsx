import React from "react";
import { Helmet } from "react-helmet-async";
import "./privacyPolicy.css";

const sections = [
  {
    title: "1. About this Privacy Policy",
    paragraphs: [
      'BuiltRight Services Limited ("BuiltRight Energy", "we", "us" or "our") respects your privacy and is committed to protecting your personal information.',
      "This Privacy Policy explains how we collect, use, store and protect personal information provided when you enquire about our solar energy solutions, solar financing services, training programmes, website, advertisements or other services.",
    ],
  },
  {
    title: "2. Information We Collect",
    intro: "Depending on how you interact with us, we may collect:",
    items: [
      "Full name",
      "Phone number",
      "WhatsApp number",
      "Email address",
      "Property or business location",
      "Type of property",
      "Information about your current electricity or power needs",
      "Information you provide when enquiring about solar financing",
      "Other information you voluntarily provide to us",
    ],
  },
  {
    title: "3. How We Use Your Information",
    intro: "We may use your information to:",
    items: [
      "Respond to your solar financing enquiry",
      "Contact you about our products and services",
      "Understand your solar and energy requirements",
      "Arrange consultations, assessments or site inspections",
      "Process or facilitate financing applications",
      "Provide quotations and relevant service information",
      "Improve our products, services and customer experience",
      "Maintain appropriate business and transaction records",
      "Comply with applicable legal and regulatory requirements",
    ],
  },
  {
    title: "4. Sharing Your Information",
    paragraphs: [
      "We may share relevant personal information with trusted third parties where reasonably necessary to provide the service you have requested. This may include financing partners, technology/service providers, contractors or other parties involved in processing your enquiry or delivering our services.",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "5. Marketing Communications",
    paragraphs: [
      "Where applicable, we may contact you about BuiltRight Energy products, services, offers or related information.",
      "You may request that we stop sending you marketing communications at any time.",
    ],
  },
  {
    title: "6. Protection of Your Information",
    paragraphs: [
      "We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.",
      "However, no method of transmitting or storing information electronically can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "7. Retention of Information",
    paragraphs: [
      "We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, to provide our services, maintain appropriate records, resolve disputes, comply with legal obligations or protect our legitimate business interests.",
    ],
  },
  {
    title: "8. Your Privacy Rights",
    intro: "Subject to applicable law, you may have rights relating to your personal information, including the right to:",
    items: [
      "Know how your information is being used",
      "Request access to your personal information",
      "Request correction of inaccurate information",
      "Object to certain processing",
      "Request deletion or restriction of your information where applicable",
      "Withdraw consent where processing is based on consent",
      "Raise a complaint regarding the handling of your personal information",
    ],
    outro: "The NDPC identifies these and other data-subject rights under the Nigeria Data Protection Act.",
  },
  {
    title: "9. Third-Party Platforms",
    paragraphs: [
      "When you submit information through an advertisement or form on platforms such as Facebook or Instagram, that platform may also process your information under its own privacy policy and terms.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements or data-processing practices. The updated version will be published on our website with the revised effective date.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | BuiltRight Energy</title>
        <meta name="description" content="BuiltRight Energy privacy policy covering personal information, solar enquiries, financing, training and customer services." />
      </Helmet>

      <main className="privacy-policy-page">
        <header className="privacy-policy-hero">
          <p className="privacy-policy-kicker">BuiltRight Energy</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-policy-effective">Effective Date: 24 August 2026</p>
        </header>

        <article className="privacy-policy-content">
          {sections.map((section) => (
            <section className="privacy-policy-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.intro && <p>{section.intro}</p>}
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              {section.outro && <p>{section.outro}</p>}
            </section>
          ))}

          <section className="privacy-policy-section privacy-policy-contact">
            <h2>11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact:</p>
            <address>
              <strong>BuiltRight Services Limited</strong>
              <span>Email: <a href="mailto:info@builtrightltd.com">info@builtrightltd.com</a></span>
              <span>Phone: <a href="tel:+2349049991595">0904 999 1595</a></span>
              <span>Website: <a href="https://www.builtrightltd.com">www.builtrightltd.com</a></span>
            </address>
          </section>
        </article>
      </main>
    </>
  );
}

export default PrivacyPolicy;
