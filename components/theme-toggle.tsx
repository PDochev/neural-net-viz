"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
    >
      {/* Both icons render; the active theme's `.dark` class picks one via CSS,
          so there's no hydration mismatch and no mount gate needed. */}
      <Sun className="size-[1.1rem] dark:hidden" />
      <Moon className="hidden size-[1.1rem] dark:block" />
    </Button>
  );
}
