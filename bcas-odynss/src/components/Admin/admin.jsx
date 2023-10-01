import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const Admin = () => {
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [tableOptions, setTableOptions] = useState([]);

  const [tableName, setTableName] = useState("");
  const [message, setMessage] = useState("");
  const handleTableNameChange = (e) => {
    setTableName(e.target.value);
  };
  const handleCreateTable = async () => {
    try {
      const response = await fetch(
        `http://localhost:5005/api/Inventory/NewTable?tableName=${tableName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setMessage(data.message);

      fetch("http://localhost:5005/api/Inventory/api/table-list")
        .then((response) => response.json())
        .then((optionsData) => {
          setTableOptions(optionsData);
        });
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while creating the table.");
    }
  };

  useEffect(() => {
    // Fetch table options from the API
    fetch("http://localhost:5005/api/Inventory/api/table-list")
      .then((response) => response.json())
      .then((optionsData) => {
        setTableOptions(optionsData);
      });
  }, []);

  useEffect(() => {
    // Fetch column names when the selected table changes
    if (selectedTable) {
      fetch(
        `http://localhost:5005/api/Inventory/GetColumn?tableName=${selectedTable}`
      )
        .then((response) => response.json())
        .then((columnsData) => {
          const columns = columnsData.map((columnName) => ({
            field: columnName,
            header: columnName,
          }));
          setColumns(columns);

          // Now that we have column names, fetch data based on those columns
          fetch(
            `http://localhost:5005/api/Inventory/${selectedTable}/${columnsData}`
          )
            .then((response) => response.json())
            .then((data) => {
              setData(data);
            });
        });
    }
  }, [selectedTable]);

  return (
    <div className="card">
      <div>
        <h2>Create Table</h2>
        <div>
          <label htmlFor="tableName">Table Name:</label>
          <input
            type="text"
            id="tableName"
            value={tableName}
            onChange={handleTableNameChange}
          />
        </div>
        <button onClick={handleCreateTable}>Create</button>
        <div>{message}</div>
      </div>

      <div className="card">
        <Dropdown
          value={selectedTable}
          options={tableOptions.map((option) => ({
            label: option,
            value: option,
          }))}
          onChange={(e) => setSelectedTable(e.value)}
          placeholder="Select a table"
        />
        <br />
        <DataTable value={data} tableStyle={{ minWidth: "50rem" }}>
          {columns.map((col) => (
            <Column key={col.field} field={col.field} header={col.header} />
          ))}
        </DataTable>
      </div>
    </div>
  );
};

export default Admin;
