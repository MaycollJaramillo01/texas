import { useEffect } from "react";
import { ESTIMATOR_URL } from "../data/company";

// The estimator now lives in its own app (GHL-connected wizard + visit
// booking). This page keeps every existing /estimate link working.
export default function EstimateRedirectPage() {
  useEffect(() => {
    window.location.replace(ESTIMATOR_URL);
  }, []);

  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "4rem 1.5rem" }}>
      <div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Opening the project estimator…</p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
          If nothing happens, <a href={ESTIMATOR_URL}>tap here to continue</a>.
        </p>
      </div>
    </main>
  );
}
