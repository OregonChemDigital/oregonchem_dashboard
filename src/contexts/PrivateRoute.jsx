import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const PrivateRoute = ({ children }) => {
  const { userLoggedIn } = useAuth();

  console.log("PrivateRoute - User Logged In:", userLoggedIn);

  return userLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;