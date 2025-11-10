// import React, { useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/login", { email, password });
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", res.data.role);
//       navigate("/");
//     } catch (err) {
//       setError("Invalid credentials. Try again.");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Login</h2>
//       <form onSubmit={handleLogin}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit">Login</button>
//       </form>
//       {error && <p className="error">{error}</p>}
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { loginUser } from "../api/auth-api"; 
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../App'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    try {
      // 1. Login user (saves token/user data to localStorage inside the API call)
      const user = await loginUser({ email, password }); 
      
      // 2. Update global state
      auth.login(user);

      // 3. Navigate based on role (AD-2)
      let redirectPath = "/";

      if (user.role === 'vendor') {
          redirectPath = "/vendor/dashboard";
      } else if (user.role === 'admin') {
          redirectPath = "/admin/panel";
      } else {
          redirectPath = "/products";
      }

      navigate(redirectPath, { replace: true });

    } catch (err) {
      const errorMessage = err.message || "Login failed. Check your email and password.";

      if (errorMessage.includes("Account suspended")) {
         setError("Login denied: Your account is suspended and under review. Contact support."); // AD-5 Feedback
      } else {
         setError(errorMessage);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>User Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <button type="submit" disabled={isLoading} className="primary-btn login-btn">
          {isLoading ? "Logging In..." : "Login"}
        </button>
      </form>
      
      {error && <p className="error-message">{error}</p>}
      
      <p className="register-prompt">
          Don't have an account? <Link to="/signup" className="link-text">Register here.</Link>
      </p>
    </div>
  );
};

export default Login;