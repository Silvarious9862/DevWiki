// src/articles/ArticleEditor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useBreadcrumbs } from "../layout/BreadcrumbContext";
import { useAuth } from "../auth/AuthContext";
import "./ArticleEditor.css";

import Button from "@mui/joy/Button";

export default function ArticleEditor() {
  const navigate = useNavigate();
  const { setItems } = useBreadcrumbs();
  const { user, isAuth } = useAuth();
  const { createArticle } = useApi();

  const [form, setForm] = useState({
    title: "",
    content: "",
    category_id: "",
  });

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
    setItems([{ label: "Новая статья" }]);
    return () => setItems([]);
  }, [setItems]);

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
      const created = await createArticle(payload);
      navigate(`/articles/${created.article_id}`);
    } catch (e) {
      setError(e.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
      setIsMenuOpen(false);
    }
  };

  const handlePublish = () => submitArticle(true);
  const handleSaveDraft = () => submitArticle(false);

  return (
    <div className="ArticleEditorPage">
      <div className="ArticleEditorPage__header">
        <h1>Новая статья</h1>
        <div className="ArticleEditorPage__subtitle">
          Напишите статью в Markdown, затем сохраните как черновик или сразу опубликуйте.
        </div>
      </div>

      <div className="ArticleEditorPage__card">
        {error && (
          <div className="ArticleEditorPage__error">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault(); // всё сохраняем через наши кнопки
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

          <div className="ArticleEditorForm__field">
            <label className="ArticleEditorForm__label">
              Контент (Markdown)
            </label>
            <textarea
              className="ArticleEditorForm__textarea"
              value={form.content}
              onChange={handleChange("content")}
              rows={20}
            />
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
                  {/* левая часть – «Опубликовать» */}
                  <span
                    className="ArticleEditorSplitButton__main"
                    onClick={(e) => {
                      if (isDisabled) return;
                      e.stopPropagation();
                      handlePublish();
                    }}
                  >
                    {saving ? "Сохранение…" : "Опубликовать"}
                  </span>

                  {/* правая часть – стрелка */}
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
    </div>
  );
}
