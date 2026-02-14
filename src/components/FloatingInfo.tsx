import React from "react";
import { cn } from "@/lib/utils";

interface FloatingInfoProps {
  children: React.ReactNode;
  className?: string;
  noBg?: boolean;
}

export const InfoTopRight = React.forwardRef<HTMLDivElement, FloatingInfoProps>(
  ({ children, className, noBg, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-14 right-8 flex flex-col rounded-lg p-2 max-h-[calc(100%-5em)] overflow-y-auto",
        !noBg && "bg-background border border-primary-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InfoTopRight.displayName = "InfoTopRight";

export const InfoBottomLeft = React.forwardRef<HTMLDivElement, FloatingInfoProps>(
  ({ children, className, noBg, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-8 left-8 flex flex-col rounded-lg p-2 max-h-[calc(100%-5em)] overflow-y-auto",
        !noBg && "bg-background border border-primary-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InfoBottomLeft.displayName = "InfoBottomLeft";

export const InfoBottomRight = React.forwardRef<HTMLDivElement, FloatingInfoProps>(
  ({ children, className, noBg, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-8 right-8 flex flex-col rounded-lg p-2 max-h-[calc(100%-5em)] overflow-y-auto",
        !noBg && "bg-background border border-primary-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InfoBottomRight.displayName = "InfoBottomRight";

export const InfoTopLeft = React.forwardRef<HTMLDivElement, FloatingInfoProps>(
  ({ children, className, noBg, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-14 left-8 flex flex-col rounded-lg p-2 max-h-[calc(100%-5em)] overflow-y-auto",
        !noBg && "bg-background border border-primary-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InfoTopLeft.displayName = "InfoTopLeft";
