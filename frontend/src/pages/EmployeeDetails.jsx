import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState([]);
  const [err, setErr] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`${apiUrl}/employee/customer-details/${id}`);
        console.log(data);
        setEmployee(data); 
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load employee");
      }
    };
    fetchEmployee();
  }, [id]);

  if (err) return <div className="p-6 text-red-500">{err}</div>;

  const columns = [
    { headerName: "id", field: "id", sortable: true, filter: true },
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Email", field: "email", sortable: true, filter: true },
    { headerName: "Mobile", field: "mobile", sortable: true, filter: true },
    { headerName: "Address", field: "address", sortable: true, filter: true },
    { headerName: "Status", field: "status", sortable: true, filter: true },
    {
      headerName: "Joined",
      field: "created_at",
      sortable: true,
      filter: true,
      valueFormatter: ({ value }) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
  ];

  return (
<div className="p-6 bg-gray-50 shadow-md rounded-lg">
  <h1 className="text-2xl font-semibold mb-5">Employee Details</h1>

  <div className="ag-theme-quartz w-full">
    <AgGridReact
      rowData={employee}
      columnDefs={columns}
      pagination={true}
      domLayout="autoHeight"
      paginationPageSize={20}
    />
  </div>
</div>

  );
}
