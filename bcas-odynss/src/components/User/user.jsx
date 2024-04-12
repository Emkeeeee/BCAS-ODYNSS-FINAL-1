import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";

function InsertForm() {
  const [tableList, setTableList] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [schema, setSchema] = useState([]);
  const [formData, setFormData] = useState({});
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

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

  useEffect(() => {
    // Call the fetchTableSchema function when selectedTable changes
    if (selectedTable) {
      fetchTableSchema();
    }
  }, [selectedTable]); // Dependency array

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
    <div className="m-2">
      {/* Add item inside the inventory */}
      {schema.length > 0 && (
        <form onSubmit={handleSubmit}>
          {schema.map((column) => (
            <div className="card flex justify-content-left" key={column.name}>
              <label className="p-2" htmlFor={column.name}>
                {column.name}
              </label>
              <InputText
                className="m-1"
                type="text"
                id={column.name}
                label={column.name}
                name={column.name}
                value={formData[column.name] ? formData[column.name].value : ""}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <Button label="Submit" icon="pi pi-check" type="submit" />
        </form>
      )}

      <span>Select A Table: </span>

      <Dropdown
        value={selectedTable}
        options={tableList.map((table) => ({ label: table, value: table }))}
        onChange={handleTableChange}
        placeholder="Select a table"
      />

      <Button label="Add New Item" icon="pi pi-plus" />

      {/* Borrow and view of data */}
      <DataTable value={data} tableStyle={{ minWidth: "50rem" }}>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
    </div>
  );
}

export default InsertForm;
