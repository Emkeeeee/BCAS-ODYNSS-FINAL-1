import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";

const SubCategoryPage = () => {
  const breadcrumb = [{ label: "User List" }];
  const home = { icon: "pi pi-home" };
  const toast = useRef(null);
  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [disabledSubCategory, setDisabledSubCategory] = useState([]);
  const [subCategoryId, setSubCategoryId] = useState([]);
  const [subCategoryValue, setSubCategoryValue] = useState({
    cat_id: "",
    subCategory: "",
    acronym: "",
  });
  const [subCategoryEditValue, setSubCategoryEditValue] = useState({
    subCat_id: "",
    subCategory: "",
    acronym: "",
  });

  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const fetchItemDetails = async (catId, subCatId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Category/GetSubcategoryViaUid?catId=${catId}&subCatId=${subCatId}`
      );
      const itemData = response.data;
      console.log(itemData);
      setSubCategoryEditValue({
        subCat_id: itemData[0].subCat_id,
        subCategory: itemData[0].subCategory,
        acronym: itemData[0].acronym,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    setSubCategoryValue((prevState) => ({
      ...prevState,
      cat_id: selectedCategory.toString(),
    }));
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetCategory"
      );
      const transformedCategory = response.data.map((category) => ({
        label: category.category,
        value: category.cat_id,
      }));
      setCategory(transformedCategory);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchSubCategories = async (catid) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetSubCategory?cat_id=${catid}`
      );
      setSubCategory(response.data);
      console.log(subCategory);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchDisabledSubCategory = (catid) => {
    axios
      .get(
        `http://localhost:5005/api/Category/GetDeactSubCategory?catId=${catid}`
      )
      .then((response) => {
        setDisabledSubCategory(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
      fetchDisabledSubCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.cat_id, rowData.subCat_id)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => handleDelete(rowData.subCat_id)}
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
          onClick={() => handleRestore(rowData.subCat_id)}
        />
      </React.Fragment>
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/DeactivateSubcategory?subCatId=${subCategoryId}&creatorId=${userData.user_id}`
      )
      .then((response) => {
        console.log(response.data);
        setvisibleDelete(false);
        fetchSubCategories(selectedCategory);
        fetchDisabledSubCategory(selectedCategory);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
        showFail();
      });
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Category/ActivateSubcategory?subCatId=${subCategoryId}&creatorId=${userData.user_id}`
      )
      .then((response) => {
        console.log(response.data);
        setVisibleRestore(false);
        fetchSubCategories(selectedCategory);
        fetchDisabledSubCategory(selectedCategory);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleDelete = (subcategory) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setSubCategoryId(subcategory);
    setvisibleDelete(true);
  };

  const handleEdit = (category, subcategory) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setSubCategoryId(subcategory);
    setVisibleEdit(true);
    fetchItemDetails(category, subcategory);
  };

  const handleRestore = (subcategory) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setSubCategoryId(subcategory);
    setVisibleRestore(true);
  };

  const handleInputChange = (e) => {
    setSubCategoryValue({
      ...subCategoryValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryEditValue((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    const postData = {
      cat_id: subCategoryValue.cat_id.toString(),
      subCategory: subCategoryValue.subCategory,
      acronym: subCategoryValue.acronym,
    };

    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5005/api/Category/AddSubcategory?creatorId=${userData.user_id}`,
        postData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      setSubCategoryValue({
        subCategory: "",
        acronym: "",
      });
      fetchSubCategories(selectedCategory);
      const message = "Successfully added a category.";
      showSuccess(message);
      setVisibleAdd(false);
    } catch (error) {
      console.error("Error:", error);
      const message =
        "Subcategory name or acronym already exists. Please try again.";
      showFail(message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5005/api/Category/EditSubcategory?creatorId=${userData.user_id}`,
        {
          SubCatId: parseInt(subCategoryEditValue.subCat_id),
          SubCatName: subCategoryEditValue.subCategory,
          Acronym: subCategoryEditValue.acronym,
        }
      );
      console.log(response.data);
      setSubCategoryEditValue({
        subCat_id: "",
        subCategory: "",
        acronym: "",
      });
      fetchSubCategories(selectedCategory);
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
        <p>Are you sure you want to delete {subCategoryId} ?</p>

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
        <p>Are you sure you want to restore {subCategoryId} ?</p>

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
        header="Add New Subcategory"
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
                  Category:
                </label>

                <Dropdown
                  name="cat_id"
                  value={subCategoryValue.cat_id}
                  options={category}
                  onChange={handleInputChange}
                  optionLabel="label"
                  placeholder="Select Category"
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Subcategory Name:
                </label>
                <InputText
                  id="subCategory"
                  name="subCategory"
                  value={subCategoryValue.subCategory}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="acronym">
                  Subcategory Acronym:
                </label>
                <InputText
                  id="subCatAc"
                  name="acronym"
                  value={subCategoryValue.acronym}
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
        header="Edit Subcategory"
        visible={visibleEdit}
        style={{ width: "50vw" }}
        onHide={() => setVisibleEdit(false)}
        className="w-3"
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h3>Your are now editing subcategory id {subCategoryId}</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <InputText
                  id="subCat_id"
                  name="subCat_id"
                  value={subCategoryEditValue.subCat_id}
                  onChange={handleInputEditChange}
                  hidden
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="category">
                  Subcategory Name:
                </label>
                <InputText
                  id="subCategory"
                  name="subCategory"
                  value={subCategoryEditValue.subCategory}
                  onChange={handleInputEditChange}
                  required
                />
              </div>

              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="acronym">
                  Subcategory Acronym:
                </label>
                <InputText
                  id="deptAc"
                  name="acronym"
                  value={subCategoryEditValue.acronym}
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
        label="Add Subcategory"
        onClick={() => setVisibleAdd(true)}
      />
      <label>Select a Category:</label>
      <Dropdown
        value={selectedCategory}
        options={category}
        onChange={(e) => setSelectedCategory(e.value)}
        optionLabel="label"
        placeholder="Filter by Category"
        className="w-full md:w-14rem"
      />
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <TabView>
          <TabPanel header="Active Subcategory">
            <DataTable
              value={subCategory}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="subCat_id" header="ID" />
              <Column field="subCategory" header="Subcategory Name" />\
              <Column field="acronym" header="Acronym" />
              <Column
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "12rem" }}
              />
            </DataTable>
          </TabPanel>
          <TabPanel header="Disabled Subcategory">
            <DataTable
              value={disabledSubCategory}
              paginator
              rows={5}
              scrollable
              scrollHeight="550px"
              style={{ width: "100%" }}
            >
              <Column field="subCat_id" header="ID" />
              <Column field="subCategory" header="Subcategory Name" />
              <Column field="acronym" header="Acronym" />
              <Column
                body={actionBodyTemplateDisable}
                exportable={false}
                style={{ minWidth: "12rem" }}
              />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default SubCategoryPage;
