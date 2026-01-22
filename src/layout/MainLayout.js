// src/layout/MainLayout.js
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

function MainLayout({ children }) {
  return (
    <div className="app-root">
      <Header />

      <div className="app-body">
        <Sidebar />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
