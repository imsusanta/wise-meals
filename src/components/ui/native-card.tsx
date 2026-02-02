import * as React from "react";
import { cn } from "@/lib/utils";

interface NativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pressable?: boolean;
  variant?: "default" | "outlined" | "filled";
}

const NativeCard = React.forwardRef<HTMLDivElement, NativeCardProps>(
  ({ className, pressable = true, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-150 tap-highlight-none select-none",
          pressable && "active:scale-[0.98] cursor-pointer",
          variant === "default" && "bg-card border border-border shadow-sm",
          variant === "outlined" && "bg-transparent border-2 border-border",
          variant === "filled" && "bg-muted border-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
NativeCard.displayName = "NativeCard";

interface NativeListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  showChevron?: boolean;
}

const NativeListItem = React.forwardRef<HTMLDivElement, NativeListItemProps>(
  ({ className, icon, title, subtitle, trailing, showChevron = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl",
          "transition-all duration-100 tap-highlight-none select-none",
          "active:bg-muted/80 cursor-pointer",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {trailing}
        {showChevron && !trailing && (
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    );
  }
);
NativeListItem.displayName = "NativeListItem";

interface NativeHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  large?: boolean;
}

const NativeHeader = React.forwardRef<HTMLDivElement, NativeHeaderProps>(
  ({ className, large = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 pt-2 pb-1",
          large ? "text-2xl font-bold" : "text-sm font-semibold text-muted-foreground uppercase tracking-wide",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
NativeHeader.displayName = "NativeHeader";

export { NativeCard, NativeListItem, NativeHeader };
