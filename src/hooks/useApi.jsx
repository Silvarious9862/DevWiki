// src/hooks/useApi.js
import { useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  ARTICLES_ENDPOINT,
  RATINGS_ENDPOINT,
  TAGS_ENDPOINT,
  COMMENTS_ENDPOINT,
  USERS_ENDPOINT,
  CATEGORIES_ENDPOINT,
} from "../config/api";

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

  // ---------- лайки ----------
  async function toggleArticleReaction(articleId, type) {
    const res = await authFetch(`${RATINGS_ENDPOINT}/article/${articleId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }), // "like" | "dislike"
    });
    if (!res.ok) {
      throw new Error("Не удалось обновить реакцию");
    }
    return res.json(); // { likes_count, dislikes_count, user_reaction }
  }

  // ---------- комментарии ----------

  const getArticleComments = useCallback(
    async (articleId) => {
      const resp = await authFetch(
        `${COMMENTS_ENDPOINT}/articles/${articleId}`,
        {
          method: "GET",
        }
      );
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось загрузить комментарии");
      }
      return resp.json(); // список CommentTreeItem
    },
    [authFetch]
  );

  const createComment = useCallback(
    async (articleId, payload, parentId = null) => {
      const params = parentId ? `?parent_id=${parentId}` : "";
      const resp = await authFetch(
        `${COMMENTS_ENDPOINT}/articles/${articleId}${params}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), // { text }
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось добавить комментарий");
      }

      return resp.json(); // CommentResponse
    },
    [authFetch]
  );

  const updateComment = useCallback(
    async (commentId, payload) => {
      const resp = await authFetch(`${COMMENTS_ENDPOINT}/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // { text }
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось обновить комментарий");
      }

      return resp.json(); // CommentResponse
    },
    [authFetch]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      const resp = await authFetch(`${COMMENTS_ENDPOINT}/${commentId}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось удалить комментарий");
      }
    },
    [authFetch]
  );

  // ---------- юзеры из комментариев ----------
  const getUserById = useCallback(
    async (id) => {
      const resp = await authFetch(`${USERS_ENDPOINT}/${id}`, {
        method: "GET",
      });
      if (!resp.ok) {
        throw new Error("Не удалось загрузить пользователя");
      }
      return resp.json(); // UserResponse
    },
    [authFetch]
  );

  // ---------- юзеры для поиска ----------
  const resolveAuthorByName = useCallback(
    async (name) => {
      const params = new URLSearchParams({ name });
      const resp = await authFetch(`${USERS_ENDPOINT}/resolve-author?${params.toString()}`, {
        method: "GET",
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось найти автора");
      }

      return resp.json(); // { id: number }
    },
    [authFetch]
  );

  // ---------- лайки комментариев ----------

  async function toggleCommentReaction(commentId, type) {
    const res = await authFetch(`${RATINGS_ENDPOINT}/comment/${commentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Не удалось обновить реакцию комментария");
    }
    return res.json(); // { likes_count, dislikes_count, user_reaction }
  }

  // ---------- теги ----------

  const getTagsByIds = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) return [];
      const params = new URLSearchParams();
      ids.forEach((id) => params.append("ids", id));
      const resp = await authFetch(`${TAGS_ENDPOINT}/bulk?${params.toString()}`, {
        method: "GET",
      });
      if (!resp.ok) {
        throw new Error("Не удалось загрузить теги");
      }
      return resp.json(); // массив TagResponse
    },
    [authFetch]
  );

  // ---------- категории name -> id ----------
  const resolveCategoryByName = useCallback(
    async (name) => {
      const params = new URLSearchParams({ name });
      const resp = await authFetch(
        `${CATEGORIES_ENDPOINT}/resolve-category?${params.toString()}`,
        { method: "GET" }
      );

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Не удалось найти категорию");
      }

      return resp.json(); // { id: number }
    },
    [authFetch]
  );

  return {
    getArticle,
    createArticle,
    updateArticle,
    toggleArticleReaction,
    getArticleComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentReaction,
    getTagsByIds,
    getUserById,
    resolveAuthorByName,
    resolveCategoryByName,
  };
}
