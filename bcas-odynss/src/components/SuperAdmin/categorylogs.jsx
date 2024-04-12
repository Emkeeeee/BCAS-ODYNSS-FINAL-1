import React, { useState, useEffect } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";

const CategoryLogs = () => {
  const breadcrumb = [{ label: "Category Logs" }];
  const home = { icon: "pi pi-home" };

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Fetch account logs when the component mounts
    axios
      .get("http://localhost:5005/api/Category/CategoryLogs")
      .then((response) => {
        setLogs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching account logs:", error);
      });
  }, []);

  return (
    <div>
      <BreadCrumb model={breadcrumb} home={home} />
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round mt-3">
        <DataTable
          value={logs}
          paginator
          rows={10}
          scrollable
          scrollHeight="700px"
          style={{ width: "100%" }}
          removableSort
        >
          <Column field="catlog_id" header="ID" sortable />
          <Column field="action" header="Action done by Admin" sortable />
          <Column field="value" header="Category Value" sortable />
          <Column field="admin" header="Admin" sortable />
          <Column field="formatted_time" header="Time of Action" sortable />
        </DataTable>
      </div>
    </div>
  );
};

export default CategoryLogs;
