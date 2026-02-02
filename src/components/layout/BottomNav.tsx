import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, ChefHat, ShoppingCart } from "lucide-react";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 tap-highlight-none">
      {/* Native iOS-style frosted glass */}
      <div className="absolute inset-0 bg-card/70 backdrop-blur-2xl border-t border-border/30" />
      
      {/* Safe area + content */}
      <div className="relative flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 pb-safe transition-all duration-150 active:scale-95 active:opacity-70 select-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Icon with active state */}
              <div className={cn(
                "relative p-2 rounded-2xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                  )} 
                />
              </div>
              
              <span className={cn(
                "text-[10px] mt-0.5 transition-all duration-200",
                isActive ? "font-semibold" : "font-medium"
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
