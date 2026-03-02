// src/layout/Header.js
import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as NightIcon } from "../assets/icons/moon.svg";
import { ReactComponent as DayIcon } from "../assets/icons/sun.svg";
import { useAuth } from "../auth/AuthContext";
import AuthDropdown from "../auth/AuthDropdown";

function Header({ isDarkMode, onToggleTheme }) {
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuth, user, logout } = useAuth();
  const [authDropdownMode, setAuthDropdownMode] = useState(null); // "login" | "register" | null
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // закрытие по клику вне
  useEffect(() => {
    function handleClickOutside() {
      if (authDropdownMode) setAuthDropdownMode(null);
      if (profileMenuOpen) setProfileMenuOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [authDropdownMode, profileMenuOpen]);

  const handleToggleTheme = () => {
    onToggleTheme();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Поиск:", searchQuery);
  };

  const handleOpenLogin = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(false);
    setAuthDropdownMode(prev => (prev === "login" ? null : "login"));
  };

  const handleOpenRegister = (e) => {
    e.stopPropagation();
    setProfileMenuOpen(false);
    setAuthDropdownMode(prev => (prev === "register" ? null : "register"));
  };

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
  };

  const displayName =
    (user && (user.login)) || "Пользователь";

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
          className={
            "theme-switcher " + (isDarkMode ? "theme-dark" : "theme-light")
          }
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

        {!isAuth && (
          <div className="auth-buttons auth-buttons-with-dropdown">
            <div className="auth-button-wrapper" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="auth-btn login-btn"
                onClick={handleOpenLogin}
              >
                Войти
              </button>
              {authDropdownMode === "login" && (
                <AuthDropdown
                  mode="login"
                  onClose={() => setAuthDropdownMode(null)}
                />
              )}
            </div>

            <div className="auth-button-wrapper" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="auth-btn register-btn"
                onClick={handleOpenRegister}
              >
                Зарегистрироваться
              </button>
              {authDropdownMode === "register" && (
                <AuthDropdown
                  mode="register"
                  onClose={() => setAuthDropdownMode(null)}
                />
              )}
            </div>
          </div>
        )}

        {isAuth && (
          <div
            className="user-profile"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="user-profile-button"
              onClick={() =>
                setProfileMenuOpen(prev => !prev)
              }
            >
              {displayName}
            </button>
            {profileMenuOpen && (
              <div className="user-profile-menu">
                <button
                  type="button"
                  className="user-profile-menu-item"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
