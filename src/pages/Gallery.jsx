import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { assetUrl, buildGalleryJsonLd, company } from "../data/company";
import { MotionSection, Reveal, fadeUp, stagger } from "../components/motion";
import PageHeader from "../components/PageHeader";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SEO from "../components/SEO";

function GalleryGrid() {
  const categories = useMemo(() => {
    const set = new Set(company.assets.gallery.map((g) => g.category));
    return ["All", ...Array.from(set)];
  }, []);

  const [filter, setFilter] = useState("All");

  const items = useMemo(() => {
    if (filter === "All") return company.assets.gallery;
    return company.assets.gallery.filter((g) => g.category === filter);
  }, [filter]);

  return (
    <MotionSection className="section">
      <Reveal className="gallery-filters" as="div">
        {categories.map((cat) => (
          <button
            key={cat}
            className={filter === cat ? "active" : ""}
            onClick={() => setFilter(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </Reveal>

      <motion.div
        className="gallery-page-grid"
        layout
        variants={stagger(0, 0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((image, index) => (
            <motion.figure
              className="gallery-item"
              key={image.src}
              layout
              variants={fadeUp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <img src={image.src} alt={image.alt} loading={index < 3 ? "eager" : "lazy"} />
              <figcaption>{image.label}</figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>
    </MotionSection>
  );
}

function CTABand() {
  return (
    <MotionSection className="cta-band">
      <Reveal>
        <p className="eyebrow">Like what you see?</p>
        <h2>
          Let's plan your next refinish <em>or remodel.</em>
        </h2>
      </Reveal>
      <Reveal className="cta-band-actions" delay={0.05}>
        <a className="button whatsapp" href={company.contact.whatsapp} target="_blank" rel="noreferrer">
          <WhatsAppIcon size={18} />
          WhatsApp
        </a>
        <Link className="button primary" to="/contact">
          <Mail size={17} />
          Request an Estimate
        </Link>
        <a className="button secondary" href={`tel:${company.contact.phoneRaw}`}>
          <Phone size={17} />
          {company.contact.phone}
        </a>
      </Reveal>
    </MotionSection>
  );
}

export default function GalleryPage() {
  return (
    <>
      <SEO
        title="Gallery — Kitchen & Exterior Finishes"
        description="View completed kitchens, cabinet finishes, exterior painting, drywall, and in-shop refinishing projects by Texas High Refinished in the Texas Hill Country."
        path="/gallery"
        image={assetUrl(company.assets.pageHeroes.gallery)}
        imageAlt="Finished kitchen and cabinet refinishing project by Texas High Refinished."
        imageWidth={1905}
        imageHeight={1270}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ]}
        jsonLd={buildGalleryJsonLd()}
      />
      <PageHeader
        crumb="Gallery"
        eyebrow="Gallery"
        title="Real projects,"
        em="real finishes."
        lede="A selection of kitchen refinishing, interior work, exterior projects, and in-shop spray work delivered across the Texas Hill Country."
        image={company.assets.pageHeroes.gallery}
      />
      <GalleryGrid />
      <CTABand />
    </>
  );
}
