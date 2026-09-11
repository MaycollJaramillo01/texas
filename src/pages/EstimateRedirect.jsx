import { useEffect, useState } from "react";
import { ESTIMATOR_URL, adParams } from "../data/company";

// The estimator now lives in its own app (GHL-connected wizard + visit
// booking). This page keeps every existing /estimate link working.
//
// The query string must survive the hop: the home-page hero calculator sends
// ?service=&qty= so the wizard can prefill and skip what the visitor answered.
export default function EstimateRedirectPage() {
  const [target, setTarget] = useState(ESTIMATOR_URL);

  useEffect(() => {
    // Whatever the link carried (?service=&qty=) plus the visit's ad click, so
    // the lead the estimator creates keeps its Google Ads attribution.
    const url = new URL(ESTIMATOR_URL + window.location.search);
    for (const [key, value] of Object.entries(adParams)) url.searchParams.set(key, value);
    setTarget(url.toString());
    window.location.replace(url.toString());
  }, []);

  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "4rem 1.5rem" }}>
      <div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Opening the project estimator…</p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
          If nothing happens, <a href={target}>tap here to continue</a>.
        </p>
      </div>
    </main>
  );
}
