import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";

const BorrowLogs = () => {
  const breadcrumb = [{ label: "Borrow Logs" }];
  const home = { icon: "pi pi-home" };

  const [borrowLogs, setBorrowLogs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "http://localhost:5005/api/ReturnBorrow/GetBorrowLogs"
        ); // Assuming your API endpoint is '/api/GetBorrow'
        setBorrowLogs(response.data);
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
          value={borrowLogs}
          paginator
          rows={10}
          scrollable
          scrollHeight="700px"
          style={{ width: "100%" }}
          removableSort
        >
          <Column field="brw_id" header="ID" sortable />
          <Column field="message" header="Log Message" sortable />
          <Column field="dept_handler" header="Department Handler" sortable />
          <Column field="formatted_brw_time" header="Borrow Time" sortable />
        </DataTable>
      </div>
    </div>
  );
};

export default BorrowLogs;
