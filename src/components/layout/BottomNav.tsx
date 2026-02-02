import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, ChefHat, ShoppingCart, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Plan", path: "/plan" },
  { icon: ChefHat, label: "Recipes", path: "/recipes" },
  { icon: ShoppingCart, label: "List", path: "/list" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  // Hide nav on auth and onboarding pages
  const hideOnPaths = ["/auth", "/onboarding"];
  if (hideOnPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const isProfileActive = location.pathname === "/settings";
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

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

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 pb-safe transition-all duration-150 active:scale-95 active:opacity-70 select-none outline-none",
                isProfileActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-2xl transition-all duration-200",
                isProfileActive && "bg-primary/10"
              )}>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className={cn(
                    "text-xs font-semibold transition-colors",
                    isProfileActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <span className={cn(
                "text-[10px] mt-0.5 transition-all duration-200",
                isProfileActive ? "font-semibold" : "font-medium"
              )}>
                Profile
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top" 
            sideOffset={12}
            className="w-48 bg-popover border border-border shadow-xl rounded-xl z-[60]"
          >
            <DropdownMenuItem 
              onClick={() => navigate("/settings")}
              className="gap-2 rounded-lg cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="gap-2 text-destructive focus:text-destructive rounded-lg cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
