import { createRoot } from "react-dom/client";
import App from "./App.simple";
import "./index.css";

// Using the simplified app which includes its own theme handling
createRoot(document.getElementById("root")!).render(
  <App />
);
