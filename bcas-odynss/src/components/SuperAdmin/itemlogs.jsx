import React, { useState, useEffect } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";

const ItemLogs = () => {
  const breadcrumb = [{ label: "Item Logs" }];
  const home = { icon: "pi pi-home" };

  const [itemLogs, setItemLogs] = useState([]);

  useEffect(() => {
    // Fetch account logs when the component mounts
    axios
      .get("http://localhost:5005/api/Inventory/GetItemLogs")
      .then((response) => {
        setItemLogs(response.data);
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
          value={itemLogs}
          paginator
          rows={10}
          scrollable
          scrollHeight="700px"
          style={{ width: "100%" }}
          removableSort
        >
          <Column field="itemlog_id" header="ID" sortable />
          <Column field="item_uid" header="Item" sortable />
          <Column field="action" header="Action done" sortable />
          <Column field="dept_handler" header="User" sortable />
          <Column field="formatted_time" header="Time of Action" sortable />
        </DataTable>
      </div>
    </div>
  );
};

export default ItemLogs;
