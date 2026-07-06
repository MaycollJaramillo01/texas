import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Facebook,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { SITE_URL, assetUrl, company } from "../data/company";
import { MotionSection, Reveal, fadeUp, stagger } from "../components/motion";
import PageHeader from "../components/PageHeader";
import WhatsAppIcon from "../components/WhatsAppIcon";
import SEO from "../components/SEO";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "5c98dc47-4b42-4c1f-a7b6-a1c93cfd7fea";
const TEST_CC_EMAIL = import.meta.env.VITE_TEST_CC_EMAIL || "";
// Base URL of the estimator app, which hosts the GHL CRM endpoint (/api/contact).
const ESTIMATOR_API_URL = (import.meta.env.VITE_ESTIMATOR_API_URL || "").replace(/\/$/, "");

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Kitchen Remodeling",
    message: "",
    botcheck: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.botcheck) return; // honeypot
    setStatus("submitting");
    setErrorMsg("");

    // The lead goes to two places in parallel: the CRM (GoHighLevel, via the
    // estimator backend) and Web3Forms (email notification). Either one
    // succeeding counts as a successful submission.
    const crmPromise = ESTIMATOR_API_URL
      ? fetch(`${ESTIMATOR_API_URL}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            service: form.service,
            message: form.message,
            botcheck: form.botcheck,
          }),
        })
          .then((r) => r.json())
          .then((r) => Boolean(r.success))
          .catch(() => false)
      : Promise.resolve(false);

    const emailPromise = fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        ...(TEST_CC_EMAIL ? { ccemail: TEST_CC_EMAIL } : {}),
        subject: `New estimate request — ${form.service}`,
        from_name: `${form.name} · texashighrefinished.com`,
        replyto: form.email,
        name: form.name,
        email: form.email,
        phone: form.phone || "(not provided)",
        service: form.service,
        message: form.message,
        botcheck: form.botcheck,
      }),
    })
      .then((r) => r.json())
      .catch(() => ({ success: false, message: "Network error. Please check your connection and try again." }));

    const [crmOk, emailResult] = await Promise.all([crmPromise, emailPromise]);

    if (crmOk || emailResult.success) {
      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        service: "Kitchen Remodeling",
        message: "",
        botcheck: "",
      });
    } else {
      setStatus("error");
      setErrorMsg(emailResult.error || emailResult.message || "Something went wrong. Please try again.");
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Hi Texas High Refinished, I'd like a quote.\n\n` +
        `Name: ${form.name || "(not provided)"}\n` +
        `Service: ${form.service}\n` +
        `Details: ${form.message || "(no details)"}`,
    );
    window.open(`https://wa.me/18305963323?text=${text}`, "_blank", "noreferrer");
  }

  if (status === "success") {
    return (
      <div className="contact-form contact-form-success" role="status" aria-live="polite">
        <div className="success-icon">
          <Send size={28} />
        </div>
        <h3>Message sent.</h3>
        <p>
          Thanks — we received your project request and will respond within 24 hours on business days. For anything
          urgent, reach us on WhatsApp or by phone.
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => setStatus("idle")}
          >
            Send another
          </button>
          <a
            className="button whatsapp"
            href={company.contact.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon size={17} />
            WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-label="Request an estimate">
      {/* Honeypot — hidden from users, bots will fill it */}
      <input
        type="checkbox"
        name="botcheck"
        value={form.botcheck}
        onChange={update("botcheck")}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="contact-form-row">
        <label>
          <span>Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Your full name"
            autoComplete="name"
            disabled={submitting}
          />
        </label>
        <label>
          <span>Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="(830) 000-0000"
            autoComplete="tel"
            disabled={submitting}
          />
        </label>
      </div>

      <label>
        <span>Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="you@email.com"
          autoComplete="email"
          disabled={submitting}
        />
      </label>

      <label>
        <span>Service of interest</span>
        <select value={form.service} onChange={update("service")} disabled={submitting}>
          {company.priorityServices.map((s) => (
            <option key={s.slug} value={s.title}>
              {s.title}
            </option>
          ))}
          <option value="Other">Other / not sure</option>
        </select>
      </label>

      <label>
        <span>Project details</span>
        <textarea
          required
          value={form.message}
          onChange={update("message")}
          placeholder="Tell us about your project — surfaces, square footage, timeline, preferred finish..."
          disabled={submitting}
        />
      </label>

      {status === "error" && (
        <p className="contact-form-error" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send size={16} />
              Send message
            </>
          )}
        </button>
        <button
          type="button"
          className="button whatsapp"
          onClick={handleWhatsApp}
          disabled={submitting}
        >
          <WhatsAppIcon size={17} />
          Send via WhatsApp
        </button>
      </div>

      <p className="contact-form-note">
        Your message is delivered directly to Esdras. We typically respond within 24 hours on business days. For
        urgent requests, WhatsApp is fastest.
      </p>
    </form>
  );
}

