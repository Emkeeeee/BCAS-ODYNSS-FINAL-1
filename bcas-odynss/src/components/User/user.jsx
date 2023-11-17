import React, { useState, useEffect } from "react";
import axios from "axios";

function InsertForm() {
  const [tableList, setTableList] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [schema, setSchema] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTableList();
  }, []);

  const fetchTableList = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/api/table-list"
      );
      setTableList(response.data);
    } catch (error) {
      // Handle error
    }
  };

  const fetchTableSchema = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/api/table-schema?tableName=${selectedTable}`
      );
      // Clear the existing schema and set it to the new schema
      setSchema([
        ...response.data,
        { name: "ItemName" },
        { name: "ItemQuantity" },
        { name: "ItemPlace" },
      ]);
    } catch (error) {
      // Handle error
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Concatenate ItemPlace and ItemName to create UID
    const itemPlace = formData["ItemPlace"] ? formData["ItemPlace"].value : "";
    const itemName = formData["ItemName"] ? formData["ItemName"].value : "";
    const uid = itemPlace + "_" + itemName;

    // Create a copy of formData and remove the "ItemPlace" field
    const updatedFormData = { ...formData };
    delete updatedFormData["ItemPlace"];

    const apiUrl = "http://localhost:5005/api/Inventory/api/dynamicform";

    const formDataArray = Object.entries(updatedFormData).map(
      ([name, value]) => ({
        id: 0,
        name: name,
        value: value.value,
      })
    );

    axios
      .post(apiUrl, formDataArray, {
        // Send only the updatedFormData
        params: {
          tableName: selectedTable,
          UID: uid,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // Handle the response
      })
      .catch((error) => {
        // Handle errors
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => {
      const updatedData = { ...prevFormData };
      updatedData[name] = {
        id: 0,
        name: name,
        value: value,
      };
      return updatedData;
    });
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  return (
    <div>
      <select value={selectedTable} onChange={handleTableChange}>
        <option value="">Select a table</option>
        {tableList.map((table) => (
          <option key={table} value={table}>
            {table}
          </option>
        ))}
      </select>
      <button onClick={fetchTableSchema} disabled={!selectedTable}>
        Add Input
      </button>

      {schema.length > 0 && (
        <form onSubmit={handleSubmit}>
          {schema.map((column) => (
            <div key={column.name}>
              <label htmlFor={column.name}>{column.name}</label>
              <input
                type="text"
                id={column.name}
                label={column.name}
                name={column.name}
                value={formData[column.name] ? formData[column.name].value : ""}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <button type="submit">Insert</button>
        </form>
      )}
    </div>
  );
}

export default InsertForm;
