import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ARTICLES_ENDPOINT } from "../config/api";
import { useAuth } from "../auth/AuthContext";
import "./ArticlesListPage.css";

import { ReactComponent as EditIcon } from "../assets/icons/edit.svg";
import { ReactComponent as ToggleIcon } from "../assets/icons/hide.svg";
import { ReactComponent as DeleteIcon } from "../assets/icons/trash.svg";

function ArticlesListPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, token, isAuth, logout, refresh } = useAuth();
  const isModerator =
    isAuth &&
    user &&
    (user.role?.name === "moderator" || user.role_id === 2);

  const loadArticles = useCallback(async () => {
    const controller = new AbortController();

    try {
      setIsLoading(true);

      const url = new URL(ARTICLES_ENDPOINT);
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
  }, [token, refresh, logout]);

  useEffect(() => {
    const abort = loadArticles();
    // loadArticles возвращает функцию, но здесь мы можем
    // просто проигнорировать или чуть поправить реализацию.
    // Для простоты:
    return () => {
      if (typeof abort === "function") {
        abort();
      }
    };
  }, [loadArticles]);

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
      // после успешного toggle заново подгружаем список
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

      // после удаления перезагружаем список
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

  const renderAuthor = (article) => {
    if (article.author_first_name || article.author_last_name) {
      return `${article.author_first_name ?? ""} ${
        article.author_last_name ?? ""
      }`.trim();
    }
    return article.author_login ?? "—";
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
                <th>Название</th>
                <th>Автор</th>
                <th>Опубликовано</th>
                <th>Изменено</th>
                {isModerator && <th>Статус</th>}
                {isModerator && <th>Действия</th>}
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
                  <td>
                    <Link
                      to={`/articles/${article.article_id}`}
                      className="ArticlesTable__titleLink"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td>{renderAuthor(article)}</td>
                  <td>
                    {formatDate(
                      article.published_at ?? article.created_at
                    )}
                  </td>
                  <td>{formatDate(article.updated_at)}</td>
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
                      className="ArticlesTable__actionsCell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="ArticlesTable__actionIconButton"
                        aria-label="Редактировать"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/articles/${article.article_id}/edit`);
                        }}
                      >
                        <EditIcon />
                      </button>

                      <button
                        type="button"
                        className="ArticlesTable__actionIconButton"
                        aria-label={
                          article.is_published ? "Скрыть" : "Опубликовать"
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
