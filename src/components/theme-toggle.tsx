"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "@/components/providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "light" ? "Use dark theme" : "Use light theme";

  return (
    <button className="icon-button" type="button" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
    </button>
  );
}
