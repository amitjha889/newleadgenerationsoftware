import React, { useState, useEffect, useMemo, useRef, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";

import { ModuleRegistry } from "ag-grid-community";
import { MasterDetailModule } from "ag-grid-enterprise";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

ModuleRegistry.registerModules([MasterDetailModule]);

// ✅ Custom Input for DatePicker
const CustomDateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="flex items-center justify-between border rounded px-2 py-2 w-40 cursor-pointer bg-white"
  >
    <span className="text-sm">{value || placeholder}</span>
    <Calendar className="w-4 h-4 text-gray-500" />
  </div>
));

export default function DailyDemos() {
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const gridRef = useRef(null);

  const columns = [
    {
      headerName: "DEMO DATE",
      field: "demo_date",
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
    },
    { headerName: "TOTAL DEMOS", field: "total_demos", sortable: true, filter: true },
  ];

  const detailColumns = [
    { headerName: "NAME", field: "name" },
    { headerName: "MOBILE", field: "mobile" },
    { headerName: "EMPLOYEE", field: "employee_name" },
    { headerName: "STATUS", field: "status" },
    {
      headerName: "FOLLOWUP DATE/TIME",
      field: "followup_datetime",
      valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString() : ""),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/customers/daily-demos`);
        setRowData(res.data);

        const today = new Date().toISOString().split("T")[0];
        const todayData = res.data.filter((item) => item.demo_date === today);
        setFilteredData(todayData);
      } catch (error) {
        console.error("Error fetching daily demos:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!fromDate && !toDate) {
      const today = new Date().toISOString().split("T")[0];
      const todayData = rowData.filter((item) => item.demo_date === today);
      setFilteredData(todayData);
    } else {
      const filtered = rowData.filter((item) => {
        const itemDate = new Date(item.demo_date);
        const start = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
        const end = toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;

        if (start && end) return itemDate >= start && itemDate <= end;
        if (start) return itemDate >= start;
        if (end) return itemDate <= end;
        return true;
      });
      setFilteredData(filtered);
    }
  }, [fromDate, toDate, rowData]);

  const detailCellRendererParams = useMemo(() => {
    return {
      detailGridOptions: {
        columnDefs: detailColumns,
        defaultColDef: { flex: 1, resizable: true },
        pagination: true,
        paginationPageSize: 5,
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data.demo_data || []);
      },
    };
  }, []);

  const onRowClicked = (params) => {
    if (params.node.expanded) {
      params.node.setExpanded(false);
    } else {
      params.node.setExpanded(true);
    }
  };

  return (
    <div className="p-6 bg-gray-50 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Daily Demo Status</h2>
      <div className="flex items-end gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            customInput={<CustomDateInput placeholder="Select date" />}
            dateFormat="dd-MM-yyyy"
            popperPlacement="bottom-start"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            customInput={<CustomDateInput placeholder="Select date" />}
            dateFormat="dd-MM-yyyy"
            popperPlacement="bottom-start"
          />
        </div>
        <button
          onClick={() => {
            setFromDate(new Date());
            setToDate(new Date());
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={filteredData}
          columnDefs={columns}
          masterDetail={true}
          detailCellRendererParams={detailCellRendererParams}
          pagination={true}
          paginationPageSize={20}
          onRowClicked={onRowClicked}
        />
      </div>
    </div>
  );
}
