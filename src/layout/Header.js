// src/layout/Header.js
import React, { useState } from "react";
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as NightIcon } from "../assets/icons/moon.svg";
import { ReactComponent as DayIcon } from "../assets/icons/sun.svg";

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    // TODO: позже здесь будет реальное переключение темы
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // TODO: подключить реальный поиск по статьям
    console.log("Поиск:", searchQuery);
  };

  return (
    <header className="header">
      <div className="header-logo">
        DEV WIKI
      </div>

      <form className="header-search" onSubmit={handleSearchSubmit}>
        <div className="search-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Найти все..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </form>

      <div className="header-user">
        <button
          className={`theme-switcher ${isDarkMode ? "theme-dark" : "theme-light"}`}
          onClick={handleToggleTheme}
          type="button"
        >
          <div className="theme-track">
            <div className="theme-thumb" />
            <div className="theme-icon theme-icon-night">
              <NightIcon />
            </div>
            <div className="theme-icon theme-icon-day">
              <DayIcon />
            </div>
          </div>
        </button>
        <div className="user-profile">
          {/* TODO: имя пользователя из контекста/Redux */}
          Юзернейм
        </div>
      </div>
    </header>
  );
}

export default Header;
