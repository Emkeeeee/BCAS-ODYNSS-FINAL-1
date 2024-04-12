import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";

const LocationPage = () => {
  const breadcrumb = [{ label: "Location List" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);
  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  const [location, setLocation] = useState([]);
  const [disabledLocation, setDisabledLocation] = useState([]);
  const [locationId, setLocationId] = useState([]);
  const [locationValue, setLocationValue] = useState({
    location: "",
  });

  const [locationEditValue, setLocationEditValue] = useState({
    loc_id: "",
    location: "",
  });

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const fetchLocationDetails = async (locId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Category/GetLocationViaUid?locId=${locId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setLocationEditValue({
        loc_id: itemData[0].loc_id,
        location: itemData[0].location,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    FetchLocation();
    FetchDisabledLocation();
  }, []);

  const FetchLocation = () => {
    axios
      .get("http://localhost:5005/api/Inventory/GetLocation")
      .then((response) => {
        setLocation(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const FetchDisabledLocation = () => {
    axios
      .get("http://localhost:5005/api/Category/GetDeactLocation")
      .then((response) => {
        setDisabledLocation(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.loc_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.loc_id)}
        />
      </React.Fragment>
    );
  };

  const actionBodyTemplateDisable = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-refresh"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleRestore(rowData.loc_id)}
        />
      </React.Fragment>
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/DeactivateLocation?locId=${locationId}&creatorId=${userData.user_id}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        FetchLocation();
        FetchDisabledLocation();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/ActivateLocation?locId=${locationId}&creatorId=${userData.user_id}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        FetchLocation();
        FetchDisabledLocation();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleDelete = (location) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setLocationId(location);
    setvisibleDelete(true);
  };

  const handleEdit = (location) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setLocationId(location);
    setVisibleEdit(true);
    fetchLocationDetails(location);
  };

  const handleRestore = (location) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setLocationId(location);
    setVisibleRestore(true);
  };

  const handleInputChange = (e) => {
    setLocationValue({ ...locationValue, [e.target.name]: e.target.value });
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setLocationEditValue((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5005/api/Category/AddLocation?creatorId=${userData.user_id}`,
        locationValue,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      setLocationValue({
        location: "",
      });
      FetchLocation();
      const message = "Successfully added a location.";
      showSuccess(message);
      setVisibleAdd(false);
    } catch (error) {
      console.error("Error:", error);
      const message = "Location name already exists. Please try again.";
      showFail(message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5005/api/Category/EditLocation?&creatorId=${userData.user_id}`,
        {
          locId: parseInt(locationEditValue.loc_id),
          locName: locationEditValue.location,
        }
      );
      console.log(response.data);
      setLocationEditValue({
        locId: "",
        location: "",
      });
      FetchLocation();
      const message = "Successfully edited location";
      showSuccess(message);
      setVisibleEdit(false);
    } catch (error) {
      console.error("Error:", error);
    }
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
      <BreadCrumb model={breadcrumb} home={home} />
      <Toast ref={toast} />

      <Dialog
        header="Confirm Delete"
        visible={visibleDelete}
        style={{ width: "50vw" }}
        onHide={() => setvisibleDelete(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to delete {locationId} ?</p>

        <Button
          label="Yes"
          className="mr-5 w-3"
          severity="danger"
          onClick={handleDeleteYes}
        />
        <Button
          label="No"
          className="w-3"
          onClick={() => setvisibleDelete(false)}
        />
      </Dialog>

      <Dialog
        header="Confirm Restore"
        visible={visibleRestore}
        style={{ width: "50vw" }}
        onHide={() => setVisibleRestore(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to restore {locationId} ?</p>

        <Button
          label="Yes"
          className="mr-5 w-3"
          severity="danger"
          onClick={handleRestoreYes}
        />
        <Button
          label="No"
          className="w-3"
          onClick={() => setVisibleRestore(false)}
        />
      </Dialog>

      <Dialog
        header="Add New Location"
        visible={visibleAdd}
        style={{ width: "50vw" }}
        onHide={() => setVisibleAdd(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <form onSubmit={handleSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Location Name:
                </label>
                <InputText
                  id="location"
                  name="location"
                  value={locationValue.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button label="Add" icon="pi pi-plus" />
            </form>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Edit Location"
        visible={visibleEdit}
        style={{ width: "50vw" }}
        onHide={() => setVisibleEdit(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h3>Your are now editing location id {locationId}</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <InputText
                  id="locId"
                  name="loc_id"
                  value={locationEditValue.loc_id}
                  onChange={handleInputEditChange}
                  hidden
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Category Name:
                </label>
                <InputText
                  id="locName"
                  name="location"
                  value={locationEditValue.location}
                  onChange={handleInputEditChange}
                  required
                />
              </div>
              <Button label="Edit" icon="pi pi-pencil" />
            </form>
          </div>
        </div>
      </Dialog>

      <Button
        icon="pi pi-plus"
        label="Add Location"
        onClick={() => setVisibleAdd(true)}
      />

      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Locations">
            <DataTable
              value={location}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="loc_id" header="ID" />
              <Column field="location" header="Location Name" />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Locations">
            <DataTable
              value={disabledLocation}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="loc_id" header="ID" />
              <Column field="location" header="Location Name" />
              <Column
                body={actionBodyTemplateDisable}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default LocationPage;
