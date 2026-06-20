"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChapterNav } from "@/components/nav/chapter-nav";
import { Brand } from "@/components/nav/brand";

/** Mobile top bar: hamburger opens the chapter list in a sheet. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open chapters"
          className="text-muted-foreground"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[18rem] p-0">
        <SheetHeader className="border-b border-border px-4 py-3.5">
          <SheetTitle asChild>
            <Brand />
          </SheetTitle>
        </SheetHeader>
        <div className="p-3">
          <ChapterNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
