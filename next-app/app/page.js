"use client";

import dynamic from "next/dynamic";

// jsPDF, html2canvas and the imperative div/tile renderers in lib/ must
// never execute during prerender - they read `window`/`document` and
// build actual DOM nodes. Loading the whole panel with ssr:false keeps
// it fully client-side; the WorksheetGenerator component itself only
// touches the DOM from inside refs/effects/handlers, but this removes
// any doubt.
const WorksheetGenerator = dynamic(
  () => import("../components/WorksheetGenerator.js"),
  { ssr: false, loading: () => <p style={{ padding: "2em" }}>Loading worksheet generator…</p> }
);

export default function Page() {
  return <WorksheetGenerator />;
}
