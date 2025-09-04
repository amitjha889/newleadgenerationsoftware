import React, { useEffect, useState, useMemo, forwardRef } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from "react-datepicker";
import { Calendar, ChevronDown } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);
Modal.setAppElement("#root");

export default function CustomerPage() {
  const [rowData, setRowData] = useState([]);
  const [openModalData, setOpenModalData] = useState(null);
  const [dateTimeMap, setDateTimeMap] = useState({});
  const [openTextModalData, setOpenTextModalData] = useState(null);
  const [textInputMap, setTextInputMap] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [statusFullData, setStatusFullData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(""); // ✅ dropdown state
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
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

    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        const url = `${apiUrl}/customers/assigned?assigned_to=${user.id}`;
        const { data } = await axios.get(url);
        setRowData(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers ❌");
      }
    };
    fetchData();
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

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "customer_id", sortable: true, filter: true },
      { headerName: "Name", field: "name", sortable: true, filter: true },
      { headerName: "Mobile", field: "mobile", sortable: true, filter: true },
      { headerName: "Address", field: "address", sortable: true, filter: true },
      {
        headerName: "Status",
        field: "status",
        sortable: true,
        filter: true,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: statusData,
          popupPosition: "under",
        },
      },
      {
        headerName: "Follow Up Date/Time",
        field: "followup_datetime",
        sortable: true,
        filter: true,
      },
    ],
    [statusData]
  );

  // ⬇️ Row filter karna dropdown ke hisaab se
  const filteredData = useMemo(() => {
    let data = rowData.filter((row) => row.status !== "Deal");
    if (selectedStatus) {
      data = data.filter((row) => row.status === selectedStatus);
    }
    return data;
  }, [rowData, selectedStatus]);

  // Status update handlers (aapka existing code same rahega)
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
          statusid: statusid,
        });

        setIsChange(!isChange);
        toast.success("Status updated successfully");
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      }
    }
  };

  // Custom Date Input with Calendar Icon
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
<div className="flex justify-between">
        <h1 className="text-lg font-semibold mb-5">Customer</h1>
    <div className="mb-4 relative w-64">
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="border px-4 py-2 rounded w-full appearance-none pr-10"
      >
        <option value="">All Status</option>
        {statusData.map((status, idx) => (
          <option key={idx} value={status}>
            {status}
          </option>
        ))}
      </select>

      <ChevronDown
        size={20}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"
      />
    </div>
</div>

      <div className="ag-theme-quartz" style={{ height: 500 }}>
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
          onCellValueChanged={handleStatusChange}
          singleClickEdit={true}
          gridOptions={gridOptions}
        />
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </div>
  );
}