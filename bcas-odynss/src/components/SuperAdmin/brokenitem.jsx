import React, { useState, useEffect, useRef } from "react";
import { BreadCrumb } from "primereact/breadcrumb";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import axios from "axios";

const BrokenItems = () => {
  const breadcrumb = [{ label: "Broken Items" }];
  const home = { icon: "pi pi-home" };
  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  const [brokenItems, setBrokenItems] = useState([]);
  const [visibleReplace, setVisibleReplace] = useState(false);
  const [visibleDelete, setVisibleDelete] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);

  const [formEditData, setFormEditData] = useState({
    old_item_uid: "",
    item_name: "",
    item_desc: "",
    remarks: "",
    dept_id: "",
    cat_id: "",
    subCat_id: "",
    unqFeat_id: "",
    unqFeat: "",
    invBy: "",
    loc_id: "",
    item_uid: "",
  });
  const [itemUid, setItemUid] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [uniqueFeature, setUniqueFeature] = useState([]);
  const [uniqueFeatureVal, setUniqueFeatureVal] = useState([]);
  const [location, setLocation] = useState([]);

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setFormEditData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    try {
      axios
        .put(
          `http://localhost:5005/api/Inventory/UpdateItemViaUid?creatorId=${userData.user_id}`,
          formEditData
        )
        .then((response) => {
          setFormEditData({
            itemUid: "",
            itemName: "",
            itemDesc: "",
            remarks: "",
            deptId: "",
            catId: "",
            subCatId: "",
            unqFeatId: "",
            unqFeature: "",
            invBy: "",
            locId: "",
          });
          setVisibleEdit(false);
          fetchBrokenItems();
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetReplaceItemViaUid?dept_id=${userData.department}&item_uid=${itemUid}`
      );
      const itemData = response.data;
      console.log(itemData);
      setFormEditData({
        old_item_uid: itemData[0].item_uid,
        item_name: itemData[0].item_name,
        item_desc: itemData[0].item_desc,
        remarks: itemData[0].remarks,
        dept_id: itemData[0].dept_id,
        cat_id: itemData[0].cat_id,
        subCat_id: itemData[0].subCat_id,
        unqFeat_id: itemData[0].unqFeat_id,
        unqFeat: itemData[0].unqFeat,
        invBy: userData.user_id,
        loc_id: itemData[0].loc_id,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    fetchBrokenItems();
  }, []);

  const fetchBrokenItems = () => {
    try {
      axios
        .get(
          `http://localhost:5005/api/Inventory/GetBrokenItem?dept_id=${userData.department}`
        )
        .then((response) => {
          // Extract data from the response
          setBrokenItems(response.data);
        });
    } catch (error) {}
  };

  useEffect(() => {
    fetchDepartments();
    fetchCategory();
    fetchUniqueFeature();
    fetchLocation();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetDepartments"
      );
      const transformedDepartments = response.data.map((department) => ({
        label: department.department,
        value: department.dept_id,
      }));
      setDepartments(transformedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

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

  const fetchSubCategories = async (catId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetSubCategory?cat_id=${catId}`
      );
      const transformedSubCategories = response.data.map((subCategory) => ({
        label: subCategory.subCategory,
        value: subCategory.subCat_id,
      }));
      setSubCategory(transformedSubCategories);
      console.log(subCategory);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    if (formEditData.cat_id) {
      fetchSubCategories(formEditData.cat_id);
    }
  }, [formEditData.cat_id]);

  useEffect(() => {
    if (formEditData.unqFeat_id) {
      fetchUniqueFeatureVal(formEditData.unqFeat_id);
    }
  }, [formEditData.unqFeat_id]);

  const fetchUniqueFeature = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetUniqueFeature"
      );
      const transformedUnqFeat = response.data.map((unqFeat) => ({
        label: unqFeat.unqFeature,
        value: unqFeat.unqFeat_id,
      }));
      setUniqueFeature(transformedUnqFeat);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchUniqueFeatureVal = async (unqFeatId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetUniqueFeatureValue?unqFeat_id=${unqFeatId}`
      );
      const transformedUniqueFeatureVal = response.data.map(
        (uniqueFeatureVal) => ({
          label: uniqueFeatureVal.unqFeatVal,
          value: uniqueFeatureVal.unqFeatVal,
        })
      );
      setUniqueFeatureVal(transformedUniqueFeatureVal);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchLocation = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5005/api/Inventory/GetLocation"
      );
      const transformedLocation = response.data.map((location) => ({
        label: location.location,
        value: location.loc_id,
      }));
      setLocation(transformedLocation);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-arrow-right-arrow-left"
          rounded
          outlined
          className="mr-2"
          onClick={() => openReplace(rowData.item_uid)}
        />
      </React.Fragment>
    );
  };
  const openReplace = (itemUid) => {
    setVisibleReplace(true);
    setItemUid(itemUid);
  };

  const replaceYes = () => {
    setVisibleReplace(false);
    setVisibleEdit(true);
    fetchItemDetails();
  };

  useEffect(() => {
    const { item_name, dept_id, cat_id, subCat_id, unqFeat } = formEditData;

    // Check if any required field is undefined, null, or an empty string
    if (item_name && dept_id && cat_id && subCat_id && unqFeat) {
      // All required fields have values, so append values to formData
      const newItemUid = `${item_name}_${dept_id}_${cat_id}_${subCat_id}_${unqFeat}`;
      setFormEditData((prevState) => ({ ...prevState, item_uid: newItemUid }));
    } else {
      // Any required field is empty, so reset itemUid to an empty string
      setFormEditData((prevState) => ({ ...prevState, item_uid: "" }));
    }
  }, [
    formEditData.item_name,
    formEditData.dept_id,
    formEditData.cat_id,
    formEditData.subCat_id,
    formEditData.unqFeat,
  ]);

  return (
    <div>
      <BreadCrumb model={breadcrumb} home={home} />
      <Dialog
        header="Edit Item"
        visible={visibleEdit}
        style={{ width: "30vw" }}
        onHide={() => setVisibleEdit(false)}
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <h2>You are now editing {itemUid}</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="itemName">
                  Item Name:
                </label>
                <InputText
                  name="item_name"
                  value={formEditData.item_name}
                  onChange={handleInputEditChange}
                  required
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="itemDesc">
                  Item Description:
                </label>
                <InputTextarea
                  autoResize
                  name="item_desc"
                  value={formEditData.item_desc}
                  onChange={handleInputEditChange}
                  required
                  rows={5}
                  cols={30}
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="remarks">
                  Remarks:
                </label>
                <InputTextarea
                  autoResize
                  name="remarks"
                  value={formEditData.remarks}
                  onChange={handleInputEditChange}
                  required
                  rows={5}
                  cols={30}
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="deptId">
                  Department:
                </label>
                <Dropdown
                  name="dept_id"
                  value={formEditData.dept_id} // Connect to formData.deptId
                  options={departments}
                  onChange={handleInputEditChange} // Update formData.deptId
                  optionLabel="label"
                  placeholder="Select a Department"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="catId">
                  Category:
                </label>
                <Dropdown
                  name="cat_id"
                  value={formEditData.cat_id}
                  options={category}
                  onChange={handleInputEditChange}
                  optionLabel="label"
                  placeholder="Select a Category"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="subCatId">
                  Subcategory:
                </label>
                <Dropdown
                  name="subCat_id"
                  value={formEditData.subCat_id}
                  options={subCategory}
                  onChange={handleInputEditChange}
                  optionLabel="label"
                  placeholder="Select a Subcategory"
                  disabled={subCategory.length === 0}
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="unqFeatId">
                  Unique Feature Category:
                </label>
                <Dropdown
                  name="unqFeat_id"
                  value={formEditData.unqFeat_id}
                  options={uniqueFeature}
                  onChange={handleInputEditChange}
                  optionLabel="label"
                  placeholder="Select a Unique Feature"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="unqFeature">
                  Unique Feature:
                </label>
                <Dropdown
                  name="unqFeat"
                  value={formEditData.unqFeat} // You can set a default value if needed
                  options={uniqueFeatureVal}
                  onChange={handleInputEditChange} // Handle subcategory selection here
                  optionLabel="label"
                  placeholder="Select a Unique Feature Value"
                  disabled={uniqueFeatureVal.length === 0} // Disable if there are no subcategories
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="locId">
                  Location:
                </label>
                <Dropdown
                  name="loc_id"
                  value={formEditData.loc_id}
                  options={location}
                  onChange={handleInputEditChange}
                  optionLabel="label"
                  placeholder="Select a Location"
                />
              </div>
              {/* Display itemUid */}
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="itemUid">
                  Generated itemUid:
                </label>
                <InputText
                  name="item_uid"
                  value={formEditData.item_uid}
                  onChange={handleInputEditChange}
                  readOnly
                  required
                />
              </div>

              <Button type="submit" label="Replace Item" />
            </form>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Confirm Replace"
        visible={visibleReplace}
        style={{ width: "50vw" }}
        onHide={() => setVisibleReplace(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to replace this item?</p>

        <Button label="Yes" className="mr-5 w-3" onClick={() => replaceYes()} />
        <Button
          label="No"
          severity="danger"
          className="w-3"
          onClick={() => setVisibleReplace(false)}
        />
      </Dialog>

      <Dialog
        header="Confirm Delete"
        visible={visibleDelete}
        style={{ width: "50vw" }}
        onHide={() => setVisibleDelete(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to delete this item?</p>

        <Button label="Yes" className="mr-5 w-3" severity="danger" />
        <Button
          label="No"
          className="w-3"
          onClick={() => setVisibleDelete(false)}
        />
      </Dialog>

      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
        <DataTable
          value={brokenItems}
          paginator
          rows={5}
          scrollable
          scrollHeight="550px"
          style={{ width: "100%" }}
        >
          <Column field="item_uid" header="ID" />
          <Column field="item_name" header="Item Name" />
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default BrokenItems;
