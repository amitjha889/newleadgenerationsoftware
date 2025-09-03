import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { User, Users, Calendar, Activity, Edit, Trash2 } from "lucide-react";
import RoleGuard from "../components/RoleGuard.jsx";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { FaUserShield } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa6";
import { toast } from "react-toastify";


ModuleRegistry.registerModules([AllCommunityModule]);

export default function Dashboard() {
  const { user } = useAuth();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState({
    Demo: 0,
    FollowUp: 0,
    NotPickedCall: 0,
    Deal: 0,
  });
  const [filteblueData, setFilteblueData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [statusModal, setStatusModal] = useState(false);
  const [statusData, setStatusData] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [editRow, setEditRow] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", sortable: true, filter: true },
      { headerName: "Name", field: "name", sortable: true, filter: true },
      { headerName: "Email", field: "email", sortable: true, filter: true },
      { headerName: "Mobile", field: "mobile", sortable: true, filter: true },
      // { headerName: "Address", field: "address", sortable: true, filter: true },
      { headerName: "Status", field: "status", sortable: true, filter: true },
      { headerName: "Created At", field: "created_at", sortable: true, filter: true },
      { headerName: "Updated At", field: "updated_at", sortable: true, filter: true },
      { headerName: "Updated By", field: "updated_by", sortable: true, filter: true },
    ],
    []
  );

  useEffect(() => {
    axios
      .get(`${apiUrl}/customers/get-lead-data`)
      .then((res) => {
        setRowData(res.data);
        setFilteblueData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching lead history:", err);
      });

    axios
      .get(`${apiUrl}/customers/fetch-customer-status`)
      .then((res) => {
        const newStats = {
          Demo: 0,
          FollowUp: 0,
          NotPickedCall: 0,
          Deal: 0,
        };

        res.data.data.forEach((item) => {
          if (item.status === "Demo") newStats.Demo++;
          if (item.status === "Follow Up") newStats.FollowUp++;
          if (item.status === "Not Picked Call") newStats.NotPickedCall++;
          if (item.status === "Deal") newStats.Deal++;
        });

        setStats(newStats);
      })
      .catch((err) => {
        console.error("Error fetching customer status:", err);
      });
  }, []);

  const handleFilterClick = (statusType) => {
    setActiveFilter(statusType);
    if (statusType === "All") {
      setFilteblueData(rowData);
    } else {
      setFilteblueData(rowData.filter((item) => item.status === statusType));
    }
  };

  const statusColumns = [
    { headerName: "ID", field: "id", width: 80 },
    { headerName: "Status", field: "name", flex: 1 },
    // {
    //   headerName: "Actions",
    //   cellRenderer: (params) => {
    //     // agar id 5 hai to kuch bhi return mat karo
    //     if (params.data.id === 5) {
    //       return null;
    //     }

    //     return (
    //       <div className="flex gap-2">
    //         <button
    //           onClick={() => {
    //             setEditRow(params.data);
    //             setNewStatus(params.data.name);
    //           }}
    //           className="flex items-center gap-1 text-black rounded-md"
    //         >
    //           <Edit size={16} />
    //         </button>
    //         <button
    //           onClick={() => {
    //             setDeleteId(params.data.id);
    //             setShowConfirm(true);
    //           }}
    //           className="flex items-center gap-1 text-black rounded-md"
    //         >
    //           <Trash2 size={16} />
    //         </button>
    //       </div>
    //     );
    //   },
    // },
  ];

  const confirmDelete = () => {
    if (deleteId) {
      handleDeleteStatus(deleteId);
      setDeleteId(null);
      setShowConfirm(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/status`);
      setStatusData(res.data);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  };

  const handleSaveStatus = async () => {

    console.log(newStatus,'newStatus...')
    if(newStatus !=="")
    {
    try {
      setLoading(true);
      if (editRow) {
        await axios.put(`${apiUrl}/status/${editRow.id}`, { name: newStatus });
      } else {
        await axios.post(`${apiUrl}/status`, { name: newStatus });
      }
      setNewStatus("");
      setEditRow(null);
      fetchStatuses();
    } catch (err) {
      console.error("Error saving status:", err);
    } finally {
      setLoading(false);
    }

    }
    else
    {


      toast.warning("Please enter valid status name");
    }
    
  };

  const handleDeleteStatus = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/status/${id}`);
      fetchStatuses();
    } catch (err) {
      console.error("Error deleting status:", err);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = () => {
    setStatusModal(true);
    fetchStatuses();
  };

  return (
    <>
      <RoleGuard role="admin">
        <div className="min-h-screen bg-gray-50 rounded-md shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

          <div className="flex justify-between items-center mb-8 px-10">
            {user && (
              <div className="mb-8 flex items-center gap-5">
                <FaUserShield className="text-blue-600 text-4xl" />
                <span className="font-semibold">{user.name}</span>
              </div>
            )}
            <div>
              <button
                className="bg-blue-500 flex items-center p-2 rounded-md gap-2 hover:bg-blue-600"
                onClick={openStatusModal}
              >
                <FaClipboardList className="text-white text-xl" />
                <h1 className="text-md text-white">Add Status</h1>
              </button>
            </div>
          </div>

          {/* Stats Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleFilterClick("Demo")}
            >
              <div className="mr-4">
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400 text-sm">Demo</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.Demo}</p>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleFilterClick("Follow Up")}
            >
              <div className="mr-4">
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400 text-sm">Followup</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.FollowUp}</p>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleFilterClick("Not Picked Call")}
            >
              <div className="mr-4">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400 text-sm">Not Picked Call</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.NotPickedCall}</p>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleFilterClick("Deal")}
            >
              <div className="mr-4">
                <User className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400 text-sm">Deal</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.Deal}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {activeFilter ? `${activeFilter} Leads` : "History"}
              </h2>
              {activeFilter && (
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                  onClick={() => handleFilterClick("All")}
                >
                  Show All
                </button>
              )}
            </div>
            <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }} >
              <AgGridReact
                rowData={filteblueData}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={20}
              />
            </div>
          </div>
        </div>
      </RoleGuard>

      {statusModal && (
        <div className="fixed inset-0  backdrop-blur-sm  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[700px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">STATUS</h2>
              <button
                onClick={() => setStatusModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-black text-lg font-bold hover:bg-gray-400 transition"
              >
                X
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="Enter status name"
                className="flex-1 border border-gray-300 p-2 rounded-md"
              />
              <button
                onClick={handleSaveStatus}
                disabled={loading}
                className={`px-4 py-2 flex items-center justify-center gap-2 rounded-md text-white ${loading ? "bg-blue-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    {editRow ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editRow ? "Update" : "Add"
                )}
              </button>
            </div>

            <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
              <AgGridReact rowData={statusData} columnDefs={statusColumns} pagination={true} />
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to delete?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-4 py-2 flex items-center justify-center gap-2 rounded-md text-white ${loading
                  ? "bg-blue-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
