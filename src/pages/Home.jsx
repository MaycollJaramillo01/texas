import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Calculator,
  Factory,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  assetUrl,
  buildBusinessJsonLd,
  buildFaqJsonLd,
  buildWebsiteJsonLd,
  company,
} from "../data/company";
import { MotionSection, Reveal, SplitHeading, ease, fadeUp, stagger } from "../components/motion";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SEO from "../components/SEO";

const MINI_SERVICES = [
  { value: "cabinet_refinishing", label: "Cabinet Refinishing", field: "Cabinet doors", unit: "doors", placeholder: "e.g. 24" },
  { value: "interior_painting", label: "Interior Painting", field: "Area to paint", unit: "sq ft", placeholder: "e.g. 2,000" },
  { value: "exterior_painting", label: "Exterior Painting", field: "Exterior area", unit: "sq ft", placeholder: "e.g. 2,500" },
  { value: "drywall", label: "Drywall", field: "Project area", unit: "sq ft", placeholder: "e.g. 800" },
  { value: "drywall_repair", label: "Drywall Repair", field: null },
  { value: "tile", label: "Tile & Flooring", field: "Area", unit: "sq ft", placeholder: "e.g. 120" },
  { value: "stain_clear", label: "Stain & Clear", field: "Surface area", unit: "sq ft", placeholder: "e.g. 200" },
];

function HeroEstimatorCard({ reduceMotion }) {
  const navigate = useNavigate();
  const [service, setService] = useState("cabinet_refinishing");
  const [qty, setQty] = useState("");
  const svc = MINI_SERVICES.find((s) => s.value === service);
  const parsed = parseFloat(qty);
  const hasQty = !isNaN(parsed) && parsed > 0;

  const submit = (e) => {
    e.preventDefault();
    navigate(`/estimate?service=${service}${svc.field && hasQty ? `&qty=${parsed}` : ""}`);
  };

  return (
    <motion.form
      className="hero-calc"
      onSubmit={submit}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 1.2 }}
    >
      <p className="hero-calc-eyebrow">
        <Calculator aria-hidden="true" size={14} />
        Instant Estimate
      </p>
      <h2 className="hero-calc-title">Calculate your price here.</h2>

      <label className="hero-calc-field">
        <span>Service</span>
        <select value={service} onChange={(e) => { setService(e.target.value); setQty(""); }}>
          {MINI_SERVICES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>

      {svc.field && (
        <label className="hero-calc-field">
          <span>{svc.field}</span>
          <div className="hero-calc-input-wrap">
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder={svc.placeholder}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <span className="hero-calc-unit">{svc.unit}</span>
          </div>
        </label>
      )}

      <button type="submit" className="hero-calc-btn">
        Calculate My Price
        <ArrowUpRight aria-hidden="true" size={15} />
      </button>
      <p className="hero-calc-hint">Free · Takes ~2 minutes · No commitment</p>
    </motion.form>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section className="hero" id="home" aria-labelledby="hero-title" ref={ref}>
      <motion.div
        className="hero-media"
        style={reduceMotion ? undefined : { y: mediaY, scale: mediaScale }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease }}
      >
        <img
          src={company.assets.heroImage}
          alt="Refinished kitchen cabinets with a premium painted finish by Texas High Refinished in Marble Falls, TX."
        />
      </motion.div>
      <motion.div className="hero-overlay" style={reduceMotion ? undefined : { opacity: overlayOpacity }} />
      <div className="hero-grain" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-main">
        <motion.p
          className="eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
        >
          Esdras Paz · {company.location.city}
        </motion.p>

        <SplitHeading id="hero-title" text="Fine finishes for kitchens across the" em="Texas Hill Country." />

        <motion.p
          className="hero-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 1 }}
        >
          {company.brand.displayName} delivers kitchen remodeling, cabinetry, interior &amp; exterior painting, and
          drywall work — finished inside a controlled in-house shop built for clean, durable, precise results.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={stagger(1.15, 0.08)}
        >
          <motion.a
            className="button whatsapp"
            href={company.contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            variants={fadeUp}
          >
            <WhatsAppIcon size={18} />
            WhatsApp Estimate
          </motion.a>
          <motion.a className="button primary" href={`tel:${company.contact.phoneRaw}`} variants={fadeUp}>
            <Phone aria-hidden="true" size={17} />
            Call Now
          </motion.a>
          <motion.span variants={fadeUp}>
            <Link className="button secondary" to="/contact">
              <Mail aria-hidden="true" size={17} />
              Request Estimate
            </Link>
          </motion.span>
        </motion.div>

        <motion.div
          className="trust-row"
          aria-label="Credentials"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={stagger(1.4, 0.07)}
        >
          <motion.span variants={fadeUp}>
            <ShieldCheck aria-hidden="true" size={15} />
            Licensed, bonded &amp; insured
          </motion.span>
          <motion.span variants={fadeUp}>
            <Sparkles aria-hidden="true" size={15} />
            Premium finishes
          </motion.span>
          <motion.span variants={fadeUp}>
            <MapPin aria-hidden="true" size={15} />
            Highland Lakes
          </motion.span>
        </motion.div>
        </div>

        <HeroEstimatorCard reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}

