import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { BreadCrumb } from "primereact/breadcrumb";
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

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchDeactAccounts();
    fetchCountActive();
    fetchCountDeactive();
  }, []);

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
        <Button icon="pi pi-pencil" rounded outlined className="mr-2" />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.user_id)}
          visible={rowData.isAdmin === false}
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

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Accounts/DeactivateAccount?userId=${accountId}`
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
        `http://localhost:5005/api/Accounts/ActivateAccount?userId=${accountId}`
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
        style={{ width: "50vw" }}
        onHide={() => setvisibleDelete(false)}
        className="text-center w-3"
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
        style={{ width: "50vw" }}
        onHide={() => setVisibleRestore(false)}
        className="text-center w-3"
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
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="firstName"
                header="First Name"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="lastName"
                header="Last Name"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="email"
                header="Email"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="department"
                header="Department"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="createdAt"
                header="Created At"
                sortable
                style={{ width: "25%" }}
              ></Column>

              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "8rem" }}
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
                style={{ width: "15%" }}
              ></Column>
              <Column
                field="firstName"
                header="First Name"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="lastName"
                header="Last Name"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="email"
                header="Email"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="department"
                header="Department"
                sortable
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="createdAt"
                header="Created At"
                sortable
                style={{ width: "25%" }}
              ></Column>

              <Column
                body={actionBodyTemplateDisable}
                exportable={false}
                style={{ minWidth: "8rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default Superadmin;
