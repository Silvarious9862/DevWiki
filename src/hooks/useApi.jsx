// hooks/useApi.js
import { useAuth } from "../auth/AuthContext";
import { ARTICLES_ENDPOINT } from "../config/api";

export function useApi() {
  const { token } = useAuth();

  async function getArticle(id) {
    const resp = await fetch(`${ARTICLES_ENDPOINT}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) throw new Error("Не удалось загрузить статью");
    return resp.json();
  }

  return { getArticle };
}
