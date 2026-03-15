import { useEffect, useState } from "react";
import "./SystemHealthWidget.css";
import { API_BASE } from "./config/api"
const HEALTH_URL = `${API_BASE}/health`;

function StatusBadge({ label, status }) {
  const emoji = status === "ok" ? "🟢" : "🔴";

  return (
    <div className="status-row">
      <span className="status-label">{label}:</span>
      <span className="status-value">
        {emoji} {status === "ok" ? "Alive" : "Error"}
      </span>
    </div>
  );
}

function SystemHealthWidget() {
  const [status, setStatus] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  const fetchHealth = () => {
    fetch(HEALTH_URL)
      .then((res) => res.json())
      .then((data) => {
        setConnectionError(false);
        setStatus(data);
      })
      .catch(() => {
        setConnectionError(true);
        setStatus(null);
      });
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  if (connectionError) {
    return (
      <div className="health-root health-root-error">
        <header>
          <h1 className="health-title">Wiki Frontend</h1>
        </header>
        <main>
          <div className="health-widget health-widget-error">
            <h3 className="health-widget-title">System Health</h3>
            <div className="health-error-text">App: 🔴 ERR_CON_BACK</div>
          </div>
        </main>
      </div>
    );
  }

  if (!status) return <p>Loading system health...</p>;

  return (
    <div className="health-root">
      <h1 className="health-title">Wiki Health</h1>
      <div className="health-center">
        <div className="health-widget">
          <h3 className="health-widget-title">System Health</h3>
          <StatusBadge label="App" status={status.app?.status} />
          <StatusBadge label="DB" status={status.db?.status} />
          <StatusBadge label="Front" status={status.front?.status} />
        </div>
      </div>
    </div>
  );
}

export default SystemHealthWidget;
