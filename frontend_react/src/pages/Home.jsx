// import React from "react";
// import { Link } from "react-router-dom";

// const Home = () => {
//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Welcome to Fitness Marketplace</h1>
//       <p className="mb-4">Browse classes, trainers, and gear!</p>
//       <Link to="/products" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
//         View Products
//       </Link>
//     </div>
//   );
// };

// export default Home;

// -----------------------------------------------

import React from "react";
import { Link } from "react-router-dom";
// Make sure this import matches the location of your global AuthContext hook
import { useAuth } from '../App'; 

const Home = () => {
    // Access the global authentication state
    const { isAuthenticated, user } = useAuth();
    const role = user?.role;

    // Determines which action link to show based on login status and role (AD-2)
    const renderRoleSpecificActions = () => {
        if (!isAuthenticated) {
            return (
                <div className="home-actions">
                    <p className="home-subtext">Ready to join our community? Start tracking your progress today!</p>
                    <Link to="/login" className="action-link">
                        <button className="primary-btn">Login / Register 🔑</button>
                    </Link>
                </div>
            );
        }

        let linkPath;
        let buttonText;
        
        // Define paths based on role: Vendor Dashboard (VR-4), Admin Panel (AD-3/AD-5)
        if (role === 'vendor') {
            linkPath = "/vendor/dashboard";
            buttonText = "Go to Vendor Dashboard 📊";
        } else if (role === 'admin') {
            linkPath = "/admin/panel";
            buttonText = "Access Admin Tools ⚙️";
        } else {
            // Default for 'customer': Order Tracking (CR-3)
            linkPath = "/my-orders";
            buttonText = "View My Orders & History 📦";
        }

        return (
            <div className="home-actions">
                {/* User is authenticated, display welcome message */}
                <p className="home-welcome">Welcome back, **{user.email}**!</p>
                <Link to={linkPath} className="action-link">
                    <button className="primary-btn secondary-btn">{buttonText}</button>
                </Link>
            </div>
        );
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to FitLife 🏋️‍♀️</h1>
                <p className="tagline">Your fitness companion for tracking, tips, and motivation.</p>
            </header>

            <section className="product-cta">
                 <h2>Find Your Perfect Gear 💪</h2>
                 <p>Explore our wide range of products for all your fitness goals.</p>
                 <Link to="/products">
                    <button className="primary-btn">Browse All Products</button>
                 </Link>
            </section>
            
            {/* Conditional action links based on authentication */}
            <section className="role-specific-section">
                {renderRoleSpecificActions()}
            </section>
        </div>
    );
};

export default Home;