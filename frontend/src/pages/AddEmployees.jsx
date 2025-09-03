import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RoleGuard from "../components/RoleGuard.jsx";
import { toast } from "react-toastify";

export default function AddEmployee() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    salary: "",
    target: "",
    joiningDate: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("mobile", form.mobile);
      data.append("password", form.password);
      data.append("salary", form.salary);
      data.append("target", form.target);
      data.append("joiningDate", form.joiningDate);
      if (avatar) data.append("avatar", avatar);

      await api.post(`${apiUrl}/employee/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Employee created successfully");
      navigate("/employees");
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to create employee";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <RoleGuard
      role="admin"
      fallback={
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center text-red-600">
          Only admins can view this.
        </div>
      }
    >
      <div className="max-w-full mx-auto mt-12 bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Add Employee</h1>

        {err && <div className="text-red-600 text-center">{err}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 cursor-pointer">
              <div className="flex items-center space-x-3">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-blue-400 flex items-center justify-center rounded-md">
                    <span className="text-xl">+</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Upload Avatar</p>
                  <p className="text-xs text-gray-500">Recommended: 400x400px</p>
                </div>
              </div>
              <input type="file" className="hidden" onChange={handleImageChange} disabled={loading} />
            </label>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "email", "mobile", "password", "salary", "target"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${field}`}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
