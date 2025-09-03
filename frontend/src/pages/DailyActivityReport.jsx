
import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";

export default function CustomerStatus() {
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);  
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/customers/get-status-employee-current`);
        const data = res.data.data || [];
        setRowData(data);
        console.log(data,'data.....data')

        if (data.length > 0) {
          const hiddenFields = ["assigned_to","Pending"]; 

          const dynamicCols = Object.keys(data[0])
            .filter((key) => !hiddenFields.includes(key))
            .map((key) => {
              if (key === "date") {
                return {
                  headerName: "DATE",
                  field: key,
                  flex: 1,
                  valueFormatter: (params) =>
                    new Date(params.value).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                };
              }

         

                if (key === "employee") {
              return {
                headerName: "EMPLOYEE",
                field: key,
                flex: 4, 
                valueFormatter: (params) =>
                  params.value ? String(params.value).toUpperCase() : "",
              };
            }

             if (key === "total_lead") {
              return {
                headerName: "TOTAL LEAD",
                field: key,
               
                valueFormatter: (params) =>
                  params.value ? String(params.value).toUpperCase() : "",
              };
            }


             if (key === "total_pending") {
              return {
                headerName: "TOTAL PENDING",
                field: key,
               
                valueFormatter: (params) =>
                  params.value ? String(params.value).toUpperCase() : "",
              };
            }


              return {
                headerName: key.replace(/_/g, " ").toUpperCase(),
                field: key,
                flex: 1,
              };
            });

          setColumns(dynamicCols);
        } else {
          setColumns([]); // reset columns agar data empty h
        }
      } catch (error) {
        console.error("Error fetching customer status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 shadow-md rounded-lg">
<h2 className="text-xl font-bold mb-4">
  Daily Activity Report (
  {" "}
  {new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
  {" "}
  ) 
</h2>


      {loading ? (
        <p className="text-gray-600">Loading data...</p>
      ) : rowData.length === 0 ? (
        <p className=" font-medium">No data available 🚫</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: 500, width: "100%" ,overflowX: "auto"}}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={20}
            defaultColDef={{ sortable: true, filter: true, resizable: true , minWidth: 180, flex: 1 }}
          suppressHorizontalScroll={false}
          />
        </div>
      )}
    </div>
  );
}


