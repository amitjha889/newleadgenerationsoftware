import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoleGuard from "../components/RoleGuard.jsx";
import axios from "axios";
import { FaChevronDown, FaList } from "react-icons/fa";
import { toast } from "react-toastify";
import { Banknote } from "lucide-react";

import { useMemo, useCallback } from "react";

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import Modal from "react-modal";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);
Modal.setAppElement("#root");


export default function AddBank() {

    const [isListClicked, setIsListClicked] = useState(false);

    const [form, setForm] = useState({
        clientId: "",
        accountholdername: "",
        mobile: "",
        address: "",
        bankName: "",
        accountNumber: "",
        ifsc: "",
    });
    const [clients, setClients] = useState([]);
    const [banks, setBanks] = useState([]);
    const [islist, setIsList] = useState(true);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;



    const columnDefs = [
        { headerName: 'IFSC Code', field: 'ifsc', sortable: true, filter: true },
        { headerName: 'Mobile Number', field: 'mobile', sortable: true, filter: true },
        { headerName: 'Date Added', field: 'addedAt', sortable: true, filter: true, valueGetter: (params) => new Date(params.data.addedAt).toLocaleString() },
        { headerName: 'Address', field: 'address', sortable: true, filter: true },
        { headerName: 'Bank Name', field: 'bankName', sortable: true, filter: true },
        { headerName: 'Account Number', field: 'accountNumber', sortable: true, filter: true }
    ];



    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await axios.get(`${apiUrl}/customers/get-users`);
                setClients(res.data);
            } catch (error) {
                console.error("Failed to fetch clients", error);
                setErr("Failed to load clients");
            }
        };
        fetchClients();
    }, [apiUrl]);

    const handleClientChange = (e) => {
        const selectedId = e.target.value;
        const selectedClient = clients.find(
            (c) => c.id === parseInt(selectedId)
        );

        setForm({
            ...form,
            clientId: selectedId,
            mobile: selectedClient?.mobile || "",
            address: selectedClient?.address || "",
        });
    };

    console.log(banks, 'banks...')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr("");

        try {
            const data = {
                clientId: "0",
                accountholdername: form.accountholdername,
                mobile: form.mobile,
                address: form.address,
                bankName: form.bankName,
                accountNumber: form.accountNumber,
                ifsc: form.ifsc,
            };

            await axios.post(`${apiUrl}/customers/add-bank`, data);
            toast.success("Bank details added successfully");
            navigate("/earning-form");

        } catch (e) {
            setErr(e.response?.data?.message || "Failed to add bank details");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await axios.get(`${apiUrl}/customers/get/${0}`);
                setBanks(res.data);
            } catch (err) {
                console.error("Failed to fetch bank details", err);
                setBanks([]);
            }
        }

        fetchBanks()
    }, [])

    const handleListClick = () => {
        setIsListClicked(true);
        setTimeout(() => setIsListClicked(false), 300);

        setIsList(true);
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


            {islist ? (<>


                <div className="p-6 bg-gray-50 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-5">

                        <h1 className="text-lg font-semibold">BANK LIST</h1>

                        <div className="flex gap-4">

                            <button
                                className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600"
                                onClick={() => {
                                    navigate("/earning-form");
                                }}
                            >
                                Earning Form
                            </button>

                            <button
                                className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600"
                                onClick={() => {
                                    setIsList(false)
                                }}
                            >
                                Add Bank
                            </button>

                        </div>


                    </div>

                    <div className="ag-theme-quartz" style={{ height: 500 }}>
                        <AgGridReact
                            rowData={banks}
                            columnDefs={columnDefs}
                            pagination={true}
                            paginationPageSize={20}

                            singleClickEdit={true}
                        />


                    </div>


                </div>





            </>) : (<>


                <div className="max-w-full mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-semibold text-gray-800">Add Bank Form</h1>
                        <FaList onClick={() => handleListClick()} className="text-gray-600 text-xl" />

                    </div>

                    {err && <div className="text-red-600 text-center">{err}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Client
                            </label>
                            <div className="relative">
                                <select
                                    className="appearance-none border border-gray-300 rounded-lg w-full px-3 py-2 pr-10 focus:outline-none"
                                    value={form.clientId}
                                    onChange={handleClientChange}
                                    required
                                >
                                    <option value="">-- Select Client --</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div> */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    A/C Holder Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter A/C Holder Name"
                                    value={form.accountholdername}
                                    onChange={(e) =>
                                        setForm({ ...form, accountholdername: e.target.value })
                                    }
                                    required
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter Mobile"
                                    value={form.mobile}
                                    onChange={(e) =>
                                        setForm({ ...form, mobile: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter Address"
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm({ ...form, address: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                                    placeholder="Bank Name"
                                    value={form.bankName}
                                    onChange={(e) =>
                                        setForm({ ...form, bankName: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Account Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                                    placeholder="Enter Bank Account Number"
                                    value={form.accountNumber}
                                    onChange={(e) =>
                                        setForm({ ...form, accountNumber: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                                    placeholder="Enter IFSC Code"
                                    value={form.ifsc}
                                    onChange={(e) =>
                                        setForm({ ...form, ifsc: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsList(true)}
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
                                {loading ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </form>
                </div>

            </>)}
        </RoleGuard>
    );
}
