import { TalentsiaLogo } from "@/components/TalentsiaLogo";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TalentsiaLogo variant="full" size="sm" />
            <span className="text-sm text-muted-foreground">
              © 2025 Talentsia. Built to help you land your dream job.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
