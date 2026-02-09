// src/hooks/useApi.js
import { useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { ARTICLES_ENDPOINT } from "../config/api";

export function useApi() {
  const { token } = useAuth();

  const getArticle = useCallback(
    async (id) => {
      const resp = await fetch(`${ARTICLES_ENDPOINT}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) throw new Error("Не удалось загрузить статью");
      return resp.json();
    },
    [token]
  );

  return { getArticle };
}
