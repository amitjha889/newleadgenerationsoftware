// Layout.jsx
import React, { useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onToggleSidebar={() => setOpen(v => !v)} />
      <div className="flex pt-20">
        <Sidebar open={open} />
        <main className="flex-1 p-4 md:ml-64 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
