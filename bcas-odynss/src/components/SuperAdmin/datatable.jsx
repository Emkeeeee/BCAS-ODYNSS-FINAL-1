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
import { TabView, TabPanel } from "primereact/tabview";
import axios from "axios";
import QrScanner from "qr-scanner";
import QRCodeStyling from "qr-code-styling";
import logo from "../../assets/images/bcaslogo.png";

const DataView = ({ userId }) => {
  //Data Values
  const [items, setItems] = useState([]);
  const [disabledItems, setDisabledItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [expandedDisabledItems, setExpandedDisabledItems] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [expandedRowsDisabled, setExpandedRowsDisabled] = useState(null);
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
  const [visibleRestore, setVisibleRestore] = useState(false);
  const [visibleRequestItem, setVisibleRequestItem] = useState(false);
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

  const StartQR = async () => {
    try {
      // Request permission to access the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Access granted, proceed with QR scanner initialization
      const videoElem = videoRef.current;
      videoElem.srcObject = stream;

      const qrScanner = new QrScanner(
        videoElem,
        (result) => setQr(result.data),
        {
          /* your options or returnDetailedScanResult: true if you're not specifying any other options */
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );

      // Start scanning
      qrScanner.start();
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
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
      fetchItems(Qr);
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

  const [formBorrowData, setBorrowData] = useState({
    user_id: "",
    item_uid: "",
    borrow_name: "",
    loc_id: "",
  });

  const [formRequestData, setRequestData] = useState({
    requester_id: "",
    item_uid: "",
    borrower: "",
    loc_id: "",
    dept_id: "",
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
      const response = await axios.get("/api/Inventory/GetDepartments");
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
      const response = await axios.get("/api/Inventory/GetCategory");
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
        `/api/Inventory/GetSubCategory?cat_id=${catId}`
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
      const response = await axios.get("/api/Inventory/GetUniqueFeature");
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
        `/api/Inventory/GetUniqueFeatureValue?unqFeat_id=${unqFeatId}`
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
      const response = await axios.get("/api/Inventory/GetLocation");
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
      fetchDisabledItems();
      fetchExpandableDisabledItems();
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
        `/api/Inventory/GetActiveItems?dept_id=${selectedDepartment}&cat_id=${selectedCategory}&subCat_id=${selectedSubCategory}&unqFeat_id=${selectedUniqueFeature}&item_uid=${Qr}`
      );
      setItems(response.data);
      console.log(items);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchDisabledItems = async () => {
    try {
      const response = await axios.get(
        `/api/Inventory/GetDisabledItem?dept_id=${selectedDepartment}&cat_id=${selectedCategory}&subCat_id=${selectedSubCategory}&unqFeat_id=${selectedUniqueFeature}&item_uid=${Qr}`
      );
      setDisabledItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchExpandableItems = async () => {
    try {
      const response = await axios.get(
        `/api/Inventory/GetActiveItemsExpandable?dept_id=${selectedDepartment}&cat_id=${selectedCategory}&subCat_id=${selectedSubCategory}&unqFeat_id=${selectedUniqueFeature}
        &loc_id=${selectedLocation}&item_uid=${Qr}`
      );
      setExpandedItems(response.data);
      console.log(expandedItems);
    } catch (error) {
      console.error("Error fetching expandable items:", error);
    }
  };

  const fetchExpandableDisabledItems = async () => {
    try {
      const response = await axios.get(
        `/api/Inventory/GetDisabledItemsExpandable?dept_id=${selectedDepartment}&cat_id=${selectedCategory}&subCat_id=${selectedSubCategory}&unqFeat_id=${selectedUniqueFeature}
        &loc_id=${selectedLocation}&item_uid=${Qr}`
      );
      setExpandedDisabledItems(response.data);
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

  const rowExpansionDisabledTemplate = (item) => {
    const filteredExpandedItems = expandedDisabledItems.filter(
      (expandedDisabledItems) =>
        expandedDisabledItems.item_name === item.item_name
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
            body={actionBodyDisabledTemplate}
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
        `/api/Inventory/DeactivateItem?itemUID=${itemUid}&creatorId=${userData.user_id}`
      )
      .then((response) => {
        console.log(response.data);
        fetchExpandableItems();
        fetchItems();
        fetchExpandableDisabledItems();
        fetchDisabledItems();
        setvisibleDelete(false);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`/api/Inventory/BorrowItem`, formBorrowData)
      .then((response) => {
        console.log(response.data);
        fetchExpandableItems();
        fetchItems();
        const message = "Item successfully borrowed";
        setVisibleBorrow(false);
        showSuccess(message);
      })
      .catch((error) => {
        console.log(`Error: ${error.response.data}`);
      });
  };

  const handleRestore = (uid) => {
    // You can perform actions with the UID here, like storing it in state or passing it to another function
    setItemUid(uid);
    setVisibleRestore(true);
  };

  const handleRestoreYes = () => {
    axios
      .put(
        `/api/Inventory/ActivateItem?itemUID=${itemUid}&creatorId=${userData.user_id}`
      )
      .then((response) => {
        setVisibleRestore(false);
        fetchExpandableItems();
        fetchItems();
        fetchExpandableDisabledItems();
        fetchDisabledItems();
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
    setBorrowData({
      user_id: userData.user_id,
      item_uid: itemUid,
    });
    setVisibleBorrow(true);
  };

  const handleRequestItem = (itemUid, deptId) => {
    setVisibleRequestItem(true);
    setRequestData({
      requester_id: userData.user_id,
      item_uid: itemUid,
      dept_id: deptId,
    });
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();

    axios
      .post("/api/Inventory/RequestItem", formRequestData)
      .then((response) => {
        console.log("Request created successfully:", response.data);
        const message = "Request created successfully.";
        setVisibleRequestItem(false);
        setRequestData({
          requester_id: "",
          item_uid: "",
          borrower: "",
          loc_id: "",
          dept_id: "",
        });
        showSuccess(message);
        // Handle success, if needed
      })
      .catch((error) => {
        console.error("Error creating request:", error);
        // Handle error, if needed
      });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-envelope"
          rounded
          outlined
          severity="warning"
          className="mr-2"
          onClick={() => handleRequestItem(rowData.item_uid, rowData.dept_id)}
          visible={
            rowData.isOut === false && rowData.dept_id !== userData.department
          }
        />
        <Button
          icon="pi pi-user"
          rounded
          outlined
          severity="secondary"
          className="mr-2"
          onClick={() => handleBorrow(rowData.item_uid)}
          visible={
            rowData.isOut === false && rowData.dept_id === userData.department
          }
        />
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => handleEdit(rowData.item_uid)}
          visible={
            rowData.isOut === false && rowData.dept_id === userData.department
          }
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          className="mr-2"
          onClick={() => handleDelete(rowData.item_uid)}
          visible={
            rowData.isOut === false && rowData.dept_id === userData.department
          }
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

  const actionBodyDisabledTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-undo"
          rounded
          outlined
          severity="info"
          onClick={() => handleRestore(rowData.item_uid)}
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

  const handleInputBorrowChange = (e) => {
    const { name, value } = e.target;
    setBorrowData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleInputRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/Inventory/AddItem?creatorId=${userData.user_id}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);
      setFormData({
        itemUid: "",
        itemName: "",
        itemDesc: "",
        remarks: "",
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
    try {
      axios
        .put(
          `/api/Inventory/UpdateItemViaUid?creatorId=${userData.user_id}`,
          formEditData
        )
        .then((response) => {
          setFormEditData({
            itemUid: "",
            itemName: "",
            itemDesc: "",
            remarks: "",
            catId: "",
            subCatId: "",
            unqFeatId: "",
            unqFeature: "",
            invBy: "",
            locId: "",
          });
          setVisibleEdit(false);
          showSuccess();
          fetchExpandableItems();
          fetchItems();
        });
    } catch (error) {
      console.error("Error:", error);
      showFail();
    }
  };

  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(
        `/api/Inventory/GetItemViaUid?dept_id=${selectedDepartment}&item_uid=${itemUid}`
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
    const { itemName, catId, subCatId, unqFeature } = formData;

    // Check if any required field is undefined, null, or an empty string
    if (itemName && catId && subCatId && unqFeature) {
      // All required fields have values, so append values to formData
      const newItemUid = `${itemName}_${catId}_${subCatId}_${unqFeature}`;
      setFormData((prevState) => ({ ...prevState, itemUid: newItemUid }));
    } else {
      // Any required field is empty, so reset itemUid to an empty string
      setFormData((prevState) => ({ ...prevState, itemUid: "" }));
    }
  }, [
    formData.itemName,
    formData.deptId,
    formData.catId,
    formData.subCatId,
    formData.unqFeature,
  ]);

  useEffect(() => {
    const { item_name, cat_id, subCat_id, unqFeat } = formEditData;

    // Check if any required field is undefined, null, or an empty string
    if (item_name && cat_id && subCat_id && unqFeat) {
      // All required fields have values, so append values to formData
      const newItemUid = `${item_name}_${cat_id}_${subCat_id}_${unqFeat}`;
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

  //Toast
  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
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
    fetchItems("");
    fetchExpandableItems("");
    fetchDisabledItems("");
    fetchExpandableDisabledItems("");
  };

  const [qrUploadResult, setQrUploadResult] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    QrScanner.scanImage(file, { returnDetailedScanResult: true })
      .then((result) => {
        setQr(result.data);
        setvisibleQrSearchUpload(false);
      })
      .catch((e) => setQrUploadResult({ data: e || "No QR code found." }));
  };

  const handleAddItem = () => {
    setFormData({ invBy: userData.user_id, deptId: userData.department });
    setVisibleAction(true);
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
        <TabView>
          <TabPanel header="Active Items">
            <DataTable
              value={items}
              expandedRows={expandedRowsDisabled}
              onRowToggle={(e) => setExpandedRowsDisabled(e.data)}
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
          </TabPanel>

          <TabPanel header="Disabled Items">
            <DataTable
              value={disabledItems}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={rowExpansionDisabledTemplate}
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
          </TabPanel>
        </TabView>
      </div>

      {/* Dialog Boxes */}
      <Dialog
        header="Request Item"
        visible={visibleRequestItem}
        className="dialog-box"
        onHide={() => setVisibleRequestItem(false)}
      >
        <form onSubmit={handleRequestSubmit} className="flex flex-column">
          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="borrow_name">
              Borrower's Name:
            </label>
            <InputText
              name="borrower"
              value={formRequestData.borrower}
              onChange={handleInputRequestChange}
              required
            />
          </div>

          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="locId">
              Location:
            </label>
            <Dropdown
              name="loc_id"
              value={formRequestData.loc_id}
              options={location}
              onChange={handleInputRequestChange}
              optionLabel="label"
              placeholder="Select a Location"
            />
          </div>

          <Button type="submit" label="Borrow Item" />
        </form>
      </Dialog>

      <Dialog
        header="Confirm Restore"
        visible={visibleRestore}
        onHide={() => setVisibleRestore(false)}
        className="text-center w-3 dialog-box"
      >
        <p>Are you sure you want to restore this item?</p>

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
        header="Borrow Item"
        visible={visibleBorrow}
        onHide={() => setVisibleBorrow(false)}
        className="dialog-box"
      >
        <form onSubmit={handleBorrowSubmit} className="flex flex-column">
          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="borrow_name">
              Borrower's Name:
            </label>
            <InputText
              name="borrow_name"
              value={formBorrowData.borrow_name}
              onChange={handleInputBorrowChange}
              required
            />
          </div>

          <div className="flex flex-column mb-2">
            <label className="mb-2" htmlFor="locId">
              Location:
            </label>
            <Dropdown
              name="loc_id"
              value={formBorrowData.loc_id}
              options={location}
              onChange={handleInputBorrowChange}
              optionLabel="label"
              placeholder="Select a Location"
            />
          </div>

          <Button type="submit" label="Borrow Item" />
        </form>
      </Dialog>

      <Dialog
        header="QR Code Generator"
        visible={visibleQr}
        onHide={() => setVisibleQr(false)}
        className="text-center dialog-box"
      >
        <div ref={qrRef}></div>
        <p>{itemUid}</p>
        <button onClick={onDownloadClick}>Download</button>
      </Dialog>

      <Dialog
        header="Confirm Delete"
        visible={visibleDelete}
        onHide={() => setvisibleDelete(false)}
        className="text-center dialog-box"
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
        className="dialog-box"
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
        header="Search via Qr"
        visible={visibleQrSearch}
        onHide={() => setvisibleQrSearch(false)}
        className="justify-content-center flex-wrap dialog-box"
      >
        <div className="flex align-items-center justify-content-center">
          <Button label="Scan Search" onClick={handleQrSearchVid} />
        </div>
        <Divider align="center">
          <span className="p-tag">OR</span>
        </Divider>
        <div className="flex align-items-center justify-content-center">
          <Button label="Upload Search" onClick={handleQrSearchUpload} />
        </div>
      </Dialog>

      <Dialog
        header="Search Via Qr"
        visible={visibleQrSearchVid}
        className="dialog-box"
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
        className="dialog-box"
        onHide={() => setvisibleQrSearchUpload(false)}
      >
        <h3>Upload QR: </h3>
        <input type="file" id="file-selector" onChange={handleFileChange} />
        <div>{qrUploadResult.data || ""}</div>
      </Dialog>

      <Dialog
        header="Add Existing Item"
        visible={visibleAddExist}
        className="dialog-box"
        onHide={() => setvisibleAddExist(false)}
        footer={footerContent}
      ></Dialog>

      <Dialog
        header="Add New Item"
        visible={visibleAddNew}
        className="dialog-box"
        onHide={() => setvisibleAddNew(false)}
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
                <label className="mb-2" htmlFor="catId">
                  Category:
                </label>
                <Dropdown
                  name="catId"
                  value={formData.catId}
                  options={category}
                  onChange={handleInputChange}
                  optionLabel="label"
                  placeholder="Select a Category"
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
                <InputText
                  name="itemUid"
                  value={formData.itemUid}
                  readOnly
                  required
                  hidden
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
        className="dialog-box"
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
                <InputText
                  name="item_uid"
                  value={formEditData.item_uid}
                  onChange={handleInputEditChange}
                  readOnly
                  required
                  hidden
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
