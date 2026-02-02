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
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0 -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {showLogo && (
            <div className="flex items-center gap-2 mr-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          )}
          
          <div>
            <h1 className="text-xl font-semibold leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {rightAction}
          {showSettings && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Settings"
              className="rounded-xl hover:bg-muted"
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
