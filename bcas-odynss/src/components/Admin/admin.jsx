import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

const Admin = () => {
  const [visibleCT, setVisibleCT] = useState(false);
  const [visibleCC, setVisibleCC] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [newColumnName, setNewColumName] = useState([]);
  const [data, setData] = useState([]);
  const [tableOptions, setTableOptions] = useState([]);
  const [selectedTableColumn, setSelectedTableColumn] = useState("");
  const [selectedDataType, setSelectedDataType] = useState("");
  const [tableName, setTableName] = useState("");
  const [message, setMessage] = useState("");
  const handleTableNameChange = (e) => {
    setTableName(e.target.value);
  };

  const dataType = [
    { name: "Text", value: "nvarchar(300)" },
    { name: "Number", value: "int" },
  ];
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

  const handleCreateColumn = async (e) => {
    e.preventDefault();

    // Create a JSON object to send to the API
    const columnData = {
      TableName: selectedTableColumn,
      ColumnName: newColumnName,
      DataType: selectedDataType,
    };

    // Make a POST request using Axios
    axios
      .post("http://localhost:5005/api/Inventory/api/column", columnData)
      .then((response) => {
        // Handle the API response (e.g., show a success message)
        console.log("API Response:", response.data);
      })
      .catch((error) => {
        // Handle errors (e.g., show an error message)
        console.error("API Error:", error);
      });

    console.log(selectedDataType);
    console.log(newColumnName);
    console.log(selectedTableColumn);
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
        <Button
          label="Create Table"
          icon="pi pi-plus"
          onClick={() => setVisibleCT(true)}
        />

        {/* Dialog box for creating table */}
        <Dialog
          header="Create Table"
          visible={visibleCT}
          style={{ width: "50vw" }}
          onHide={() => setVisibleCT(false)}
        >
          <p className="m-0">
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
          </p>
        </Dialog>

        <Button
          label="Create Column"
          icon="pi pi-plus"
          onClick={() => setVisibleCC(true)}
        />
        <Dialog
          header="Create Column"
          visible={visibleCC}
          style={{ width: "50vw" }}
          onHide={() => setVisibleCC(false)}
        >
          <p className="m-0">
            <div>
              <label htmlFor="tableName">Column Name:</label>
              <input
                type="text"
                id="newColumnName"
                value={newColumnName}
                onChange={(e) => setNewColumName(e.target.value)}
              />
              <label htmlFor="tableName">Table Name:</label>
              <Dropdown
                value={selectedTableColumn}
                options={tableOptions.map((option) => ({
                  label: option,
                  value: option,
                }))}
                onChange={(e) => setSelectedTableColumn(e.value)}
                placeholder="Select a table"
              />

              <label htmlFor="dataType">Data Type:</label>
              <Dropdown
                value={selectedDataType}
                options={dataType}
                optionLabel="name"
                onChange={(e) => setSelectedDataType(e.value)}
                placeholder="Select a table"
              />
            </div>
            <button onClick={handleCreateColumn}>Create</button>
          </p>
        </Dialog>
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
