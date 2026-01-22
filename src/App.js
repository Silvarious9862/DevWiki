import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SystemHealthWidget from "./SystemHealthWidget";
import NotFound404 from "./NotFound404";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* корневая страница */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <h1>Wiki Frontend</h1>
            </MainLayout>
          } 
        />

        {/* health-страница */}
        <Route path="/health" element={<SystemHealthWidget />} />

        {/* 404 - catch-all маршрут для несуществующих путей */}
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </Router>
  );
}

export default App;
