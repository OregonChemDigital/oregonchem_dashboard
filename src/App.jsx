import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import AppRoutes from "./routes/routes"; // Ensure correct import
import CombinedAnalyticsDashboard from './components/CombinedAnalyticsDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
