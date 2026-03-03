// src/articles/ArticleComments.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../auth/AuthContext";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";

import "./ArticleComments.css";

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

function CommentItem({
  comment,
  depth,
  isAuth,
  currentUser,
  onReply,
  onToggleReaction,
  onUpdate,
  onDelete,
  getDisplayName,
  articleAuthorId,
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const canEditOrDelete =
    currentUser && currentUser.user_id === comment.author_id;

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.comment_id, replyText);
    setReplyText("");
    setShowReply(false);
  };

  const handleEditSubmit = () => {
    if (!editText.trim() || editText === comment.text) {
      setIsEditing(false);
      setEditText(comment.text);
      return;
    }
    onUpdate(comment.comment_id, editText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Удалить комментарий?")) {
      onDelete(comment.comment_id);
    }
  };

  return (
    <div className="ArticleComments__commentWrapper">
      <div
        className={
          "ArticleComments__comment" +
          (depth > 0 ? " ArticleComments__comment--nested" : "")
        }
      >
        {/* шапка: автор + дата */}
        <div className="ArticleComments__commentHeader">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="ArticleComments__commentAuthor">
              {getDisplayName(comment.author_id)}
            </span>

            {comment.author_id === articleAuthorId && (
              <span className="ArticleComments__authorBadge">
                Автор
              </span>
            )}
          </div>

          <span className="ArticleComments__commentDate">
            {formatDateTime(comment.created_at)}
          </span>
        </div>


        {/* две колонки: слева текст+кнопки, справа лайки */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          {/* левая колонка */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <div className="ArticleComments__commentEditBlock">
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ width: "100%", marginTop: 4, marginBottom: 4 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" onClick={handleEditSubmit}>
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.text);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="ArticleComments__commentText">
                {comment.text}
              </div>
            )}

            <div
              className="ArticleComments__commentActions"
            >
              {isAuth && depth < 7 && (
                <Button
                  size="sm"
                  variant="plain"
                  onClick={() => setShowReply((v) => !v)}
                  sx={{
                    px: 0.5,
                    py: 0,
                    fontSize: 13,
                    minHeight: "unset",
                    color: "var(--text-secondary)",
                    textTransform: "none",
                    "&:hover": {
                      color: "var(--accent-primary)",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Ответить
                </Button>
              )}

              {canEditOrDelete && (
                <>
                  <Button
                    size="sm"
                    variant="plain"
                    onClick={() => setIsEditing((v) => !v)}
                    sx={{
                      px: 0.5,
                      py: 0,
                      fontSize: 13,
                      minHeight: "unset",
                      color: "var(--text-secondary)",
                      textTransform: "none",
                      "&:hover": {
                        color: "var(--accent-primary)",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="plain"
                    onClick={handleDelete}
                    className="ArticleComments__deleteButton"
                    sx={{
                      px: 0.5,
                      py: 0,
                      fontSize: 13,
                      minHeight: "unset",
                      textTransform: "none",
                    }}
                  >
                    Удалить
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* правая колонка: лайки, фиксированная ширина */}
          <div
            style={{
              width: 120,
              display: "flex",
              justifyContent: "flex-end",
              gap: 4,
            }}
          >
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => onToggleReaction(comment.comment_id, "like")}
              disabled={!isAuth}
              sx={{
                borderRadius: 999,
                px: 1,
                py: 0.25,
                color:
                  comment.user_reaction === "like"
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
                {comment.likes_count}
              </span>
            </IconButton>

            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => onToggleReaction(comment.comment_id, "dislike")}
              disabled={!isAuth}
              sx={{
                borderRadius: 999,
                px: 1,
                py: 0.25,
                color:
                  comment.user_reaction === "dislike"
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
                {comment.dislikes_count}
              </span>
            </IconButton>
          </div>
        </div>

        {showReply && isAuth && depth < 7 && (
          <div
            className="ArticleComments__replyForm"
            style={{ marginTop: 8, marginBottom: 8 }}
          >
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Ваш ответ..."
              style={{ width: "100%", marginBottom: 4 }}
            />
            <Button
              size="sm"
              onClick={handleReplySubmit}
              disabled={!replyText.trim()}
            >
              Отправить
            </Button>
          </div>
        )}

        {comment.children && comment.children.length > 0 && (
          <div className="ArticleComments__children">
            {comment.children.map((child) => (
              <CommentItem
                key={child.comment_id}
                comment={child}
                depth={depth + 1}
                isAuth={isAuth}
                currentUser={currentUser}
                onReply={onReply}
                onToggleReaction={onToggleReaction}
                onUpdate={onUpdate}
                onDelete={onDelete}
                getDisplayName={getDisplayName}
                articleAuthorId={articleAuthorId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleComments({ articleId, articleAuthorId }) {
  const {
    getArticleComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentReaction,
    getUserById,
  } = useApi();
  const { isAuth, user } = useAuth();

  const [comments, setComments] = useState([]);
  const [rootText, setRootText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});

  const getDisplayName = (userId) => {
    const u = userCache[userId];
    if (!u) return `Пользователь #${userId}`;
    if (u.first_name && u.last_name) {
      return `${u.first_name} ${u.last_name}`;
    }
    if (u.login) return u.login;
    return `Пользователь #${userId}`;
  };

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArticleComments(articleId);
      setComments(data || []);

      // подгружаем авторов
      const ids = new Set();
      (data || []).forEach(function collect(c) {
        ids.add(c.author_id);
        (c.children || []).forEach(collect);
      });

      const missing = Array.from(ids).filter((id) => !userCache[id]);
      const newUsers = {};
      for (const id of missing) {
        try {
          const u = await getUserById(id);
          newUsers[id] = u;
        } catch {
          // оставим "Пользователь #id"
        }
      }
      if (Object.keys(newUsers).length > 0) {
        setUserCache((prev) => ({ ...prev, ...newUsers }));
      }
    } catch (e) {
      setError(e.message || "Не удалось загрузить комментарии");
    } finally {
      setLoading(false);
    }
  }, [articleId, getArticleComments, getUserById, userCache]);

  useEffect(() => {
    if (articleId) {
      loadComments();
    }
  }, [articleId, loadComments]);

  const handleCreateRoot = async () => {
    if (!rootText.trim()) return;
    try {
      await createComment(articleId, { text: rootText }, null);
      setRootText("");
      await loadComments();
    } catch (e) {
      setError(e.message || "Ошибка добавления комментария");
    }
  };

  const handleReply = async (parentId, text) => {
    try {
      await createComment(articleId, { text }, parentId);
      await loadComments();
    } catch (e) {
      setError(e.message || "Ошибка добавления ответа");
    }
  };

  const handleToggleReaction = async (commentId, type) => {
    try {
      await toggleCommentReaction(commentId, type);
    } catch (e) {
      setError(e.message || "Ошибка обновления реакции");
    } finally {
      await loadComments();
    }
  };

  const handleUpdate = async (commentId, text) => {
    try {
      await updateComment(commentId, { text });
      await loadComments();
    } catch (e) {
      setError(e.message || "Ошибка обновления комментария");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (e) {
      setError(e.message || "Ошибка удаления комментария");
    }
  };

  return (
    <section className="ArticleComments" style={{ marginTop: 32 }}>
      <h2 className="ArticleComments__title" style={{ marginBottom: 12 }}>
        Комментарии
      </h2>

      {error && (
        <div className="ArticleComments__error" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {isAuth ? (
        <div className="ArticleComments__rootForm" style={{ marginBottom: 16 }}>
          <textarea
            rows={4}
            value={rootText}
            onChange={(e) => setRootText(e.target.value)}
            placeholder="Оставьте комментарий..."
          />
          <Button onClick={handleCreateRoot} disabled={!rootText.trim()}>
            Отправить
          </Button>
        </div>
      ) : (
        <div
          className="ArticleComments__authHint"
          style={{ marginBottom: 16, color: "var(--text-secondary)" }}
        >
          Войдите, чтобы оставлять комментарии и ставить оценки.
        </div>
      )}

      {loading ? (
        <div className="ArticleComments__loading">Загрузка комментариев...</div>
      ) : comments.length === 0 ? (
        <div className="ArticleComments__empty">Пока нет комментариев.</div>
      ) : (
        <div className="ArticleComments__list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              depth={0}
              isAuth={isAuth}
              currentUser={user}
              onReply={handleReply}
              onToggleReaction={handleToggleReaction}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              getDisplayName={getDisplayName}
              articleAuthorId={articleAuthorId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
