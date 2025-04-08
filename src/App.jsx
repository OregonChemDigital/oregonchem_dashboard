import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import { LoadingProvider } from "./contexts/loadingContext";
import LoadingSpinner from "./components/LoadingSpinner";
import SuccessMessage from "./components/SuccessMessage";
import { useLoading } from "./contexts/loadingContext";
import AppRoutes from "./routes/routes";
import "./App.css";

const AppContent = () => {
  const { isLoading, successMessage, showSuccess } = useLoading();

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => showSuccess(null)}
        />
      )}
      <AppRoutes />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
