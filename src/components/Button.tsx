import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  solid?: boolean;
  outlined?: boolean;
  icon?: boolean;
  small?: boolean;
  width?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, solid, outlined, icon, small, width, style, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-center rounded-sm bg-transparent border border-transparent text-[var(--color-primary)] cursor-pointer font-inherit text-sm tracking-wider py-2.5 px-4 transition-all duration-100 uppercase",
        "hover:bg-[var(--color-primary-light)]",
        "disabled:grayscale disabled:opacity-80 disabled:cursor-not-allowed",
        solid && "bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] hover:border-[var(--color-primary-dark)]",
        outlined && "bg-transparent border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]",
        icon && "border-[var(--bg-color-secondary)] bg-[var(--bg-color-secondary)] rounded-full p-2 hover:text-[var(--bg-color-secondary)] hover:bg-[var(--color-primary-dark)]",
        small && "p-1",
        className
      )}
      style={{ width: width || undefined, ...style }}
      {...props}
    />
  )
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
  <div className={cn("flex [&>button:not(:first-child)]:ml-1.5", className)} {...props}>
    {children}
  </div>
);
