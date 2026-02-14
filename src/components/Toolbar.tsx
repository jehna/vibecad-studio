import React from "react";

export default function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white text-[var(--color-primary)] border border-gray-300 border-t-0 rounded-b p-1.5 text-xl">
      {children}
    </div>
  );
}
