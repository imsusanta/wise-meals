import { ArrowLeft, Settings, Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  showSettings = false,
  showLogo = false,
  rightAction 
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-2xl border-b border-border/20 tap-highlight-none">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0 -ml-2 rounded-xl active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {showLogo && (
            <div className="flex items-center gap-2 mr-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
          
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {rightAction}
          {showSettings && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Settings"
              className="rounded-xl active:scale-95 transition-transform"
            >
              <Link to="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
