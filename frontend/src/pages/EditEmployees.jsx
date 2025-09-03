import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios"; // axios instance
import RoleGuard from "../components/RoleGuard.jsx";
import axios from "axios";
import { toast } from "react-toastify";

export default function EditEmployee() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    salary: "",
    target: "",
    joiningDate: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalPassword, setOriginalPassword] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/employee/${id}`);
        setForm({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          salary: data.salary || "",
          target: data.target || "",
          joiningDate: data.joining_date
            ? data.joining_date.split("T")[0]
            : "",
          password: data.password || "", // Show actual password
        });
        if (data.avatar) {
          setAvatarPreview(`http://localhost:5000/${data.avatar}`);
        }
        // Store the original password for comparison
        setOriginalPassword(data.password || "");
      } catch (err) {
        console.error(err);
        alert("Failed to load employee");
      }
    };
    fetchEmployee();
  }, [id]);

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

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        // Only send password if it has been changed
        if (form[key] && (key !== 'password' || form[key] !== originalPassword)) {
          formData.append(key, form[key]);
        }
      });
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await api.put(`/employee/edit/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Employee updated successfully!");
      navigate("/employees");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to update employee");
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
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Employee</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
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
                  <p className="text-xs text-gray-500">
                    Recommended: 400x400px
                  </p>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />
            </label>
          </div>

          {/* Text Inputs (excluding password) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "email", "mobile", "salary", "target"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${field}`}
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.joiningDate}
                onChange={(e) =>
                  setForm({ ...form, joiningDate: e.target.value })
                }
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
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
              {loading ? "Updating..." : "Update Employee"}
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}