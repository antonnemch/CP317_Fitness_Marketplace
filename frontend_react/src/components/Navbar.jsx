import React, { useState, useEffect } from "react";
import "../styles/components.css";

export default function Navbar({ user, onTab, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.body.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark");
    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const link = (label, route) => (
    <button
      onClick={() => {
        onTab(route);
        setMenuOpen(false);
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <nav className="navbar">
        <h1 className="navbar-title" onClick={() => onTab("home")}>
          Fitness Marketplace
        </h1>

 
        <div className="navbar-links">
          {link("Home", "home")}
          {link("Products", "products")}
          {link("Register", "register")}
          {link("Login", "login")}

          {user?.role === "vendor" && link("Vendor Dashboard", "manage")}

          {user && (
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            {dark ? "⚫" : "⚪"}
          </button>
        </div>

   
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </nav>

     
      {menuOpen && (
        <div className="mobile-menu">
          {link("Home", "home")}
          {link("Products", "products")}
          {link("Register", "register")}
          {link("Login", "login")}

          {user?.role === "vendor" && link("Vendor Dashboard", "manage")}

          {user && (
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            {dark ? "⚫" : "⚪"}
          </button>
        </div>
      )}
    </>
  );
}
