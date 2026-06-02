import { Button } from "./ui/button";
import {
  Heart,
  ShoppingCart,
  Pill,
  FlaskConical,
  Stethoscope,
  Brain,
  Crown,
  Tag,
  Menu,
  X
} from "lucide-react";
import { PageView } from "./types";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface NavigationProps {
  onNavigate: (view: PageView) => void;
  cartCount?: number;
}

export function Navigation({ onNavigate, cartCount = 0 }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainMenuItems = [
    { label: "Home", view: "home" as PageView },
    { label: "Features", view: "features" as PageView },
    { label: "How it Works", view: "how-it-works" as PageView },
    { label: "Pricing", view: "pricing" as PageView },
    { label: "AI & Advanced Features", view: "ai-features" as PageView },
  ];

  const categoryItems = [
    { label: "Medicine", view: "medicine" as PageView, icon: Pill },
    { label: "Healthcare", view: "healthcare" as PageView, icon: Heart },
    { label: "Doctor Consult", view: "doctor-consult" as PageView, icon: Stethoscope },
    { label: "Lab Tests", view: "lab-tests" as PageView, icon: FlaskConical },
    { label: "PLUS", view: "plus" as PageView, icon: Crown },
    { label: "Health Insights", view: "health-insights" as PageView, icon: Brain },
    { label: "Offers", view: "offers" as PageView, icon: Tag },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Top Nav */}
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate("home")}>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-xl text-foreground font-semibold group-hover:text-primary transition-colors duration-300">I Health Clinic</span>
          </div>

          {/* Desktop Main Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {mainMenuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className="relative group px-4 py-2 text-sm font-medium transition-all duration-300 ease-out"
              >
                <span className="relative z-10 text-foreground/90 group-hover:text-black dark:group-hover:text-white transition-all duration-300">
                  {item.label}
                </span>

                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-100 dark:from-pink-500/30 dark:to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </button>

            ))}
            <button
              onClick={() => onNavigate("contact")}
              className="relative group px-4 py-2 text-sm font-medium transition-all duration-300 ease-out"
            >
              <span className="relative z-10 text-foreground/90 group-hover:text-black dark:group-hover:text-white transition-all duration-300">
                Contact
              </span>

              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-100 dark:from-pink-500/30 dark:to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </button>

          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="flex text-foreground relative"
              onClick={() => onNavigate("cart")}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onNavigate("login")}
              className="hidden sm:flex text-foreground font-semibold"
            >
              Login
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop Subtle Category Sub-navigation */}
        <div className="hidden lg:flex items-center justify-center gap-6 py-2 border-t border-border/40">
          {categoryItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="flex items-center gap-2 group cursor-pointer transition-colors"
            >
              <div className="p-1 rounded-md bg-transparent group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50">
            <div className="px-4 py-6 space-y-4">
              {/* Main Menu Items */}
              <div className="space-y-3">
                {mainMenuItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => {
                      onNavigate(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-foreground/90 hover:text-primary hover:bg-accent rounded-lg transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    onNavigate("contact");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-foreground/90 hover:text-primary hover:bg-accent rounded-lg transition-colors font-medium"
                >
                  Contact
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-4">
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onNavigate("login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-foreground/90 hover:text-primary hover:bg-accent rounded-lg transition-colors font-medium"
                  >
                    Login
                  </button>

                </div>
              </div>

              {/* Category Items */}
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {categoryItems.map((item) => (
                    <button
                      key={item.view}
                      onClick={() => {
                        onNavigate(item.view);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-foreground/80 hover:text-primary hover:bg-accent rounded-lg transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
