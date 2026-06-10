import { Link } from "react-router-dom";
import { Reveal, SplitHeading } from "./motion";

export default function PageHeader({ eyebrow, title, em, lede, crumb, image }) {
  return (
    <section className="page-header">
      {image && (
        <div className="page-header-media">
          <img src={image} alt="" />
        </div>
      )}
      <div className="page-header-overlay" />
      <div className="page-header-inner">
        <Reveal className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span>{crumb}</span>
        </Reveal>
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <SplitHeading text={title} em={em} />
        {lede && (
          <Reveal delay={0.1}>
            <p className="page-header-lede">{lede}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
