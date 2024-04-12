import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ChangePassword = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const [isTokenExpired, setIsTokenExpired] = useState(false);

  const checkTokenExpiration = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Accounts/expired?token=${token}`
      );
      if (response.data.expired) {
        setIsTokenExpired(true);
      }
    } catch (error) {
      console.error("Failed to check token expiration", error);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, [token]);

  useEffect(() => {
    if (isTokenExpired) {
      navigate("/");
    }
  }, [isTokenExpired, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5005/api/Accounts/ChangePasswordViaLink?username=${username}`,
        `"${password}"`, // Enclose the password in double quotes to mimic JSON format
        {
          headers: {
            "Content-Type": "application/json", // Set the content type to application/json
          },
        }
      );
      if (response.status === 200) {
        navigate("/");
      }
    } catch (error) {
      console.error("An error occurred while changing password", error);
    }
  };

  return (
    <div className="flex justify-content-center align-content-center flex-wrap w-12">
      <div className="shadow-2 p-2 mt-8 ">
        <div className="text-center">
          <h3>Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword}>
          <div className="flex flex-column p-2">
            <label>Username</label>
            <InputText
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-column p-2">
            <label>New Password</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
            />
          </div>

          <div className="flex flex-column p-2">
            <label>Confirm Password</label>
            <Password toggleMask feedback={false} />
          </div>

          <div className="flex flex-column p-2">
            <Button label="Submit" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
