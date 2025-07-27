import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateFormPage from './pages/CreateFormPage';
import ViewFormPage from './pages/ViewFormPage';
import ResponsesPage from './pages/ResponsesPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>Feedback Collection System</h1>
        </header>
        <main>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route 
              path="/create-form" 
              element={isAuthenticated ? <CreateFormPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/form/:formId" 
              element={isAuthenticated ? <ViewFormPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/responses/:formId" 
              element={isAuthenticated ? <ResponsesPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;