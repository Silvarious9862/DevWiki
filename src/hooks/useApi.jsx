// src/hooks/useApi.js
import { useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { ARTICLES_ENDPOINT, RATINGS_ENDPOINT } from "../config/api";

export function useApi() {
  const { token, refresh, logout } = useAuth();

  // Базовая обертка над fetch с поддержкой JWT + refresh
  const authFetch = useCallback(
    async (url, options = {}) => {
      // первый запрос с текущим токеном
      let resp = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // если access протух — пробуем обновить и повторить
      if (resp.status === 401) {
        const newToken = await refresh(); // вернет новый access или разлогинит
        if (!newToken) {
          throw new Error("Требуется вход в систему");
        }

        resp = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (resp.status === 401) {
          await logout();
          throw new Error("Требуется вход в систему");
        }
      }

      return resp;
    },
    [token, refresh, logout]
  );

  // ---------- статьи ----------

  const getArticle = useCallback(
    async (id) => {
      const resp = await authFetch(`${ARTICLES_ENDPOINT}/${id}`, {
        method: "GET",
      });
      if (!resp.ok) {
        throw new Error("Не удалось загрузить статью");
      }
      return resp.json();
    },
    [authFetch]
  );

  const createArticle = useCallback(
    async (payload) => {
      const resp = await authFetch(`${ARTICLES_ENDPOINT}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось создать статью");
      }

      return resp.json();
    },
    [authFetch]
  );

  const updateArticle = useCallback(
    async (id, payload) => {
      const resp = await authFetch(`${ARTICLES_ENDPOINT}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось сохранить статью");
      }

      return resp.json();
    },
    [authFetch]
  );

  async function toggleArticleReaction(articleId, type) {
    const res = await authFetch(`${RATINGS_ENDPOINT}/articles/${articleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }), // "like" | "dislike"
    });
    if (!res.ok) {
      throw new Error("Не удалось обновить реакцию");
    }
    return res.json(); // { likes_count, dislikes_count, user_reaction }
  }


  return {
    getArticle,
    createArticle,
    updateArticle,
    toggleArticleReaction,
  };
}
