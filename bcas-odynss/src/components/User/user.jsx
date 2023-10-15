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
      setSchema(response.data);
      setFormData(response.data);
    } catch (error) {
      // Handle error
    }
  };

  const handleSubmit = async (event) => {
    let jsontest = JSON.stringify(formData, selectedTable);
    console.log("jsontest: ", jsontest);
    event.preventDefault();
    fetch(`http://localhost:5005/api/Inventory/api/dynamicform`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        // Handle the response from the API
      })
      .catch((error) => {
        // Handle errors
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
                value={formData[column.name]}
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
