import React, { useState, useEffect } from 'react';
import { contractAPI, clientAPI } from '../../services/api';
import { FileSignature, Upload, Download, RefreshCw, CheckCircle, FileText, FileCode, Check } from 'lucide-react';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [templateInfo, setTemplateInfo] = useState({ templateName: '' });
  const [loading, setLoading] = useState(true);
  
  // Template upload state
  const [templateFile, setTemplateFile] = useState(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [pan, setPan] = useState('');
  const [gst, setGst] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [insuranceDetails, setInsuranceDetails] = useState('');
  const [rates, setRates] = useState('');
  const [contractDuration, setContractDuration] = useState('12 Months');
  
  // Client Bank Details states
  const [bankName, setBankName] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  
  // Terms & Conditions and Payment Terms (Auto-fills)
  const [termsConditions, setTermsConditions] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const contractRecords = await contractAPI.list();
      setContracts(contractRecords);

      const clientRecords = await clientAPI.list();
      setClients(clientRecords);

      const tInfo = await contractAPI.getTemplateInfo();
      setTemplateInfo(tInfo);

      const latestTerms = await contractAPI.getLatestTerms();
      setTermsConditions(latestTerms.terms_conditions);
      setPaymentTerms(latestTerms.payment_terms);
    } catch (err) {
      console.error('Failed to load contract resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle auto-fill on client selection
  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientName(client.client_name);
      setAddress(client.address || '');
      setPan(client.pan_number || '');
      setGst(client.gst_number || '');
      setVehicleName(client.vehicle_name || '');
      setVehicleNo(client.vehicle_no || '');
      setRcNumber(client.rc_number || '');
      setInsuranceDetails(client.insurance_details || '');
      setBankName(client.bank_name || '');
      setBankHolderName(client.bank_holder_name || '');
      setBankAccountNumber(client.bank_account_number || '');
      setBankIfsc(client.bank_ifsc || '');
    } else {
      setClientName('');
      setAddress('');
      setPan('');
      setGst('');
      setVehicleName('');
      setVehicleNo('');
      setRcNumber('');
      setInsuranceDetails('');
      setBankName('');
      setBankHolderName('');
      setBankAccountNumber('');
      setBankIfsc('');
    }
  };

  // Template Upload Handler
  const handleTemplateUpload = async (e) => {
    e.preventDefault();
    if (!templateFile) return;

    setUploadingTemplate(true);
    setUploadSuccess('');
    const formData = new FormData();
    formData.append('template', templateFile);

    try {
      const res = await contractAPI.uploadTemplate(formData);
      setUploadSuccess(res.message);
      setTemplateFile(null);
      // Reload template info
      const tInfo = await contractAPI.getTemplateInfo();
      setTemplateInfo(tInfo);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload template.');
    } finally {
      setUploadingTemplate(false);
    }
  };

  // Contract Generation Handler
  const handleGenerate = async (format) => {
    if (!clientName || !vehicleNo || !rates) {
      alert('Please select a client or enter Client Name, Vehicle No, and Rates.');
      return;
    }

    setGenerating(true);
    setGenSuccess('');

    const payload = {
      client_name: clientName,
      address,
      pan,
      gst,
      vehicle_name: vehicleName,
      vehicle_no: vehicleNo,
      rc_number: rcNumber,
      insurance_details: insuranceDetails,
      rates,
      contract_duration: contractDuration,
      terms_conditions: termsConditions,
      payment_terms: paymentTerms,
      bank_name: bankName,
      bank_holder_name: bankHolderName,
      bank_account_number: bankAccountNumber,
      bank_ifsc: bankIfsc
    };

    try {
      const blob = await contractAPI.generate(payload, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contract_${clientName.replace(/\s+/g, '_')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setGenSuccess(`Contract successfully generated and exported as ${format.toUpperCase()}!`);
      
      // Refresh list
      const contractRecords = await contractAPI.list();
      setContracts(contractRecords);
    } catch (err) {
      console.error(err);
      alert('Failed to generate contract.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* View Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Contract Generation & Management</h2>
        <p className="text-xs sm:text-sm text-slate-500">Generate legal agreements dynamically, upload templates, and download outputs.</p>
      </div>

      {/* Grid: Left - Generator Form, Right - Template and History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Col 7 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-855 dark:text-white flex items-center space-x-2">
              <FileSignature className="text-primary-500" />
              <span>Contract Data Generator</span>
            </h3>

            {genSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 border border-emerald-200/40">
                <CheckCircle size={16} />
                <span>{genSuccess}</span>
              </div>
            )}

            {/* Select Client Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Auto-fill From Hired Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Click to select and auto-fill --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.client_name} ({c.vehicle_no})</option>
                ))}
              </select>
            </div>

            <div className="w-full h-px bg-slate-150 dark:bg-slate-850"></div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client / Contractor Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address details"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="PAN card"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GST Registration</label>
                  <input
                    type="text"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    placeholder="GSTIN"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Client Bank Details */}
              <div className="w-full h-px bg-slate-150 dark:bg-slate-850 my-2"></div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary-550 dark:text-primary-400">Client Bank Account Details</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankHolderName}
                    onChange={(e) => setBankHolderName(e.target.value)}
                    placeholder="Name in Bank account"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="A/C Number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    placeholder="IFSC Code"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="w-full h-px bg-slate-150 dark:bg-slate-850 my-2"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Description</label>
                  <input
                    type="text"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="e.g. Maruti Swift Tour S"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="e.g. WB 02 B 5678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contract Rates / Terms *</label>
                  <input
                    type="text"
                    required
                    value={rates}
                    onChange={(e) => setRates(e.target.value)}
                    placeholder="e.g. Rs. 14 / KM with Rs. 300 allowance"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Agreement Duration</label>
                  <input
                    type="text"
                    value={contractDuration}
                    onChange={(e) => setContractDuration(e.target.value)}
                    placeholder="e.g. 12 Months"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">RC Number</label>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="RC number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Insurance details</label>
                  <input
                    type="text"
                    value={insuranceDetails}
                    onChange={(e) => setInsuranceDetails(e.target.value)}
                    placeholder="Policy details"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Terms & Conditions (Auto-saved)</label>
                <textarea
                  rows="4"
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="Legal clauses here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payment & Invoice Terms (Auto-saved)</label>
                <textarea
                  rows="3"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Payment cycles, bank processing timelines..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              {/* Generation buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => handleGenerate('docx')}
                  className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  {generating ? <RefreshCw className="animate-spin" size={14} /> : <FileCode size={14} />}
                  <span>Export Word (.docx)</span>
                </button>
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => handleGenerate('pdf')}
                  className="flex-1 py-3 bg-rose-650 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  {generating ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />}
                  <span>Export PDF (.pdf)</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane: Col 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Template upload card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Word Contract Template</h3>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 text-xs rounded-2xl border border-slate-150">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Active Template:</span>
              <span className="text-primary-600 dark:text-primary-400 font-mono font-bold break-all">
                {templateInfo.templateName || 'None (Default Generator active)'}
              </span>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-emerald-200/40">
                <Check size={14} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleTemplateUpload} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Upload New Word Template (.docx)</label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => setTemplateFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-primary-50 dark:file:bg-slate-800 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingTemplate || !templateFile}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1"
              >
                {uploadingTemplate ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                <span>Upload Template</span>
              </button>
            </form>
          </div>

          {/* History card */}
          <div className="glass-card p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recently Generated</h3>
            
            {loading ? (
              <div className="flex justify-center py-4"><RefreshCw className="animate-spin text-slate-400" size={20} /></div>
            ) : contracts.length === 0 ? (
              <div className="text-xs text-slate-500 py-2">No generated contracts on file.</div>
            ) : (
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {contracts.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-150/50 dark:border-slate-800/50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">{c.client_name}</span>
                      <span className="text-[10px] text-slate-400 block">{c.vehicle_details}</span>
                      <span className="text-[9px] text-slate-400 block">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    {c.document_url && (
                      <a
                        href={`http://localhost:5000${c.document_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 transition-colors"
                        title="Download Copy"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ContractManagement;
