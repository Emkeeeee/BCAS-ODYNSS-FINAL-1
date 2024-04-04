import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { Sidebar } from "primereact/sidebar";
import axios from "axios";
import QrScanner from "qr-scanner";
import QRCodeStyling from "qr-code-styling";
import logo from "../../assets/images/bcaslogo.png";

const DataView = ({ userId }) => {
  //Data Values
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [uniqueFeature, setUniqueFeature] = useState([]);
  const [selectedUniqueFeature, setSelectedUniqueFeature] = useState([]);
  const [uniqueFeatureVal, setUniqueFeatureVal] = useState([]);
  const [selectedUniqueFeatureVal, setSelectedUniqueFeatureVal] = useState([]);
  const [location, setLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [itemUid, setItemUid] = useState([]);
  const userDataString = sessionStorage.getItem("userData");
  const userData = JSON.parse(userDataString);

  //Values for show and hide dialog and toasts
  const [visibleAction, setVisibleAction] = useState(false);
  const [visibleAddNew, setvisibleAddNew] = useState(false);
  const [visibleAddExist, setvisibleAddExist] = useState(false);
  const [visibleQrSearch, setvisibleQrSearch] = useState(false);
  const [visibleQrSearchVid, setvisibleQrSearchVid] = useState(false);
  const [visibleQrSearchUpload, setvisibleQrSearchUpload] = useState(false);
  const [visibleDelete, setvisibleDelete] = useState(false);
  const [visibleRight, setVisibleRight] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [visibleQr, setVisibleQr] = useState(false);
  const [visibleBorrow, setVisibleBorrow] = useState(false);
  const toast = useRef(null);
  const qrRef = useRef(null);

  //QR Code Handlers
  const [fileExt, setFileExt] = useState("png");
  const [Qr, setQr] = useState([]);
  const videoRef = useRef(null);

  const onDownloadClick = () => {
    qrCode.download({
      extension: fileExt,
    });
  };

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    image: logo,
    dotsOptions: {
      color: "#009341",
      type: "rounded",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 20,
    },
  });

  const StartQR = () => {
    const videoElem = videoRef.current;
    const qrScanner = new QrScanner(videoElem, (result) => setQr(result.data), {
      /* your options or returnDetailedScanResult: true if you're not specifying any other options */
      highlightScanRegion: true,
      highlightCodeOutline: true,
      returnDetailedScanResult: true,
    });

    // Start scanning
    qrScanner.start();
  };

  const stopVideo = () => {
    const videoElem = videoRef.current;
    const qrScanner = new QrScanner(videoElem);
    setQr("");
    console.log(Qr);
    qrScanner.stop();
  };

  useEffect(() => {
    if (Qr.length > 0) {
      fetchItems();
      fetchExpandableItems(Qr);
      setvisibleQrSearchVid(false);
      setQr("");
    }
  }, [Qr]);

  //Data for post processing
  const [formData, setFormData] = useState({
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

  const [formEditData, setFormEditData] = useState({
    oldItemUid: "",
    itemName: "",
    itemDesc: "",
    remarks: "",
    deptId: "",
    catId: "",
    subCatId: "",
    unqFeatId: "",
    unqFeature: "",
    inventoryBy: "",
    locId: "",
    itemUid: "",
  });

  //Fetch Data For Dropdowns
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
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (formData.catId) {
      fetchSubCategories(formData.catId);
    }
  }, [formData.catId]);

  useEffect(() => {
    if (formData.unqFeatId) {
      fetchUniqueFeatureVal(formData.unqFeatId);
    }
  }, [formData.unqFeatId]);

  useEffect(() => {
    if (formEditData.catId) {
      fetchSubCategories(formEditData.catId);
    }
  }, [formEditData.catId]);

  useEffect(() => {
    if (formEditData.unqFeatId) {
      fetchUniqueFeatureVal(formEditData.unqFeatId);
    }
  }, [formEditData.unqFeatId]);

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

  useEffect(() => {
    if (selectedUniqueFeature) {
      fetchUniqueFeatureVal(selectedUniqueFeature);
    }
  }, [selectedUniqueFeature]);

  // Fetch Data for Table Data View
  useEffect(() => {
    if (
      selectedDepartment ||
      selectedCategory ||
      selectedSubCategory ||
      selectedUniqueFeature
    ) {
      fetchItems();
      fetchExpandableItems();
    }
  }, [
    selectedDepartment,
    selectedCategory,
    selectedSubCategory,
    selectedUniqueFeature,
  ]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetActiveItems?dept_id=${selectedDepartment}&cat_id=${selectedCategory}&subCat_id=${selectedSubCategory}&unqFeat_id=${selectedUniqueFeature}`
      );
      setItems(response.data);
      console.log(items);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchExpandableItems = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetActiveItemsExpandable?dept_id=${selectedDepartment}&cat_id=${selectedCategory}&subCat_id=${selectedSubCategory}&unqFeat_id=${selectedUniqueFeature}
        &loc_id=${selectedLocation}&item_uid=${Qr}`
      );
      setExpandedItems(response.data);
      console.log(expandedItems);
    } catch (error) {
      console.error("Error fetching expandable items:", error);
    }
  };

  const rowExpansionTemplate = (item) => {
    const filteredExpandedItems = expandedItems.filter(
      (expandedItem) => expandedItem.item_name === item.item_name
    );

    return (
      <div className="p-grid">
        <DataTable
          value={filteredExpandedItems}
          className="p-datatable-expandable"
        >
          <Column field="item_uid" header="UID" />
          <Column field="remarks" header="Remarks" />
          <Column field="invTime" header="Last Inventory Time" />
          <Column field="invBy" header="Last Inventory By" />
          <Column field="isOut" header="Borrowed" body={borrowedBodyTemplate} />
          <Column field="borrowBy" header="Borrowed By" />
          <Column field="location" header="Location" />
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "12rem" }}
          ></Column>
        </DataTable>
      </div>
    );
  };

  const borrowedBodyTemplate = (rowData) => {
    return rowData.isOut ? "Yes" : "No";
  };

  const allowExpansion = (items) => {
    return (
      items.item_uid !== undefined &&
      items.remarks !== undefined &&
      items.invTime !== undefined &&
      items.invBy !== undefined &&
      items.isOut !== undefined &&
      items.borrowBy !== undefined &&
      items.location !== undefined
    );
  };

  const handleDeleteYes = () => {
    axios
      .put(
        `http://localhost:5005/api/Inventory/DeactivateItem?itemUID=${itemUid}`
      )
      .then((response) => {
        console.log(response.data);
        fetchExpandableItems();
        fetchItems();
        setvisibleDelete(false);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  useEffect(() => {
    // This will run whenever itemUid changes
    qrCode.update({
      data: itemUid,
    });
    console.log(itemUid);

    if (visibleQr) {
      qrCode.append(qrRef.current);
    }

    // Cleanup: Remove the appended QR code when component unmounts
    return () => {
      if (visibleQr) {
        qrRef.current.innerHTML = ""; // Clear the contents of the QR container
      }
    };
  }, [itemUid, visibleQr]);

  const handleQRCodeGen = (uid) => {
    setItemUid(uid);
    setVisibleQr(true);
  };

  const handleDelete = (uid) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setItemUid(uid);
    setvisibleDelete(true);
  };

  const handleEdit = (uid) => {
    setItemUid(uid);
    console.log(formEditData);
    setVisibleEdit(true);
  };

  const handleQrSearchVid = () => {
    setvisibleQrSearch(false);
    setvisibleQrSearchVid(true);
  };

  const handleQrSearchUpload = () => {
    setvisibleQrSearch(false);
    setvisibleQrSearchUpload(true);
  };

  const handleBorrow = (itemUid) => {
    setVisibleBorrow(true);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-user"
          rounded
          outlined
          severity="secondary"
          className="mr-2"
          onClick={() => handleBorrow()}
          visible={rowData.isOut === false}
        />
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.item_uid)}
          visible={rowData.isOut === false}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          className="mr-2"
          onClick={() => handleDelete(rowData.item_uid)}
          visible={rowData.isOut === false}
        />
        <Button
          icon="pi pi-qrcode"
          rounded
          outlined
          severity="info"
          onClick={() => handleQRCodeGen(rowData.item_uid)}
        />
      </React.Fragment>
    );
  };

  const footerContent = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setVisibleAction(false)}
        className="p-button-text"
      />
    </div>
  );

  const newItemDialogOpen = () => {
    setVisibleAction(false);
    setvisibleAddNew(true);
  };

  const existingItemDialogOpen = () => {
    setVisibleAction(false);
    setvisibleAddExist(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target || e;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5005/api/Inventory/AddItem",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);
      setFormData({
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
      showSuccess();
      setvisibleAddNew(false);
      fetchItems();
      fetchExpandableItems();
    } catch (error) {
      console.error("Error:", error);
      showFail();
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/Inventory/GetItemViaUid?dept_id=${selectedDepartment}&item_uid=${itemUid}`
      );
      const itemData = response.data;
      console.log(itemData);
      setFormEditData({
        oldItemUid: itemData[0].item_uid,
        itemName: itemData[0].item_name,
        itemDesc: itemData[0].item_desc,
        remarks: itemData[0].remarks,
        deptId: itemData[0].dept_id,
        catId: itemData[0].cat_id,
        subCatId: itemData[0].subCat_id,
        unqFeatId: itemData[0].unqFeat_id,
        unqFeature: itemData[0].unqFeat,
        inventoryBy: userData.user_id,
        locId: itemData[0].loc_id,
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  useEffect(() => {
    if (selectedDepartment && itemUid) {
      fetchItemDetails();
    }
  }, [selectedDepartment, itemUid]);

  useEffect(() => {
    console.log(formEditData); // Log formEditData after it's updated
  }, [formEditData]); // Watch for changes in formEditData

  // Render your component JSX

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setFormEditData((prevState) => ({ ...prevState, [name]: value }));
  };

  useEffect(() => {
    const { itemName, deptId, catId, unqFeature, locId } = formData;

    // Check if any required field is undefined, null, or an empty string
    if (itemName && deptId && catId && unqFeature && locId) {
      // All required fields have values, so append values to formData
      const newItemUid = `${itemName}_${deptId}_${catId}_${unqFeature}_${locId}`;
      setFormData((prevState) => ({ ...prevState, itemUid: newItemUid }));
    } else {
      // Any required field is empty, so reset itemUid to an empty string
      setFormData((prevState) => ({ ...prevState, itemUid: "" }));
    }
  }, [
    formData.itemName,
    formData.deptId,
    formData.catId,
    formData.unqFeature,
    formData.locId,
  ]);

  useEffect(() => {
    const { itemName, deptId, catId, unqFeature, locId } = formEditData;

    // Check if any required field is undefined, null, or an empty string
    if (itemName && deptId && catId && unqFeature && locId) {
      // All required fields have values, so append values to formData
      const newItemUid = `${itemName}_${deptId}_${catId}_${unqFeature}_${locId}`;
      setFormEditData((prevState) => ({ ...prevState, itemUid: newItemUid }));
    } else {
      // Any required field is empty, so reset itemUid to an empty string
      setFormEditData((prevState) => ({ ...prevState, itemUid: "" }));
    }
  }, [
    formEditData.itemName,
    formEditData.deptId,
    formEditData.catId,
    formEditData.unqFeature,
    formEditData.locId,
  ]);

  //Toast
  const showSuccess = () => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Message Content",
      life: 3000,
    });
  };

  const showFail = () => {
    toast.current.show({
      severity: "danger",
      summary: "Failure",
      detail: "An error occurred while processing",
      life: 3000,
    });
  };

  const handleClear = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedUniqueFeature("");
    setSelectedUniqueFeatureVal("");
    setSelectedLocation("");
    setQr("");
    fetchExpandableItems("");
  };

  const [qrUploadResult, setQrUploadResult] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    QrScanner.scanImage(file, { returnDetailedScanResult: true })
      .then((result) => setQrUploadResult(result))
      .catch((e) => setQrUploadResult({ data: e || "No QR code found." }));
  };

  const handleAddItem = () => {
    setFormData({ invBy: userData.user_id });
    setvisibleAddNew(true);
  };

  return (
    <div>
      <Sidebar
        visible={visibleRight}
        position="right"
        onHide={() => setVisibleRight(false)}
        className="flex flex-column"
      >
        <h2>Filter Table</h2>
        <Button
          icon="pi pi-filter-slash"
          label="Clear Filter"
          className="mb-4"
          onClick={handleClear}
          rounded
        />
        <div className="mb-3">
          <label>Select a Category:</label>
          <Dropdown
            value={selectedCategory}
            options={category}
            onChange={(e) => setSelectedCategory(e.value)}
            optionLabel="label"
            placeholder="Filter by Category"
            className="w-full md:w-14rem"
          />
        </div>
        <div className="mb-3">
          <label>Select a Subcategory:</label>
          <Dropdown
            value={selectedSubCategory} // You can set a default value if needed
            options={subCategory}
            onChange={(e) => setSelectedSubCategory(e.value)} // Handle subcategory selection here
            optionLabel="label"
            placeholder="Filter by Subcategory"
            disabled={subCategory.length === 0} // Disable if there are no subcategories
            className="w-full md:w-14rem"
          />
        </div>
        <div className="mb-3">
          <label>Select a Unique Feature:</label>
          <Dropdown
            value={selectedUniqueFeature}
            options={uniqueFeature}
            onChange={(e) => setSelectedUniqueFeature(e.value)}
            optionLabel="label"
            placeholder="Filter by Feature"
            className="w-full md:w-14rem"
          />
        </div>
        <div className="mb-3">
          <label>Select a Value of Unique Feature:</label>
          <Dropdown
            value={selectedUniqueFeatureVal} // You can set a default value if needed
            options={uniqueFeatureVal}
            onChange={(e) => setSelectedUniqueFeatureVal(e.value)} // Handle subcategory selection here
            optionLabel="label"
            placeholder="Filter by Feature Value"
            disabled={uniqueFeatureVal.length === 0} // Disable if there are no subcategories
            className="w-full md:w-14rem"
          />
        </div>

        <div className="mb-3">
          <label>Select a Location:</label>
          <Dropdown
            value={selectedLocation}
            options={location}
            onChange={(e) => setSelectedLocation(e.value)}
            optionLabel="label"
            placeholder="Filter by Location"
            className="w-full md:w-14rem"
          />
        </div>
      </Sidebar>

      <Toast ref={toast} />

      <Button icon="pi pi-plus" label="Add Item" onClick={handleAddItem} />

      <Button
        icon="pi pi-qrcode"
        rounded
        onClick={() => setvisibleQrSearch(true)}
      />

      <Button
        icon="pi pi-filter"
        rounded
        onClick={() => setVisibleRight(true)}
      />

      <Dropdown
        value={selectedDepartment}
        options={departments}
        onChange={(e) => setSelectedDepartment(e.value)}
        optionLabel="label"
        placeholder="Select a Department"
        className="w-full md:w-14rem"
      />

      <div className="card shadow-2">
        <DataTable
          value={items}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="item_name"
          removableSort
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          scrollable
          scrollHeight="550px"
        >
          <Column expander={allowExpansion} style={{ width: "3em" }} />
          <Column sortable field="item_name" header="Item Name" />
          <Column sortable field="item_desc" header="Item Description" />
          <Column sortable field="qty" header="Qty" />
          <Column sortable field="stock" header="Stock" />
        </DataTable>
      </div>

      {/* Dialog Boxes */}
      <Dialog
        header="Borrow Item"
        visible={visibleBorrow}
        style={{ width: "50vw" }}
        onHide={() => setVisibleBorrow(false)}
        className="text-center w-3"
      >
        TITE
      </Dialog>

      <Dialog
        header="QR Code Generator"
        visible={visibleQr}
        style={{ width: "50vw" }}
        onHide={() => setVisibleQr(false)}
        className="text-center w-3"
      >
        <div ref={qrRef}></div>
        <p>{itemUid}</p>
        <button onClick={onDownloadClick}>Download</button>
      </Dialog>

      <Dialog
        header="Confirm Delete"
        visible={visibleDelete}
        style={{ width: "50vw" }}
        onHide={() => setvisibleDelete(false)}
        className="text-center w-3"
      >
        <p>Are you sure you want to delete item {itemUid} ?</p>

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
        header="Choose an action"
        visible={visibleAction}
        style={{ width: "30vw" }}
        onHide={() => setVisibleAction(false)}
        footer={footerContent}
      >
        <p className="m-0 flex justify-content-center">
          <Button
            className="flex m-2"
            label="New Item"
            onClick={newItemDialogOpen}
          />
          <Button
            className="flex m-2"
            label="Add Existing Item"
            onClick={existingItemDialogOpen}
          />
        </p>
      </Dialog>

      <Dialog
        header="Search Via Qr"
        visible={visibleQrSearch}
        style={{ width: "20vw" }}
        onHide={() => setvisibleQrSearch(false)}
        className="flex justify-content-center"
      >
        <Button label="Scan Search" onClick={handleQrSearchVid} />

        <Divider className="bg-primary-300" align="center">
          <span className="p-tag">OR</span>
        </Divider>

        <Button label="Upload Search" onClick={handleQrSearchUpload} />
      </Dialog>

      <Dialog
        header="Search Via Qr"
        visible={visibleQrSearchVid}
        style={{ width: "50vw" }}
        onHide={() => setvisibleQrSearchVid(false)}
      >
        <h3>Scan QR:</h3>
        <button onClick={StartQR}>Start Video</button>
        <button onClick={stopVideo}>Stop Video</button>
        <div style={{ position: "relative" }}>
          <video ref={videoRef} style={{ width: "100%" }} autoPlay />
        </div>
      </Dialog>

      <Dialog
        header="Search Via Qr"
        visible={visibleQrSearchUpload}
        style={{ width: "20vw" }}
        onHide={() => setvisibleQrSearchUpload(false)}
      >
        <h3>Upload QR: </h3>
        <input type="file" id="file-selector" onChange={handleFileChange} />
        <div>{qrUploadResult.data || ""}</div>
      </Dialog>

      <Dialog
        header="Add Existing Item"
        visible={visibleAddExist}
        style={{ width: "30vw" }}
        onHide={() => setvisibleAddExist(false)}
        footer={footerContent}
      ></Dialog>

      <Dialog
        header="Add New Item"
        visible={visibleAddNew}
        style={{ width: "30vw" }}
        onHide={() => setvisibleAddNew(false)}
        footer={footerContent}
      >
        <div class="formgrid grid">
          <div class="flex flex-column field col">
            <form onSubmit={handleSubmit} className="flex flex-column">
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="itemName">
                  Item Name:
                </label>
                <InputText
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="itemDesc">
                  Item Description:
                </label>
                <InputTextarea
                  autoResize
                  name="itemDesc"
                  value={formData.itemDesc}
                  onChange={handleInputChange}
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
                  value={formData.remarks}
                  onChange={handleInputChange}
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
                  name="deptId"
                  value={formData.deptId} // Connect to formData.deptId
                  options={departments}
                  onChange={handleInputChange} // Update formData.deptId
                  optionLabel="label"
                  placeholder="Select a Department"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="catId">
                  Category:
                </label>
                <Dropdown
                  name="catId"
                  value={formData.catId}
                  options={category}
                  onChange={handleInputChange}
                  optionLabel="label"
                  placeholder="Select a Department"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="subCatId">
                  Subcategory:
                </label>
                <Dropdown
                  name="subCatId"
                  value={formData.subCatId}
                  options={subCategory}
                  onChange={handleInputChange}
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
                  name="unqFeatId"
                  value={formData.unqFeatId}
                  options={uniqueFeature}
                  onChange={handleInputChange}
                  optionLabel="label"
                  placeholder="Select a Unique Feature"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="unqFeature">
                  Unique Feature:
                </label>
                <Dropdown
                  name="unqFeature"
                  value={formData.unqFeature} // You can set a default value if needed
                  options={uniqueFeatureVal}
                  onChange={handleInputChange} // Handle subcategory selection here
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
                  name="locId"
                  value={formData.locId}
                  options={location}
                  onChange={handleInputChange}
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
                  name="itemUid"
                  value={formData.itemUid}
                  readOnly
                  required
                />
              </div>

              <Button type="submit" label="Add Item" />
            </form>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Edit Item"
        visible={visibleEdit}
        style={{ width: "30vw" }}
        onHide={() => setVisibleEdit(false)}
        footer={footerContent}
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
                  name="itemName"
                  value={formEditData.itemName}
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
                  name="itemDesc"
                  value={formEditData.itemDesc}
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
                  name="deptId"
                  value={formEditData.deptId} // Connect to formData.deptId
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
                  name="catId"
                  value={formEditData.catId}
                  options={category}
                  onChange={handleInputEditChange}
                  optionLabel="label"
                  placeholder="Select a Department"
                />
              </div>
              <div className="flex flex-column mb-2">
                <label className="mb-2" htmlFor="subCatId">
                  Subcategory:
                </label>
                <Dropdown
                  name="subCatId"
                  value={formEditData.subCatId}
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
                  name="unqFeatId"
                  value={formEditData.unqFeatId}
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
                  name="unqFeature"
                  value={formEditData.unqFeature} // You can set a default value if needed
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
                  name="locId"
                  value={formEditData.locId}
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
                  name="itemUid"
                  value={formEditData.itemUid}
                  onChange={handleInputEditChange}
                  readOnly
                  required
                />
              </div>

              <Button type="submit" label="Edit Item" />
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DataView;
