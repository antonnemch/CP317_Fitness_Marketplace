import React from "react";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={active ? "tabs-btn active" : "tabs-btn"}
  >
    {children}
  </button>
);

export default TabButton;