import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-icons">
          <a class="footer-icon">⧉</a> {/* Instagram */}
          <a class="footer-icon">♪</a> {/* TikTok */}
          <a class="footer-icon">✕</a> {/* X/Twitter */}
          <a class="footer-icon">✉</a> {/* Email */}
        </div>

        <p className="footer-text">
          © {new Date().getFullYear()} Fitness Marketplace — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
