import React from "react";
import { cn } from "@/lib/utils";
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "@/components/ui/button";

interface ButtonProps extends Omit<ShadcnButtonProps, "variant" | "size"> {
  solid?: boolean;
  outlined?: boolean;
  icon?: boolean;
  small?: boolean;
  width?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, solid, outlined, icon, small, width, style, ...props }, ref) => {
    const variant = solid
      ? "default"
      : outlined
        ? "outline"
        : icon
          ? "ghost"
          : "ghost";
    const size = icon ? "icon" : small ? "sm" : "default";

    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          !solid && !icon && "text-primary uppercase tracking-wider",
          icon && "rounded-full",
          className
        )}
        style={{ width: width || undefined, ...style }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const ButtonIcon = ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src={src}
    alt={alt}
    className={cn("h-4 mr-1.5 invert-[47%] sepia-[15%] saturate-[1794%] hue-rotate-[165deg] brightness-[95%] contrast-[80%]", className)}
    {...props}
  />
);

export const ButtonBar = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex gap-1.5", className)} {...props}>
    {children}
  </div>
);
