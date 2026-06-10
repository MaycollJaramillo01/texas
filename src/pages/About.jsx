import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Accessibility,
  Baby,
  Building2,
  CalendarDays,
  Car,
  Check,
  Factory,
  Heart,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Tag,
  Wrench,
} from "lucide-react";
import { SITE_URL, assetUrl, company } from "../data/company";
import { MotionSection, Reveal, fadeUp, stagger } from "../components/motion";
import PageHeader from "../components/PageHeader";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SEO from "../components/SEO";

function AboutIntro() {
  return (
    <MotionSection className="section">
      <div className="about-hero-grid">
        <Reveal className="about-visual">
          <img src={company.assets.aboutImage} alt="Texas High Refinished shop work in progress." />
        </Reveal>
        <div>
          <Reveal>
            <p className="eyebrow">About the business</p>
          </Reveal>
          <Reveal>
            <h2>{company.story.title}</h2>
          </Reveal>
          {company.story.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.05 + index * 0.03}>
              <p
                style={{
                  color: "var(--slate)",
                  fontSize: "1.04rem",
                  lineHeight: 1.7,
                  marginTop: index === 0 ? 24 : 18,
                }}
              >
                {paragraph}
              </p>
            </Reveal>
          ))}

          <Reveal className="category-row" delay={0.15} as="div" style={{ marginTop: 28 }}>
            {company.categories.map((cat) => (
              <span key={cat.label} className={cat.primary ? "category-pill primary" : "category-pill"}>
                {cat.label}
              </span>
            ))}
          </Reveal>
        </div>
      </div>

      <motion.div
        className="about-stats"
        variants={stagger(0.05, 0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="about-stat" variants={fadeUp}>
          <strong>2019</strong>
          <span>Founded · Marble Falls</span>
        </motion.div>
        <motion.div className="about-stat" variants={fadeUp}>
          <strong>19+</strong>
          <span>Cities served across the Hill Country</span>
        </motion.div>
        <motion.div className="about-stat" variants={fadeUp}>
          <strong>100%</strong>
          <span>Licensed · Bonded · Insured</span>
        </motion.div>
      </motion.div>
    </MotionSection>
  );
}

function ShopBlock() {
  return (
    <MotionSection className="shop-section">
      <div className="shop-inner">
        <Reveal className="shop-visual">
          <span className="shop-badge">The Shop · Marble Falls</span>
          <img src={company.assets.shopImage} alt="In-shop spray and refinishing work." />
        </Reveal>

        <div className="shop-content">
          <Reveal>
            <p className="eyebrow">
              <Factory size={14} />
              In-house workshop
            </p>
          </Reveal>
          <Reveal>
            <h2>
              The Shop. <em>The reason the finish lasts.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p>{company.shop.intro}</p>
          </Reveal>

          <motion.div
            className="shop-highlights"
            variants={stagger(0.05, 0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {company.shop.highlights.map((h) => (
              <motion.div className="shop-highlight" key={h.title} variants={fadeUp}>
                <h4>{h.title}</h4>
                <p>{h.copy}</p>
              </motion.div>
            ))}
          </motion.div>

          <Reveal className="shop-closing" delay={0.1}>
            “{company.shop.closing}”
          </Reveal>
        </div>
      </div>
    </MotionSection>
  );
}

function BusinessInfoPanel() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">Business information</p>
          <h2>
            Everything you need to know <em>before booking a project.</em>
          </h2>
        </div>
        <p>
          Categories, amenities, accessibility, parking, and inclusivity — the full profile of how the shop operates.
        </p>
      </Reveal>

      <motion.div
        className="info-panel"
        variants={stagger(0.05, 0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        <motion.div className="info-block" variants={fadeUp}>
          <span className="info-block-title">
            <Tag size={14} />
            Categories
          </span>
          <div className="category-row">
            {company.categories.map((cat) => (
              <span key={cat.label} className={cat.primary ? "category-pill primary" : "category-pill"}>
                {cat.label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div className="info-block" variants={fadeUp}>
          <span className="info-block-title">
            <Wrench size={14} />
            Service options
          </span>
          <ul>
            {company.amenities.service.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="info-block" variants={fadeUp}>
          <span className="info-block-title">
            <Car size={14} />
            Parking
          </span>
          <ul>
            {company.amenities.parking.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="info-block" variants={fadeUp}>
          <span className="info-block-title">
            <Baby size={14} />
            Discounts
          </span>
          <ul>
            {company.amenities.discounts.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="info-block" variants={fadeUp}>
          <span className="info-block-title">
            <Heart size={14} />
            Inclusivity
          </span>
          <ul>
            {company.amenities.audience.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="info-block" variants={fadeUp}>
          <span className="info-block-title">
            <Building2 size={14} />
            Facilities
          </span>
          <ul>
            {company.amenities.facilities.map((item) => (
              <li key={item}>
                <Check size={15} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </MotionSection>
  );
}

function CredentialsPanel() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading">
        <p className="eyebrow">Credentials</p>
        <h2>
          A trusted operator <em>across the Highland Lakes.</em>
        </h2>
      </Reveal>

      <Reveal className="proof-panel">
        <div>
          <CalendarDays aria-hidden="true" size={20} />
          <span>Founded</span>
          <strong>{company.brand.openedAt}</strong>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" size={20} />
          <span>Status</span>
          <strong>Licensed · Bonded · Insured</strong>
        </div>
        <div>
          <Sparkles aria-hidden="true" size={20} />
          <span>Specialty</span>
          <strong>Cabinet refinishing &amp; premium coatings</strong>
        </div>
      </Reveal>
    </MotionSection>
  );
}

function CTABand() {
  return (
    <MotionSection className="cta-band">
      <Reveal>
        <p className="eyebrow">Visit the shop</p>
        <h2>
          Drop by or call <em>to plan your project with Esdras.</em>
        </h2>
      </Reveal>
      <Reveal className="cta-band-actions" delay={0.05}>
        <a className="button whatsapp" href={company.contact.whatsapp} target="_blank" rel="noreferrer">
          <WhatsAppIcon size={18} />
          WhatsApp
        </a>
        <Link className="button primary" to="/contact">
          <Mail size={17} />
          Contact us
        </Link>
        <a className="button secondary" href={`tel:${company.contact.phoneRaw}`}>
          <Phone size={17} />
          {company.contact.phone}
        </a>
      </Reveal>
    </MotionSection>
  );
}

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About — Cabinet & Paint Shop"
        description="Learn the story of Texas High Refinished in Marble Falls, TX, from PV Pro Painting to a dedicated cabinet refinishing and premium paint shop."
        path="/about"
        image={assetUrl(company.assets.pageHeroes.about)}
        imageAlt="The controlled spray booth and refinishing shop at Texas High Refinished."
        imageWidth={1024}
        imageHeight={1536}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Texas High Refinished",
          url: `${SITE_URL}/about`,
          mainEntity: { "@id": `${SITE_URL}/#business` },
        }}
      />
      <PageHeader
        crumb="About"
        eyebrow="About"
        title="Esdras Paz, refinishing"
        em="across the Texas Hill Country."
        lede="A controlled shop process, premium materials, and a craftsman's eye for detail — that's what Texas High Refinished brings to every kitchen, cabinet, and interior."
        image={company.assets.pageHeroes.about}
      />
      <AboutIntro />
      <ShopBlock />
      <BusinessInfoPanel />
      <CredentialsPanel />
      <CTABand />
    </>
  );
}
