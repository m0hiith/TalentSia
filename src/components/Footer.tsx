import { Briefcase } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2025 ATS Finder. Built to help you land your dream job.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
