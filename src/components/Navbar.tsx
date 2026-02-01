import { Link, useLocation } from "react-router-dom";
import { Briefcase, FileText, BarChart3, Home } from "lucide-react";
const Navbar = () => {
  const location = useLocation();
  const navItems = [{
    path: "/",
    label: "Home",
    icon: Home
  }, {
    path: "/upload",
    label: "Upload",
    icon: FileText
  }, {
    path: "/skills",
    label: "Skills",
    icon: BarChart3
  }, {
    path: "/jobs",
    label: "Jobs",
    icon: Briefcase
  }];
  return <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center animate-glow">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              TalentSia
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>;
          })}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={`p-2 rounded-lg transition-all duration-300 ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </Link>;
          })}
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;