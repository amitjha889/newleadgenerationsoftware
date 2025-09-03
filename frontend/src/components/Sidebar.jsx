import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiFileText,
  FiBarChart2,
  FiActivity,
  FiCalendar,
  FiDollarSign
  
} from "react-icons/fi";
import { MdCardMembership } from "react-icons/md";

export default function Sidebar({ open }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const base = "flex items-center gap-2 px-4 py-2 rounded-lg";
  const active = ({ isActive }) =>
    `${base} ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;

  return (
    <aside
      className={`
        fixed top-20 bottom-4 left-0 bg-white border-r rounded-r-2xl border-gray-200 p-4
        md:translate-x-0 w-64 transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"}
        overflow-y-auto
      `}
    >
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={active}>
          <FiHome className="mr-2" /> Dashboard
        </NavLink>

        {user?.role === "admin" && (
          <>
            <NavLink to="/employees" className={active}>
              <FiUsers className="mr-2" /> Employees
            </NavLink>
            <NavLink to="/customer" className={active}>
              <FiUser className="mr-2" /> Customer
            </NavLink>
            <NavLink to="/excel" className={active}>
              <FiFileText className="mr-2" /> Excel
            </NavLink>
            <NavLink to="/earning-form" className={active}>
              <FiDollarSign className="mr-2" /> Earning
            </NavLink>
            <NavLink to="/customer-status" className={active}>
              <FiActivity className="mr-2" /> Customer Status
            </NavLink>
            <NavLink to="/daily" className={active}>
              <FiCalendar className="mr-2" /> Daily Demo
            </NavLink>
            <NavLink to="/daily-activity" className={active}>
              <FiCalendar className="mr-2" /> Daily Activity Report
            </NavLink>

             <NavLink to="/deal" className={active}>
             <MdCardMembership  className="mr-2" /> Deal
            </NavLink>


          </>
        )}

        {user?.role === "employee" && (
          <>
            <NavLink to="/assign-customer" className={active}>
              <FiUsers className="mr-2" /> Contacts
            </NavLink>
            <NavLink to="/follow-up" className={active}>
              <FiActivity className="mr-2" /> Follow Up
            </NavLink>
            <NavLink to="/demo" className={active}>
              <FiFileText className="mr-2" /> Demo
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
