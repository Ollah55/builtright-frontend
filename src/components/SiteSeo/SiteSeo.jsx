import React from "react";
import { Helmet } from "react-helmet-async";
import logo from "../../assets/logoooo.png";

const SITE_URL = "https://www.builtrightltd.com";

const publicPages = {
  "/": {
    title: "Solar Installation & Facility Management in Lagos | BuiltRight Services Ltd",
    description: "BuiltRight delivers solar installation, inverter solutions, energy audits, facility management, and maintenance services for homes and businesses in Lagos, Nigeria.",
  },
  "/about": {
    title: "About BuiltRight Services | Facility & Energy Experts Nigeria",
    description: "Learn how BuiltRight Services Ltd combines facility management, maintenance, energy audits, and solar solutions for Nigerian homes and businesses.",
  },
  "/services": {
    title: "Facility Management, Maintenance & Solar Services | BuiltRight",
    description: "Explore BuiltRight facility management, preventive maintenance, energy audits, technical training, and solar installation services in Lagos and Nigeria.",
  },
  "/energy": {
    title: "Solar & Energy Solutions Nigeria | BuiltRight Energy",
    description: "Plan reliable solar power with BuiltRight energy audits, inverter systems, battery storage, solar installation, and maintenance support in Nigeria.",
  },
  "/contact": {
    title: "Contact BuiltRight Services | Lagos Nigeria",
    description: "Contact BuiltRight Services Ltd in Ogba, Lagos for facility management, maintenance, solar installation, energy audits, and project support.",
  },
  "/shop": {
    title: "Shop Solar Inverters & Energy Systems | BuiltRight Nigeria",
    description: "Browse BuiltRight solar systems, inverters, batteries, and energy products for homes and businesses in Nigeria.",
  },
  "/compare": {
    title: "Compare Solar Products & Inverter Systems | BuiltRight",
    description: "Compare solar inverter systems, battery capacity, pricing, and product features before choosing a BuiltRight energy solution.",
  },
};

const privatePrefixes = ["/admin", "/installer", "/customer", "/auth", "/checkout", "/financing", "/payment-success"];

function getPageMetadata(pathname) {
  const page = publicPages[pathname] || (pathname.startsWith("/shop/") ? publicPages["/shop"] : publicPages["/"]);
  const isPrivate = privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return { ...page, isPrivate };
}

function SiteSeo({ pathname }) {
  const { title, description, isPrivate } = getPageMetadata(pathname);
  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  const structuredData = pathname === "/" ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "BuiltRight Services Ltd",
    url: SITE_URL,
    logo: `${SITE_URL}${logo}`,
    image: `${SITE_URL}${logo}`,
    description,
    telephone: "+2349134991239",
    email: "info@builtrightltd.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1b Adeniji Street, Off Odusami Street",
      addressLocality: "Ogba",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    areaServed: ["Lagos", "Nigeria"],
    sameAs: [
      "https://www.facebook.com/share/1DKLiANFfD/?mibextid=wwXIfr",
      "https://www.instagram.com/builtrightenergy",
      "https://www.tiktok.com/@builtright.energy",
      "https://x.com/builtrightafrik",
    ],
  } : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={isPrivate ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="BuiltRight Services Ltd" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  );
}

export default SiteSeo;