function ContactBody() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2>
            Send a project request <em>or reach us directly.</em>
          </h2>
        </div>
        <p>
          Fill the form for a written estimate, or use one of the direct channels. WhatsApp is fastest for photos and
          quick questions.
        </p>
      </Reveal>

      <div className="contact-page-grid">
        <Reveal>
          <ContactForm />
        </Reveal>

        <div className="contact-info-block">
          <Reveal className="contact-info-row">
            <span className="contact-info-label">
              <WhatsAppIcon size={14} />
              WhatsApp · Fastest
            </span>
            <span className="contact-info-value">
              <a href={company.contact.whatsapp} target="_blank" rel="noreferrer">
                Message on WhatsApp
              </a>
            </span>
          </Reveal>

          <Reveal className="contact-info-row">
            <span className="contact-info-label">
              <Phone size={14} />
              Phone
            </span>
            <span className="contact-info-value">
              <a href={`tel:${company.contact.phoneRaw}`}>{company.contact.phone}</a>
            </span>
          </Reveal>

          <Reveal className="contact-info-row">
            <span className="contact-info-label">
              <MessageSquare size={14} />
              Text Message
            </span>
            <span className="contact-info-value">
              <a href={company.contact.sms}>Send a text</a>
            </span>
          </Reveal>

          <Reveal className="contact-info-row">
            <span className="contact-info-label">
              <Mail size={14} />
              Email
            </span>
            <span className="contact-info-value">
              <a href={`mailto:${company.contact.email}`}>{company.contact.email}</a>
            </span>
          </Reveal>

          <Reveal className="contact-info-row">
            <span className="contact-info-label">
              <Facebook size={14} />
              Facebook
            </span>
            <span className="contact-info-value">
              <a href={company.contact.facebook} target="_blank" rel="noreferrer">
                Visit page
              </a>
            </span>
          </Reveal>

          <Reveal className="contact-info-row">
            <span className="contact-info-label">
              <Clock size={14} />
              Hours
            </span>
            <div style={{ display: "grid", gap: 0, marginTop: 4 }}>
              {company.hours.map((item) => (
                <div className="hours-row" key={item.day}>
                  <span>{item.day}</span>
                  <strong>{item.hours}</strong>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </MotionSection>
  );
}

function MapSection() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">Visit the shop</p>
          <h2>
            Find us in Marble Falls. <em>Centered in the Highland Lakes.</em>
          </h2>
        </div>
        <p>
          The shop is the heart of every project. Drop in by appointment to review samples, finish chips, and
          in-progress pieces.
        </p>
      </Reveal>

      <Reveal className="map-block">
        <iframe
          src={company.location.mapEmbedUrl}
          title="Texas High Refinished — Marble Falls location"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="map-block-meta">
          <div>
            <strong>{company.location.fullAddress}</strong>
            <br />
            <small>Marble Falls · Texas Hill Country</small>
          </div>
          <a className="text-link" href={company.location.mapUrl} target="_blank" rel="noreferrer">
            <MapPin size={14} />
            Open in Google Maps
            <ExternalLink size={13} />
          </a>
        </div>
      </Reveal>
    </MotionSection>
  );
}

