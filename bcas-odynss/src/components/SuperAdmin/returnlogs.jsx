import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";

const ReturnLogs = () => {
  const breadcrumb = [{ label: "Return Logs" }];
  const home = { icon: "pi pi-home" };

  const [returnLogs, setReturnLogs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "http://localhost:5005/api/ReturnBorrow/GetReturnLogs"
        ); // Assuming your API endpoint is '/api/GetBorrow'
        setReturnLogs(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <BreadCrumb model={breadcrumb} home={home} />
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round mt-3">
        <DataTable
          value={returnLogs}
          paginator
          rows={10}
          scrollable
          scrollHeight="700px"
          style={{ width: "100%" }}
          removableSort
        >
          <Column field="rt_id" header="ID" sortable />
          <Column field="message" header="Log Message" sortable />
          <Column field="dept_handler" header="Department Borrower" sortable />
          <Column field="formatted_rt_time" header="Borrow Time" sortable />
        </DataTable>
      </div>
    </div>
  );
};

export default ReturnLogs;
