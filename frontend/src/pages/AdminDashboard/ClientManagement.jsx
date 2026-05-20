import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Search, RefreshCw, X, ShieldAlert, FileText, Download, Banknote } from 'lucide-react';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Fields
  const [vehicleNo, setVehicleNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  
  // Bank Details
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  
  // Vehicle details under client
  const [vehicleName, setVehicleName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [insuranceDetails, setInsuranceDetails] = useState('');
  
  // Documents state
  const [files, setFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await clientAPI.list(searchQuery);
      setClients(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch hired client records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setVehicleNo('');
    setClientName('');
    setAddress('');
    setContactNumber('');
    setEmail('');
    setPanNumber('');
    setGstNumber('');
    setBankHolderName('');
    setBankAccountNumber('');
    setBankIfsc('');
    setBankName('');
    setVehicleName('');
    setRcNumber('');
    setInsuranceDetails('');
    setFiles([]);
    setExistingDocs([]);
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setVehicleNo(c.vehicle_no);
    setClientName(c.client_name);
    setAddress(c.address);
    setContactNumber(c.contact_number);
    setEmail(c.email);
    setPanNumber(c.pan_number);
    setGstNumber(c.gst_number || '');
    setBankHolderName(c.bank_holder_name);
    setBankAccountNumber(c.bank_account_number);
    setBankIfsc(c.bank_ifsc);
    setBankName(c.bank_name);
    setVehicleName(c.vehicle_name);
    setRcNumber(c.rc_number);
    setInsuranceDetails(c.insurance_details);
    setFiles([]);
    
    // Parse documents JSON
    let docs = [];
    if (c.document_urls) {
      try {
        docs = typeof c.document_urls === 'string' ? JSON.parse(c.document_urls) : c.document_urls;
      } catch (err) {
        docs = [];
      }
    }
    setExistingDocs(docs);
    setShowModal(true);
  };

  const handleRemoveExistingDoc = (docUrl) => {
    setExistingDocs(prev => prev.filter(d => d.url !== docUrl));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('vehicle_no', vehicleNo);
    formData.append('client_name', clientName);
    formData.append('address', address);
    formData.append('contact_number', contactNumber);
    formData.append('email', email);
    formData.append('pan_number', panNumber);
    formData.append('gst_number', gstNumber);
    
    formData.append('bank_holder_name', bankHolderName);
    formData.append('bank_account_number', bankAccountNumber);
    formData.append('bank_ifsc', bankIfsc);
    formData.append('bank_name', bankName);
    
    formData.append('vehicle_name', vehicleName);
    formData.append('rc_number', rcNumber);
    formData.append('insurance_details', insuranceDetails);
    
    formData.append('existing_documents', JSON.stringify(existingDocs));

    // Append newly uploaded files
    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }

    try {
      if (editingId) {
        await clientAPI.update(editingId, formData);
      } else {
        await clientAPI.create(formData);
      }
      setShowModal(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save client details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hired client record?')) return;
    try {
      await clientAPI.delete(id);
      fetchClients();
    } catch (err) {
      alert('Failed to delete client.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Hired Clients Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage client vehicles hired by MAA Travels, including payment accounts and documents.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md btn-premium"
        >
          <Plus size={16} />
          <span>Add Hired Client</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="relative max-w-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search client name, vehicle, PAN, GST..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Client List Table */}
      {loading ? (
        <div className="flex flex-col items-center py-20 space-y-4">
          <RefreshCw className="animate-spin text-primary-500" size={36} />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading client directory...</p>
        </div>
      ) : error && !showModal ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-sm font-semibold rounded-xl border border-rose-200/40">
          {error}
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="p-4">Client Details</th>
                  <th className="p-4">Hired Vehicle Details</th>
                  <th className="p-4">PAN & GST Details</th>
                  <th className="p-4">Bank Account</th>
                  <th className="p-4">Documents</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {clients.map((c) => {
                  let docs = [];
                  if (c.document_urls) {
                    try {
                      docs = typeof c.document_urls === 'string' ? JSON.parse(c.document_urls) : c.document_urls;
                    } catch {
                      docs = [];
                    }
                  }
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-white block">{c.client_name}</span>
                        <span className="text-[10px] text-slate-400 block">{c.contact_number} • {c.email}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">{c.address}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold block">{c.vehicle_no}</span>
                        <span className="text-[10px] text-slate-400 block">{c.vehicle_name}</span>
                        <span className="text-[10px] text-slate-400 block">RC: {c.rc_number}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-semibold block">PAN: {c.pan_number}</span>
                        {c.gst_number && <span className="text-[10px] text-slate-400 block">GST: {c.gst_number}</span>}
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <span className="font-bold flex items-center text-slate-800 dark:text-white">
                          <Banknote size={12} className="text-emerald-500 mr-1" />
                          {c.bank_name}
                        </span>
                        <span className="block text-[10px] text-slate-400">A/C: {c.bank_account_number}</span>
                        <span className="block text-[10px] text-slate-400">IFSC: {c.bank_ifsc}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          {docs.map((d, dIdx) => (
                            <a
                              key={dIdx}
                              href={`http://localhost:5000${d.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-primary-500 hover:underline flex items-center space-x-1"
                            >
                              <FileText size={10} />
                              <span className="truncate max-w-[80px]">{d.name}</span>
                              <Download size={8} />
                            </a>
                          ))}
                          {docs.length === 0 && <span className="text-[10px] text-slate-400">No docs uploaded</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors inline-flex"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Overlay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingId ? 'Edit Client details' : 'Add Hired Client'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2 border border-rose-200/40">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Section 1: Basic client details */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-500">1. Client Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Joydeb Travels Agency"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Hired Vehicle Number *</label>
                    <input
                      type="text"
                      required
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. WB 04 CD 5678"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Mobile contact"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">PAN Card Number *</label>
                    <input
                      type="text"
                      required
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      placeholder="10-digit PAN"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Billing address details"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GST Number (Optional)</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="GSTIN if any"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Hired vehicle specific details */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-500">2. Vehicle Technical Specs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Model / Name</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      placeholder="e.g. Mahindra Marazzo SUV"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">RC Certificate Number</label>
                    <input
                      type="text"
                      value={rcNumber}
                      onChange={(e) => setRcNumber(e.target.value)}
                      placeholder="RC number"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Insurance Policy Details</label>
                    <input
                      type="text"
                      value={insuranceDetails}
                      onChange={(e) => setInsuranceDetails(e.target.value)}
                      placeholder="Provider & Expiry Date"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Bank details */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-500">3. Bank Account details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                      placeholder="Name in passbook"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Account Number *</label>
                    <input
                      type="text"
                      required
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      placeholder="11-character IFSC"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Document attachments */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-500">4. Documents Upload</h4>
                
                {/* Existing docs display */}
                {existingDocs.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400">Uploaded Documents:</span>
                    <div className="flex flex-wrap gap-3">
                      {existingDocs.map((d, dIdx) => (
                        <div key={dIdx} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs">
                          <FileText size={12} className="text-primary-500" />
                          <span className="truncate max-w-[120px] font-medium">{d.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingDoc(d.url)}
                            className="text-slate-400 hover:text-rose-500 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Upload New Documents (Multiple)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 dark:file:bg-slate-800 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">Accepts images, PDFs, Word docs up to 5 files.</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold btn-premium"
                >
                  Save Hired Client
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientManagement;
