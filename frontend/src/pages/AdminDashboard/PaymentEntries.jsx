import React, { useState, useEffect } from 'react';
import { paymentAPI, vehicleAPI, clientAPI } from '../../services/api';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, ShieldAlert, FileSpreadsheet, Calculator } from 'lucide-react';

const PaymentEntries = () => {
  const [payments, setPayments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Input Fields (State variables mapped exactly to DB fields)
  const [billNumber, setBillNumber] = useState('');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [clientName, setClientName] = useState(''); // maps to vehicle_name
  const [pan, setPan] = useState('');
  
  // Amounts
  const [basicAmount, setBasicAmount] = useState(0);
  const [commissionPct, setCommissionPct] = useState(5);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [netTotal, setNetTotal] = useState(0);
  const [tdsPct, setTdsPct] = useState(1);
  const [tdsAmount, setTdsAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0); // maps to deductions
  const [netPay, setNetPay] = useState(0); // maps to net_to_pay
  
  const [status, setStatus] = useState('Pending'); // maps to paid_status
  const [notes, setNotes] = useState('');

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const yearsList = [];
  const currentYr = new Date().getFullYear();
  for (let y = currentYr - 2; y <= currentYr + 5; y++) {
    yearsList.push(y);
  }

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const payList = await paymentAPI.list();
      setPayments(payList);

      const vList = await vehicleAPI.list();
      setVehicles(vList);

      const cList = await clientAPI.list();
      setClients(cList);
    } catch (err) {
      console.error(err);
      setError('Failed to load ledger information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time calculation triggers based on backend calculation logic
  useEffect(() => {
    const basic = parseFloat(basicAmount) || 0;
    const commPercent = parseFloat(commissionPct) || 0;
    const tdsPercent = parseFloat(tdsPct) || 0;
    const deductions = parseFloat(otherDeductions) || 0;

    const comm = Math.round(basic * (commPercent / 100));
    setCommissionAmount(comm);

    const net = Math.round(basic - comm);
    setNetTotal(net);

    const tds = Math.round(net * (tdsPercent / 100));
    setTdsAmount(tds);

    const total = Math.round(net - tds);
    setTotalAmount(total);

    const finalNet = Math.round(total - deductions);
    setNetPay(finalNet);
  }, [basicAmount, commissionPct, tdsPct, otherDeductions]);

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setVehicleNo(vehicle.number);
      
      // Attempt to find client name matching this vehicle number
      const matchedClient = clients.find(c => c.vehicle_no.replace(/\s+/g, '').toLowerCase() === vehicle.number.replace(/\s+/g, '').toLowerCase());
      if (matchedClient) {
        setClientName(matchedClient.client_name);
        setPan(matchedClient.pan_number || '');
      } else {
        setClientName('Company Shuttle Rental');
        setPan('');
      }
    } else {
      setVehicleNo('');
      setClientName('');
      setPan('');
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
    setSelectedVehicleId('');
    setVehicleNo('');
    setClientName('');
    setPan('');
    setMonth(monthsList[new Date().getMonth()]);
    setYear(new Date().getFullYear());
    setBasicAmount(0);
    setCommissionPct(5);
    setCommissionAmount(0);
    setNetTotal(0);
    setTdsPct(1);
    setTdsAmount(0);
    setTotalAmount(0);
    setOtherDeductions(0);
    setNetPay(0);
    setStatus('Pending');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    
    // Find matching vehicle
    const matchV = vehicles.find(v => v.number === p.vehicle_number);
    setSelectedVehicleId(matchV ? matchV.id : '');
    
    setBillNumber(p.bill_number);
    setVehicleNo(p.vehicle_number);
    setClientName(p.vehicle_name);
    setPan(p.pan || '');
    setMonth(p.month);
    setYear(p.year);
    setBasicAmount(p.basic_amount);
    setCommissionPct(p.commission_percentage);
    setTdsPct(p.tds_percentage);
    setOtherDeductions(p.deductions);
    setStatus(p.paid_status);
    setNotes(p.notes || '');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Payload keys matched EXACTLY to backend expectations
    const payload = {
      bill_number: billNumber,
      month,
      year: parseInt(year),
      vehicle_number: vehicleNo,
      vehicle_name: clientName,
      pan,
      basic_amount: Math.round(Number(basicAmount)),
      commission_percentage: Number(commissionPct),
      tds_percentage: Number(tdsPct),
      deductions: Math.round(Number(otherDeductions)),
      paid_status: status,
      notes
    };

    try {
      if (editingId) {
        await paymentAPI.update(editingId, payload);
      } else {
        await paymentAPI.create(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit payment details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment entry?')) return;
    try {
      await paymentAPI.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete payment entry.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Payment Ledger Entries</h2>
          <p className="text-xs sm:text-sm text-slate-500">Log monthly billing sheets, commissions, TDS deductions, and client payments.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md btn-premium"
        >
          <Plus size={16} />
          <span>New Payment Entry</span>
        </button>
      </div>

      {/* Ledger Lists */}
      {loading ? (
        <div className="flex flex-col items-center py-20 space-y-4">
          <RefreshCw className="animate-spin text-primary-500" size={36} />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading transaction ledger...</p>
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
                  <th className="p-4">Bill No.</th>
                  <th className="p-4">Vehicle & Client</th>
                  <th className="p-4">Billing Cycle</th>
                  <th className="p-4">Basic Gross</th>
                  <th className="p-4">Net (Base)</th>
                  <th className="p-4">Tax Deducts</th>
                  <th className="p-4">Net Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                    <td className="p-4 font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">{p.bill_number}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold block">{p.vehicle_number}</span>
                      <span className="text-[10px] text-slate-400 block">{p.vehicle_name}</span>
                    </td>
                    <td className="p-4 font-medium text-xs">{p.month} {p.year}</td>
                    <td className="p-4 text-xs font-semibold">Rs. {p.basic_amount}</td>
                    <td className="p-4 text-xs">
                      <span className="font-bold block">Rs. {p.net_total}</span>
                      <span className="text-[10px] text-slate-400 block">Com ({p.commission_percentage}%): Rs. {p.commission_amount}</span>
                    </td>
                    <td className="p-4 text-xs space-y-0.5">
                      <span className="block text-[10px] text-rose-500">TDS ({p.tds_percentage}%): Rs. {p.tds_amount}</span>
                      <span className="block text-[10px] text-slate-400">Ded: Rs. {p.deductions}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-slate-800 dark:text-white block">Rs. {p.net_to_pay}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.paid_status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {p.paid_status}
                      </span>
                      {p.notes && <span className="block text-[9px] text-slate-400 truncate max-w-[120px]">{p.notes}</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors inline-flex"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                {editingId ? 'Edit Payment Entry' : 'Log New Payment Entry'}
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
              
              {/* Row 1: Bill Number and Vehicle Registration Number (Required fields) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Bill Number *</label>
                  <input
                    type="text"
                    required
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    placeholder="e.g. BILL-102"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Fleet Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => handleVehicleSelect(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- Choose active cab --</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.number})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Reg Number *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="e.g. WB 02 B 1234"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 2: Client name and PAN (Optional fields - Removed required restrictions) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client / Agency Name (Vehicle Name)</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client agency"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client PAN Card Number</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="PAN Details"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 3: Month & Year Dropdown Lists (Required fields) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Billing Month *</label>
                  <select
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Billing Year *</label>
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Pricing parameters (Optional fields) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Basic Amount (Gross Rs.)</label>
                  <input
                    type="number"
                    value={basicAmount}
                    onChange={(e) => setBasicAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Other Deductions (Rs.)</label>
                  <input
                    type="number"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Row 5: TDS and automatic calculations summary review */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">TDS percentage %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tdsPct}
                    onChange={(e) => setTdsPct(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                
                {/* Math calculation review card */}
                <div className="sm:col-span-2 p-4 bg-primary-50 dark:bg-slate-850 rounded-2xl border border-primary-200/50 dark:border-slate-800 flex justify-around text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Commission</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">Rs. {commissionAmount}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Net Total (TDS Base)</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">Rs. {netTotal}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">TDS Amount</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">Rs. {tdsAmount}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                  <div>
                    <span className="block text-[10px] text-primary-500 font-bold uppercase">Net Payout</span>
                    <span className="font-extrabold text-primary-600 dark:text-primary-400">Rs. {netPay}</span>
                  </div>
                </div>
              </div>

              {/* Row 6: Payment parameters and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-150 dark:border-slate-850 pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Administrative Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Cheque ref, bank transaction codes, general terms..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentEntries;
