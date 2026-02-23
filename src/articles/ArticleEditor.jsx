// src/articles/ArticleEditor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useBreadcrumbs } from "../layout/BreadcrumbContext";
import { useAuth } from "../auth/AuthContext";
import "./ArticleEditor.css";
import Button from "@mui/joy/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DRAFT_STORAGE_KEY = "devwiki_article_draft_v1";

export default function ArticleEditor({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setItems } = useBreadcrumbs();
  const { user, isAuth } = useAuth();
  const { createArticle, getArticle, updateArticle } = useApi();
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(mode === "create");



  const [form, setForm] = useState(() => {
    if (mode === "edit") {
      return { title: "", content: "", category_id: "" };
    }
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return { title: "", content: "", category_id: "" };
      }
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") {
        return { title: "", content: "", category_id: "" };
      }
      return {
        title: saved.title ?? "",
        content: saved.content ?? "",
        category_id:
          typeof saved.category_id === "number" ? saved.category_id : "",
      };
    } catch {
      return { title: "", content: "", category_id: "" };
    }
  });

  useEffect(() => {
    if (mode !== "create") return;
    const payload = {
      title: form.title,
      content: form.content,
      category_id:
        typeof form.category_id === "number" ? form.category_id : null,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [mode, form.title, form.content, form.category_id]);

  useEffect(() => {
    if (mode !== "edit" || !id || initialLoaded) return;

    let cancelled = false;

    async function loadArticle() {
      try {
        const article = await getArticle(id);
        if (cancelled) return;
        setForm({
          title: article.title ?? "",
          content: article.content ?? "",
          category_id:
            typeof article.category_id === "number"
              ? article.category_id
              : "",
        });
        setItems([{ label: "Редактирование статьи" }]);
        setInitialLoaded(true);
      } catch (e) {
        // можно показать ошибку и/или редирект
        setInitialLoaded(true);
      }
    }

    loadArticle();
    return () => {
      cancelled = true;
    };
  }, [mode, id, getArticle, setItems, initialLoaded]);





  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);




  const isFormValid =
  form.title.trim().length > 0 &&
  form.content.trim().length > 0 &&
  typeof form.category_id === "number" &&
  form.category_id > 0;

  const isDisabled = saving || !isFormValid;

  useEffect(() => {
    if (mode === "create") {
      setItems([{ label: "Новая статья" }]);
    }
    return () => setItems([]);
  }, [mode, setItems]);


  const isModerator =
    isAuth &&
    user &&
    (user.role?.name === "moderator" || user.role_id === 2);

  if (!isAuth) {
    return <div>Требуется вход в систему</div>;
  }

  if (!isModerator) {
    return <div>Недостаточно прав для доступа к редактору статей</div>;
  }

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]:
        field === "category_id"
          ? value === "" ? null : Number(value)
          : value,
    }));
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      content: value,
    }));
  };


  const submitArticle = async (publish) => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        content: form.content,
        author_id: user.user_id,
        category_id: form.category_id ?? null,
        is_published: publish,
      };

      if (mode === "create") {
        const created = await createArticle(payload);

        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // ignore
        }

        navigate(`/articles/${created.article_id}`);
      } else {
        // режим редактирования
        await updateArticle(id, payload);
        navigate(`/articles/${id}`);
      }
    } catch (e) {
      setError(e.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
      setIsMenuOpen(false);
    }
  };


  const handlePublish = () => submitArticle(true);
  const handleSaveDraft = () => submitArticle(false);
  const submitLabel = mode === "create" ? "Создать статью" : "Сохранить изменения";
  const nameLabel =
    mode === "create" ? "Новая статья" : "Редактирование статьи";

  const subtitleLabel =
    mode === "create"
      ? "Напишите статью в Markdown, затем сохраните как черновик или сразу опубликуйте."
      : "Измените текст статьи в Markdown и сохраните изменения.";


  return (
    <div className="ArticleEditorPage">
      <div className="ArticleEditorPage__header">
        <h1>{nameLabel}</h1>
        <div className="ArticleEditorPage__subtitle">
          {subtitleLabel}
        </div>
      </div>

      <div className="ArticleEditorPage__layout">
        {/* Левая карточка: форма + редактор */}
        <div className="ArticleEditorPage__card ArticleEditorPage__card--form">
          {error && (
            <div className="ArticleEditorPage__error">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="ArticleEditorForm__field">
              <label className="ArticleEditorForm__label">
                Заголовок
              </label>
              <input
                className="ArticleEditorForm__input"
                type="text"
                value={form.title}
                onChange={handleChange("title")}
                required
              />
            </div>

            <div className="ArticleEditorForm__field">
              <label className="ArticleEditorForm__label">
                Категория (ID)
              </label>
              <input
                className="ArticleEditorForm__input"
                type="number"
                value={form.category_id ?? ""}
                onChange={handleChange("category_id")}
              />
            </div>

            <div className="ArticleEditorForm__field ArticleEditorForm__field--editor">
              <div className="ArticleEditorForm__editorTopRow">
                <div className="ArticleEditorForm__editorLabels">
                  <div className="ArticleEditorForm__label">Редактор</div>
                </div>

                <Button
                  size="sm"
                  variant="plain"
                  onClick={() => setIsPreviewOpen((v) => !v)}
                  className={
                    isPreviewOpen
                      ? "ArticleEditorForm__previewToggle ArticleEditorForm__previewToggle--active"
                      : "ArticleEditorForm__previewToggle"
                  }
                >
                  {isPreviewOpen ? "Скрыть превью" : "Показать превью"}
                </Button>
              </div>

              <div className="ArticleEditorForm__editorPane">
                <textarea
                  className="ArticleEditorForm__textarea"
                  value={form.content}
                  onChange={handleContentChange}
                  rows={18}
                  placeholder="Введите Markdown-текст статьи…"
                />
              </div>
            </div>

            <div className="ArticleEditorForm__footerRow">
              <div className="ArticleEditorForm__actions">
                <div
                  className="ArticleEditorForm__splitButtonWrapper"
                  tabIndex={-1}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  <Button
                    type="button"
                    disabled={isDisabled}
                    sx={{
                      borderRadius: 999,
                      px: 0,
                      py: 0,
                      minWidth: 0,
                      textTransform: "none",
                      backgroundColor: "transparent",
                      border: "none",
                      boxShadow: "none",
                      "& .ArticleEditorSplitButton__main, & .ArticleEditorSplitButton__toggle": {
                        backgroundColor: "var(--accent-primary)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        opacity: 1,
                      },
                      "& .ArticleEditorSplitButton__toggle": {
                        borderLeft: "1px solid rgba(0, 0, 0, 0.25)",
                      },
                      "&.Mui-disabled .ArticleEditorSplitButton__main, &.Mui-disabled .ArticleEditorSplitButton__toggle": {
                        backgroundColor: "var(--accent-muted)",
                        color: "var(--text-muted)",
                        cursor: "default",
                        opacity: 0.7,
                      },
                      "& .ArticleEditorSplitButton__toggle:hover, & .ArticleEditorSplitButton__toggle--active": {
                        backgroundColor: "var(--accent-secondary)"
                      },
                      "& .ArticleEditorSplitButton__main:hover": {
                        backgroundColor: "var(--accent-secondary)"
                      }
                    }}
                  >
                    <span
                      className="ArticleEditorSplitButton__main"
                      onClick={(e) => {
                        if (isDisabled) return;
                        e.stopPropagation();
                        handlePublish();
                      }}
                    >
                      {saving ? "Сохранение…" : submitLabel}
                    </span>

                    <span
                      className={
                        "ArticleEditorSplitButton__toggle" +
                        (isMenuOpen ? " ArticleEditorSplitButton__toggle--active" : "")
                      }
                      onClick={(e) => {
                        if (isDisabled) return;
                        e.stopPropagation();
                        setIsMenuOpen((v) => !v);
                      }}
                    >
                      ▾
                    </span>
                  </Button>

                  {isMenuOpen && (
                    <div className="ArticleEditorForm__menu">
                      <button
                        type="button"
                        className="ArticleEditorForm__menuItem"
                        onClick={() => {
                          if (isDisabled) return;
                          handleSaveDraft();
                        }}
                        disabled={isDisabled}
                      >
                        Сохранить как черновик
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    py: 0.75,
                    minWidth: 96,
                    height: 36,
                    textTransform: "none",
                    fontSize: 14,
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    "&:hover": {
                      backgroundColor: "var(--accent-secondary)",
                      borderColor: "var(--accent-secondary)",
                    },
                  }}
                  onClick={() => navigate(-1)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Правая карточка: предпросмотр */}
        {isPreviewOpen && (
          <div className="ArticleEditorPage__card ArticleEditorPage__card--preview">
            <div className="ArticleEditorPreview__header">
              <div className="ArticleEditorPreview__title">Предпросмотр</div>
            </div>

            <div className="ArticleEditorPreview__scroll">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {`# ${form.title || "Без названия"}\n\n${form.content || ""}`}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
