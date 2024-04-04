import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";

const UniqueFeatureValuePage = () => {
  const breadcrumb = [{ label: "User List" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);

  const [uniqueFeature, setUniqueFeature] = useState([]);
  const [selectedUniqueFeature, setSelectedUniqueFeature] = useState([]);
  const [uniqueFeatureVal, setUniqueFeatureVal] = useState([]);
  const [disabledUniquefeatureVal, setDisabledUniquefeatureVal] = useState([]);
  const [uniqueFeatureValId, setUniqueFeatureValId] = useState([]);
  const [uniqueFeatureValValue, setUniqueFeatureValValue] = useState({
    unqFeat_id: "",
    unqFeatVal: "",
  });

  const [uniqueFeatureEditValue, setUniqueFeatureEditValue] = useState({
    unqFeatVal_id: "",
    unqFeatVal: "",
  });

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const fetchUnqFeatureDetails = async (unqFeatId, unqFeatValId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Category/GetUniqueFeatureValueViaUid?unqFeat_id=${unqFeatId}&unqFeatVal_id=${unqFeatValId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setUniqueFeatureEditValue({
        unqFeatVal_id: itemData[0].unqFeatVal_id,
        unqFeatVal: itemData[0].unqFeatVal,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    setUniqueFeatureValValue((prevState) => ({
      ...prevState,
      unqFeat_id: selectedUniqueFeature.toString(),
    }));
    console.log(uniqueFeatureValValue);
  }, [selectedUniqueFeature]);

  useEffect(() => {
    fetchUniqueFeature();
  }, []);

  const fetchUniqueFeature = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetUniqueFeature"
      );
      const transformedUnqFeat = response.data.map((unqFeat) => ({
        label: unqFeat.unqFeature,
        value: unqFeat.unqFeat_id,
      }));
      setUniqueFeature(transformedUnqFeat);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchUniqueFeatureVal = async (unqFeatId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetUniqueFeatureValue?unqFeat_id=${unqFeatId}`
      );
      setUniqueFeatureVal(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchDisabledUniqueFeatureVal = async (unqFeatId) => {
    axios
      .get(
        `http://localhost:5005/api/Category/GetDeactUniqueFeatureValue?unqFeat_id=${unqFeatId}`
      )
      .then((response) => {
        setDisabledUniquefeatureVal(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (selectedUniqueFeature) {
      fetchUniqueFeatureVal(selectedUniqueFeature);
      fetchDisabledUniqueFeatureVal(selectedUniqueFeature);
    }
  }, [selectedUniqueFeature]);

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.unqFeat_id, rowData.unqFeatVal_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.unqFeatVal_id)}
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
          onClick={() => handleRestore(rowData.unqFeatVal_id)}
        />
      </React.Fragment>
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/DeactivateUniqueFeatureValue?unqFeatVal_id=${uniqueFeatureValId}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        fetchUniqueFeatureVal(selectedUniqueFeature);
        fetchDisabledUniqueFeatureVal(selectedUniqueFeature);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/ActivateUniqueFeatureValue?unqFeatVal_id=${uniqueFeatureValId}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        fetchUniqueFeatureVal(selectedUniqueFeature);
        fetchDisabledUniqueFeatureVal(selectedUniqueFeature);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleDelete = (unqFeatValId) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setUniqueFeatureValId(unqFeatValId);
    setvisibleDelete(true);
  };

  const handleEdit = (unqFeatId, unqFeatValId) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setUniqueFeatureValId(unqFeatValId);
    setVisibleEdit(true);
    fetchUnqFeatureDetails(unqFeatId, unqFeatValId);
  };

  const handleRestore = (unqFeatValId) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setUniqueFeatureValId(unqFeatValId);
    setVisibleRestore(true);
  };

  const handleInputChange = (e) => {
    setUniqueFeatureValValue({
      ...uniqueFeatureValValue,
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
      const postData = {
        unqFeat_id: uniqueFeatureValValue.unqFeat_id.toString(),
        unqFeatVal: uniqueFeatureValValue.unqFeatVal,
      };

      const response = await axios.post(
        "http://localhost:5005/api/Category/AddUniqueFeatureValue",
        postData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);

      setUniqueFeatureValValue({
        unqFeat_id: "",
        unqFeatVal: "",
      });
      fetchUniqueFeatureVal(selectedUniqueFeature);
      const message = "Successfully added a unique feature value.";
      showSuccess(message);
      setVisibleAdd(false);
    } catch (error) {
      console.error("Error:", error);
      const message =
        "Subcategory name or acronym already exists. Please try again.";
      showFail(message);
      console.log(selectedUniqueFeature);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5005/api/Category/EditUniqueFeatureValue`,
        {
          unqFeatValId: parseInt(uniqueFeatureEditValue.unqFeatVal_id),
          unqFeatValName: uniqueFeatureEditValue.unqFeatVal,
        }
      );
      console.log(response.data);
      setUniqueFeatureEditValue({
        unqFeatVal_id: "",
        unqFeatVal: "",
      });
      fetchUniqueFeatureVal(selectedUniqueFeature);
      const message = "Successfully edited unique feature value";
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
        <p>Are you sure you want to delete {uniqueFeatureValId} ?</p>

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
        <p>Are you sure you want to restore {uniqueFeatureValId} ?</p>

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
        header="Add New Unique Feature Value"
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
                  Unique Feature:
                </label>
                <Dropdown
                  name="unqFeat_id"
                  value={uniqueFeatureValValue.unqFeat_id}
                  options={uniqueFeature}
                  onChange={handleInputChange}
                  optionLabel="label"
                  placeholder="Filter by Feature"
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Unique Feature Value Name:
                </label>
                <InputText
                  id="unqFeatVal"
                  name="unqFeatVal"
                  value={uniqueFeatureValValue.unqFeatVal}
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
        header="Edit Unique Feature Value"
        visible={visibleEdit}
        style={{ width: "50vw" }}
        onHide={() => setVisibleEdit(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h3>
              Your are now editing unique feature value id {uniqueFeatureValId}
            </h3>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <InputText
                  id="unqFeatVal_id"
                  name="unqFeatVal_id"
                  value={uniqueFeatureEditValue.unqFeatVal_id}
                  onChange={handleInputEditChange}
                  hidden
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Subcategory Name:
                </label>
                <InputText
                  id="unqFeatVal"
                  name="unqFeatVal"
                  value={uniqueFeatureEditValue.unqFeatVal}
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
        label="Add Unique Featuer Value"
        onClick={() => setVisibleAdd(true)}
      />

      <label>Select a Unique Feature:</label>
      <Dropdown
        value={selectedUniqueFeature}
        options={uniqueFeature}
        onChange={(e) => setSelectedUniqueFeature(e.value)}
        optionLabel="label"
        placeholder="Filter by Feature"
        className="w-full md:w-14rem"
      />
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Unique Feature Value">
            <DataTable
              value={uniqueFeatureVal}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="unqFeatVal_id" header="ID" />
              <Column field="unqFeatVal" header="Unique Feature Value" />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Unique Feature Value">
            <DataTable
              value={disabledUniquefeatureVal}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="unqFeatVal_id" header="ID" />
              <Column field="unqFeatVal" header="Unique Feature Value" />
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

export default UniqueFeatureValuePage;
