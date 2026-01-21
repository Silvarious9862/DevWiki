import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SystemHealthWidget from "./SystemHealthWidget";
import NotFound404 from "./NotFound404";

function App() {
  return (
    <Router>
      <Routes>
        {/* корневая страница */}
        <Route path="/" element={<h1>Wiki Frontend</h1>} />

        {/* health-страница */}
        <Route path="/health" element={<SystemHealthWidget />} />

        {/* 404 - catch-all маршрут для несуществующих путей */}
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </Router>
  );
}

export default App;
