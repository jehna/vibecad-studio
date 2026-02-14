import React from "react";
import { cn } from "@/lib/utils";

interface ParamsSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const ParamsSection = ({ children, className }: ParamsSectionProps) => (
  <div
    className={cn(
      "bg-[var(--bg-color)] font-mono text-[11px] py-2.5 gap-y-2.5",
      className
    )}
  >
    {children}
  </div>
);

interface LabelledBlockProps {
  label: string;
  labelFor?: string;
  children: React.ReactNode;
}

export const LabelledBlock = ({ label, labelFor, children }: LabelledBlockProps) => {
  return (
    <div className="flex flex-col px-2.5 [&>label]:flex [&>label]:h-6 [&>label]:items-center [&>label]:text-[var(--color-primary)]">
      <label htmlFor={labelFor}>{label}</label>
      {children}
    </div>
  );
};
