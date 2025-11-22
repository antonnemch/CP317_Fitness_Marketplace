import React from "react";
import "../styles/layout.css";

export default function PageContainer({ children }) {
  return (
    <main className="page-container">
      {children}
    </main>
  );
}
