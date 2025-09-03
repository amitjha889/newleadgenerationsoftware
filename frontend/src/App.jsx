import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employee.jsx";
import AddEmployee from "./pages/AddEmployees.jsx";
import CustomerData from "./pages/CustomerData.jsx";
import Excel from "./pages/Excel.jsx";
import BatchCustomers from "./pages/BatchCustomers.jsx";
import CustomerPage from "./pages/CustomerPage.jsx";
import EmployeeDetail from "./pages/EmployeeDetails.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import EditEmployees from "./pages/EditEmployees.jsx";
import GeneralDashboard from "./components/GeneralDashboard.jsx";
import FollowUp from "./pages/FollowUp.jsx";
import Demo from "./pages/Demo.jsx";
import EarningForm from "./pages/EarningForm.jsx";
import AddBank from "./pages/AddBank.jsx";
import CustomerStatus from "./pages/CustomerStatus.jsx";
import DailyDemo from "./pages/DailyDemo.jsx";
import DailyActivityReport from "./pages/DailyActivityReport.jsx";
import Deal from "./pages/Deal.jsx";

export default function App() {
  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout><GeneralDashboard /></Layout>} />
        <Route path="/employees" element={<Layout><Employees /></Layout>} />
        <Route path="/employees/add-employee" element={<Layout><AddEmployee /></Layout>} />
        <Route path="/customer" element={<Layout><CustomerData /></Layout>} />
        <Route path="/excel" element={<Layout><Excel /></Layout>} />
        <Route path="/excel/batch/:batchId" element={<Layout><BatchCustomers /></Layout>} />
        <Route path="/assign-customer" element={<Layout><CustomerPage /></Layout>} />
        <Route path="/employees/:id" element={<Layout><EmployeeDetail /></Layout>} />
        <Route path="/employees/edit/:id" element={<Layout><EditEmployees /></Layout>} />
        <Route path="/customer/:id" element={<Layout><CustomerDetails /></Layout>} />
        <Route path="/follow-up" element={<Layout><FollowUp /></Layout>} />
        <Route path="/demo" element={<Layout><Demo /></Layout>} />
        <Route path="/deal" element={<Layout><Deal /></Layout>} />
        <Route path="/earning-form" element={<Layout><EarningForm /></Layout>} />
        <Route path="/customer-status" element={<Layout><CustomerStatus /></Layout>} />
        <Route path="/earning-form/add-bank" element={<Layout><AddBank /></Layout>} />
        <Route path="/daily" element={<Layout><DailyDemo /></Layout>} />
        <Route path="/daily-activity" element={<Layout><DailyActivityReport /></Layout>} />
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </>
  );
}
