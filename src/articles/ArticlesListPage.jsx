// src/articles/ArticlesListPage.jsx

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ARTICLES_ENDPOINT } from "../config/api";
import { useAuth } from "../auth/AuthContext";
import "./ArticlesListPage.css";

import { ArticleStatsBadge } from "./ArticleStatsBadge";
import ArticleTags from "./ArticleTags";
import ArticlesSearchBar, {
  parseQuery,
  buildQueryString,
} from "./ArticlesSearchBar";
import { useApi } from "../hooks/useApi";

import { ReactComponent as EditIcon } from "../assets/icons/edit.svg";
import { ReactComponent as ToggleIcon } from "../assets/icons/hide.svg";
import { ReactComponent as DeleteIcon } from "../assets/icons/trash.svg";

function ArticlesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, token, isAuth, logout, refresh } = useAuth();
  const { resolveAuthorByName, resolveCategoryByName } = useApi();

  const isModerator =
    isAuth &&
    user &&
    (user.role?.name === "moderator" || user.role_id === 2);

  const loadArticles = useCallback(
    async (filters = {}) => {
      const controller = new AbortController();

      try {
        setIsLoading(true);

        const url = new URL(ARTICLES_ENDPOINT);

        if (filters.title) {
          url.searchParams.append("query", filters.title);
        }

        if (filters.tagIds && filters.tagIds.length > 0) {
          filters.tagIds.forEach((id) =>
            url.searchParams.append("tag_ids", String(id))
          );
        }

        if (filters.authorId) {
          url.searchParams.append("author_id", String(filters.authorId));
        }

        if (filters.categoryId) {
          url.searchParams.append("category_id", String(filters.categoryId));
        }

        let currentToken = token;

        let res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: currentToken
            ? { Authorization: `Bearer ${currentToken}` }
            : {},
        });

        if (res.status === 401 && refresh) {
          const newToken = await refresh();
          if (newToken) {
            currentToken = newToken;
            res = await fetch(url.toString(), {
              signal: controller.signal,
              headers: { Authorization: `Bearer ${currentToken}` },
            });
          } else {
            await logout();
            return;
          }
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Failed to load articles", e);
          setArticles([]);
        }
      } finally {
        setIsLoading(false);
      }

      return () => controller.abort();
    },
    [token, refresh, logout]
  );

  const [authorId, setAuthorId] = useState(null);
  const [authorError, setAuthorError] = useState("");

  const initialRawQuery = searchParams.get("q") || "";

  
  const initialCategoryId = searchParams.get("category_id");
  const initialCategoryNameParam = searchParams.get("category_name");
  const initialCategoryName = initialCategoryNameParam
    ? decodeURIComponent(initialCategoryNameParam)
    : "";
  const parsedInitial = parseQuery(initialRawQuery);

  const effectiveInitialCategoryName =
    initialCategoryName || parsedInitial.categoryName || "";

  const composedInitialQuery = buildQueryString(
    parsedInitial.title,
    parsedInitial.tagIds,
    parsedInitial.authorName,
    effectiveInitialCategoryName
  );

  const handleSearch = useCallback(
    async ({
      raw,
      title,
      tagIds,
      authorName,
      categoryName,
      categoryId,
    }) => {
      setAuthorError("");

      let nextAuthorId = null;
      let nextCategoryId = categoryId ?? null;

      // 1. Резолвим категорию по имени, если id нет
      if (categoryName && !nextCategoryId) {
        try {
          const cat = await resolveCategoryByName(categoryName.trim());
          nextCategoryId = cat.id;
        } catch (e) {
          console.error("Failed to resolve category", e);
          nextCategoryId = null;
        }
      }

      // 2. Обновляем URL
      const params = {};
      if (raw) params.q = raw;
      if (nextCategoryId) params.category_id = String(nextCategoryId);
      if (categoryName) params.category_name = encodeURIComponent(categoryName);
      setSearchParams(params);

      // 3. Если автор не указан — title/tags/category
      if (!authorName || !authorName.trim()) {
        await loadArticles({
          title,
          tagIds,
          categoryId: nextCategoryId || undefined,
        });
        return;
      }

      // 4. Автор указан — резолвим автора
      try {
        const data = await resolveAuthorByName(authorName.trim());
        nextAuthorId = data.id;
        setAuthorId(nextAuthorId);
      } catch (e) {
        console.error("Failed to resolve author", e);
        setAuthorId(null);
        setAuthorError("Автор не найден");
        return;
      }

      // 5. Поиск с author_id и category_id
      await loadArticles({
        title,
        tagIds,
        authorId: nextAuthorId,
        categoryId: nextCategoryId || undefined,
      });
    },
    [loadArticles, resolveAuthorByName, resolveCategoryByName, setSearchParams]
  );

  useEffect(() => {
    const parsed = parsedInitial;

    const categoryId = initialCategoryId ? Number(initialCategoryId) : undefined;

    loadArticles({
      title: parsed.title,
      tagIds: parsed.tagIds,
      categoryId,
    });
  }, [initialRawQuery, initialCategoryId, initialCategoryName, loadArticles]);



  const handleTagClick = (tag) => {
    const id = tag.tag_id || tag.id;

    const currentRaw = searchParams.get("q") || "";
    const parsed = parseQuery(currentRaw); // { title, tagIds, authorName, categoryName }

    const tagIdsSet = new Set(parsed.tagIds);
    tagIdsSet.add(id);
    const newTagIds = Array.from(tagIdsSet);

    // если категории нет в q, берём из URL
    const effectiveCategoryName =
      parsed.categoryName || initialCategoryName || "";

    const newRaw = buildQueryString(
      parsed.title,
      newTagIds,
      parsed.authorName,
      effectiveCategoryName
    );

    handleSearch({
      raw: newRaw,
      title: parsed.title,
      tagIds: newTagIds,
      authorName: parsed.authorName,
      categoryName: effectiveCategoryName,
    });
  };

  const renderAuthor = (article) => {
    if (article.author_first_name || article.author_last_name) {
      return `${article.author_first_name ?? ""} ${
        article.author_last_name ?? ""
      }`.trim();
    }
    return article.author_login ?? "—";
  };

  const handleCategoryClick = (article, e) => {
    e.stopPropagation();

    const categoryName = article.category_name;
    if (!categoryName) {
      navigate(`/articles/${article.article_id}`);
      return;
    }

    const currentRaw = searchParams.get("q") || "";
    const parsed = parseQuery(currentRaw); // { title, tagIds, authorName, categoryName }

    // Подставляем категорию из статьи
    const newRaw = buildQueryString(
      parsed.title,
      parsed.tagIds,
      parsed.authorName,
      categoryName
    );

    handleSearch({
      raw: newRaw,
      title: parsed.title,
      tagIds: parsed.tagIds,
      authorName: parsed.authorName,
      categoryName,
    });
  };

  const handleAuthorClick = async (article, e) => {
    e.stopPropagation();

    const name = renderAuthor(article);
    if (!name || name === "—") return;

    const currentRaw = searchParams.get("q") || "";
    const parsed = parseQuery(currentRaw); // title, tagIds, authorName, categoryName

    const effectiveCategoryName =
      parsed.categoryName || initialCategoryName || "";

    const newRaw = buildQueryString(
      parsed.title,
      parsed.tagIds,
      name,                 // новый автор
      effectiveCategoryName
    );

    await handleSearch({
      raw: newRaw,
      title: parsed.title,
      tagIds: parsed.tagIds,
      authorName: name,
      categoryName: effectiveCategoryName,
    });
  };


  const handleTogglePublish = async (articleId) => {
    if (!token) return;

    let currentToken = token;
    const url = `${ARTICLES_ENDPOINT}/${articleId}/toggle-publish`;

    try {
      let res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.status === 401 && refresh) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          return;
        }
        currentToken = newToken;
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      await res.json();
      await loadArticles();
    } catch (e) {
      console.error("Failed to toggle publish", e);
    }
  };

  const handleDelete = async (articleId) => {
    if (!token) return;
    if (!window.confirm("Точно удалить статью?")) return;

    let currentToken = token;
    const url = `${ARTICLES_ENDPOINT}/${articleId}`;

    try {
      let res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.status === 401 && refresh) {
        const newToken = await refresh();
        if (!newToken) {
          await logout();
          return;
        }
        currentToken = newToken;
        res = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }

      if (!res.ok && res.status !== 204) {
        throw new Error(`HTTP ${res.status}`);
      }

      await loadArticles();
    } catch (e) {
      console.error("Failed to delete article", e);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const shifted = new Date(d.getTime() + 3 * 60 * 60 * 1000);
    const date = shifted.toLocaleDateString("ru-RU");
    const time = shifted.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  };

  return (
    <div className="ArticlesListPage">
      <header className="ArticlesListPage__header">
        <div className="ArticlesListPage__headerRow">
          <h1>Все статьи</h1>

          {isModerator && (
            <Link
              to="/articles/new"
              className="ArticlesListPage__newButton"
            >
              Создать новую
            </Link>
          )}
        </div>

        <ArticlesSearchBar
          initialQuery={composedInitialQuery}
          onSearch={handleSearch}
        />

        {authorError && (
          <p className="ArticlesListPage__error">{authorError}</p>
        )}
      </header>

      {isLoading ? (
        <p>Загрузка…</p>
      ) : articles.length === 0 ? (
        <p>Статей пока нет.</p>
      ) : (
        <div className="ArticlesListPage__tableWrapper">
          <table className="ArticlesTable">
            <thead>
              <tr>
                <th className="ArticlesTable__nameHeader">Название</th>
                <th className="ArticlesTable__categoryHeader">Категория</th>
                <th className="ArticlesTable__authorHeader">Автор</th>
                <th className="ArticlesTable__publishedHeader">Опубликовано</th>
                {isModerator && (
                  <th className="ArticlesTable__editedHeader">Изменено</th>
                )}
                {isModerator && (
                  <th className="ArticlesTable__statusHeader">Статус</th>
                )}
                {isModerator && (
                  <th className="ArticlesTable__actionsHeader">Действия</th>
                )}
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.article_id}
                  className="ArticlesTable__row"
                  onClick={() => {
                    window.location.href = `/articles/${article.article_id}`;
                  }}
                >
                  <td
                    className="ArticlesTable__cell-title"
                    onClick={() =>
                      navigate(`/articles/${article.article_id}`)
                    }
                  >
                    <div className="ArticlesTable__titleRow">
                      <div className="ArticlesTable__titleText">
                        {article.title}
                      </div>
                    </div>

                    <div className="ArticlesTable__metaRow">
                      <ArticleStatsBadge
                        viewCount={article.view_count}
                        likesCount={article.likes_count}
                        dislikesCount={article.dislikes_count}
                        commentsCount={article.comments_count}
                        userReaction={article.user_reaction}
                      />
                    </div>

                    <div
                      className="ArticlesTable__tagsRow"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArticleTags
                        tagIds={article.tag_ids}
                        clickable
                        compact
                        onTagClick={handleTagClick}
                      />
                    </div>
                  </td>
                  
                  <td
                    className="ArticlesTable__category"
                    onClick={(e) => handleCategoryClick(article, e)}
                  >
                    {article.category_name || "—"}
                  </td>

                  <td
                    className="ArticlesTable__author"
                    onClick={(e) => handleAuthorClick(article, e)}
                  >
                    {renderAuthor(article)}
                  </td>
                  <td>
                    {formatDate(
                      article.published_at ?? article.created_at
                    )}
                  </td>
                  {isModerator && (
                    <td>{formatDate(article.updated_at)}</td>
                  )}
                  {isModerator && (
                    <td
                      className={
                        "ArticlesTable__statusCell " +
                        (article.is_published
                          ? "ArticlesTable__statusCell--published"
                          : "ArticlesTable__statusCell--draft")
                      }
                    >
                      <span>
                        {article.is_published
                          ? "Опубликована"
                          : "Черновик"}
                      </span>
                    </td>
                  )}
                  {isModerator && (
                    <td
                      className="ArticlesTable__cell-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="ArticlesTable__actionIconButton"
                        aria-label="Редактировать"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/articles/${article.article_id}/edit`
                          );
                        }}
                      >
                        <EditIcon />
                      </button>

                      <button
                        type="button"
                        className="ArticlesTable__actionIconButton"
                        aria-label={
                          article.is_published
                            ? "Скрыть"
                            : "Опубликовать"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(article.article_id);
                        }}
                      >
                        <ToggleIcon />
                      </button>

                      <button
                        type="button"
                        className="ArticlesTable__actionIconButton ArticlesTable__actionIconButton--delete"
                        aria-label="Удалить"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article.article_id);
                        }}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ArticlesListPage;
