import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PAGE_SIZE = 10;

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function CustomerDetailModal({ customer, onClose, onUpdatePaymentStatus }) {
  if (!customer) return null;

  const handlePaymentStatusToggle = async (biltyNumber, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/customers/${customer._id}/bilties/${biltyNumber}/payment-status`,
        { payment_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePaymentStatus();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
        
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><span className="font-medium">Name:</span> {customer.name}</div>
          <div><span className="font-medium">Phone:</span> {customer.phone || 'N/A'}</div>
          <div><span className="font-medium">Address:</span> {customer.address || 'N/A'}</div>
          <div><span className="font-medium">Status:</span> {customer.status}</div>
          <div><span className="font-medium">Total Amount Due:</span> ₨{customer.totalAmountDue?.toLocaleString() || 0}</div>
          <div><span className="font-medium">Total Bilties:</span> {customer.bilties?.length || 0}</div>
        </div>

        {/* Bilties Table */}
        {customer.bilties && customer.bilties.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Bilties</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Bilty Number</th>
                    <th className="p-2 border">Amount to be Paid</th>
                    <th className="p-2 border">Paid by Customer</th>
                    <th className="p-2 border">Payment Status</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.bilties.map((bilty, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 border">{bilty.biltyNumber}</td>
                      <td className="p-2 border">₨{bilty.amount_to_be_paid?.toLocaleString() || 0}</td>
                      <td className="p-2 border">₨{bilty.paid_by_customer?.toLocaleString() || 0}</td>
                      <td className="p-2 border">
                        <span className={`px-2 py-1 rounded text-xs ${
                          bilty.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bilty.payment_status}
                        </span>
                      </td>
                      <td className="p-2 border">
                        {bilty.amount_to_be_paid > 0 && bilty.paid_by_customer === 0 ? (
                          <button
                            onClick={() => handlePaymentStatusToggle(bilty.biltyNumber, bilty.payment_status)}
                            className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded text-xs"
                          >
                            Mark Paid by Customer
                          </button>
                        ) : bilty.paid_by_customer > 0 ? (
                          <span className="text-green-600 text-xs font-medium">Already paid by customer</span>
                        ) : (
                          <span className="text-gray-500 text-xs">No amount due</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit: PAGE_SIZE,
        search,
        status,
      };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/customers/get/all`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, [search, status, page]);

  const handleUpdatePaymentStatus = () => {
    fetchCustomers();
    setSelectedCustomer(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-48"
            placeholder="Name, Phone, Bilty..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="border rounded px-2 py-1"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Address</th>
              <th className="p-2">Status</th>
              <th className="p-2">Total Amount Due</th>
              <th className="p-2">Total Bilties</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-4">No customers found.</td></tr>
            ) : customers.map((c, i) => (
              <tr
                key={c._id}
                className="border-b hover:bg-blue-50 cursor-pointer"
                onClick={() => setSelectedCustomer(c)}
              >
                <td className="p-2">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="p-2 font-semibold">{c.name}</td>
                <td className="p-2">{c.phone || 'N/A'}</td>
                <td className="p-2">{c.address || 'N/A'}</td>
                <td className="p-2 capitalize">{c.status}</td>
                <td className="p-2 font-semibold">₨{c.totalAmountDue?.toLocaleString() || 0}</td>
                <td className="p-2">{c.bilties?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >Next</button>
      </div>
      <CustomerDetailModal 
        customer={selectedCustomer} 
        onClose={() => setSelectedCustomer(null)}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />
    </div>
  );
}