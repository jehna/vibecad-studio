import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ErrorBoundary from "../components/ErrorBoundary";
import Fullscreen from "../icons/Fullscreen";

interface HeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  solid?: boolean;
  small?: boolean;
}

export const HeaderButton = React.forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ className, solid, small, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "bg-transparent text-[#d4d4d4] border border-transparent tracking-wider flex items-center justify-center hover:bg-white/10",
        solid && "bg-[var(--color-primary)]",
        className
      )}
      {...props}
    />
  )
);
HeaderButton.displayName = "HeaderButton";

export const HeaderSelect = ({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      "mr-6 text-[#d4d4d4] border-transparent bg-[var(--color-primary)] rounded-sm",
      className
    )}
    {...props}
  />
);

interface PaneProps {
  children: React.ReactNode;
  buttons?: React.ReactNode;
  aboveOthers?: boolean;
}

export const Pane = ({ children, buttons, aboveOthers }: PaneProps) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col [--pane-header-height:1.75em]",
        fullscreen
          ? "absolute inset-0 w-screen h-screen z-10"
          : "relative w-full h-full",
        aboveOthers && !fullscreen && "z-1"
      )}
    >
      <div className="flex w-full shrink-0 basis-[var(--pane-header-height)] justify-end h-[var(--pane-header-height)] bg-[var(--color-header-secondary)] py-0.5 px-8 shadow-[inset_0_-6px_12px_3px_rgba(0,0,0,0.35)] [&_*]:text-[calc(var(--pane-header-height)*0.6)]">
        {buttons}
        <HeaderButton
          solid={fullscreen}
          onClick={() => setFullscreen(!fullscreen)}
          title="Fullscreen"
        >
          <Fullscreen />
        </HeaderButton>
      </div>
      <div className="flex w-full flex-1 max-h-[calc(100%-var(--pane-header-height))] bg-[var(--bg-color)] relative">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
};
