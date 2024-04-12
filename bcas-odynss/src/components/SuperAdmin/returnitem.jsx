import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import axios from "axios";

const ReturnItemPage = () => {
  const breadcrumb = [{ label: "Return Item" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);

  const [userId, setUserId] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [location, setLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [checked, setChecked] = useState(false);
  const [itemUID, setItemUID] = useState([]);
  const [borrowId, setBorrowId] = useState([]);

  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  const [visibleReturn, setVisibleReturn] = useState(false);

  useEffect(() => {
    fetchBorrowHistory();
    fetchLocation();
  }, []);

  const fetchBorrowHistory = () => {
    axios
      .get(
        `http://localhost:5005/api/ReturnBorrow/GetBorrowHistory?userId=${userData.user_id}`
      )
      .then((response) => {
        // Extract data from the response
        const responseData = response.data;
        setBorrowHistory(responseData); // Set only the data to borrowHistory
        console.log(responseData); // Log the data if needed
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchLocation = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetLocation"
      );
      const transformedLocation = response.data.map((location) => ({
        label: location.location,
        value: location.loc_id,
      }));
      setLocation(transformedLocation);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const returnItem = (e) => {
    e.preventDefault();
    axios
      .put(
        `http://localhost:5005/api/Inventory/ReturnItem?itemUID=${itemUID}&brw_id=${borrowId}&loc_id=${selectedLocation}&isBroken=${checked}`
      )
      .then((response) => {
        console.log(response.data);
        fetchBorrowHistory();
        const message = "Item successfully returned";
        setVisibleReturn(false);
        showSuccess(message);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleReturn = (itemUid, borrowId) => {
    setVisibleReturn(true);
    setItemUID(itemUid);
    setBorrowId(borrowId);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-refresh"
          rounded
          outlined
          severity="success"
          onClick={() => handleReturn(rowData.item_uid, rowData.brw_id)}
        />
      </React.Fragment>
    );
  };

  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showFail = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Failure",
      detail: message,
      life: 3000,
    });
  };

  return (
    <div>
      <Toast ref={toast} />
      <BreadCrumb model={breadcrumb} home={home} />
      <Dialog
        header="Return Item"
        visible={visibleReturn}
        style={{ width: "50vw" }}
        onHide={() => setVisibleReturn(false)}
        className="w-3"
      >
        <form className="flex flex-column" onSubmit={returnItem}>
          <div className="flex flex-column mb-2">
            <label>Select a Location:</label>
            <Dropdown
              value={selectedLocation}
              options={location}
              onChange={(e) => setSelectedLocation(e.value)}
              optionLabel="label"
              placeholder="Filter by Location"
              className="w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label>Item Broken?</label>
            <Checkbox
              onChange={(e) => setChecked(e.checked)}
              checked={checked}
              className="ml-3"
            ></Checkbox>
          </div>

          <Button label="Return Item" icon="pi pi-refresh" />
        </form>
      </Dialog>

      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <DataTable
          value={borrowHistory}
          paginator
          rows={5}
          scrollable
          scrollHeight="550px"
          style={{ width: "100%" }}
        >
          <Column field="dept_handler" header="Department Handler" />
          <Column field="item_uid" header="Item UID" />
          <Column field="borrower" header="Borrower" />
          <Column field="location" header="Borrow Location" />
          <Column field="brw_time" header="Borrow Time" />
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default ReturnItemPage;
