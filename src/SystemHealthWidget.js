import { useEffect, useState } from "react";

function StatusBadge({ label, status }) {
  const color = status === "ok" ? "green" : "red";
  const emoji = status === "ok" ? "🟢" : "🔴";

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}
    >
      <span style={{ fontWeight: "bold", width: "80px", textAlign: "center" }}>
        {label}:
      </span>
      <span
        style={{
          color,
          fontWeight: "bold",
          marginLeft: "8px",
          textAlign: "left",
        }}
      >
        {emoji} {status === "ok" ? "Alive" : "Error"}
      </span>
    </div>
  );
}

function SystemHealthWidget() {
  const [status, setStatus] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  // функция загрузки данных
  const fetchHealth = () => {
    fetch("http://192.168.100.20:8000/health")
      .then((res) => res.json())
      .then((data) => {
        setConnectionError(false);
        setStatus(data);
      })
      .catch((err) => {
        setConnectionError(true);
        setStatus(null);
      });
  };

  useEffect(() => {
    fetchHealth(); // первый запрос при монтировании
    const interval = setInterval(fetchHealth, 5000); // обновление каждые 5 секунд
    return () => clearInterval(interval); // очистка таймера при размонтировании
  }, []);

  if (connectionError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
        class="page"
      >
        <header>
          <h1>Wiki Frontend</h1>
        </header>
        <main>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              width: "200px",
              backgroundColor: "#f9f9f9",
              textAlign: "center",
            }}
            class="widget"
          >
            <h3 style={{ marginBottom: "12px" }}>System Health</h3>
            <div style={{ color: "red", fontWeight: "bold" }}>
              App:🔴 ERR_CON_BACK
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!status) return <p>Loading system health...</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Wiki Health</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          //height: "50vh"
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            width: "200px",
            backgroundColor: "#f9f9f9",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>System Health</h3>
          <StatusBadge label="App" status={status.app?.status} />
          <StatusBadge label="DB" status={status.db?.status} />
          <StatusBadge label="Front" status={status.front?.status} />
        </div>
      </div>
    </div>
  );
}

export default SystemHealthWidget;
