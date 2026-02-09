import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useBreadcrumbs } from "../layout/BreadcrumbContext";

export default function ArticlePage() {
  const { id } = useParams();
  const { getArticle } = useApi();
  const { setItems } = useBreadcrumbs();

  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getArticle(id); // здесь уже есть category_id и category_name
        if (!cancelled) {
          setArticle(data);

          const crumbs = [];
          if (data.category_id && data.category_name) {
            crumbs.push({
              label: data.category_name,
              href: `/articles?category_id=${data.category_id}`,
            });
          }
          crumbs.push({ label: data.title });

          setItems(crumbs);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      setItems([]); // очищаем крошки при уходе
    };
  }, [id]); // только id

  if (loading) return <div>Загрузка…</div>;
  if (error) return <div>{error}</div>;
  if (!article) return <div>Статья не найдена</div>;

  return (
    <div>
      <h1>{article.title}</h1>
      <article>{article.content}</article>
    </div>
  );
}
