import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, FileText, BarChart3, Home, LogIn, LogOut, User, LayoutDashboard, Bookmark, ClipboardList, FileEdit, TrendingUp, Menu } from "lucide-react";
import { TalentsiaLogo } from "@/components/TalentsiaLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const publicNavItems = [
    { path: "/", label: "Home", icon: Home },
  ];

  const authNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/upload", label: "Analyze", icon: FileText },
    { path: "/skills", label: "My Skills", icon: BarChart3 },
    { path: "/learning-path", label: "Learning Path", icon: TrendingUp },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
  ];

  // Extra account destinations only surfaced in the desktop dropdown / mobile sheet.
  const accountNavItems = [
    { path: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
    { path: "/applications", label: "Applications", icon: ClipboardList },
    { path: "/cover-letter", label: "Cover Letter", icon: FileEdit },
  ];

  const navItems = user ? authNavItems : publicNavItems;

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center group min-w-0">
            <TalentsiaLogo variant="full" size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop account control */}
            {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="font-medium truncate" disabled>
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {accountNavItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link to={item.path} className="cursor-pointer">
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button size="sm" className="gradient-primary">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile navigation — hamburger sheet with full labels */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[min(20rem,85vw)] flex flex-col gap-2">
                  <SheetHeader className="text-left">
                    <SheetTitle>
                      <TalentsiaLogo variant="full" size="sm" />
                    </SheetTitle>
                  </SheetHeader>

                  {user && (
                    <p className="text-sm text-muted-foreground truncate px-1 pb-2 border-b border-border/50">
                      {user.email}
                    </p>
                  )}

                  <nav className="flex flex-col gap-1 mt-2">
                    {navItems.map(item => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors ${isActive
                            ? "bg-primary/20 text-primary"
                            : "text-foreground hover:bg-secondary/50"
                            }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}

                    {user && accountNavItems.map(item => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors ${isActive
                            ? "bg-primary/20 text-primary"
                            : "text-foreground hover:bg-secondary/50"
                            }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-auto pt-4 border-t border-border/50">
                    {user ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setMobileOpen(false);
                          signOut();
                        }}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                      </Button>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full gradient-primary">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
