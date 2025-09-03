import React from "react";
import Dashboard from "../pages/Dashboard.jsx";
import EmployeeDashboard from "../pages/EmployeeDashborad.jsx";

export default function GeneralDashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return <div className="p-6 text-center text-red-500">User not found. Please login.</div>;
  } else if (user.role === "employee") {
    return <EmployeeDashboard />;
  } else if (user.role === "admin") {
    return <Dashboard />;
  } else {
    return <div className="p-6 text-center text-gray-500">Unauthorized role: {user.role}</div>;
  }
}