function ServiceAreas() {
  return (
    <MotionSection className="section">
      <Reveal className="section-heading split">
        <div>
          <p className="eyebrow">Service area</p>
          <h2>
            Serving Marble Falls, <em>Highland Lakes, and the Texas Hill Country.</em>
          </h2>
        </div>
        <p>
          We travel throughout the region for on-site work, and bring cabinetry, furniture, and architectural pieces
          back to the shop in Marble Falls for premium refinishing.
        </p>
      </Reveal>

      <motion.div
        className="areas-list"
        aria-label="Service areas"
        variants={stagger(0, 0.025)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        {company.serviceAreas.map((area) => (
          <motion.span key={area} variants={fadeUp}>
            {area}
          </motion.span>
        ))}
      </motion.div>
    </MotionSection>
  );
}

function ContactCTA() {
  return (
    <MotionSection className="contact-section">
      <Reveal className="contact-card">
        <div>
          <p className="eyebrow">Quick contact</p>
          <h2>
            Tap a channel and reach <em>{company.brand.representative} today.</em>
          </h2>
          <p>
            For new projects, share a photo and a short description — we'll respond with next steps.
          </p>
        </div>

        <motion.div
          className="contact-actions"
          aria-label="Contact options"
          variants={stagger(0.1, 0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.a
            href={company.contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            variants={fadeUp}
            className="whatsapp"
          >
            <WhatsAppIcon size={18} />
            <span>WhatsApp</span>
            <ArrowUpRight aria-hidden="true" size={15} style={{ marginLeft: "auto" }} />
          </motion.a>
          <motion.a href={`tel:${company.contact.phoneRaw}`} variants={fadeUp}>
            <Phone aria-hidden="true" size={18} />
            <span>{company.contact.phone}</span>
            <ArrowUpRight aria-hidden="true" size={15} style={{ marginLeft: "auto" }} />
          </motion.a>
          <motion.a href={`mailto:${company.contact.email}`} variants={fadeUp}>
            <Mail aria-hidden="true" size={18} />
            <span>{company.contact.email}</span>
            <ArrowUpRight aria-hidden="true" size={15} style={{ marginLeft: "auto" }} />
          </motion.a>
          <motion.a href={company.contact.facebook} target="_blank" rel="noreferrer" variants={fadeUp}>
            <Facebook aria-hidden="true" size={18} />
            <span>Facebook</span>
            <ArrowUpRight aria-hidden="true" size={15} style={{ marginLeft: "auto" }} />
          </motion.a>
        </motion.div>
      </Reveal>
    </MotionSection>
  );
}

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact — Free Estimates Marble Falls TX"
        description="Contact Texas High Refinished for cabinet refinishing, kitchen remodeling, painting, and drywall estimates in Marble Falls and the Texas Hill Country."
        path="/contact"
        image={assetUrl(company.assets.pageHeroes.contact)}
        imageAlt="Exterior finish project by Texas High Refinished in the Texas Hill Country."
        imageWidth={1905}
        imageHeight={1429}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Texas High Refinished",
          url: `${SITE_URL}/contact`,
          mainEntity: { "@id": `${SITE_URL}/#business` },
        }}
      />
      <PageHeader
        crumb="Contact"
        eyebrow="Contact"
        title="Let's plan your next"
        em="finish, together."
        lede="Reach Esdras Paz directly — by phone, WhatsApp, text, email, or Facebook. For new projects, send a photo and a short description and we'll follow up with a clear estimate."
        image={company.assets.pageHeroes.contact}
      />
      <ContactBody />
      <MapSection />
      <ServiceAreas />
      <ContactCTA />
    </>
  );
}
