// src/layout/BreadcrumbContext.js
import { createContext, useContext, useState, useCallback } from "react";

const BreadcrumbContext = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [items, setItemsState] = useState([]);

  const setItems = useCallback((next) => {
    setItemsState(next);
  }, []);

  const value = { items, setItems };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumbs must be used inside BreadcrumbProvider");
  }
  return ctx;
}
