import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function BatchCustomers() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const gridRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", flex: 0.5 },
      { headerName: "Name", field: "name", flex: 1 },
      { headerName: "Email", field: "email", flex: 1 },
      { headerName: "Mobile", field: "mobile", flex: 1 },
      { headerName: "Address", field: "address", flex: 1 },
      { headerName: "Status", field: "status", flex: 1 },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, filter: true, resizable: true }),
    []
  );

  const fetchCustomersByBatch = async () => {
    try {
      const { data } = await axios.get(
        `${apiUrl}/customers/wise/${batchId}`
      );
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomersByBatch();
  }, [batchId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <h1 className="text-3xl font-bold">Customers in Batch {batchId}</h1>
      <div className="ag-theme-quartz w-full" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={customers}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          animateRows={true}
        />
      </div>
    </div>
  );
}
