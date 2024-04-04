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

const Department = () => {
  const breadcrumb = [{ label: "Department List" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [disabledDepts, setDisabledDepts] = useState([]);
  const [deptId, setDeptId] = useState([]);
  const [deptValue, setDeptValue] = useState({
    department: "",
    acronym: "",
  });

  const [deptEditValue, setDepEditValue] = useState({
    dept_id: "",
    department: "",
    acronym: "",
  });

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const fetchItemDetails = async (departmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Category/GetDepartments?deptId=${departmentId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setDepEditValue({
        dept_id: itemData[0].dept_id,
        department: itemData[0].department,
        acronym: itemData[0].acronym,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    FetchDepartments();
    FetchDeactDepartments();
  }, []);

  const FetchDepartments = () => {
    axios
      .get("http://localhost:5005/api/Inventory/GetDepartments")
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const FetchDeactDepartments = () => {
    axios
      .get("http://localhost:5005/api/Category/GetDeactDepartments")
      .then((response) => {
        setDisabledDepts(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const actionBodyTemplateActive = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.dept_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.dept_id)}
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
          onClick={() => handleRestore(rowData.dept_id)}
        />
      </React.Fragment>
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/DeactivateDepartment?deptId=${deptId}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        FetchDepartments();
        FetchDeactDepartments();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/ActivateDepartment?deptId=${deptId}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        FetchDepartments();
        FetchDeactDepartments();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleDelete = (department) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setDeptId(department);
    setvisibleDelete(true);
  };

  const handleEdit = (department) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setDeptId(department);
    setVisibleEdit(true);
    fetchItemDetails(department);
  };

  const handleRestore = (department) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setDeptId(department);
    setVisibleRestore(true);
  };

  const handleInputChange = (e) => {
    setDeptValue({ ...deptValue, [e.target.name]: e.target.value });
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setDepEditValue((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5005/api/Category/AddDepartment",
        deptValue,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      setDeptValue({
        department: "",
        acronym: "",
      });
      FetchDepartments();
      const message = "Successfully added a department.";
      showSuccess(message);
      setVisibleAdd(false);
    } catch (error) {
      console.error("Error:", error);
      const message =
        "Department name or acronym already exists. Please try again.";
      showFail(message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5005/api/Category/EditDepartment",
        {
          deptId: parseInt(deptEditValue.dept_id),
          deptName: deptEditValue.department,
          acronym: deptEditValue.acronym,
        }
      );
      console.log(response.data);
      setDepEditValue({
        department: "",
        acronym: "",
      });
      FetchDepartments();
      const message = "Successfully edited department";
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
      <Toast ref={toast} />
      <BreadCrumb model={breadcrumb} home={home} />

      <Dialog
        header="Confirm Delete"
        visible={visibleDelete}
        style={{ width: "50vw" }}
        onHide={() => setvisibleDelete(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to delete {deptId} ?</p>

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
        <p>Are you sure you want to restore {deptId} ?</p>

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
        header="Add New Department"
        visible={visibleAdd}
        style={{ width: "50vw" }}
        onHide={() => setVisibleAdd(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <form onSubmit={handleSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="department">
                  Department Name:
                </label>
                <InputText
                  id="deptName"
                  name="department"
                  value={deptValue.deptName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="acronym">
                  Department Acronym:
                </label>
                <InputText
                  id="deptAc"
                  name="acronym"
                  value={deptValue.deptName}
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
        header="Edit Department"
        visible={visibleEdit}
        style={{ width: "50vw" }}
        onHide={() => setVisibleEdit(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h3>Your are now editing department id {deptId}</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <InputText
                  id="deptId"
                  name="dept_id"
                  value={deptEditValue.dept_id}
                  onChange={handleInputEditChange}
                  hidden
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="department">
                  Department Name:
                </label>
                <InputText
                  id="deptName"
                  name="department"
                  value={deptEditValue.department}
                  onChange={handleInputEditChange}
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="acronym">
                  Department Acronym:
                </label>
                <InputText
                  id="deptAc"
                  name="acronym"
                  value={deptEditValue.acronym}
                  onChange={handleInputEditChange}
                  required
                />
              </div>

              <Button className="w-5" label="Edit" icon="pi pi-pencil" />
            </form>
          </div>
        </div>
      </Dialog>

      <Button
        label="New Department"
        icon="pi pi-plus"
        onClick={() => setVisibleAdd(true)}
      />
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Departments">
            <DataTable
              value={departments}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="dept_id" header="ID" />
              <Column field="department" header="Department Name" />
              <Column field="acronym" header="Acronym" />
              <Column
                body={actionBodyTemplateActive}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Departments">
            <DataTable
              value={disabledDepts}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="dept_id" header="ID" />
              <Column field="department" header="Department Name" />
              <Column field="acronym" header="Acronym" />
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

export default Department;
