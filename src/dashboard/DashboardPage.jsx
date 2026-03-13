// src/dashboard/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import DashboardStats from "./DashboardStats";
import DashboardNewArticles from "./DashboardNewArticles";
import DashboardTopAuthors from "./DashboardTopAuthors";

import "./Dashboard.css";

export default function DashboardPage() {
  const { getStats, getNewArticles, getTopAuthors } = useApi();

  const [stats, setStats] = useState(null);
  const [newArticles, setNewArticles] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [s, na, ta] = await Promise.all([
          getStats(),
          getNewArticles(),
          getTopAuthors(),
        ]);
        if (cancelled) return;
        setStats(s);
        setNewArticles(na);
        setTopAuthors(ta);
      } catch (e) {
        if (!cancelled) setError(e.message || "Ошибка загрузки дашборда");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [getStats, getNewArticles, getTopAuthors]);

  if (loading) {
    return <>Загрузка дашборда…</>;
  }

  if (error) {
    return <>{error}</>;
  }

  // <-- один корневой элемент: React fragment
  return (
    <>
      <DashboardStats data={stats} />
      <DashboardNewArticles items={newArticles} />
      <DashboardTopAuthors items={topAuthors} />
    </>
  );
}
