import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../App'; // Import useAuth from the centralized context

// --- Import Pages ---
import Home from './Home';
import Products from './Products';
import Login from './Login';
import Signup from './Signup';
import Wishlist from './Wishlist';
import Orders from './Orders';
import Checkout from './Checkout';
import VendorDashboard from './VendorDashboard';
import AdminPanel from './AdminPanel';
import NotFound from './NotFound';

// --------------------------------------------------------------------------
// Private Route Component (Authentication Guard - T2, AD-2)
// --------------------------------------------------------------------------
const PrivateRoute = ({ allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const rolesArray = allowedRoles.split(',').map(r => r.trim());
        if (!rolesArray.includes(role)) {
            // Forbidden access
            return <Navigate to="/" replace />;
        }
    }
    
    return <Outlet />; 
};


// --------------------------------------------------------------------------
// Main Router Component
// --------------------------------------------------------------------------
const AppRouter = () => {
    const { isAuthenticated } = useAuth();
    
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<p>Product Detail Page (TODO)</p>} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

            {/* PROTECTED ROUTES (T2, AD-2) */}
            <Route element={<PrivateRoute allowedRoles="customer, vendor, admin" />}>
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/my-orders" element={<Orders />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-orders/:orderId" element={<p>Order Detail (TODO)</p>} />
            </Route>

            {/* Vendor Management Access (AD-2, VR-4) */}
            <Route element={<PrivateRoute allowedRoles="vendor, admin" />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                {/* Note: Product management routes can be nested under /vendor/products */}
            </Route>
            
            {/* Admin Exclusive Access (AD-2, AD-3, AD-5) */}
            <Route element={<PrivateRoute allowedRoles="admin" />}>
                <Route path="/admin/panel" element={<AdminPanel />} />
            </Route>
            
            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;