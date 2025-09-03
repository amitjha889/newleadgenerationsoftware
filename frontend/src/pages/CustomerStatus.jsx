// import React, { useEffect, useState } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from "axios";

// export default function CustomerStatus() {
//   const [rowData, setRowData] = useState([]);
//   const apiUrl = import.meta.env.VITE_API_URL;

//   const columns = [
//     { 
//       headerName: "Month", 
//       field: "month", 
//       flex: 1, 
//       valueFormatter: params => new Date(params.value).toLocaleString('default', { month: 'long', year: 'numeric' }) 
//     },
//     { headerName: "Employee Name", field: "employee_name", flex: 1 },
//     { headerName: "Total Followups", field: "total_followups", flex: 1 },
//     { headerName: "Demos Going On", field: "total_demos", flex: 1 },
//     { headerName: "Total Deal", field: "total_deals", flex: 1 },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`${apiUrl}/customers/get-status-employee`);
//         setRowData(res.data.data);
//       } catch (error) {
//         console.error("Error fetching customer status:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
// <div className="p-6 bg-gray-50 shadow-md rounded-lg">
//   <h2 className="text-xl font-bold mb-4">Customer Status</h2>
//   <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
//     <AgGridReact
//       rowData={rowData}
//       columnDefs={columns}
//       pagination={true}
//       paginationPageSize={20}
//       defaultColDef={{
//         sortable: true,
//         filter: true,
//         resizable: true
//       }}
//     />
//   </div>
// </div>

//   );
// }


// import React, { useEffect, useState } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from "axios";
// import { GrCaretPrevious } from "react-icons/gr";
// import { FcNext } from "react-icons/fc";
// import { GrCaretNext } from "react-icons/gr";

// export default function CustomerStatus() {
//   const [rowData, setRowData] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState(new Date()); // default current month
//   const apiUrl = import.meta.env.VITE_API_URL;

//   const columns = [
//     { 
//       headerName: "Month", 
//       field: "month", 
//       flex: 1, 
//       valueFormatter: params => new Date(params.value).toLocaleString('default', { month: 'long', year: 'numeric' }) 
//     },
//     { headerName: "Employee Name", field: "employee_name", flex: 1 },
//     { headerName: "Total Followups", field: "total_followups", flex: 1 },
//     { headerName: "Demos Going On", field: "total_demos", flex: 1 },
//     { headerName: "Total Deal", field: "total_deals", flex: 1 },
//   ];

//   const fetchData = async (monthDate) => {
//     try {
//       const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
//       const res = await axios.get(`${apiUrl}/customers/get-status-employee?month=${monthStr}`);
//       setRowData(res.data.data);
//     } catch (error) {
//       console.error("Error fetching customer status:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData(selectedMonth);
//   }, [selectedMonth]);

//   const handlePrev = () => {
//     setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
//   };

//   const handleNext = () => {
//     setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
//   };

//   return (
//     <div className="p-6 bg-gray-50 shadow-md rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Customer Status</h2>

//       {/* Month Controls */}
//       <div className="flex items-center gap-4 mb-4">
//         <button 
//           onClick={handlePrev} 
//           className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
//         >
//          <GrCaretPrevious />
//         </button>
//         <span className="font-medium">
//           {selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })}
//         </span>
//         <button 
//           onClick={handleNext} 
//           className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
//         >
//           <GrCaretNext />
//         </button>
//       </div>

//       {/* AG Grid */}
//       <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
//         <AgGridReact
//           rowData={rowData}
//           columnDefs={columns}
//           pagination={true}
//           paginationPageSize={20}
//           defaultColDef={{
//             sortable: true,
//             filter: true,
//             resizable: true
//           }}
//         />
//       </div>
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// export default function CustomerStatus() {
//   const [rowData, setRowData] = useState([]);
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [startDate, endDate] = dateRange;
//   const apiUrl = import.meta.env.VITE_API_URL;

