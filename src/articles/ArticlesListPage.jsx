import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ARTICLES_ENDPOINT } from "../config/api";
import "./ArticlesListPage.css";

function ArticlesListPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(ARTICLES_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error("Failed to load articles", e);
        setArticles([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

    const formatDate = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);

        // сдвиг +3 часа к UTC
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
            return `${article.author_first_name ?? ""} ${article.author_last_name ?? ""}`.trim();
        }
        return article.author_login ?? "—";
    };

  return (
    <div className="ArticlesListPage">
      <header className="ArticlesListPage__header">
        <h1>Все статьи</h1>
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
                    <td>
                        {renderAuthor(article)}
                    </td>
                    <td>{formatDate(article.published_at ?? article.created_at)}</td>
                    <td>{formatDate(article.updated_at)}</td>
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
