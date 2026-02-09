import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import "./Auth.css";

export default function AuthDropdown({ mode, onClose }) {
  // mode всегда "login" или "register" – задаётся из Header
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    login: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.login, form.password);
      } else {
        await register({
          login: form.login,
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
        });
      }
      onClose();
    } catch (err) {
      setError(err && err.message ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Войти" : "Зарегистрироваться";

  return (
    <div className="auth-dropdown" onClick={e => e.stopPropagation()}>
      <div className="auth-dropdown-arrow" />

      <div className="auth-dropdown-title">
        {title}
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Логин</span>
          <input
            type="text"
            value={form.login}
            onChange={e => handleChange("login", e.target.value)}
            required
          />
        </label>

        {mode === "register" && (
          <>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>Имя</span>
              <input
                type="text"
                value={form.first_name}
                onChange={e => handleChange("first_name", e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Фамилия</span>
              <input
                type="text"
                value={form.last_name}
                onChange={e => handleChange("last_name", e.target.value)}
              />
            </label>
          </>
        )}

        <label className="auth-field">
          <span>Пароль</span>
          <input
            type="password"
            value={form.password}
            onChange={e => handleChange("password", e.target.value)}
            required
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Загрузка..." : title}
        </button>
      </form>
    </div>
  );
}