//   // ✅ Date ko YYYY-MM-DD format me convert karne ka function
//   const formatDateForApi = (date) => {
//     if (!date) return null;
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const columns = [
//     {
//       headerName: "Month",
//       field: "month",
//       flex: 1,
//       valueFormatter: (p) =>
//         new Date(p.value).toLocaleString("default", {
//           month: "long",
//           year: "numeric",
//         }),
//     },
//     { headerName: "Employee Name", field: "employee_name", flex: 1 },
//     { headerName: "Total Followups", field: "total_followups", flex: 1 },
//     { headerName: "Demos Going On", field: "total_demos", flex: 1 },
//     { headerName: "Total Deal", field: "total_deals", flex: 1 },
//   ];

//   const fetchData = async () => {
//     try {
//       let url = `${apiUrl}/customers/get-status-employee`;

//       // ✅ Start aur End date ko formatted string me bhejna
//       const formattedStart = formatDateForApi(startDate);
//       const formattedEnd = formatDateForApi(endDate);

//       if (formattedStart && formattedEnd) {
//         url += `?start=${formattedStart}&end=${formattedEnd}`;
//       }

//       const res = await axios.get(url);
//       setRowData(res.data.data);
//     } catch (error) {
//       console.error("Error fetching customer status:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [startDate, endDate]);

//   return (
//     <div className="p-6 bg-gray-50 shadow-md rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Customer Status</h2>

//       {/* Calendar Controls */}
//       <div className="flex items-center gap-4 mb-4">
//         <DatePicker
//           selectsRange
//           startDate={startDate}
//           endDate={endDate}
//           onChange={(update) => setDateRange(update || [null, null])}
       
//           showMonthDropdown
//           showYearDropdown
//           dropdownMode="select"
//           todayButton="Today"
//           placeholderText="📅 Select date range"
//           className="border px-3 py-2 rounded w-60"
//         />
//         <button
//           onClick={() => setDateRange([null, null])}
//           className="bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded"
//         >
//           Clear
//         </button>
//       </div>

//       {/* AG Grid */}
//       <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
//         <AgGridReact
//           rowData={rowData}
//           columnDefs={columns}
//           pagination
//           paginationPageSize={20}
//           defaultColDef={{ sortable: true, filter: true, resizable: true }}
//         />
//       </div>
//     </div>
//   );
// }





import React, { useEffect, useState, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

// ✅ Custom Input for DatePicker
const CustomDateInput = forwardRef(({ value, onClick }, ref) => {
  // Show today's date if value is null
  const displayValue = value || new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy format
  return (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between border rounded px-2 py-2 w-44 cursor-pointer bg-white"
    >
      <span className="text-sm">{displayValue}</span>
      <Calendar className="w-4 h-4 text-gray-500" />
    </div>
  );
});

export default function CustomerStatus() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [fromDate, setFromDate] = useState(new Date()); // default current date
  const [toDate, setToDate] = useState(new Date()); // default current date
  const apiUrl = import.meta.env.VITE_API_URL;

  // ✅ Format date for API (YYYY-MM-DD)
  const formatDateForApi = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    try {
      let url = `${apiUrl}/customers/get-status-employee`;

      const formattedStart = formatDateForApi(fromDate);
      const formattedEnd = formatDateForApi(toDate);

      if (formattedStart && formattedEnd) {
        url += `?start=${formattedStart}&end=${formattedEnd}`;
      }

      const res = await axios.get(url);
      const data = res.data.data || [];

      setRowData(data);

      if (data.length > 0) {
        const keys = Object.keys(data[0]);
        const hiddenFields = ["assigned_to"];

        const cols = keys.map((key) => {
          if (hiddenFields.includes(key)) {
            return {
              headerName: key.replace(/_/g, " ").toUpperCase(),
              field: key,
              hide: true,
            };
          }

          if (key === "month") {
            return {
              headerName: "MONTH",
              field: key,
              flex: 1,
              valueFormatter: (p) =>
                new Date(p.value).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                }),
            };
          }

          return {
            headerName: key.replace(/_/g, " ").toUpperCase(),
            field: key,
            flex: 1,
            minWidth: 160,
          };
        });

        setColumnDefs(cols);
      }
    } catch (error) {
      console.error("Error fetching customer status:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  return (
    <div className="p-6 bg-gray-50 shadow-md rounded-lg relative">
      <h2 className="text-xl font-bold mb-4">Customer Status</h2>

      {/* ✅ From / To Date Pickers */}
      <div className="flex items-end gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            customInput={<CustomDateInput />}
            dateFormat="dd-MM-yyyy"
            popperPlacement="bottom-start"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            customInput={<CustomDateInput />}
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

      {/* AG Grid */}
      <div
        className="ag-theme-alpine"
        style={{ height: 500, width: "100%", overflowX: "auto" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={20}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            minWidth: 180,
            flex: 1,
          }}
          suppressHorizontalScroll={false}
        />
      </div>
    </div>
  );
}






