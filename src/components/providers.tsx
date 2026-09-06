"use client";

import { Theme } from "@radix-ui/themes";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

type ThemeName = "light" | "dark";

const ThemeContext = createContext<{
  theme: ThemeName;
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => undefined });

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<ThemeName>(
    (onStoreChange) => {
      window.addEventListener("jobbr-theme-change", onStoreChange);
      return () => window.removeEventListener("jobbr-theme-change", onStoreChange);
    },
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        const next = theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("jobbr-theme", next);
        window.dispatchEvent(new Event("jobbr-theme-change"));
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <Theme appearance="inherit" hasBackground={false} accentColor="jade" grayColor="slate" radius="medium" scaling="100%">
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
