import React from "react";
import { createRoot } from "react-dom/client";
import { HardcoverShelf } from "../src";

// Set this in the environment before starting the dev server, e.g.:
//   VITE_HARDCOVER_API_KEY="YOUR_API_KEY" pnpm dev
const API_KEY = import.meta.env.VITE_HARDCOVER_API_KEY ?? "YOUR_API_KEY";

const container = document.getElementById("home");
const root = createRoot(container as HTMLElement);
root.render(
  <div>
    <style dangerouslySetInnerHTML={{ __html: "body { font-family: sans-serif }" }}></style>
    <h1>React Hardcover Shelf Demo Page</h1>
    <HardcoverShelf apiKey={API_KEY} width={160} limit={20} groupBy="year" />
  </div>,
);
