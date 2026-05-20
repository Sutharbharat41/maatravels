import React, { useState, useEffect } from 'react';
import { reportAPI, paymentAPI } from '../../services/api';
import { FileSpreadsheet, FileText, Calendar, Search, RefreshCw, Filter, ShieldAlert } from 'lucide-react';

const ReportsModule = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter variables
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  const [downloading, setDownloading] = useState(false);

  const fetchFilteredLedger = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentAPI.list({
        search,
        startDate,
        endDate,
        status
      });
      setPayments(data);
    } catch (err) {
      console.error(err);
      setError('Failed to query ledger transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredLedger();
  }, [search, startDate, endDate, status]);

  // Export spreadsheet handler
  const handleExportExcel = async () => {
    setDownloading(true);
    try {
      const blob = await reportAPI.exportExcel({ search, startDate, endDate, status });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MAA_Travels_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to generate Excel report.');
    } finally {
      setDownloading(false);
    }
  };

  // Export PDF ledger handler
  const handleExportPdf = async () => {
    setDownloading(true);
    try {
      const blob = await reportAPI.exportPdf({ search, startDate, endDate, status });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MAA_Travels_Ledger_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  // Total summary calculators
  const stats = payments.reduce((acc, p) => {
    acc.gross += p.basic_amount + p.toll_charges + p.parking_charges - p.commission_amount;
    acc.tds += p.tds_amount;
    acc.net += p.net_pay;
    if (p.status === 'Paid') acc.paid += p.net_pay;
    else acc.pending += p.net_pay;
    return acc;
  }, { gross: 0, tds: 0, net: 0, paid: 0, pending: 0 });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Reports & Financial Exports</h2>
        <p className="text-xs sm:text-sm text-slate-500">Apply filtering criteria to review transactions and compile Excel / PDF business statements.</p>
      </div>

      {/* Filter toolbar grid */}
      <div className="glass-card p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Search */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center space-x-1">
            <Search size={12} />
            <span>Keyword Search</span>
          </label>
          <input
            type="text"
            placeholder="Vehicle no, client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center space-x-1">
            <Calendar size={12} />
            <span>Start Date</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center space-x-1">
            <Calendar size={12} />
            <span>End Date</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center space-x-1">
            <Filter size={12} />
            <span>Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          >
            <option value="">All Transactions</option>
            <option value="Paid">Paid Ledger Only</option>
            <option value="Pending">Pending Ledger Only</option>
          </select>
        </div>

      </div>

      {/* Export Actions Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-100 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <span className="text-xs font-semibold text-slate-500">
          Showing {payments.length} ledger sheets matching filters. Download exports:
        </span>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            disabled={downloading || payments.length === 0}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={16} />
            <span>Download Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={downloading || payments.length === 0}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-rose-650 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={16} />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Basic Gross Total</span>
          <span className="text-lg sm:text-xl font-extrabold">Rs. {stats.gross.toLocaleString()}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">TDS Deductions</span>
          <span className="text-lg sm:text-xl font-extrabold text-rose-400">Rs. {stats.tds.toLocaleString()}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Paid Invoices</span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-bold">Rs. {stats.paid.toLocaleString()}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Outstanding Pending</span>
          <span className="text-lg sm:text-xl font-extrabold text-amber-400">Rs. {stats.pending.toLocaleString()}</span>
        </div>
      </div>

      {/* Mini Listing Grid */}
      {loading ? (
        <div className="flex flex-col items-center py-10 space-y-4">
          <RefreshCw className="animate-spin text-primary-500" size={28} />
          <p className="text-xs text-slate-500">Refreshing query results...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">No records found. Please adjust filters.</div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Billing Cycle</th>
                  <th className="p-4">Days Run</th>
                  <th className="p-4">Basic Gross</th>
                  <th className="p-4">Net Payable</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {payments.map((p) => (
                  <tr key={p.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-4 font-mono text-xs font-bold">{p.vehicle_no}</td>
                    <td className="p-4">{p.client_name}</td>
                    <td className="p-4 font-medium text-xs">{p.month_year}</td>
                    <td className="p-4 text-xs font-bold">{p.days_run} Days</td>
                    <td className="p-4 text-xs">Rs. {p.basic_amount}</td>
                    <td className="p-4 font-extrabold text-slate-800 dark:text-white">Rs. {p.net_pay}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsModule;
