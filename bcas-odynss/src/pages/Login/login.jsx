import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import yourImage from "../../assets/images/odynss.jpg";
import axios from "axios";

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
  const [department, setDepartment] = useState(0);
  const [user_id, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");

  const isAdminValue = isAdmin === "true";

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const isUser = sessionStorage.getItem("asUser", "true");
    const isAdmin = sessionStorage.getItem("asAdmin", "true");

    if (isLoggedIn === "true" || isAdmin === "true") {
      navigate("/superadmin"); // or navigate to superadmin page based on your logic
    }
    if (isLoggedIn === "true" || isUser === "true") {
      navigate("/user");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Send login request to the API
    try {
      const response = await fetch("/api/Accounts/Login", {
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
          department: parseInt(department),
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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleCancelForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(false);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    try {
      axios
        .post(`/api/Accounts/SendChangePasswordEmail?recipientEmail=${email}`)
        .then(
          (response) => {
            console.log(response.data);
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Reset password link has been sent to your email.",
              life: 5000,
            });
            setShowForgotPassword(false);
            setEmail("");
          },
          (error) => {
            console.log(error);
            setEmail("");
            toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "Cannot send reset password link to your email.",
              life: 5000,
            });
          }
        );
    } catch (error) {}
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <form onSubmit={handleLogin}>
        <Toast ref={toast} />
        <div className="flex justify-content-center flex-wrap mt-8 mb-8 ">
          <Card style={{ width: "50%" }} className="picture-box">
            <img
              src={yourImage}
              alt="Card Image"
              className="bg-cover bg-center w-full"
            />
          </Card>
          <Card
            className="p-5 md:align-items-center"
            style={{ backgroundColor: "white" }}
          >
            <h3 className="text-center">BCAS-ODYNSS</h3>
            <div
              id="loginform"
              className="flex flex-column align-items-center justify-content-center"
            >
              {!showForgotPassword ? (
                <>
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
                    />
                    <label htmlFor="password">Password</label>
                  </span>

                  <Button
                    label="Login"
                    type="submit"
                    icon="pi pi-user"
                    className="w-10rem"
                  />

                  <Button
                    label="Forgot Password"
                    severity="secondary"
                    text
                    className="mt-5"
                    onClick={handleForgotPassword}
                  />
                </>
              ) : (
                <>
                  <span className="p-float-label m-3">
                    <InputText
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-12"
                    />
                    <label htmlFor="email">Email</label>
                  </span>

                  <div>
                    <Button
                      label="Submit"
                      className="mr-3"
                      onClick={handleForgotPasswordSubmit}
                    />
                    <Button
                      label="Cancel"
                      className="mr-3"
                      onClick={handleCancelForgotPassword}
                      severity="secondary"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Login;
