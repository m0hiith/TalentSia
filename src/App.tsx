import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Skills from "./pages/Skills";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import ResumeBuilder from "./pages/ResumeBuilder";
import Onboarding from "./pages/Onboarding";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
