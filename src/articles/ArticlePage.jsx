// src/articles/ArticlePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useBreadcrumbs } from "../layout/BreadcrumbContext";
import { useAuth } from "../auth/AuthContext";
import Button from "@mui/joy/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ArticlePage.css";

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getArticle } = useApi();
  const { setItems } = useBreadcrumbs();
  const { user, isAuth } = useAuth();
  const isModerator =
    isAuth &&
    user &&
    (user.role?.name === "moderator" || user.role_id === 2);

  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getArticle(id);
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
      setItems([]);
    };
  }, [id, getArticle, setItems]);

  if (loading) return <div>Загрузка…</div>;
  if (error) return <div>{error}</div>;
  if (!article) return <div>Статья не найдена</div>;

  const statusLabel = article.is_published ? "Опубликовано" : "Черновик";
  const metaParts = [];

  // дата публикации
  if (article.published_at) {
    metaParts.push(formatDateTime(article.published_at));
  } else if (article.created_at) {
    metaParts.push(formatDateTime(article.created_at));
  }

  // обновление (если отличается от created_at/published_at)
  if (article.updated_at && article.updated_at !== article.created_at) {
    metaParts.push(`обновлено ${formatDateTime(article.updated_at)}`);
  }

  // автор — сейчас в модели нет имени, можно временно пропустить
  // metaParts.push("Автор: ...");

  // теги — когда появятся, добавим сюда
  // if (article.tags?.length) {
  //   metaParts.push(`теги: ${article.tags.join(", ")}`);
  // }

  const metaLine = metaParts.join(" · ");

  return (
    <div className="ArticlePage">
      <div className="ArticlePage__headerRow">
        <h1 className="ArticlePage__title">{article.title}</h1>

        {isModerator && (
          <Button
            size="sm"
            variant="plain"
            onClick={() => navigate(`/articles/${article.article_id}/edit`)}
            sx={{
              borderRadius: "999px",
              px: 1.75,
              py: 0.25,
              fontSize: 14,
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-primary)",
              "&:hover": {
                backgroundColor: "var(--accent-secondary)",
              },
            }}
          >
            Редактировать
          </Button>
        )}
      </div>

      <div className="ArticlePage__metaRow">
        <span
          className={
            "ArticlePage__statusPill " +
            (article.is_published
              ? "ArticlePage__statusPill--published"
              : "ArticlePage__statusPill--draft")
          }
        >
          {statusLabel}
        </span>

        {metaLine && (
          <span className="ArticlePage__metaText">
            {metaLine}
          </span>
        )}
      </div>

      <article className="ArticlePage__content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content || ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}
