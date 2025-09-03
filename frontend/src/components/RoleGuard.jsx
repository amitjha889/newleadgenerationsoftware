import React from "react";

export default function RoleGuard({ role, children, fallback = null }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user || user.role !== role) {
    return fallback;
  }

  return children;
}
