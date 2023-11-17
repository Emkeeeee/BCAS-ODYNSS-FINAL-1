import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";

const Superadmin = () => {
  const toast = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [userType, setUserType] = useState(null); // Change initial state to null
  const [department, setDepartment] = useState(null); // Change initial state to null
  const user_type = [
    { label: "User", value: "User" },
    { label: "Admin", value: "Admin" },
    { label: "SuperAdmin", value: "SuperAdmin" },
  ];
  const departmentType = [
    { label: "Elementary", value: "Elementary" },
    { label: "Junior Highschool", value: "JuniorHighschool" },
    { label: "Senior Highschool", value: "SeniorHighschool" },
    { label: "College", value: "College" },
  ];

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create an object with the account data
    const accountData = {
      username: username,
      password: password,
      user_type: userType,
      department: department,
    };

    // Send a POST request to the API endpoint
    axios
      .post("http://localhost:5005/api/Accounts/Insert", accountData)
      .then((response) => {
        console.log(response.data);

        if (response.status === 200) {
          fetchAccounts();

          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Succesfully Registered",
            life: 5000,
          });
        }

        // Handle the success response as needed
      })
      .catch((error) => {
        console.error(error);
        // Handle the error response as needed
        toast.current.show({
          severity: "warn",
          summary: "Error",
          detail: "Not Registered",
          life: 5000,
        });
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Toast ref={toast} />
      <div className="flex justify-content-center flex-wrap mt-8 mb-8 ">
        <div className="flex flex-column row-gap-4 justify-content-center ">
          <h1 className="text-center">Register</h1>
          <span className="p-float-label">
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="username">Username</label>
          </span>

          <span className="p-float-label">
            <Password
              inputId="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
          </span>

          <span className="p-float-label">
            <Password
              inputId="confirmpass"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              feedback={false}
            />
            <label htmlFor="password">Confirm Password</label>
          </span>

          <Dropdown
            value={userType}
            onChange={(e) => setUserType(e.value)}
            options={user_type}
            placeholder="Select a User Type"
          />

          <Dropdown
            value={department}
            onChange={(e) => setDepartment(e.value)}
            options={departmentType}
            placeholder="Select a Department"
          />

          <Button type="submit" label="Register" icon="pi pi-check" />
        </div>
      </div>

      <div className="card">
        <DataTable
          value={accounts}
          paginator
          rows={5}
          removableSort
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field="id"
            header="ID"
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
            field="user_type"
            header="User Type"
            sortable
            style={{ width: "25%" }}
          ></Column>
          <Column
            field="department"
            header="Department"
            sortable
            style={{ width: "25%" }}
          ></Column>
        </DataTable>
      </div>
    </form>
  );
};

export default Superadmin;
