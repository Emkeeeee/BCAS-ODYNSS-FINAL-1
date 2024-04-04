import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import yourImage from "../../assets/images/odynss.jpg";

const Login = () => {
  useEffect(() => {
    document.title = "BCAS-ODYNSS";
  }, []);

  const navigate = useNavigate();
  const toast = useRef(null);
  const [salt, setSalt] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [user_id, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdminValue = isAdmin === "true";

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/superadmin"); // or navigate to superadmin page based on your logic
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Send login request to the API
    try {
      const response = await fetch("http://localhost:5005/api/Accounts/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          firstName, // Include additional parameters
          lastName, // Include additional parameters
          isAdmin: isAdminValue, // Include additional parameters
          salt, // Include additional parameters
        }),
      });

      if (response.ok) {
        // Authentication successful
        const data = await response.json();
        // Store JWT token in session storage or local storage
        sessionStorage.setItem("jwtToken", data.token);
        // Set session variable indicating user is logged in
        sessionStorage.setItem("isLoggedIn", "true");
        // Store user details in session storage
        sessionStorage.setItem("userData", JSON.stringify(data.user));

        if (data.user.isAdmin) {
          // Navigate to superadmin page
          sessionStorage.setItem("asAdmin", "true");
          navigate("/superadmin");
        } else {
          // Navigate to user page
          sessionStorage.setItem("asUser", "true");
          navigate("/user");
        }
      } else {
        // Authentication failed
        const error = await response.text();
        toast.current.show({
          severity: "warn",
          summary: "Error",
          detail: "Cannot login this account.",
          life: 5000,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Toast ref={toast} />
      <div className="flex justify-content-center flex-wrap mt-8 mb-8 ">
        <Card
          style={{ width: "50%" }}
          className="sm:hidden md:hidden lg:hidden xl:block"
        >
          <img
            src={yourImage}
            alt="Card Image"
            class="bg-cover bg-center w-full"
          />
        </Card>
        <Card className="p-5 md:align-items-center">
          <h3 className="text-center">BCAS-ODYNSS</h3>
          <div
            id="loginform"
            className="flex flex-column align-items-center justify-content-center"
          >
            <span className="p-float-label m-3">
              <InputText
                id="username"
                value={username}
                keyfilter="alphanum"
                onChange={(e) => setUsername(e.target.value)}
                className="w-12"
              />
              <label htmlFor="username">Username</label>
            </span>

            <span className="p-float-label m-3">
              <Password
                inputId="password"
                value={password}
                // keyfilter="alphanum"
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
              />
              <label htmlFor="password">Password</label>
            </span>

            <Button
              label="Login"
              type="submit"
              icon="pi pi-user"
              className="w-10rem"
            />
          </div>
        </Card>
      </div>
    </form>
  );
};

export default Login;
