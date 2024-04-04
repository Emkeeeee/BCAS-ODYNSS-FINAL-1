import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { BreadCrumb } from "primereact/breadcrumb";
import axios from "axios";

const Register = () => {
  const toast = useRef(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [userType, setUserType] = useState(null); // Change initial state to null
  const [department, setDepartment] = useState(null); // Change initial state to null
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const user_type = [
    { label: "", value: "" },
    { label: "User", value: "false" },
    { label: "Admin", value: "true" },
  ];
  const isAdmin = userType === "true";

  const [passwordMatch, setPasswordMatch] = useState(true); // State to track password match

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Check if passwords match when password field changes
    setPasswordMatch(e.target.value === confirmPass);
  };

  const handleConfirmPassChange = (e) => {
    setConfirmPass(e.target.value);
    // Check if passwords match when confirm password field changes
    setPasswordMatch(e.target.value === password);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetDepartments"
      );
      const transformedDepartments = response.data.map((department) => ({
        label: department.department,
        value: department.dept_id,
      }));
      setDepartment(transformedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve token from session storage
    const jwtToken = sessionStorage.getItem("jwtToken");

    // Create an object with the account data
    const accountData = {
      username: username,
      password: password,
      firstname: firstName,
      lastname: lastName,
      email: email,
      isAdmin: isAdmin,
      department: selectedDepartment,
    };

    // Send a POST request to the API endpoint with the token included in the headers
    axios
      .post("http://localhost:5005/api/Accounts/Insert", accountData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response.data);

        if (response.status === 200) {
          // Success
          // Show success toast if needed
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Account created successfully",
            life: 5000,
          });

          setUsername("");
          setPassword("");
          setConfirmPass("");
          setFirstName("");
          setLastName("");
          setEmail("");
          setUserType(null);
          setSelectedDepartment(null);
          setPasswordMatch(true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        if (error.response) {
          // The request was made, and the server responded with a status code
          if (error.response.status === 400) {
            // Bad Request (e.g., null or whitespace inputs)
            // Show warning toast
            toast.current.show({
              severity: "warn",
              summary: "Error",
              detail: "Username and password cannot be null or whitespace.",
              life: 5000,
            });
          } else if (error.response.status === 409) {
            // Conflict (e.g., username already exists)
            // Show warning toast
            toast.current.show({
              severity: "warn",
              summary: "Error",
              detail: "Username or email already exists",
              life: 5000,
            });
          } else {
            // Handle other status codes if needed
            // Show a generic error toast
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "An error occurred",
              life: 5000,
            });
          }
        } else if (error.request) {
          // The request was made, but no response was received
          // Show a generic error toast
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "No response received",
            life: 5000,
          });
        } else {
          // Something happened in setting up the request that triggered an error
          // Show a generic error toast
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "An error occurred",
            life: 5000,
          });
        }
      });
  };

  const breadcrumb = [{ label: "Register" }];
  const home = { icon: "pi pi-home" };

  return (
    <div>
      <BreadCrumb model={breadcrumb} home={home} />
      <Toast ref={toast} />
      <form onSubmit={handleSubmit}>
        <div className="flex justify-content-center flex-wrap mt-2 mb-8 ">
          <div className="flex flex-column row-gap-4 justify-content-center ">
            <h1 className="text-center">Register</h1>
            <span className="p-float-label">
              <InputText
                id="username"
                value={username}
                keyfilter="alphanum"
                onChange={(e) => setUsername(e.target.value)}
                className="w-12"
              />
              <label htmlFor="username">Username</label>
            </span>

            <span className="p-float-label">
              <Password
                inputId="password"
                value={password}
                keyfilter="alphanum"
                onChange={handlePasswordChange}
                toggleMask
              />
              <label htmlFor="password">Password</label>
            </span>

            <span className="p-float-label">
              <Password
                inputId="confirmpass"
                value={confirmPass}
                keyfilter="alphanum"
                onChange={handleConfirmPassChange}
                feedback={false}
                className={!passwordMatch ? "p-invalid" : ""}
                toggleMask
              />
              <label htmlFor="password">Confirm Password</label>
            </span>
            {!passwordMatch && (
              <small className="p-error">Passwords do not match.</small>
            )}

            <span className="p-float-label">
              <InputText
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-12"
                keyfilter="email"
              />
              <label htmlFor="email">Email</label>
            </span>

            <span className="p-float-label">
              <InputText
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-12"
              />
              <label htmlFor="email">First Name</label>
            </span>

            <span className="p-float-label">
              <InputText
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-12"
              />
              <label htmlFor="email">Last Name</label>
            </span>

            <Dropdown
              value={userType}
              onChange={(e) => setUserType(e.value)}
              options={user_type}
              placeholder="Select a User Type"
            />

            <Dropdown
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.value)}
              options={department}
              optionLabel="label"
              placeholder="Select a Department"
            />

            <Button
              type="submit"
              label="Register"
              icon="pi pi-check"
              disabled={!passwordMatch}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
