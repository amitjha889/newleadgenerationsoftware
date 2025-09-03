import React, { useEffect, useState } from "react";
import {
  Target,
  ClipboardList,
  CheckCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function EmployeeDashboard() {
  const [target, setTarget] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusData, setStatusData] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  const statusMapping = {
    pending: "pending",
    deal: "deal",
    follow_up: "follow_up",
    demo_not_deal: "demo",
  };

  const fetchEmployeeTarget = async () => {
    try {
      const { data } = await axios.get(
        `${apiUrl}/employee/target?employeeId=${user.id}`
      );
      const targetValue = Array.isArray(data) ? data[0]?.target : data?.target;
      setTarget(targetValue);
    } catch (err) {
      console.error("Error fetching employee target:", err);
    }
  };

  const fetchEmployeeStatus = async () => {
    try {
      const { data } = await axios.get(
        `${apiUrl}/employee/status?employeeId=${user.id}`
      );
      setStatus(data);
    } catch (err) {
      console.error("Error fetching employee status:", err);
    }
  };

  const fetchStatusData = async (statusType) => {
    try {
      const { data } = await axios.get(`${apiUrl}/employee/status/data`, {
        params: { employeeId: user.id, status: statusType },
      });
      setStatusData(data.data);
    } catch (err) {
      console.error("Error fetching status data:", err);
      setStatusData([]);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeTarget();
      fetchEmployeeStatus();
    }
  }, [user?.id]);

  const handleStatusClick = (statusType) => {
    const mappedStatus = statusMapping[statusType] || statusType;
    setSelectedStatus(mappedStatus);
    fetchStatusData(mappedStatus);
  };

  const columns = [
    { headerName: "Name", field: "name", flex: 1 },
    { headerName: "Mobile", field: "mobile", flex: 1 },
    { headerName: "Address", field: "address", flex: 1 },
    { headerName: "Status", field: "status", flex: 1 },
    {
      headerName: "Date",
      field: "followup_datetime",
      flex: 1,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {user && (
        <p className="mb-8 text-gray-600 text-lg">
          Welcome, <span className="font-semibold">{user.name}</span>!
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center hover:shadow-2xl transition-shadow duration-300 cursor-default">
          <div className="mr-4">
            <Target className="text-blue-500 w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <p className="text-gray-400 text-sm">Target</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {target !== null ? target : "Loading..."}
            </p>
          </div>
        </div>

        {[
          {
            key: "pending",
            label: "Pending",
            icon: <ClipboardList className="text-yellow-500 w-6 h-6" />,
          },
          {
            key: "deal",
            label: "Deal",
            icon: <CheckCircle className="text-green-500 w-6 h-6" />,
          },
          {
            key: "follow_up",
            label: "Follow Up",
            icon: <RefreshCw className="text-purple-500 w-6 h-6" />,
          },
          {
            key: "demo_not_deal",
            label: "Demo Not Deal",
            icon: <XCircle className="text-red-500 w-6 h-6" />,
          },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => handleStatusClick(item.key)}
            className="bg-white rounded-2xl shadow-lg p-6 flex items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
          >
            <div className="mr-4">{item.icon}</div>
            <div className="flex flex-col">
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {status ? status[item.key] : "Loading..."}
              </p>
            </div>
          </div>
        ))}
      </div>
      {selectedStatus && (
        <div className="mt-10 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
            {selectedStatus} Records
          </h2>
          <div
            className="ag-theme-alpine"
            style={{ width: "100%", height: 400 }}
          >
            <AgGridReact
              rowData={statusData}
              columnDefs={columns}
              pagination={true}
              paginationPageSize={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}