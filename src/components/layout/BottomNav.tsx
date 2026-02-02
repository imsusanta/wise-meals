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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-4 min-w-[72px] min-h-touch transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 mb-1",
                  isActive && "stroke-[2.5px]"
                )} 
              />
              <span className={cn(
                "text-sm font-medium",
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
