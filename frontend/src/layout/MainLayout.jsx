// src/layout/MainLayout.js
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useBreadcrumbs } from "./BreadcrumbContext";
import "./Layout.css";

const SECTION_LABELS = {
  "articles": "Статьи",
  "faq": "FAQ",
  "about": "О нас",
  "": null, // корень – без крошек
};

function MainLayout({ children, disableBreadcrumbs = false }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { items } = useBreadcrumbs();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setIsDarkMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const themeClass = isDarkMode ? "theme-dark" : "theme-light";

  // извлекаем первый сегмент пути: /articles/123 -> "articles"
  const [, firstSegment = ""] = location.pathname.split("/");
  const sectionLabel = SECTION_LABELS[firstSegment];

  // если раздел не известен или выключены крошки — ничего не рисуем
  const baseCrumbs = sectionLabel
    ? [{ label: sectionLabel, href: `/${firstSegment}` }]
    : [];

  const fullBreadcrumb = [...baseCrumbs, ...items];

  const showBreadcrumbs =
    !disableBreadcrumbs && fullBreadcrumb.length > 0;

  return (
    <div className={`app-root ${themeClass}`}>
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          {showBreadcrumbs && (
            <nav className="breadcrumbs">
              {fullBreadcrumb.map((item, idx) => {
                const isLast = idx === fullBreadcrumb.length - 1;
                return (
                  <span key={idx} className="breadcrumb-item">
                    {idx > 0 && (
                      <span className="breadcrumb-sep"> / </span>
                    )}
                    {isLast || !item.href ? (
                      <span>{item.label}</span>
                    ) : (
                      <Link to={item.href}>{item.label}</Link>
                    )}
                  </span>
                );
              })}
            </nav>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
