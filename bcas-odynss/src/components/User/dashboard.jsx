import React, { useEffect } from "react";
import InsertForm from "./user";
import logo from "../../assets/images/logo.png";
import { Button } from "primereact/button";
import { PanelMenu } from "primereact/panelmenu";
import { useNavigate, useLocation } from "react-router-dom";
import { createRoot } from "react-dom";
import DataView from "../SuperAdmin/datatable";
import ReturnItemPage from "../SuperAdmin/returnitem";
import BrokenItems from "../SuperAdmin/brokenitem";

const UserDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const asAdmin = sessionStorage.getItem("asAdmin");
    if (asAdmin === "true") {
      navigate("/superadmin"); // or navigate to user page based on your logic
    }
  }, [navigate]);

  const logout = () => {
    // Call navigate within the component function
    sessionStorage.clear();
    navigate("/");
  };

  const items = [
    {
      label: "Item Management",
      icon: "pi pi-fw pi-pencil",
      items: [
        {
          label: "Item View",
          icon: "pi pi-fw pi-plus",
          command: () => {
            renderInterfaceContent(<DataView />);
          },
        },
        {
          label: "Return Item",
          icon: "pi pi-fw pi-bookmark",
          command: () => {
            renderInterfaceContent(<ReturnItemPage />);
          },
        },
        {
          label: "Broken Item",
          icon: "pi pi-fw pi-bookmark-fill",
          command: () => {
            renderInterfaceContent(<BrokenItems />);
          },
        },
      ],
    },
  ];

  const renderInterfaceContent = (content) => {
    const interfaceDiv = document.getElementById("Interface");
    interfaceDiv.innerHTML = ""; // Clear previous content
    createRoot(interfaceDiv).render(content);
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
        <div id="Menu" className="bg-white w-2 h-screen shadow-2">
          <div className="bg-gray-200 p-3 text-center">
            <p>
              <b>Welcome Back! </b>
            </p>
            <p className="text-primary font-semibold"></p>
          </div>
          <div className="card flex flex-col justify-content-start h-full">
            <PanelMenu model={items} className="w-full flex-shrink" />
          </div>
        </div>
        <div id="Interface" className="w-auto m-2 flex-grow-1"></div>
      </div>
    </div>
  );
};

export default UserDashboard;
