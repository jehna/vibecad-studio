import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ErrorBoundary from "../components/ErrorBoundary";
import Fullscreen from "../icons/Fullscreen";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface HeaderDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  triggerLabel?: string;
}

export const HeaderDropdown = ({
  value,
  onValueChange,
  items,
  triggerLabel,
}: HeaderDropdownProps) => {
  const selected = items.find((item) => item.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#d4d4d4] hover:bg-white/10 hover:text-white mr-6"
        >
          {triggerLabel ?? selected?.label ?? "Select"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {items.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
      <div className="flex w-full shrink-0 basis-[var(--pane-header-height)] justify-end items-center h-[var(--pane-header-height)] bg-header-secondary py-0.5 px-2 border-b border-white/10 [&_*]:text-[calc(var(--pane-header-height)*0.6)]">
        {buttons}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={fullscreen ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6 text-[#d4d4d4] hover:bg-white/10 hover:text-white"
              onClick={() => setFullscreen(!fullscreen)}
            >
              <Fullscreen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fullscreen</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex w-full flex-1 max-h-[calc(100%-var(--pane-header-height))] bg-background relative">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
};
