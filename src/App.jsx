import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import { LoadingProvider } from "./contexts/loadingContext";
import { ViewModeProvider } from "./contexts/ViewModeContext";
import LoadingSpinner from "./components/ui/LoadingSpinner/LoadingSpinner";
import SuccessMessage from "./components/ui/SuccessMessage/SuccessMessage";
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
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <LoadingProvider>
          <ViewModeProvider>
            <AppContent />
          </ViewModeProvider>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
};

// Health check endpoint
export const healthCheck = () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: import.meta.env.NODE_ENV,
    version: import.meta.env.VITE_APP_VERSION,
    name: import.meta.env.VITE_APP_NAME
  };
};

export default App;
