import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Fitness Marketplace</h1>
      <p className="mb-4">Browse classes, trainers, and gear!</p>
      <Link to="/products" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        View Products
      </Link>
    </div>
  );
};

export default Home;
