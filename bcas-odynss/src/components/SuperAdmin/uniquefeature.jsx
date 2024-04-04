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

const UniqueFeaturePage = () => {
  const breadcrumb = [{ label: "Unique Feature" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);

  const [uniqueFeature, setUniqueFeature] = useState([]);
  const [disabledUniqueFeature, setDisabledUniqueFeature] = useState([]);
  const [uniqueFeatureId, setUniqueFeatureId] = useState([]);
  const [uniqueFeatureValue, setUniqueFeatureValue] = useState({
    unqFeature: "",
  });

  const [uniqueFeatureEditValue, setUniqueFeatureEditValue] = useState({
    unqFeat_id: "",
    unqFeature: "",
  });

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const fetchUnqFeatureDetails = async (unqFeatId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Category/GetUniqueFeatureViaUid?unqFeatId=${unqFeatId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setUniqueFeatureEditValue({
        unqFeat_id: itemData[0].unqFeat_id,
        unqFeature: itemData[0].unqFeature,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    FetchUniqueFeature();
    FetchDisabledUniqueFeature();
  }, []);

  const FetchUniqueFeature = () => {
    axios
      .get("http://localhost:5005/api/Inventory/GetUniqueFeature")
      .then((response) => {
        setUniqueFeature(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const FetchDisabledUniqueFeature = () => {
    axios
      .get("http://localhost:5005/api/Category/GetDeactUniqueFeature")
      .then((response) => {
        setDisabledUniqueFeature(response.data);
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
          onClick={() => handleEdit(rowData.unqFeat_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.unqFeat_id)}
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
          onClick={() => handleRestore(rowData.unqFeat_id)}
        />
      </React.Fragment>
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/DeactivateUniqueFeature?unqFeatId=${uniqueFeatureId}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        FetchUniqueFeature();
        FetchDisabledUniqueFeature();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/ActivateUniqueFeature?unqFeatId=${uniqueFeatureId}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        FetchUniqueFeature();
        FetchDisabledUniqueFeature();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleDelete = (unqFeature) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setUniqueFeatureId(unqFeature);
    setvisibleDelete(true);
  };

  const handleEdit = (unqFeature) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setUniqueFeatureId(unqFeature);
    setVisibleEdit(true);
    fetchUnqFeatureDetails(unqFeature);
  };

  const handleRestore = (unqFeature) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setUniqueFeatureId(unqFeature);
    setVisibleRestore(true);
  };

  const handleInputChange = (e) => {
    setUniqueFeatureValue({
      ...uniqueFeatureValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setUniqueFeatureEditValue((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5005/api/Category/AddUniqueFeature",
        uniqueFeatureValue,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      setUniqueFeatureValue({
        unqFeature: "",
      });
      FetchUniqueFeature();
      const message = "Successfully added a Unique Feature.";
      showSuccess(message);
      setVisibleAdd(false);
    } catch (error) {
      console.error("Error:", error);
      const message = "Unique Feature name already exists. Please try again.";
      showFail(message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5005/api/Category/EditUniqueFeature",
        {
          unqFeatId: parseInt(uniqueFeatureEditValue.unqFeat_id),
          unqFeatName: uniqueFeatureEditValue.unqFeature,
        }
      );
      console.log(response.data);
      setUniqueFeatureEditValue({
        unqFeat_id: "",
        unqFeature: "",
      });
      FetchUniqueFeature();
      const message = "Successfully edited unique feature";
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
        <p>Are you sure you want to delete {uniqueFeatureId} ?</p>

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
        <p>Are you sure you want to restore {uniqueFeatureId} ?</p>

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
        header="Add New Unique Feature"
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
                  Unique Feature Name:
                </label>
                <InputText
                  id="unqFeature"
                  name="unqFeature"
                  value={uniqueFeatureValue.unqFeature}
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
        header="Edit Unique Feature"
        visible={visibleEdit}
        style={{ width: "50vw" }}
        onHide={() => setVisibleEdit(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h3>Your are now editing unique feature id {uniqueFeatureId}</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <InputText
                  id="locId"
                  name="loc_id"
                  value={uniqueFeatureEditValue.unqFeat_id}
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
                  id="unqFeature"
                  name="unqFeature"
                  value={uniqueFeatureEditValue.unqFeature}
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
        label="Add Unique Feature"
        onClick={() => setVisibleAdd(true)}
      />

      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Unique Features">
            <DataTable
              value={uniqueFeature}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="unqFeat_id" header="ID" />
              <Column field="unqFeature" header="Unique Feature Name" />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Unique Features">
            <DataTable
              value={disabledUniqueFeature}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="unqFeat_id" header="ID" />
              <Column field="unqFeature" header="Unique Feature Name" />
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

export default UniqueFeaturePage;
