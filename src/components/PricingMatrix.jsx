import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Calculator, DollarSign, Info, Ruler } from "lucide-react";
import { company } from "../data/company";
import { MotionSection, Reveal, fadeUp, stagger } from "./motion";
import WhatsAppIcon from "./WhatsAppIcon";

function PricingTable({ title, rows }) {
  return (
    <div className="pricing-table-wrap">
      <table className="pricing-table">
        <caption className="sr-only">Base price ranges for {title}</caption>
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Base price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${title}-${row.service}`}>
              <td data-label="Service">{row.service}</td>
              <td data-label="Base price">
                <span className="price-value">{row.price}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingSideTable({ rows }) {
  return (
    <div className="pricing-table-wrap compact">
      <table className="pricing-table">
        <caption className="sr-only">Minimum service charges</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.service}>
              <td data-label="Service">{row.service}</td>
              <td data-label="Minimum">
                <span className="price-value">{row.price}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingMatrix({ context = "services" }) {
  const isHome = context === "home";
  const pricing = company.pricingMatrix;
  const totalRows =
    pricing.groups.reduce((count, group) => count + group.items.length, 0) + pricing.minimumCharges.length;

  return (
    <MotionSection id="pricing" className="section pricing-section">
      <Reveal className="section-heading split pricing-heading">
        <div>
          <p className="eyebrow">{pricing.version}</p>
          <h2 id="pricing-title">
            {isHome ? "Project pricing for painting, cabinets, drywall, and tile" : "Base pricing by service"}
            <em> in Marble Falls and the Texas Hill Country.</em>
          </h2>
        </div>
        <p>
          Transparent planning ranges for interior painting, exterior painting, cabinet refinishing, drywall
          installation, drywall repair, and tile installation. Final estimates are written after we review prep,
          materials, access, and scope.
        </p>
      </Reveal>

      <Reveal className="pricing-intro-panel" amount={0.2}>
        <div className="pricing-intro-copy">
          <Info size={18} aria-hidden="true" />
          <p>{pricing.disclaimer}</p>
        </div>
        <div className="pricing-stats" aria-label="Pricing summary">
          <span>
            <DollarSign size={16} aria-hidden="true" />
            {pricing.groups.length} price categories
          </span>
          <span>
            <Ruler size={16} aria-hidden="true" />
            {totalRows} line items
          </span>
          <span>
            <Calculator size={16} aria-hidden="true" />
            Minimum service call {pricing.minimumCharges[0].price}
          </span>
        </div>
      </Reveal>

      <motion.div
        className="pricing-grid"
        variants={stagger(0, 0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
      >
        {pricing.groups.map((group, index) => (
          <motion.article className="pricing-card" key={group.key} variants={fadeUp}>
            <div className="pricing-card-header">
              <span className="pricing-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.summary}</p>
              </div>
            </div>
            <PricingTable title={group.title} rows={group.items} />
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        className="pricing-support-grid"
        variants={stagger(0.05, 0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.article className="pricing-support-card" variants={fadeUp}>
          <span className="pricing-support-label">Minimums</span>
          <h3>THR minimum service charges</h3>
          <PricingSideTable rows={pricing.minimumCharges} />
        </motion.article>

        <motion.article className="pricing-support-card dark" variants={fadeUp}>
          <span className="pricing-support-label">Production target</span>
          <h3>THR daily operating cost</h3>
          <div className="daily-target-list">
            {pricing.dailyTargets.map((target) => (
              <div key={target.label}>
                <span>{target.label}</span>
                <strong>{target.value}</strong>
              </div>
            ))}
          </div>
        </motion.article>
      </motion.div>

      <Reveal className="pricing-cta" amount={0.2}>
        <div>
          <span className="pricing-support-label">Estimate next step</span>
          <p>
            Share photos, measurements, and the finish level you want. We will confirm the right pricing range and
            prepare a written estimate.
          </p>
        </div>
        <div className="pricing-cta-actions">
          <a className="button whatsapp" href={company.contact.whatsapp} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={18} />
            Send Photos
          </a>
          <Link className="text-link" to="/contact">
            Request detailed estimate
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </Reveal>
    </MotionSection>
  );
}
