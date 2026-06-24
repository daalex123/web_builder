"use client";

import { createContext, useContext } from "react";
import type { FurnitureVariant } from "./variants";

const FurnitureThemeContext = createContext<FurnitureVariant | null>(null);

export function FurnitureThemeProvider({
  variant,
  children,
}: {
  variant: FurnitureVariant;
  children: React.ReactNode;
}) {
  return (
    <FurnitureThemeContext.Provider value={variant}>
      {children}
    </FurnitureThemeContext.Provider>
  );
}

export function useFurnitureTheme(): FurnitureVariant {
  const ctx = useContext(FurnitureThemeContext);
  if (!ctx) {
    throw new Error("useFurnitureTheme must be used within FurnitureThemeProvider");
  }
  return ctx;
}
