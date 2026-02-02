import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, ChefHat, ShoppingCart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Plan", path: "/plan" },
  { icon: ChefHat, label: "Recipes", path: "/recipes" },
  { icon: ShoppingCart, label: "List", path: "/list" },
];

export function BottomNav() {
  const location = useLocation();

  // Hide nav on auth and onboarding pages
  const hideOnPaths = ["/auth", "/onboarding"];
  if (hideOnPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-lg shadow-black/5" />
      
      <div className="relative flex items-center justify-around max-w-lg mx-auto pb-safe">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-5 min-w-[72px] transition-all duration-200 relative group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary" />
              )}
              
              {/* Icon container with subtle scale on active */}
              <span className={cn(
                "relative flex items-center justify-center transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-105"
              )}>
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-all",
                    isActive && "stroke-[2.5px]"
                  )} 
                />
                
                {/* Glow effect for active state */}
                {isActive && (
                  <span className="absolute inset-0 blur-lg bg-primary/30 rounded-full" />
                )}
              </span>
              
              <span className={cn(
                "text-xs mt-1.5 font-medium transition-all",
                isActive && "font-semibold"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
