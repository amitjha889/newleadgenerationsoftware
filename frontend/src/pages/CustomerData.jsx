import React, { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from "react";
import * as XLSX from "xlsx";
import RoleGuard from "../components/RoleGuard";
import axios from "axios";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "./dealTable.css";

import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeBalham,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function CustomerData() {
  const [data, setData] = useState([]);
  const [copyData, setCopyData] = useState([]);
  const [copyChekingData, setChekingCopyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef(null);
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('')
  const [loadingAssign, setLoadingAssign] = useState(false);

  const [isChange, setIsChange] = useState(false)


  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [limit, setLimit] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [statusFullData, setStatusFullData] = useState([]);
  const [openModalData, setOpenModalData] = useState(null);
  const [dateTimeMap, setDateTimeMap] = useState({});
  const [openTextModalData, setOpenTextModalData] = useState(null);
  const [textInputMap, setTextInputMap] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;



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


  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/customers/get-data`
      );
      setData(Array.isArray(res.data) ? res.data : []);
      setCopyData(Array.isArray(res.data) ? res.data : []);
      setChekingCopyData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setData([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${apiUrl}/employee/single`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };


  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
  }, []);


  useEffect(() => {

    console.log(copyData, 'copyData..')

    if (filterType === 'all' || filterType === '') {
      setData(copyData);

    }
    else if (filterType === 'Assigned') {

      const assigned = copyData.filter((item) => item.assigned_to !== null);
      setData(assigned);

    }

    else if (filterType === 'Not Assigned') {


      const notAssigned = copyData.filter((item) => item.assigned_to === null);
      setData(notAssigned);


    }




  }, [filterType]);




  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id" },
      { headerName: "Name", field: "name" },
      { headerName: "Email", field: "email" },
      { headerName: "Mobile", field: "mobile" },
      { headerName: "Address", field: "address" },
      { headerName: "Source Name", field: "source_name" },
      // { headerName: "Status", field: "status" },
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
        headerName: "Assigned Status",
        field: "assigned_to_name",
        valueFormatter: (p) => (p.value ? "Assigned" : "Not Assigned"),
        filter: true,
      },
      { headerName: "Assigned To", field: "assigned_to_name" },
      {
        headerName: "Created At",
        field: "created_at",
        valueFormatter: (p) =>
          p.value ? new Date(p.value).toLocaleString() : "-",
      },
      {
        headerName: "Action",
        field: "id",
        cellRenderer: (params) => {
          return (
            <button
              className=" text-sm"
              onClick={() => navigate(`/customer/${params.value}`)}
            >
              <Eye size={16} />
            </button>
          );
        },
      },
    ],
    [navigate, statusData]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 140,
    }),
    []
  );

  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleQuickFilter = (e) => {
    const val = e.target.value;
    if (gridRef.current?.api) {
      gridRef.current.api.setQuickFilter(val);
    }
  };

  const exportToCsv = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: "customers.csv",
      });
    }
  };





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


    fetchStatuses();
  }, [isChange]);





  const handleStatusChange = async (params) => {
    const value = params.newValue?.trim();
    console.log(params.data, 'value...');

    const selectedObj = statusFullData.find(
      (item) => item.name.trim().toLowerCase() === value?.toLowerCase()
    );
    const statusid = selectedObj?.id ?? null;
    console.log(statusid, 'statusid..');

    if (params.colDef.field === "status" && statusid) {
      const { id } = params.data;
      let customer_id = id;
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
          status: value,               // ✅ always newValue bhejna hai
          updated_by_id: user.id,
          updated_by_name: user.name,
          statusid: statusid,          // ✅ trimmed match ka
        });

        setIsChange(!isChange);
        toast.success("Status updated successfully");
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      }
    }
  };




  const handleSaveDateTime = async () => {
    if (!openModalData) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const dateTime = dateTimeMap[openModalData.customer_id] || "";

    const value = openModalData.status

    console.log(user, 'user..')
    console.log(dateTime, 'dateTime..')
    console.log(value, 'value..')
    const selectedObj = statusFullData.find(
      (item) => item.name.trim().toLowerCase() === value?.toLowerCase()
    );
    const statusid = selectedObj?.id ?? null;


    try {
      await axios.put(
        `${apiUrl}/customers/status/${openModalData.customer_id}`,
        {
          customer_id: openModalData.customer_id,
          status: openModalData.status,
          updated_by_id: user.id,
          updated_by_name: user.name,
          followup_datetime: dateTime,
          statusid: statusid

        }
      );

      // setRowData((prev) =>
      //   prev.map((row) =>
      //     row.customer_id === openModalData.customer_id
      //       ? { ...row, status: openModalData.status, followup_datetime: dateTime }
      //       : row
      //   )
      // );

      toast.success("Follow-up date/time saved");
    } catch (error) {
      console.error("Error updating status with date/time:", error);
      toast.error("Failed to save follow-up");
    } finally {
      setOpenModalData(null);
    }
  };



  // const handleSaveTextInput = async () => {
  //     if (!openTextModalData) return;
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     const textValue = textInputMap[openTextModalData.customer_id] || "";

  //     try {
  //       await axios.put(
  //         `${apiUrl}/customers/status/${openTextModalData.customer_id}`,
  //         {
  //           customer_id: openTextModalData.customer_id,
  //           status: openTextModalData.status,
  //           updated_by_id: user.id,
  //           updated_by_name: user.name,
  //           note: textValue,
  //         }
  //       );

  //       setRowData((prev) =>
  //         prev.map((row) =>
  //           row.customer_id === openTextModalData.customer_id
  //             ? { ...row, status: openTextModalData.status, note: textValue }
  //             : row
  //         )
  //       );

  //       toast.success("Note saved successfully");
  //     } catch (error) {
  //       console.error("Error updating status with text:", error);
  //       toast.error("Failed to save note");
  //     } finally {
  //       setOpenTextModalData(null);
  //     }
  //   };



  const handleAssignSubmit = async () => {

    const notAssigned = copyData?.filter((item) => item.assigned_to === null);
    if (selectedEmployees.length === 0) {
      toast.warning("Please select at least one employee!");
      return;
    }
    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      toast.warning("Please enter a valid limit!");
      return;
    }
    
    const totalLimit = Number(limit);

    if (totalLimit > notAssigned.length) {
      toast.warning(`You have Only ${notAssigned.length} contacts for assigning`)
      return;
    }




    const distribution = selectedEmployees.map((emp) => {
      return { employeeId: emp.id, limit: totalLimit };
    });

    

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${apiUrl}/employee/assign`,
        {
          batchId: selectedBatch.batch_id,
          distribution,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        ` assigned successfully to employees!`
      );
    } catch (err) {
      toast.error("Error assigning batch!");
      console.error("Error assigning batch:", err);
    }

    setShowAssignModal(false);
    setLimit("");
    setSelectedEmployees([]);
  };


  return (
    <RoleGuard role="admin">
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold">Customer Data</h2>

          <div className="flex gap-3">
            <button
              onClick={() => setFilterType('Assigned')}
              className="w-[130px] px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Assigned
            </button>

            <button
              onClick={() => setFilterType('Not Assigned')}
              className="w-[130px] px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Not Assigned
            </button>

            <button
              onClick={() => setFilterType('all')}
              className="w-[130px] px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Clear Fillter
            </button>

            <button
              className="w-[130px] px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center gap-1"
              onClick={() => {
                if (data.length > 0) {
                  setSelectedBatch(data[0]);
                  setShowAssignModal(true);
                } else {
                  toast.warning("No batches available to assign!");
                }
              }}
            >
              <MdOutlineAssignmentTurnedIn />
              Assign
            </button>
          </div>



        </div>

        <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            theme={themeBalham}
            ref={gridRef}
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            animateRows={true}
            onGridReady={onGridReady}
            onFirstDataRendered={onFirstDataRendered}
            onCellValueChanged={handleStatusChange}
          />
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
                dateTimeMap[openModalData?.customer_id]
                  ? new Date(dateTimeMap[openModalData?.customer_id])
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
          {/* <Modal
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
                          </Modal> */}
        </div>

        {showAssignModal && selectedBatch && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-[600px]">
              <input
                type="number"
                placeholder="Enter Limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="mb-4 w-full px-4 py-2 border border-gray-400"
              />

              <div
                className="ag-theme-quartz"
                style={{ height: 250, width: "100%" }}
              >
                <AgGridReact
                  rowData={employees}
                  columnDefs={[
                    {
                      headerName: "ID",
                      field: "id",
                      flex: 0.5,
                      checkboxSelection: true,
                      headerCheckboxSelection: true,
                      headerCheckboxSelectionFilteredOnly: true,
                    },
                    { headerName: "Name", field: "name", flex: 1 },
                    { headerName: "Email", field: "email", flex: 1 },
                  ]}
                  rowSelection="multiple"
                  onSelectionChanged={(params) => {
                    const selected = params.api.getSelectedRows();
                    setSelectedEmployees(selected);
                  }}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={5}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-md flex items-center justify-center gap-2
        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                  onClick={handleAssignSubmit}
                  disabled={loadingAssign}
                >
                  {loadingAssign ? (
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
                          d="M4 12a8 8 0 018-8V0C5.373 
              0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    "Assign"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
