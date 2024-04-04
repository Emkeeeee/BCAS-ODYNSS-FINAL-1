import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";

const ItemCategory = () => {
  const breadcrumb = [{ label: "Category List" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);

  const [category, setCategory] = useState([]);
  const [disabledCategory, setDisabledCategory] = useState([]);
  const [categoryId, setCategoryId] = useState([]);
  const [categoryValue, setCategoryValue] = useState({
    category: "",
    acronym: "",
  });

  const [categoryEditValue, setCategoryEditValue] = useState({
    cat_id: "",
    category: "",
    acronym: "",
  });

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const fetchItemDetails = async (catId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Category/GetCategoryViaUid?catId=${catId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setCategoryEditValue({
        cat_id: itemData[0].cat_id,
        category: itemData[0].category,
        acronym: itemData[0].acronym,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    FetchCategory();
    FetchDisabledCategory();
  }, []);

  const FetchCategory = () => {
    axios
      .get("http://localhost:5005/api/Inventory/GetCategory")
      .then((response) => {
        setCategory(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const FetchDisabledCategory = () => {
    axios
      .get("http://localhost:5005/api/Category/GetDeactCategory")
      .then((response) => {
        setDisabledCategory(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.cat_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.cat_id)}
        />
      </React.Fragment>
    );
  };

  const actionBodyTemplateDisable = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-refresh"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleRestore(rowData.cat_id)}
        />
      </React.Fragment>
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/DeactivateCategory?catId=${categoryId}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        FetchCategory();
        FetchDisabledCategory();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/ActivateCategory?catId=${categoryId}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        FetchCategory();
        FetchDisabledCategory();
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleDelete = (category) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setCategoryId(category);
    setvisibleDelete(true);
  };

  const handleEdit = (category) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setCategoryId(category);
    setVisibleEdit(true);
    fetchItemDetails(category);
  };

  const handleRestore = (category) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setCategoryId(category);
    setVisibleRestore(true);
  };

  const handleInputChange = (e) => {
    setCategoryValue({ ...categoryValue, [e.target.name]: e.target.value });
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setCategoryEditValue((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5005/api/Category/AddCategory",
        categoryValue,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      setCategoryValue({
        category: "",
        acronym: "",
      });
      FetchCategory();
      const message = "Successfully added a category.";
      showSuccess(message);
      setVisibleAdd(false);
    } catch (error) {
      console.error("Error:", error);
      const message =
        "Category name or acronym already exists. Please try again.";
      showFail(message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5005/api/Category/EditCategory",
        {
          catId: parseInt(categoryEditValue.cat_id),
          catName: categoryEditValue.category,
          acronym: categoryEditValue.acronym,
        }
      );
      console.log(response.data);
      setCategoryEditValue({
        catId: "",
        category: "",
        acronym: "",
      });
      FetchCategory();
      const message = "Successfully edited category";
      showSuccess(message);
      setVisibleEdit(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showFail = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Failure",
      detail: message,
      life: 3000,
    });
  };

  return (
    <div>
      <BreadCrumb model={breadcrumb} home={home} />
      <Toast ref={toast} />

      <Dialog
        header="Confirm Delete"
        visible={visibleDelete}
        style={{ width: "50vw" }}
        onHide={() => setvisibleDelete(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to delete {categoryId} ?</p>

        <Button
          label="Yes"
          className="mr-5 w-3"
          severity="danger"
          onClick={handleDeleteYes}
        />
        <Button
          label="No"
          className="w-3"
          onClick={() => setvisibleDelete(false)}
        />
      </Dialog>

      <Dialog
        header="Confirm Restore"
        visible={visibleRestore}
        style={{ width: "50vw" }}
        onHide={() => setVisibleRestore(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to restore {categoryId} ?</p>

        <Button
          label="Yes"
          className="mr-5 w-3"
          severity="danger"
          onClick={handleRestoreYes}
        />
        <Button
          label="No"
          className="w-3"
          onClick={() => setVisibleRestore(false)}
        />
      </Dialog>

      <Dialog
        header="Add New Category"
        visible={visibleAdd}
        style={{ width: "50vw" }}
        onHide={() => setVisibleAdd(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <form onSubmit={handleSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Category Name:
                </label>
                <InputText
                  id="category"
                  name="category"
                  value={categoryValue.category}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="acronym">
                  Category Acronym:
                </label>
                <InputText
                  id="catAc"
                  name="acronym"
                  value={categoryValue.acronym}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button label="Add" icon="pi pi-plus" />
            </form>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Edit Category"
        visible={visibleEdit}
        style={{ width: "50vw" }}
        onHide={() => setVisibleEdit(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h3>Your are now editing category id {categoryId}</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <InputText
                  id="catId"
                  name="cat_id"
                  value={categoryEditValue.cat_id}
                  onChange={handleInputEditChange}
                  hidden
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Category Name:
                </label>
                <InputText
                  id="catName"
                  name="category"
                  value={categoryEditValue.category}
                  onChange={handleInputEditChange}
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="acronym">
                  Category Acronym:
                </label>
                <InputText
                  id="deptAc"
                  name="acronym"
                  value={categoryEditValue.acronym}
                  onChange={handleInputEditChange}
                  required
                />
              </div>

              <Button label="Edit" icon="pi pi-pencil" />
            </form>
          </div>
        </div>
      </Dialog>

      <Button
        icon="pi pi-plus"
        label="Add Category"
        onClick={() => setVisibleAdd(true)}
      />
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Category">
            <DataTable
              value={category}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="cat_id" header="ID" />
              <Column field="category" header="Category Name" />
              <Column field="acronym" header="Acronym" />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Category">
            <DataTable
              value={disabledCategory}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="cat_id" header="ID" />
              <Column field="category" header="Category Name" />
              <Column field="acronym" header="Acronym" />
              <Column
                body={actionBodyTemplateDisable}
                exportable={false}
                style={{ minWidth: "12rem" }}
              ></Column>
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default ItemCategory;
