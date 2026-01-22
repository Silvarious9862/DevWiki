// src/layout/Header.js
import React, { useState } from "react";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");

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
        <input
          type="text"
          placeholder="Поиск по статьям..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </form>

      <div className="header-user">
        <div className="user-profile">
          {/* TODO: имя пользователя из контекста/Redux */}
          User
        </div>
        <button className="theme-toggle" title="Переключить тему">
          {/* TODO: иконка луна/солнце */}
          ☾
        </button>
      </div>
    </header>
  );
}

export default Header;
