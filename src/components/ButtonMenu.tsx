import React from "react";
import { cn } from "@/lib/utils";
import { InfoTopLeft } from "./FloatingInfo";
import { Button } from "@/components/ui/button";

export const InfoMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hide?: boolean; noBg?: boolean }
>(({ className, hide, noBg, ...props }, ref) => (
  <InfoTopLeft
    ref={ref}
    noBg={noBg}
    className={cn(
      "[&>*]:shrink-0 [&>:not(:first-child)]:mt-1.5 transition-opacity duration-500 ease-in-out hover:opacity-100 max-[400px]:mt-10",
      hide ? "opacity-0" : "opacity-100",
      className
    )}
    {...props}
  />
));
InfoMenu.displayName = "InfoMenu";

export const ContextButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    className={cn("text-2xl relative m-auto rounded-full", className)}
    {...props}
  />
));
ContextButton.displayName = "ContextButton";
