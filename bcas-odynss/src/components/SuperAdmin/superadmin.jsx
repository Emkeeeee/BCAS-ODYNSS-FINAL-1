import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { BreadCrumb } from "primereact/breadcrumb";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import axios from "axios";

const Superadmin = () => {
  const [accountId, setAccountId] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [deactAccounts, setDeactAccounts] = useState([]);
  const [activeAccountsCount, setActiveAccountsCount] = useState(0);
  const [deactiveAccountsCount, setDeactiveAccountsCount] = useState(0);
  const toast = useRef(null);
  const [formEdit, setFormEdit] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isAdminCount, setIsAdminCount] = useState(0);

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);
  const [creatorId, setCreatorId] = useState([]);

  useEffect(() => {
    fetchAccounts();
    fetchDeactAccounts();
    fetchCountActive();
    fetchCountDeactive();
    setCreatorId(userData.user_id);
  }, []);

  useEffect(() => {
    // Count the number of isAdmin entries
    const count = accounts.reduce(
      (acc, rowData) => (rowData.isAdmin ? acc + 1 : acc),
      0
    );
    setIsAdminCount(count);
  }, [accounts]);

  useEffect(() => {
    // Count the number of isAdmin entries
    console.log(isAdminCount);
  }, [isAdminCount]);

  const fetchAccountDetails = async (accountId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Accounts/SelectViaUid?userId=${accountId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setFormEdit({
        userId: itemData[0].user_id,
        firstName: itemData[0].firstName,
        lastName: itemData[0].lastName,
        email: itemData[0].email,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const fetchCountActive = () => {
    axios
      .get("http://localhost:5005/api/Accounts/GetCountActiveAccounts")
      .then((response) => {
        setActiveAccountsCount(response.data);
      })
      .catch((error) => {
        console.error("Error fetching active accounts count:", error);
      });
  };

  const fetchCountDeactive = () => {
    axios
      .get("http://localhost:5005/api/Accounts/GetCountDeactiveAccounts")
      .then((response) => {
        setDeactiveAccountsCount(response.data);
      })
      .catch((error) => {
        console.error("Error fetching active accounts count:", error);
      });
  };

  const fetchAccounts = () => {
    axios
      .get("http://localhost:5005/api/Accounts/Select")
      .then((response) => {
        setAccounts(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchDeactAccounts = () => {
    axios
      .get("http://localhost:5005/api/Accounts/SelectDeact")
      .then((response) => {
        setDeactAccounts(response.data);
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
          onClick={() => handleEdit(rowData.user_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.user_id)}
          visible={rowData.isAdmin === false || isAdminCount > 1}
        />
      </React.Fragment>
    );
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setFormEdit((prevState) => ({ ...prevState, [name]: value }));
  };

  const actionBodyTemplateDisable = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-refresh"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleRestore(rowData.user_id)}
        />
      </React.Fragment>
    );
  };

  const handleDelete = (accountid) => {
    setAccountId(accountid);
    setvisibleDelete(true);
  };

  const handleRestore = (accountid) => {
    setAccountId(accountid);
    setVisibleRestore(true);
  };

  const handleEdit = (accountid) => {
    setVisibleEdit(true);
    fetchAccountDetails(accountid);
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Accounts/DeactivateAccount?userId=${accountId}&creatorId=${creatorId}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        fetchAccounts();
        fetchDeactAccounts();
        fetchCountActive();
        fetchCountDeactive();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Accounts/ActivateAccount?userId=${accountId}&creatorId=${creatorId}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        fetchAccounts();
        fetchDeactAccounts();
        fetchCountActive();
        fetchCountDeactive();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5005/api/Accounts/EditAccount?creatorId=${creatorId}`,
        {
          userId: parseInt(formEdit.userId),
          firstName: formEdit.firstName,
          lastName: formEdit.lastName,
          email: formEdit.email,
        }
      );
      console.log(response.data);
      setFormEdit({
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
      });
      fetchAccounts();
      const message = "Successfully edited user";
      showSuccess(message);
      setVisibleEdit(false);
    } catch (error) {
      const message = "Email is used";
      showFail(message);
      console.error("Error:", error);
    }
  };

  const breadcrumb = [{ label: "User List" }];
  const home = { icon: "pi pi-home" };

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
        onHide={() => setvisibleDelete(false)}
        className="text-center dialog-box"
      >
        <p>Are you sure you want to delete {accountId} ?</p>

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
        onHide={() => setVisibleRestore(false)}
        className="text-center dialog-box"
      >
        <p>Are you sure you want to restore {accountId} ?</p>

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
        header="Edit User"
        visible={visibleEdit}
        onHide={() => setVisibleEdit(false)}
        className="dialog-box"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-column">
          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="category">
              Category Name:
            </label>
            <InputText
              id="firstName"
              name="firstName"
              value={formEdit.firstName}
              onChange={handleInputEditChange}
              required
            />
          </div>

          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="category">
              Category Name:
            </label>
            <InputText
              id="lastName"
              name="lastName"
              value={formEdit.lastName}
              onChange={handleInputEditChange}
              required
            />
          </div>

          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="category">
              Category Name:
            </label>
            <InputText
              id="email"
              name="email"
              value={formEdit.email}
              onChange={handleInputEditChange}
              required
            />
          </div>

          <Button label="Edit" icon="pi pi-pencil" />
        </form>
      </Dialog>

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Users
                </span>
                <div className="text-900 font-medium text-xl">
                  {activeAccountsCount}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-blue-100 border-round"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-user text-blue-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Disabled Users
                </span>
                <div className="text-900 font-medium text-xl">
                  {deactiveAccountsCount}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-red-100 border-round"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-user-minus text-red-500 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Users">
            <DataTable value={accounts} paginator rows={5} removableSort>
              <Column
                field="user_id"
                header="ID"
                sortable
                style={{ width: "5%" }}
              ></Column>
              <Column
                field="isAdmin"
                header="Admin"
                sortable
                style={{ width: "5%" }}
              ></Column>
              <Column
                field="username"
                header="Username"
                sortable
                style={{ width: "10%" }}
              ></Column>
              <Column
                field="firstName"
                header="First Name"
                sortable
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="lastName"
                header="Last Name"
                sortable
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="email"
                header="Email"
                sortable
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="department"
                header="Department"
                sortable
                style={{ width: "10%" }}
              ></Column>
              <Column
                field="formatted_createdAt"
                header="Created At"
                sortable
                style={{ width: "25%" }}
              ></Column>

              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Users">
            <DataTable value={deactAccounts} paginator rows={5} removableSort>
              <Column
                field="user_id"
                header="ID"
                sortable
                style={{ width: "5%" }}
              ></Column>
              <Column
                field="isAdmin"
                header="Admin"
                sortable
                style={{ width: "5%" }}
              ></Column>
              <Column
                field="username"
                header="Username"
                sortable
                style={{ width: "10%" }}
              ></Column>
              <Column
                field="firstName"
                header="First Name"
                sortable
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="lastName"
                header="Last Name"
                sortable
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="email"
                header="Email"
                sortable
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="department"
                header="Department"
                sortable
                style={{ width: "10%" }}
              ></Column>
              <Column
                field="formatted_createdAt"
                header="Created At"
                sortable
                style={{ width: "25%" }}
              ></Column>

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

export default Superadmin;
