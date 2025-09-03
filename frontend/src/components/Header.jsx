// Header.jsx
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function Header({ onToggleSidebar }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-lg border">
            ☰
          </button>
          <img
            src="/leadgen.png"
            alt="Lead Generate"
            className="h-12 md:h-18 w-auto object-contain"
          />

        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
