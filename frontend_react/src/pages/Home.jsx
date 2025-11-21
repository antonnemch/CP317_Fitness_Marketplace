import React from "react";
import "../styles/home.css";

export default function Home({ onTab }) {
  return (
    <div className="home-hero">
      <h1 className="home-title">Welcome to Fitness Marketplace</h1>

      <p className="home-subtitle">
        Browse classes, trainers, and fitness gear!
      </p>

      <button className="home-btn" onClick={() => onTab("products")}>
        View Products
      </button>
    </div>
  );
}
