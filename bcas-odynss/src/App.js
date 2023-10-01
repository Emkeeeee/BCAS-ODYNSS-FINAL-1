import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Admin from "./components/Admin/admin";
import Login from "./components/Login/login";
import Superadmin from "./components/SuperAdmin/superadmin";
import InsertForm from "./components/User/user";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/user" element={<InsertForm />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/superadmin" element={<Superadmin />} />
    </Routes>
  );
}

export default App;
