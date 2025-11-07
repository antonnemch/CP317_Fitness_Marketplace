import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={{ textAlign: "center", marginTop: "3rem" }}>
    <h1>404 - Page Not Found 😔</h1>
    <Link to="/">Go back Home</Link>
  </div>
);

export default NotFound;

// import React from "react";
// import { Link } from "react-router-dom";

// const NotFound = () => (
//   <div className="p-6">
//     <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
//     <Link to="/" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
//       Go Home
//     </Link>
//   </div>
// );

// export default NotFound;