function Pillars() {
  return (
    <MotionSection className="pillars-section">
      <div className="pillars-inner">
        <Reveal>
          <p className="eyebrow">Our standard</p>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="pillars-statement">
            Where every finish <span className="chrome">reflects excellence</span> — a controlled shop, premium
            materials, and a craftsman's eye for detail.
          </p>
        </Reveal>

        <motion.div
          className="pillars-grid"
          variants={stagger(0.05, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {company.pillars.map((pillar) => (
            <motion.div className="pillar" key={pillar.num} variants={fadeUp}>
              <span className="pillar-num">{pillar.num}</span>
              <span className="pillar-meta">Standard</span>
              <div>
                <h4>{pillar.title}</h4>
                <p>{pillar.copy}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
}

function PriorityServices() {
  return (
    <MotionSection id="services" className="section services-section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">Priority services</p>
          <h2>
            Four services we lead with. <em>Every finish runs through our shop.</em>
          </h2>
        </div>
        <p>
          Kitchen remodeling, high-end finished kitchens, interior &amp; exterior painting, and drywall repair &amp;
          installation — the work we book most and execute best.
        </p>
      </Reveal>

      <motion.div
        className="featured-services"
        variants={stagger(0, 0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {company.priorityServices.map((service, index) => (
          <motion.div key={service.slug} variants={fadeUp}>
            <Link to="/services" className="featured-service">
              <div className="featured-service-media">
                <span className="featured-service-priority">Priority {String(index + 1).padStart(2, "0")}</span>
                <img
                  src={service.image}
                  alt={`${service.title} project by Texas High Refinished — ${service.detail} in the Texas Hill Country.`}
                  loading="lazy"
                />
              </div>
              <div className="featured-service-body">
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <span className="featured-service-arrow">
                  View detail
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <Reveal className="capability-strip" amount={0.2}>
        <Link className="text-link" to="/services">
          View all services
          <ArrowUpRight size={14} />
        </Link>
      </Reveal>
    </MotionSection>
  );
}

function ShopSection() {
  return (
    <MotionSection className="shop-section">
      <div className="shop-inner">
        <Reveal className="shop-visual">
          <span className="shop-badge">The Shop · Marble Falls</span>
          <img
            src={company.assets.shopImage}
            alt="The Shop at Texas High Refinished in Marble Falls, TX — climate-controlled spray bay for cabinet refinishing."
          />
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
              The Shop. <em>Where every finish reflects excellence.</em>
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

function GalleryPreview() {
  const preview = company.assets.gallery.slice(0, 6);

  return (
    <MotionSection className="section gallery-section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">Selected work</p>
          <h2>
            Real finishes. <em>Clean surfaces and visible detail.</em>
          </h2>
        </div>
        <p>
          Residential projects focused on cabinetry, interiors, exteriors, surface preparation, and decorative
          finishes.
        </p>
      </Reveal>

      <motion.div
        className="gallery-grid"
        variants={stagger(0, 0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {preview.map((image, index) => (
          <motion.figure
            className={index === 0 ? "gallery-item feature" : "gallery-item"}
            key={image.src}
            variants={fadeUp}
          >
            <img src={image.src} alt={image.alt} loading={index === 0 ? "eager" : "lazy"} />
            <figcaption>{image.label}</figcaption>
          </motion.figure>
        ))}
      </motion.div>

      <Reveal className="capability-strip" amount={0.2}>
        <Link className="text-link" to="/gallery">
          See full gallery
          <ArrowUpRight size={14} />
        </Link>
      </Reveal>
    </MotionSection>
  );
}

const ESTIMATOR_SERVICES = [
  { href: "/estimate?service=interior_painting",   label: "Interior Painting" },
  { href: "/estimate?service=exterior_painting",   label: "Exterior Painting" },
  { href: "/estimate?service=cabinet_refinishing", label: "Cabinet Refinishing" },
  { href: "/estimate?service=drywall",             label: "Drywall" },
  { href: "/estimate?service=drywall_repair",      label: "Drywall Repair" },
  { href: "/estimate?service=tile",                label: "Tile Installation" },
  { href: "/estimate?service=stain_clear",         label: "Stain & Clear" },
];

function EstimatorBand() {
  return (
    <MotionSection className="estimator-band">
      <div className="estimator-band-inner">
        <div className="estimator-band-copy">
          <Reveal>
            <p className="eyebrow">
              <Calculator size={13} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              Free Estimator
            </p>
            <h2>
              Know your investment <em>before you pick up the phone.</em>
            </h2>
            <p className="estimator-band-lede">
              Answer a few questions about your project and receive a real investment range in
              minutes — calculated privately on our servers.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Link className="button primary" to="/estimate">
              <Calculator size={16} />
              Get Free Estimate
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="estimator-band-services">
          <p className="estimator-band-services-label">Quick-start by service</p>
          <div className="estimator-service-grid">
            {ESTIMATOR_SERVICES.map((svc) => (
              <Link key={svc.href} to={svc.href} className="estimator-service-tag">
                <ArrowUpRight size={12} aria-hidden="true" />
                {svc.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </MotionSection>
  );
}

function CTABand() {
  return (
    <MotionSection className="cta-band">
      <Reveal>
        <p className="eyebrow">Start a project</p>
        <h2>
          Ready to refine your kitchen <em>or finish your next interior?</em>
        </h2>
      </Reveal>
      <Reveal className="cta-band-actions" delay={0.05}>
        <a
          className="button whatsapp"
          href={company.contact.whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon size={18} />
          WhatsApp Now
        </a>
        <Link className="button primary" to="/estimate">
          <Calculator size={17} />
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

export default function HomePage() {
  return (
    <>
      <SEO
        title="Cabinet Refinishing Marble Falls TX"
        description="Texas High Refinished provides cabinet refinishing, kitchen remodeling, interior and exterior painting, and drywall services in Marble Falls, TX and the Texas Hill Country."
        path="/"
        type="business.business"
        image={assetUrl(company.assets.heroImage)}
        imageAlt="Finished kitchen with white cabinetry and premium refinishing by Texas High Refinished."
        imageWidth={1905}
        imageHeight={1270}
        breadcrumbs={[{ name: "Home", path: "/" }]}
        jsonLd={[
          buildBusinessJsonLd(),
          buildWebsiteJsonLd(),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://texashighrefinished.com/#home",
            name: "Cabinet Refinishing, Kitchen Remodeling & Painting in Marble Falls",
            url: "https://texashighrefinished.com/",
            isPartOf: { "@id": "https://texashighrefinished.com/#website" },
            about: { "@id": "https://texashighrefinished.com/#business" },
            inLanguage: "en-US",
            description:
              "Premium kitchen finishes, refinishing, painting, and drywall serving Marble Falls and the Texas Hill Country.",
          },
          buildFaqJsonLd(),
        ]}
      />
      <Hero />
      <PriorityServices />
      <ShopSection />
      <EstimatorBand />
      <Pillars />
      <GalleryPreview />
      <CTABand />
    </>
  );
}
