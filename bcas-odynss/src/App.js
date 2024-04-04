import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/login";
import UserDashboard from "./components/User/dashboard";
import SuperadminDashboard from "./components/SuperAdmin/dashboard";
import AdminDashboard from "./components/Admin/dashboard";
import Register from "./components/SuperAdmin/register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/superadmin" element={<SuperadminDashboard />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
