import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // The product is intentionally dark. next-themes (used by the Sonner toaster)
  // now manages the `dark` class instead of it being hardcoded on a div. (P19)
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <App />
  </ThemeProvider>,
);
