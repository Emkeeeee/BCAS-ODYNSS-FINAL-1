import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/login";
import UserDashboard from "./components/User/dashboard";
import SuperadminDashboard from "./components/SuperAdmin/dashboard";
import ForgotPassword from "./pages/Login/forgotpass";
import ChangePassword from "./pages/Login/changepass";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/superadmin" element={<SuperadminDashboard />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/changepassword/:token" element={<ChangePassword />} />
    </Routes>
  );
}

export default App;
