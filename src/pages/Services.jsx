import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Factory, Mail, Phone } from "lucide-react";
import { assetUrl, buildServiceListJsonLd, company } from "../data/company";
import { MotionSection, Reveal, fadeUp, stagger } from "../components/motion";
import PageHeader from "../components/PageHeader";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SEO from "../components/SEO";

function ServiceDetailGrid() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading">
        <p className="eyebrow">What we do</p>
        <h2>
          Four priority services. <em>Run through one disciplined process.</em>
        </h2>
      </Reveal>

      <motion.div
        className="service-detail-grid"
        variants={stagger(0, 0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        {company.priorityServices.map((service, index) => (
          <motion.article
            className={index % 2 === 1 ? "service-detail reverse" : "service-detail"}
            key={service.slug}
            variants={fadeUp}
          >
            <div className="service-detail-media">
              <span className="service-detail-tag-floating">{service.tag}</span>
              <img
                src={service.image}
                alt={`${service.title} by Texas High Refinished — ${service.detail} in Marble Falls and the Texas Hill Country.`}
                loading="lazy"
              />
            </div>
            <div className="service-detail-body">
              <span className="service-detail-meta">{service.detail}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <ul className="service-detail-points">
                {service.points.map((point) => (
                  <li key={point}>
                    <Check size={16} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </MotionSection>
  );
}

function ShopFeature() {
  return (
    <MotionSection className="shop-section">
      <div className="shop-inner">
        <Reveal className="shop-visual">
          <span className="shop-badge">The Shop · Marble Falls</span>
          <img src={company.assets.shopImage} alt="In-shop refinishing process." />
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
              {company.shop.headline.split(".")[0]}.{" "}
              <em>{company.shop.headline.split(".").slice(1).join(".")}</em>
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

function ProcessSection() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">How we work</p>
          <h2>
            A six-step process <em>from first call to final walkthrough.</em>
          </h2>
        </div>
        <p>
          Each step is documented and inspected so projects move smoothly and the finish meets a consistent standard
          across every piece.
        </p>
      </Reveal>

      <motion.div
        className="process-grid"
        variants={stagger(0, 0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {company.process.map((step) => (
          <motion.div className="process-step" key={step.step} variants={fadeUp}>
            <span className="process-num">{step.step}</span>
            <h4>{step.title}</h4>
            <p>{step.copy}</p>
          </motion.div>
        ))}
      </motion.div>
    </MotionSection>
  );
}

function CapabilitiesStrip() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading">
        <p className="eyebrow">Capabilities</p>
        <h2>
          Specialty coatings, decorative finishes, <em>and detailed prep.</em>
        </h2>
      </Reveal>
      <motion.div
        className="capability-strip"
        variants={stagger(0, 0.04)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        style={{ marginTop: 0 }}
      >
        {company.capabilities.map((c) => (
          <motion.span key={c} variants={fadeUp}>
            <Check size={13} />
            {c}
          </motion.span>
        ))}
      </motion.div>
    </MotionSection>
  );
}

function CTABand() {
  return (
    <MotionSection className="cta-band">
      <Reveal>
        <p className="eyebrow">Start a project</p>
        <h2>
          Talk to Esdras about your project. <em>Same week, in most cases.</em>
        </h2>
      </Reveal>
      <Reveal className="cta-band-actions" delay={0.05}>
        <a className="button whatsapp" href={company.contact.whatsapp} target="_blank" rel="noreferrer">
          <WhatsAppIcon size={18} />
          WhatsApp
        </a>
        <Link className="button primary" to="/estimate">
          <Mail size={17} />
          Get Free Estimate
        </Link>
        <a className="button secondary" href={`tel:${company.contact.phoneRaw}`}>
          <Phone size={17} />
          {company.contact.phone}
        </a>
      </Reveal>
    </MotionSection>
  );
}

export default function ServicesPage() {
  return (
    <>
      <SEO
        title="Services — Cabinet Refinishing & Painting"
        description="Explore cabinet refinishing, kitchen remodeling, interior and exterior painting, and drywall repair from Texas High Refinished in Marble Falls, TX."
        path="/services"
        image={assetUrl(company.assets.pageHeroes.services)}
        imageAlt="Finished open kitchen remodel by Texas High Refinished in Marble Falls, TX."
        imageWidth={1905}
        imageHeight={1270}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
        jsonLd={buildServiceListJsonLd()}
      />
      <PageHeader
        crumb="Services"
        eyebrow="Services"
        title="Premium painted finishes,"
        em="from cabinetry to whole-home work."
        lede="Texas High Refinished prioritizes four core services. Every project — whether a kitchen refinish or an exterior repaint — runs through the same disciplined shop process and quality control."
        image={company.assets.pageHeroes.services}
      />
      <ServiceDetailGrid />
      <ShopFeature />
      <ProcessSection />
      <CapabilitiesStrip />
      <CTABand />
    </>
  );
}
