import React from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const breadcrumb = [{ label: "User List" }];
const home = { icon: "pi pi-home" };

const BrokenItems = () => {
  return (
    <div>
      <BreadCrumb model={breadcrumb} home={home} />
      <h1>Broken Items Page</h1>
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Users"></TabPanel>
          <TabPanel header="Disabled Users">
            <p className="m-0"></p>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default BrokenItems;
