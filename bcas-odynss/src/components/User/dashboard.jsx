import React, { useState, useEffect, useRef } from "react";
import InsertForm from "./user";
import logo from "../../assets/images/logo.png";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { PanelMenu } from "primereact/panelmenu";
import { Badge } from "primereact/badge";
import { OverlayPanel } from "primereact/overlaypanel";
import { ScrollPanel } from "primereact/scrollpanel";
import axios from "axios";
import DataView from "../SuperAdmin/datatable";
import ReturnItemPage from "../SuperAdmin/returnitem";
import BrokenItems from "../SuperAdmin/brokenitem";

const UserDashboard = () => {
  const [content, setContent] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [deptId, setDeptId] = useState([]);
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
    const asAdmin = sessionStorage.getItem("asAdmin");
    if (asAdmin === "true") {
      navigate("/superadmin"); // or navigate to user page based on your logic
    }
  }, [navigate]);

  useEffect(() => {
    const isAnon = sessionStorage.getItem("isAnon");
    if (isAnon === "true") {
      navigate("/"); // or navigate to user page based on your logic
    }
  }, [navigate]);

  const logout = () => {
    // Call navigate within the component function
    sessionStorage.clear();
    navigate("/");
  };

  const renderContent = (contentComponent) => {
    setContent(contentComponent);
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
            icon="pi pi-inbox mr-2"
            className="text-white"
            label="Requests"
            onClick={(e) => op.current.toggle(e)}
          >
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

          <Button
            icon="pi pi-sign-out"
            className="text-white"
            label="Logout"
            onClick={logout}
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
            <PanelMenu
              model={items}
              className="w-full flex-shrink"
              onItemClick={(e) => renderContent(e.item.command)}
            />
          </div>
        </div>
        <div id="Interface" className="w-auto m-2 flex-grow-1">
          {content}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
