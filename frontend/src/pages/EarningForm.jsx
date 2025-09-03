import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoleGuard from "../components/RoleGuard.jsx";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";


export default function EarningForm() {
    const [form, setForm] = useState({
        clientId: "",
        name: "",
        amount: "",
        bank: "",
        mobile: "",
        address: "",
        comment: "",
        receivedDate: "",
    });

    console.log("Form State:", form);
    const [clients, setClients] = useState([]);
    const [banks, setBanks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [islist, setIsList] = useState(true);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [rowData, setRowData] = useState([]);
    const [columnDefs] = useState([
        { headerName: "NAME", field: "name",flex: 1 },
        { headerName: "AMOUNT", field: "amount", flex: 1 },
        { headerName: "BANK", field: "bank", flex: 1 },
        { headerName: "MOBILE", field: "mobile", flex: 1 },
        // { headerName: "Address", field: "address", flex: 1 },
        { headerName: "COMMENT", field: "comment",  flex: 1 },
        { headerName: "RECEIVED DATE", field: "receivedDate", flex: 1 },
    ]);

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
    }, []);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await axios.get(`${apiUrl}/customers/get/${0}`);
                setBanks(res.data);
            } catch (err) {
                console.error("Failed to fetch bank details", err);
                setBanks([]);
            }
        };
        fetchBanks();
    }, []);


    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await axios.get(`${apiUrl}/customers/earning-data`);

                const formatted = res.data.flatMap((client) =>
                    client.earnings_list.map((earning, index) => ({
                        id: `${client.client_id}-${index + 1}`,
                        client_id: client.client_id,
                        ...earning,
                    }))
                );

                setRowData(formatted);
            } catch (err) {
                console.error("Failed to fetch earnings", err);
                setRowData([]);
            }
        };

        fetchEarnings();
    }, []);


    const normalizeString = (str) =>
        str?.toString().toLowerCase().replace(/\s+/g, " ").trim() || "";

    const filteredClients = clients.filter((client) => {
        const search = normalizeString(searchTerm);
        return (
            normalizeString(client.name).includes(search) ||
            normalizeString(client.mobile).includes(search) ||
            normalizeString(client.email).includes(search)
        );
    });

    const handleSelect = (id, name) => {
        const selectedClient = clients.find((c) => c.id === parseInt(id));

        setForm({
            ...form,
            clientId: id,
            name: name,
            mobile: selectedClient?.mobile || "",
            address: selectedClient?.address || "",
            bank: "",
        });

        setSearchTerm(name);
        setIsOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr("");

        try {
            const data = {
                clientId: form.clientId,
                name: form.name,
                amount: form.amount,
                bank: form.bank,
                mobile: form.mobile,
                address: form.address,
                comment: form.comment,
                receivedDate: form.receivedDate,
            };

            await axios.post(`${apiUrl}/customers/add`, data);
            toast.success("Earning added successfully ✅");
            navigate("/earning-form");
        } catch (e) {
           toast.error(e.response?.data?.message || "❌ Failed to add earning");
        } finally {
            setLoading(false);
        }
    };

    return (
        <> 
        <RoleGuard
            role="admin"
            fallback={
                <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center text-red-600">
                    Only admins can view this.
                </div>
            }
        >
            <div className="max-w-full mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
                <div className="flex justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        {islist ? "Earnings List" : "Earning Form"}
                    </h1>

                    <div className="flex gap-4">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            onClick={() => setIsList(!islist)}
                        >
                            {islist ? "Add Earning" : "Back"}
                        </button>

                        <button
                            className="bg-blue-500 text-white px-2 py-2 rounded-md hover:bg-blue-600"
                            onClick={() => {
                                navigate("/earning-form/add-bank");
                            }}
                        >
                            Banks List
                        </button>
                    </div>
                </div>


                {islist && (
                    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            pagination={true}
                            paginationPageSize={10}
                            defaultColDef={{
                                sortable: true,
                                filter: true,
                                resizable: true,
                            }}
                            animateRows={true}
                        />
                    </div>
                )}

                {/* Form */}
                {!islist && (
                    <>
                        {err && <div className="text-red-600 text-center">{err}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Client
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="appearance-none border border-gray-300 rounded-lg w-full px-3 py-2 pr-10 focus:outline-none"
                                            placeholder="-- Select Client --"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setIsOpen(true);
                                            }}
                                            onClick={() => setIsOpen(!isOpen)}
                                            required
                                        />
                                        <FaChevronDown
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                            onClick={() => setIsOpen(!isOpen)}
                                        />
                                        {isOpen && (
                                            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-md">
                                                {filteredClients.length > 0 ? (
                                                    filteredClients.map((client) => (
                                                        <li
                                                            key={client.id}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() =>
                                                                handleSelect(client.id, client.name)
                                                            }
                                                        >
                                                            {`${client.name}_______${client.mobile}_______${client.email}`}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="px-3 py-2 text-gray-400">
                                                        No clients found
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Enter Amount
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                                        placeholder="Enter Amount"
                                        value={form.amount}
                                        onChange={(e) =>
                                            setForm({ ...form, amount: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Bank Account Name
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none"
                                            value={form.bank}
                                            onChange={(e) =>
                                                setForm({ ...form, bank: e.target.value })
                                            }
                                            required
                                            disabled={banks.length === 0}
                                        >
                                            <option value="">-- Select Bank --</option>
                                            {banks.map((b, idx) => (
                                                <option key={idx} value={b.bankName}>
                                                    {b.bankName} ({b.accountNumber})
                                                </option>
                                            ))}
                                        </select>
                                        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comment
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                                        placeholder="Enter Comment"
                                        value={form.comment}
                                        onChange={(e) =>
                                            setForm({ ...form, comment: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Received Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                                        value={form.receivedDate}
                                        onChange={(e) =>
                                            setForm({ ...form, receivedDate: e.target.value })
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
                                    {loading ? "Saving..." : "Add Earning"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </RoleGuard>
        </>
    );
}
