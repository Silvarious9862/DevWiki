// src/articles/ArticlePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useBreadcrumbs } from "../layout/BreadcrumbContext";
import { useAuth } from "../auth/AuthContext";

import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

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
  const { getArticle, toggleArticleReaction } = useApi();
  const { setItems } = useBreadcrumbs();
  const { user, isAuth } = useAuth();
  const isModerator =
    isAuth &&
    user &&
    (user.role?.name === "moderator" || user.role_id === 2);

  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getArticle(id);
        if (!cancelled) {
          setArticle(data);
          setUserReaction(data.user_reaction || null);

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
  if (article.author_first_name && article.author_last_name) {
    metaParts.push(`Автор: ${article.author_first_name} ${article.author_last_name}`);
  } else if (article.author_login) {
    metaParts.push(`Автор: ${article.author_login}`)
  } else {
    metaParts.push(`Автор неизвестен`)
  }

  const handleReaction = async (type) => {
    if (!isAuth || !user) return;

    try {
      const res = await toggleArticleReaction(article.article_id, type);
      setArticle((prev) =>
        prev
          ? {
              ...prev,
              likes_count: res.likes_count,
              dislikes_count: res.dislikes_count,
            }
          : prev
      );
      setUserReaction(res.user_reaction);
    } catch (e) {
      console.error(e);
    }
  };


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

            <div
        className="ArticlePage__footerRow"
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
      >
        <div
          className="ArticlePage__statsChip"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 4px",
            borderRadius: 999,
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow)",
          }}
        >
          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onClick={() => handleReaction("like")}
            disabled={!isAuth}
            sx={{
              borderRadius: 999,
              px: 1,
              py: 0.25,
              color:
                userReaction === "like"
                  ? "var(--accent-primary)"
                  : "var(--text-secondary)",
              "&:hover": {
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-primary)",
              },
            }}
          >
            <ThumbUpAltOutlinedIcon fontSize="small" />
            <span className="ArticlePage__reactionCount">
              {article.likes_count}
            </span>
          </IconButton>

          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onClick={() => handleReaction("dislike")}
            disabled={!isAuth}
            sx={{
              borderRadius: 999,
              px: 1,
              py: 0.25,
              color:
                userReaction === "dislike"
                  ? "var(--accent-primary)"
                  : "var(--text-secondary)",
              "&:hover": {
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-primary)",
              },
            }}
          >
            <ThumbDownAltOutlinedIcon fontSize="small" />
            <span className="ArticlePage__reactionCount">
              {article.dislikes_count}
            </span>
          </IconButton>

          <div className="ArticlePage__statsDivider" />

          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            sx={{
              borderRadius: 999,
              px: 1,
              py: 0.25,
              color: "var(--text-secondary)",
              pointerEvents: "none",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
            <span className="ArticlePage__reactionCount">
              {article.view_count}
            </span>
          </IconButton>
        </div>
      </div>
    </div>
  );
}
