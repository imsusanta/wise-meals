import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

export function ImageWithSkeleton({ 
  src, 
  alt, 
  className,
  skeletonClassName 
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {/* Shimmer skeleton */}
      {isLoading && !hasError && (
        <div 
          className={cn(
            "absolute inset-0 shimmer rounded-inherit",
            skeletonClassName
          )} 
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      
      {/* Error fallback */}
      {hasError && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-muted/50 text-muted-foreground text-4xl",
          skeletonClassName
        )}>
          🍽️
        </div>
      )}
    </div>
  );
}
