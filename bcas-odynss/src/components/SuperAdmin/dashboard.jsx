import React, { useEffect, useState } from "react";
import Superadmin from "./superadmin";
import Register from "./register";
import DataView from "./datatable";
import Department from "./department";
import ItemCategory from "./itemcategory";
import SubCategoryPage from "./itemsubcategory";
import UniqueFeaturePage from "./uniquefeature";
import UniqueFeatureValuePage from "./uniquefeaturevalue";
import LocationPage from "./location";
import BrokenItems from "./brokenitem";
import ReturnItemPage from "./returnitem";
import logo from "../../assets/images/logo.png";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";
import { createRoot } from "react-dom";
import { PanelMenu } from "primereact/panelmenu";

const SuperadminDashboard = () => {
  const items = [
    {
      label: "Users",
      icon: "pi pi-fw pi-user",
      items: [
        {
          label: "User List",
          icon: "pi pi-fw pi-users",
          command: () => {
            renderInterfaceContent(<Superadmin />);
          },
        },
        {
          label: "New User",
          icon: "pi pi-fw pi-user-plus",
          command: () => {
            renderInterfaceContent(<Register />);
          },
        },
      ],
    },
    {
      label: "Category Design",
      icon: "pi pi-fw pi-file",
      items: [
        {
          label: "Department",
          icon: "pi pi-fw pi-trash",
          command: () => {
            renderInterfaceContent(<Department userId={userData.user_id} />);
          },
        },
        {
          label: "Item Category",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderInterfaceContent(<ItemCategory />);
          },
        },
        {
          label: "Item Subcategory",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderInterfaceContent(<SubCategoryPage />);
          },
        },
        {
          label: "Unique Feature",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderInterfaceContent(<UniqueFeaturePage />);
          },
        },
        {
          label: "Unique Feature Values",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderInterfaceContent(<UniqueFeatureValuePage />);
          },
        },
        {
          label: "Location",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderInterfaceContent(<LocationPage />);
          },
        },
      ],
    },
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
    {
      label: "Logs",
      icon: "pi pi-fw pi-history",
      items: [
        {
          label: "Borrow Logs",
          icon: "pi pi-fw pi-history",
        },
        {
          label: "Return Logs",
          icon: "pi pi-fw pi-history",
        },
        {
          label: "Category Logs",
          icon: "pi pi-fw pi-history",
        },
      ],
    },
  ];

  const renderInterfaceContent = (content) => {
    const interfaceDiv = document.getElementById("Interface");
    interfaceDiv.innerHTML = ""; // Clear previous content
    createRoot(interfaceDiv).render(content);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const asUser = sessionStorage.getItem("asUser");
    if (asUser === "true") {
      navigate("/user"); // or navigate to user page based on your logic
    }
  }, [navigate]);

  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  const logout = () => {
    // Call navigate within the component function
    sessionStorage.clear();
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
        <div id="Menu" className="bg-white w-2 h-screen shadow-2">
          <div className="bg-gray-200 p-3 text-center">
            <p>
              <b>Welcome Back! </b>
            </p>
            <p className="text-primary font-semibold">
              {userData.firstName} {userData.lastName}
            </p>
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

export default SuperadminDashboard;