// import React, { useEffect, useState, useRef } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from "axios";

// // ✅ react-day-picker import
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";

// export default function CustomerStatus() {
//   const [rowData, setRowData] = useState([]);
//   const [range, setRange] = useState({ from: null, to: null }); // react-day-picker ke liye
//   const { from: startDate, to: endDate } = range;
//   const [isOpen, setIsOpen] = useState(false); // popup toggle
//   const apiUrl = import.meta.env.VITE_API_URL;
//   const pickerRef = useRef(null);

//   // ✅ Date ko YYYY-MM-DD format me convert karne ka function
//   const formatDateForApi = (date) => {
//     if (!date) return null;
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const columns = [
//     {
//       headerName: "Month",
//       field: "month",
//       flex: 1,
//       valueFormatter: (p) =>
//         new Date(p.value).toLocaleString("default", {
//           month: "long",
//           year: "numeric",
//         }),
//     },
//     { headerName: "Employee Name", field: "employee_name", flex: 1 },
//     { headerName: "Total Followups", field: "total_followups", flex: 1 },
//     { headerName: "Demos Going On", field: "total_demos", flex: 1 },
//     { headerName: "Total Deal", field: "total_deals", flex: 1 },
//   ];



//   const fetchData = async () => {
//     try {
//       let url = `${apiUrl}/customers/get-status-employee`;

//       // ✅ Start aur End date ko formatted string me bhejna
//       const formattedStart = formatDateForApi(startDate);
//       const formattedEnd = formatDateForApi(endDate);

//       if (formattedStart && formattedEnd) {
//         url += `?start=${formattedStart}&end=${formattedEnd}`;
//       }

//       const res = await axios.get(url);
//       setRowData(res.data.data);
//     } catch (error) {
//       console.error("Error fetching customer status:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [startDate, endDate]);

//   // ✅ Outside click se popup band karna
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (pickerRef.current && !pickerRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="p-6 bg-gray-50 shadow-md rounded-lg relative">
//       <h2 className="text-xl font-bold mb-4">Customer Status</h2>

//       {/* ✅ Calendar Button */}
//       <div className="flex items-center gap-4 mb-4 relative" ref={pickerRef}>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="border px-3 py-2 rounded bg-white shadow"
//         >
//           {startDate && endDate
//             ? `${formatDateForApi(startDate)} → ${formatDateForApi(endDate)}`
//             : "📅 Select Date Range"}
//         </button>
//         <button
//           onClick={() => setRange({ from: null, to: null })}
//           className="bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded"
//         >
//           Clear
//         </button>

//         {/* ✅ Popup Calendar */}
//         {isOpen && (
//           <div className="absolute top-12 z-50 bg-white shadow-lg rounded-lg p-2">
//             <DayPicker
//               mode="range"
//               selected={range}
//               onSelect={setRange}
//               showOutsideDays
//               fixedWeeks
//               captionLayout="dropdown" 
              
//             />
//           </div>
//         )}
//       </div>

//       {/* AG Grid */}
//       <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
//         <AgGridReact
//           rowData={rowData}
//           columnDefs={columns}
//           pagination
//           paginationPageSize={20}
//           defaultColDef={{ sortable: true, filter: true, resizable: true }}
//         />
//       </div>
//     </div>
//   );
// }


