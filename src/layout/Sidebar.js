// src/layout/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Dashboard" },
  { path: "/articles", label: "Articles" },
  { path: "/faq", label: "FAQ" },
  { path: "/about", label: "About" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
