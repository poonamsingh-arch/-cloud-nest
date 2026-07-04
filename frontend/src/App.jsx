import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;