import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const toast = useRef(null);

  const [user_type, setUser_type] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ username, password, user_type }),
      });

      if (response.ok) {
        // Authentication successful
        const data = await response.json();
        if (data.user_type === "user") {
          navigate("/user");
        }
        if (data.user_type === "admin") {
          navigate("/admin");
        }
        if (data.user_type === "superadmin") {
          navigate("/superadmin");
        }

        // Handle the user type or other actions as needed
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
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Toast ref={toast} />
      <div className="flex justify-content-center flex-wrap mt-8 mb-8 ">
        <div className="flex flex-column row-gap-4 justify-content-center ">
          <h1 className="text-center">Login</h1>
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
              feedback={false}
            />
            <label htmlFor="password">Password</label>
          </span>

          <Button label="Login" type="submit" />
        </div>
      </div>
    </form>
  );
};

export default Login;
