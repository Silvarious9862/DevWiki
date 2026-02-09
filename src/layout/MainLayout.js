// src/layout/MainLayout.js
import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css"

function MainLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setIsDarkMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const themeClass = isDarkMode ? "theme-dark" : "theme-light";

  return (
    <div className={`app-root ${themeClass}`}>
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
