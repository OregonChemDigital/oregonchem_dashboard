import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import Routes from "./routes/routes";
import Navbar from "./components/Navbar/Navbar";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;