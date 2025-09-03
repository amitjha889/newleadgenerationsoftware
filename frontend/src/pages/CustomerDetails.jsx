import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function CustomerDetails() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const [columnDefs] = useState([
    { headerName: "Customer ID", field: "customer_id", sortable: true, filter: true },
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Email", field: "email", sortable: true, filter: true },
    { headerName: "Address", field: "address", sortable: true, filter: true },
    { headerName: "Status", field: "status", sortable: true, filter: true },
    {
      headerName: "Created At",
      field: "created_at",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleString(),
    },
    {
      headerName: "Updated At",
      field: "updated_at",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleString(),
    },
  ]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${apiUrl}/customers/lead/${id}`);
        setHistory(res.data);
        if (res.data.length > 0) {
          setCustomerName(res.data[0].name);
        }
      } catch (err) {
        console.error("Error fetching lead history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Lead History for {customerName || `Customer ${id}`}
        </h2>
        <Link
          to="/customers"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back
        </Link>
      </div>

      {history.length === 0 ? (
        <p>No history found for this customer.</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            rowData={history}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      )}
    </div>
  );
}
