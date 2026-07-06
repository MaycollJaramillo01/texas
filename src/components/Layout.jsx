import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { company, navItems } from "../data/company";
import { ease } from "./motion";
import WhatsAppIcon from "./WhatsAppIcon";

function Header() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        className="site-header"
        initial={reduceMotion ? false : { y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
      >
        <Link className="brand-mark" to="/" aria-label="Texas High Refinished — Home">
          <img src={company.assets.logoDark} alt="Texas High Refinished" />
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.4 + i * 0.06 }}
            >
              <NavLink to={item.href} end={item.href === "/"}>
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <a className="header-call" href={`tel:${company.contact.phoneRaw}`}>
          <Phone aria-hidden="true" size={16} />
          <span>{company.contact.phone}</span>
        </a>

        <div className="header-actions">
          <a
            className="mobile-call"
            href={`tel:${company.contact.phoneRaw}`}
            aria-label={`Call ${company.contact.phone}`}
          >
            <Phone size={18} />
          </a>
          <button
            className="mobile-menu-btn"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.header>

      {open && (
        <motion.div
          className="mobile-menu"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <button
            className="mobile-menu-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
          {navItems.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.href === "/"}>
              {item.label}
              <ArrowRight size={20} />
            </NavLink>
          ))}
        </motion.div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <address style={{ fontStyle: "normal" }}>
        <strong>{company.brand.displayName}</strong> · {company.brand.representative} ·{" "}
        <a href={`tel:${company.contact.phoneRaw}`}>{company.contact.phone}</a> · {company.location.shortAddress} · ©{" "}
        {new Date().getFullYear()}
      </address>
      <Link to="/">
        Back to top
        <ArrowRight aria-hidden="true" size={14} />
      </Link>
    </footer>
  );
}

function GHLChatWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.setAttribute("data-resources-url", "https://widgets.leadconnectorhq.com/chat-widget/loader.js");
    // TODO: Reemplaza "yDCxF21GLfVMLBtlB1Cl" con el Location ID real de la subcuenta de GHL
    script.setAttribute("data-widget-id", "yDCxF21GLfVMLBtlB1Cl"); 
    script.setAttribute("data-primary-color", "#1a1a1c");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return <chat-widget location-id="yDCxF21GLfVMLBtlB1Cl"></chat-widget>;
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" role="main">
        <Outlet />
      </main>
      <Footer />
      <a
        className="whatsapp-fab"
        href={company.contact.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon size={24} aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
      <GHLChatWidget />
    </>
  );
}
