import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { useEffect, useState } from "react";

export function AppLayout() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col scroll-native tap-highlight-none">
      <main 
        className={`flex-1 pb-24 ${isTransitioning ? 'animate-fade-in' : ''}`}
        key={location.pathname}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
