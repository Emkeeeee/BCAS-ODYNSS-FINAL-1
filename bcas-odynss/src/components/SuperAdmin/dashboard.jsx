import React, { useEffect, useState, useRef } from "react";
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
import ReturnLogs from "./returnlogs";
import ItemLogs from "./itemlogs";
import CategoryLogs from "./categorylogs";
import BorrowLogs from "./borrowlogs";
import AccountLog from "./accountlog";
import logo from "../../assets/images/logo.png";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { PanelMenu } from "primereact/panelmenu";
import { Badge } from "primereact/badge";
import { OverlayPanel } from "primereact/overlaypanel";
import { ScrollPanel } from "primereact/scrollpanel";
import Home from "./home";
import axios from "axios";

const SuperadminDashboard = () => {
  const [content, setContent] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  useEffect(() => {
    fetchCountActive(userData.department);
  }, [userData.department]);

  const fetchCountActive = (id) => {
    axios
      .get(
        `http://localhost:5005/api/Inventory/RequestCountDepartment?deptId=${id}`
      )
      .then((response) => {
        setRequestCount(response.data);
      })
      .catch((error) => {
        console.error("Error fetching active accounts count:", error);
      });
  };

  const navigate = useNavigate();

  useEffect(() => {
    const asUser = sessionStorage.getItem("asUser");
    if (asUser === "true") {
      navigate("/user");
    }
  }, [navigate]);

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const renderContent = (contentComponent) => {
    setContent(contentComponent);
  };

  useEffect(() => {
    renderContent(<Home />);
  }, []);

  const items = [
    {
      label: "Dashboard",
      icon: "pi pi-fw pi-home",
      command: () => {
        renderContent(<Home />);
      },
    },
    {
      label: "Users",
      icon: "pi pi-fw pi-user",
      items: [
        {
          label: "User List",
          icon: "pi pi-fw pi-users",
          command: () => {
            renderContent(<Superadmin />);
          },
        },
        {
          label: "New User",
          icon: "pi pi-fw pi-user-plus",
          command: () => {
            renderContent(<Register />);
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
            renderContent(<Department userId={userData.user_id} />);
          },
        },
        {
          label: "Item Category",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderContent(<ItemCategory />);
          },
        },
        {
          label: "Item Subcategory",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderContent(<SubCategoryPage />);
          },
        },
        {
          label: "Unique Feature",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderContent(<UniqueFeaturePage />);
          },
        },
        {
          label: "Unique Feature Values",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderContent(<UniqueFeatureValuePage />);
          },
        },
        {
          label: "Location",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            renderContent(<LocationPage />);
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
            renderContent(<DataView />);
          },
        },
        {
          label: "Return Item",
          icon: "pi pi-fw pi-bookmark",
          command: () => {
            renderContent(<ReturnItemPage />);
          },
        },
        {
          label: "Broken Item",
          icon: "pi pi-fw pi-bookmark-fill",
          command: () => {
            renderContent(<BrokenItems />);
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
          command: () => {
            renderContent(<BorrowLogs />);
          },
        },
        {
          label: "Return Logs",
          icon: "pi pi-fw pi-history",
          command: () => {
            renderContent(<ReturnLogs />);
          },
        },
        {
          label: "Category Logs",
          icon: "pi pi-fw pi-history",
          command: () => {
            renderContent(<CategoryLogs />);
          },
        },
        {
          label: "Item Logs",
          icon: "pi pi-fw pi-history",
          command: () => {
            renderContent(<ItemLogs />);
          },
        },
        {
          label: "Account Logs",
          icon: "pi pi-fw pi-history",
          command: () => {
            renderContent(<AccountLog />);
          },
        },
      ],
    },
  ];

  const op = useRef(null);

  const [requests, setRequests] = useState([]);

  const fetchData = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetRequests?deptId=${id}`
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(userData.department);
  }, [userData.department]);

  const handleAccept = async (request) => {
    try {
      const response = await axios.put(
        "http://localhost:5005/api/Inventory/AcceptRequestBorrow",
        {
          item_uid: request.item_uid,
          borrower: request.borrower,
          loc_id: request.loc_id,
          requester_id: request.requester_id,
          rq_id: request.rq_id,
        }
      );
      // Check the response if needed
      console.log(response.data);
      // Update the local state to mark the request as accepted
      fetchCountActive(userData.department);
      fetchData(userData.department);
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.rq_id === request.rq_id ? { ...req, isAccepted: true } : req
        )
      );
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <div id="Navbar" className="flex overflow-hidden bg-primary shadow-2 ">
        <div className="p-2">
          <Button
            className="burger-menu lg:hidden"
            icon="pi pi-bars"
            onClick={toggleMenu}
          />
        </div>

        <img
          src={logo}
          alt="Logo"
          className="ml-3 mt-2"
          style={{ height: "40px" }}
        />
        <p className="font-bold p-2 m-2">BCAS-ODYNSS</p>
        <div className="ml-auto p-2">
          <Button
            icon="pi pi-inbox mr-2"
            className="text-white"
            onClick={(e) => op.current.toggle(e)}
          >
            <span className="small-screen-label">Requests</span>
            <Badge value={requestCount} severity="danger"></Badge>
          </Button>

          <OverlayPanel ref={op}>
            <ScrollPanel style={{ width: "100%", height: "300px" }}>
              {requests.length === 0 ? (
                <div className="p-grid p-2">
                  <div className="p-col">
                    <p>There are no requests</p>
                  </div>
                </div>
              ) : (
                requests.map((request, index) => (
                  <div key={index} className="p-grid hover:bg-cyan-50 p-2">
                    <div className="p-col">
                      <p>{request.message}</p>
                    </div>
                    <div className="p-col">
                      <div className="flex justify-content-end">
                        <Button
                          label="Accept"
                          className="mr-2"
                          onClick={() => handleAccept(request)}
                        />
                        <Button
                          label="Deny"
                          severity="danger"
                          className="mr-2"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollPanel>
          </OverlayPanel>

          <Button icon="pi pi-sign-out" className="text-white" onClick={logout}>
            <span className="small-screen-label pl-2">Logout</span>
          </Button>
        </div>
      </div>
      <div
        id="Content"
        className="flex flex-row flex-wrap lg:overflow-hidden overflow-auto"
      >
        <div
          id="Menu"
          className={`bg-white menu-container h-screen shadow-2 ${
            menuOpen ? "open" : ""
          }`}
        >
          <div className="menu-content">
            <div className="bg-gray-200 p-3 text-center">
              <p>
                <b>Welcome Back! </b>
              </p>
              <p className="text-primary font-semibold">
                {userData.firstName} {userData.lastName}
              </p>
            </div>
            <div className="card flex flex-col justify-content-start h-full">
              <PanelMenu model={items} className="w-full" />
            </div>
          </div>
        </div>
        <div
          id="Interface"
          className="w-auto m-2 flex-grow-1 relative overflow-y-auto"
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
