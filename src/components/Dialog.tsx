import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const useOnKeypress = (fcn: (() => void) | undefined, keypress = "Escape") => {
  const actionFcn = useRef(fcn);
  useEffect(() => {
    actionFcn.current = fcn;
  }, [fcn]);

  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === keypress) {
        actionFcn.current && actionFcn.current();
      }
    },
    [keypress]
  );

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [escFunction]);
};

interface DialogProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Dialog = React.memo(function Dialog({
  children,
  onClose,
  className,
}: DialogProps) {
  useOnKeypress(onClose, "Escape");

  return createPortal(
    <>
      <div
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-11 flex flex-col rounded-lg bg-[var(--bg-color)] border border-[var(--color-primary)] shadow-lg outline-none max-sm:top-auto max-sm:bottom-0 max-sm:left-2.5 max-sm:right-2.5 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none",
          className
        )}
      >
        <div className="max-h-[calc(100vh-100px)] min-w-[250px] w-auto max-w-[calc(100vw-10px)] grid gap-6 grid-rows-[auto_1fr] auto-rows-auto grid-cols-1 [&>:last-child]:mb-6">
          {children}
        </div>
      </div>
      <div
        className="fixed inset-0 z-10 bg-black/45"
        onClick={onClose}
      />
    </>,
    document.body
  );
});

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogBody = React.memo(function DialogBody({
  children,
  className,
}: DialogBodyProps) {
  return (
    <div className="min-h-0">
      <div className={cn("overflow-auto overscroll-contain h-full w-full px-8 py-px", className)}>
        {children}
      </div>
    </div>
  );
});

interface DialogTitleProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const DialogTitle = React.memo(function DialogTitle({
  children,
  onClose,
  className,
}: DialogTitleProps) {
  return (
    <div
      className={cn(
        "relative pt-6 px-8 leading-tight text-center font-bold truncate",
        className
      )}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 bg-none border-none p-0 font-normal cursor-pointer text-inherit"
        >
          &#x2715;
        </button>
      )}
    </div>
  );
});

export const DialogButtons = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("w-full flex flex-row justify-end px-8", className)} {...props}>
    {children}
  </div>
);
