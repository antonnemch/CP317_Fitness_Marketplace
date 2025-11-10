// import React, { useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// const Signup = () => {
//   const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
//   const navigate = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     await api.post("/signup", form);
//     navigate("/login");
//   };

//   return (
//     <div className="auth-container">
//       <h2>Sign Up</h2>
//       <form onSubmit={handleSignup}>
//         <input name="name" placeholder="Name" onChange={handleChange} required />
//         <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
//         <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
//         <select name="role" onChange={handleChange}>
//           <option value="customer">Customer</option>
//           <option value="vendor">Vendor</option>
//         </select>
//         <button type="submit">Create Account</button>
//       </form>
//     </div>
//   );
// };

// export default Signup;


import React, { useState } from "react";
import { registerUser } from "../api/auth-api"; 
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    role: "customer" 
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await registerUser(form); 
      
      if (form.role === 'vendor') {
        setSuccess("Registration successful! Your vendor account requires admin approval before you can start listing products."); // AD-1 Message
        setTimeout(() => navigate('/login'), 4000); 
      } else {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000); 
      }
      
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred during signup.";

      if (errorMessage.includes("Email already exists")) {
        setError("This email address is already registered. Please login.");
      } else {
        setError(errorMessage);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <label htmlFor="email">Email</label>
        <input 
          id="email" name="email" type="email" placeholder="Email address" 
          onChange={handleChange} value={form.email} required disabled={isLoading}
        />
        
        <label htmlFor="password">Password</label>
        <input 
          id="password" name="password" type="password" placeholder="Password (min 8 chars)" 
          onChange={handleChange} value={form.password} required disabled={isLoading}
        />
        
        <label htmlFor="role">Account Type</label>
        <select 
          id="role" name="role" onChange={handleChange} value={form.role} disabled={isLoading}
        >
          <option value="customer">Customer (Browse & Buy)</option>
          <option value="vendor">Vendor (Sell Products)</option>
        </select>

        <button type="submit" disabled={isLoading} className="primary-btn signup-btn">
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
      
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <p className="login-prompt">
          Already have an account? <Link to="/login" className="link-text">Log in here.</Link>
      </p>
    </div>
  );
};

export default Signup;