import { useLocation, Link } from "react-router-dom";
import "./App.css";

function NotFound404() {
  const location = useLocation();

  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <h2 className="not-found-subtitle">Страница не найдена</h2>
      <p className="not-found-message">
        Запрошенный URI: <code className="not-found-uri">{location.pathname}</code>
      </p>
      <Link to="/" className="not-found-link">
        Вернуться на главную
      </Link>
    </div>
  );
}

export default NotFound404;

