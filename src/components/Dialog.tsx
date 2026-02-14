import React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  return (
    <ShadcnDialog open={true} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className={cn("max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:rounded-b-none", className)}>
        <DialogDescription className="sr-only">Dialog</DialogDescription>
        {children}
      </DialogContent>
    </ShadcnDialog>
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
      <div className={cn("overflow-auto overscroll-contain h-full w-full", className)}>
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
  className,
}: DialogTitleProps) {
  return (
    <DialogHeader>
      <ShadcnDialogTitle className={cn("text-center", className)}>
        {children}
      </ShadcnDialogTitle>
    </DialogHeader>
  );
});

export const DialogButtons = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogFooter className={cn(className)} {...props}>
    {children}
  </DialogFooter>
);
