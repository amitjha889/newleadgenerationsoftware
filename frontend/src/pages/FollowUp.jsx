import { useState, useEffect, useMemo, useRef, forwardRef } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Calendar } from "lucide-react";
import { toast } from "react-toastify";
import "./dealTable.css";


export default function FollowUp() {
  const [rowData, setRowData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [openModalData, setOpenModalData] = useState(null);
  const [dateTimeMap, setDateTimeMap] = useState({});
  const [openTextModalData, setOpenTextModalData] = useState(null);
  const [textInputMap, setTextInputMap] = useState({});
  const [statusFullData, setStatusFullData] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const gridRef = useRef();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchFollowUpData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const employeeId = user?.id;
      if (!employeeId) return;

      const { data } = await axios.get(`${apiUrl}/employee/status/data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { employeeId, status: "Follow Up" },
      });

      setRowData(data.data || []);
    } catch (err) {
      console.error("Error fetching follow_up data:", err);
      setRowData([]);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/status`);
      const filterStatus = res.data.map((status) => status.name);
      setStatusData(filterStatus);
      setStatusFullData(res.data);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      toast.error("Failed to load statuses ❌");
    }
  };

  useEffect(() => {
    fetchFollowUpData();
    fetchStatuses();
  }, [isChange]);

  const gridOptions = {
    defaultColDef: {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
    },
    singleClickEdit: true,
  };

  const columns = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 90 },
      { headerName: "Name", field: "name", flex: 1 },
      { headerName: "Mobile", field: "mobile", flex: 1 },
      { headerName: "Address", field: "address", flex: 1 },
      {
        headerName: "Status",
        field: "status",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: statusData,
          popupPosition: "under",
        },
      },
      {
        headerName: "Follow Up Date",
        field: "followup_datetime",
        flex: 1,
        filter: "agDateColumnFilter",
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value).toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })
            : "",
      },
    ],
    [statusData]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  const handleStatusChange = async (params) => {
    const value = params.newValue?.trim();
    const selectedObj = statusFullData.find(
      (item) => item.name.trim().toLowerCase() === value?.toLowerCase()
    );
    const statusid = selectedObj?.id ?? null;

    if (params.colDef.field === "status" && statusid) {
      const { customer_id } = params.data;
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id || !user?.name) return;

      if (value === "Demo" || value === "Follow Up") {
        setOpenModalData({ customer_id, status: value });
        return;
      }

      if (value === "Using Another Services" || value === "Language Issue") {
        setOpenTextModalData({ customer_id, status: value });
        return;
      }

      try {
        await axios.put(`${apiUrl}/customers/status/${customer_id}`, {
          customer_id,
          status: value,
          updated_by_id: user.id,
          updated_by_name: user.name,
          statusid,
        });

        setIsChange(!isChange);
        toast.success("Status updated successfully ✅");
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status ❌");
      }
    }
  };

  // ✅ Save Date Modal
  const handleSaveDateTime = async () => {
    if (!openModalData) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const dateTime = dateTimeMap[openModalData.customer_id] || "";

    const value = openModalData.status;
    const selectedObj = statusFullData.find(
      (item) => item.name.trim().toLowerCase() === value?.toLowerCase()
    );
    const statusid = selectedObj?.id ?? null;

    try {
      await axios.put(`${apiUrl}/customers/status/${openModalData.customer_id}`, {
        customer_id: openModalData.customer_id,
        status: openModalData.status,
        updated_by_id: user.id,
        updated_by_name: user.name,
        followup_datetime: dateTime,
        statusid,
      });

      setIsChange(!isChange);
      toast.success("Follow-up date/time saved ✅");
    } catch (error) {
      console.error("Error updating status with date/time:", error);
      toast.error("Failed to save follow-up ❌");
    } finally {
      setOpenModalData(null);
    }
  };

  // ✅ Save Text Modal
  const handleSaveTextInput = async () => {
    if (!openTextModalData) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const textValue = textInputMap[openTextModalData.customer_id] || "";

    try {
      await axios.put(`${apiUrl}/customers/status/${openTextModalData.customer_id}`, {
        customer_id: openTextModalData.customer_id,
        status: openTextModalData.status,
        updated_by_id: user.id,
        updated_by_name: user.name,
        note: textValue,
      });

      setIsChange(!isChange);
      toast.success("Note saved successfully ✅");
    } catch (error) {
      console.error("Error updating status with text:", error);
      toast.error("Failed to save note ❌");
    } finally {
      setOpenTextModalData(null);
    }
  };

  const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex justify-between items-center border border-gray-300 rounded px-3 py-2 w-90 cursor-pointer bg-white"
    >
      <span className={value ? "text-black" : "text-gray-400"}>
        {value || "Select date & time"}
      </span>
      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
    </div>
  ));

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Follow Up</h2>
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          onCellValueChanged={handleStatusChange}
          paginationAutoPageSize={true}
          animateRows={true}
          singleClickEdit={true}
          gridOptions={gridOptions}
          rowSelection="multiple"
        />

        {/* ✅ Date Modal */}
        <Modal
          isOpen={!!openModalData}
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
          onRequestClose={() => setOpenModalData(null)}
          contentLabel="Select Date and Time"
          className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20 relative z-[9999]"
          overlayClassName="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9998]"
        >
          <div className="flex justify-between items-center mb-4 gap-10">
            <h2 className="text-xl font-bold">
              Select Date & Time for {openModalData?.status}
            </h2>
            <button
              onClick={() => setOpenModalData(null)}
              className="text-black hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <DatePicker
            selected={
              openModalData?.customer_id && dateTimeMap[openModalData.customer_id]
                ? new Date(dateTimeMap[openModalData.customer_id])
                : null
            }
            onChange={(date) =>
              setDateTimeMap((prev) => ({
                ...prev,
                [openModalData.customer_id]: date,
              }))
            }
            showTimeSelect
            showTimeSelectSeconds
            timeIntervals={1}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy HH:mm:ss"
            timeFormat="HH:mm:ss"
            customInput={<CustomDateInput />}
          />


          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setOpenModalData(null)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDateTime}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Modal>

        {/* ✅ Text Modal */}
        <Modal
          isOpen={!!openTextModalData}
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
          onRequestClose={() => setOpenTextModalData(null)}
          contentLabel="Enter Note"
          className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20 relative z-[9999]"
          overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Enter Note for {openTextModalData?.status}
            </h2>
            <button
              onClick={() => setOpenTextModalData(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={textInputMap[openTextModalData?.customer_id] || ""}
            onChange={(e) =>
              setTextInputMap((prev) => ({
                ...prev,
                [openTextModalData.customer_id]: e.target.value,
              }))
            }
            className="border p-2 w-full mb-4 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpenTextModalData(null)}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTextInput}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
