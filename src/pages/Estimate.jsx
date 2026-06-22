import { useSearchParams } from "react-router-dom";
import { Calculator } from "lucide-react";
import EstimatorWizard from "../components/EstimatorWizard";
import SEO from "../components/SEO";
import { Reveal } from "../components/motion";

export default function EstimatePage() {
  const [searchParams] = useSearchParams();
  const rawService = searchParams.get("service");

  const VALID_SERVICES = [
    "interior_painting", "exterior_painting", "cabinet_refinishing",
    "drywall", "drywall_repair", "tile", "stain_clear",
  ];
  const initialService = VALID_SERVICES.includes(rawService) ? rawService : undefined;

  return (
    <>
      <SEO
        title="Get a Free Project Estimate"
        description="Use the THR Estimator to get a personalized investment range for painting, cabinet refinishing, drywall, or tile in Marble Falls and the Texas Hill Country."
        path="/estimate"
      />

      <main className="estimate-page">
        <div className="estimate-page-intro">
          <Reveal>
            <p className="eyebrow">
              <Calculator size={13} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              Free Estimator
            </p>
            <h1>
              Estimate your project. <em>In minutes.</em>
            </h1>
            <p className="estimate-page-lede">
              Answer a few questions about your project and receive a personalized investment range —
              calculated privately on our servers, never shown to third parties.
            </p>
          </Reveal>
        </div>

        <EstimatorWizard initialService={initialService} />
      </main>
    </>
  );
}
