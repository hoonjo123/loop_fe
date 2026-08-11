import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExplorePage } from "@/src/features/explore/components/ExplorePage";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExplorePage />
  </StrictMode>,
);
