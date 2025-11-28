import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SystemHealthWidget from "./SystemHealthWidget";

function App() {
  return (
    <Router>
      <Routes>
        {/* корневая страница */}
        <Route path="/" element={<h1>Wiki Frontend</h1>} />

        {/* health-страница */}
        <Route path="/health" element={<SystemHealthWidget />} />
      </Routes>
    </Router>
  );
}

export default App;
