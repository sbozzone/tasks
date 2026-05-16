"use client";

import { createContext, useContext } from "react";
import type { Family } from "@/types/database";

interface FamilyContextValue {
  family: Family;
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({
  family,
  children,
}: {
  family: Family;
  children: React.ReactNode;
}) {
  return (
    <FamilyContext.Provider value={{ family }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
}
