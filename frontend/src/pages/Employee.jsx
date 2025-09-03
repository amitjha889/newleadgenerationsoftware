import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RoleGuard from "../components/RoleGuard.jsx";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Eye, Edit } from "lucide-react";
import axios from "axios";
import "./dealTable.css";


ModuleRegistry.registerModules([AllCommunityModule]);

export default function Employees() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;


  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/employee/get`);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to fetch");
      setList([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", filter: "agNumberColumnFilter", minWidth: 100 },
      { headerName: "Name", field: "name", filter: "agTextColumnFilter", flex: 1 },
      { headerName: "Email", field: "email", filter: "agTextColumnFilter", flex: 1 },
      {
        headerName: "Joined",
        field: "created_at",
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : "-"),
        minWidth: 150,
      },
      {
        headerName: "Action",
        field: "id",
        cellRenderer: (params) => (
          <div className="flex gap-2">
            {/* View button */}
            <button
              onClick={() => navigate(`/employees/${params.value}`)}
              className="rounded-lg flex items-center gap-1"
              title="View"
            >
              <Eye size={16} />
            </button>

            {/* Edit button */}
            <button
              onClick={() => navigate(`/employees/edit/${params.value}`)}
              className="rounded-lg flex items-center gap-1"
              title="Edit"
            >
              <Edit size={16} />
            </button>
          </div>
        ),
        minWidth: 150,
      },
    ],
    [navigate]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <RoleGuard
      role="admin"
      fallback={<div className="card p-6">Only admins can view this.</div>}
    >
      <div className="space-y-6 bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Employees</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => navigate("/employees/add-employee")}
          >
            Add Employee
          </button>
        </div>
        <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={list}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            animateRows={true}
          />
        </div>

        {err && <div className="text-red-500">{err}</div>}
      </div>
    </RoleGuard>
  );
}
