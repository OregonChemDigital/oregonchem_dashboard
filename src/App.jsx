import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import { LoadingProvider } from "./contexts/loadingContext";
import { ViewModeProvider } from "./contexts/ViewModeContext";
import LoadingSpinner from "./components/LoadingSpinner";
import SuccessMessage from "./components/SuccessMessage";
import { useLoading } from "./contexts/loadingContext";
import AppRoutes from "./routes/routes";
import { getAuthToken } from "./utils/getAuthToken";
import "./App.css";

const AppContent = () => {
  const { isLoading, successMessage, showSuccess } = useLoading();

  const handleGetToken = async () => {
    const token = await getAuthToken();
    if (token) {
      // Copy token to clipboard
      navigator.clipboard.writeText(token);
      showSuccess('Token copied to clipboard!');
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => showSuccess(null)}
        />
      )}
      <button 
        onClick={handleGetToken}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Get Auth Token
      </button>
      <AppRoutes />
    </>
  );
};

const App = () => {
  return (
    <Router>
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
