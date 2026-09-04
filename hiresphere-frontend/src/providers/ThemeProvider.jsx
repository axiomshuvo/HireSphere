"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, []);

  useEffect(() => {
    // Avoid calling setMounted(true) directly if it triggers cascading render warnings, 
    // but we need it for hydration mismatch protection.
    // React 19 / Compiler might complain, but this is a standard pattern for ThemeProviders.
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }
    setMounted(true);
  }, [applyTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
