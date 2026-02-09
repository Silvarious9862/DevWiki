import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_BASE = "http://192.168.100.20:8000";
const TOKEN_KEY = "devwiki_token";
const USER_KEY = "devwiki_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const isAuth = Boolean(token && user);

  // Восстановление сессии при загрузке
  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    const savedUser = window.localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        window.localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  async function login(loginValue, password) {
    const resp = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: loginValue, password }),
    });

    if (!resp.ok) {
      let message = "Неправильный логин или пароль";
      try {
        const err = await resp.json();
        if (err && err.detail) {
          message = err.detail;
        }
      } catch (e) {
        // ignore
      }
      throw new Error(message);
    }

    const data = await resp.json(); // { access_token, token_type, user }
    setToken(data.access_token);
    setUser(data.user);
    window.localStorage.setItem(TOKEN_KEY, data.access_token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  async function register({ login: loginValue, email, password, first_name, last_name }) {
    const payload = {
      login: loginValue,
      email,
      password,
      first_name: first_name || null,
      last_name: last_name || null,
    };

    const resp = await fetch(API_BASE + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      let message = "Ошибка регистрации";
      try {
        const err = await resp.json();
        if (err && err.detail) {
          message = err.detail;
        }
      } catch (e) {
        // ignore
      }
      throw new Error(message);
    }

    // После регистрации сразу логиним
    await login(loginValue, password);
  }

  async function logout() {
    if (token) {
      try {
        await fetch(API_BASE + "/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        // мягко игнорируем сетевые ошибки
      }
    }

    setToken(null);
    setUser(null);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  const value = {
    user,
    token,
    isAuth,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
