import React from "react";
import Admin from "./admin";
import logo from "../../assets/images/logo.png";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useNavigate } from "react-router-dom";

let items = [
  { label: "New", icon: "pi pi-fw pi-plus" },
  { label: "Borrowed Items", icon: "pi pi-fw pi-trash" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Call navigate within the component function
    navigate("/");
  };

  return (
    <div>
      <div className="flex overflow-hidden bg-primary w-auto shadow-2 sticky-top">
        <img
          src={logo}
          alt="Logo"
          className="ml-3 mt-2"
          style={{ height: "40px" }}
        />
        <p className="font-bold p-2 m-2">BCAS-ODYNSS</p>
        <div className="ml-auto p-2">
          <Button
            icon="pi pi-sign-out"
            className="text-white"
            label="Logout"
            onClick={logout}
            text
          />
        </div>
      </div>
      <div id="Content" className="flex flex-row flex-wrap overflow-hidden">
        <div id="Menu" className="bg-primary-300 w-2 max-h-full shadow-2">
          <div className="card flex flex-col justify-content-start h-full">
            <Menu model={items} className="w-full flex-shrink" />
          </div>
        </div>
        <div id="Interface" className="w-auto m-2 flex-grow-1">
          <Admin />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
