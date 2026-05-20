import React, { useState, useEffect } from 'react';
import { reportAPI, inquiryAPI } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  IndianRupee,
  Car,
  Users2,
  MailWarning,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reply Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const currentYear = new Date().getFullYear();
      const analytics = await reportAPI.getAnalytics(currentYear);
      setStats(analytics);
      
      const inqData = await inquiryAPI.list();
      setInquiries(inqData.slice(0, 5)); // Show 5 most recent inquiries
    } catch (err) {
      console.error(err);
      setError('Failed to refresh dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenReply = (inq) => {
    setSelectedInquiry(inq);
    setReplyText('');
    setSuccessMsg('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText) return;
    
    setSubmittingReply(true);
    setSuccessMsg('');
    try {
      const res = await inquiryAPI.reply(selectedInquiry.id, replyText);
      setSuccessMsg(res.message || 'Email successfully queued.');
      setTimeout(() => {
        setSelectedInquiry(null);
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleResolve = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Resolved' ? 'Unresolved' : 'Resolved';
      await inquiryAPI.resolve(id, nextStatus);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={36} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Refreshing management data...</p>
      </div>
    );
  }

  const cards = stats?.cards || {
    totalEarnings: 0,
    totalPaid: 0,
    totalPending: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalClients: 0,
    pendingInquiries: 0
  };

  const chartData = stats?.charts?.monthlyRevenue || [];

  return (
    <div className="space-y-8">
      
      {/* 1. Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Net Earnings */}
        <div className="glass-card p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <IndianRupee size={24} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Net Income</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
              Rs. {cards.totalEarnings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Outstanding Payments */}
        <div className="glass-card p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl">
            <IndianRupee size={24} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Outstanding</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
              Rs. {cards.totalPending.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Active fleet details */}
        <div className="glass-card p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl">
            <Car size={24} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Active Vehicles</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
              {cards.activeVehicles} <span className="text-xs font-normal text-slate-500">/ {cards.totalVehicles} total</span>
            </span>
          </div>
        </div>

        {/* Card 4: Mail notifications */}
        <div className="glass-card p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <MailWarning size={24} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Open Inquiries</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
              {cards.pendingInquiries} <span className="text-xs font-normal text-slate-500">pending</span>
            </span>
          </div>
        </div>

      </div>

      {/* 2. Charts & Stats Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Line chart (Area chart) (Col 2) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Monthly Revenue Distribution ({new Date().getFullYear()})</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="netPay" name="Net Billing (Rs.)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick details / list metrics (Col 1) */}
        <div className="glass-card p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Directory Stats</h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-around">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <span className="text-sm text-slate-500">Total Hired Clients</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Users2 size={16} className="text-primary-500" />
                <span>{cards.totalClients}</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <span className="text-sm text-slate-500">Paid Invoices</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 size={16} />
                <span>Rs. {cards.totalPaid.toLocaleString()}</span>
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Unpaid Outstanding</span>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <Clock size={16} />
                <span>Rs. {cards.totalPending.toLocaleString()}</span>
              </span>
            </div>
          </div>

          <div className="p-4 bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-2xl border border-primary-100 dark:border-primary-900/30">
            Database keeps active automatically every 12 hours. Use `/api/cron/keep-alive` to configure external uptime pings.
          </div>
        </div>

      </div>

      {/* 3. Inquiries Response Board */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Customer Inquiries</h3>

        {inquiries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No inquiries received. Form submissions will display here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Message</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-4 font-semibold">
                      {inq.name}
                      {inq.company_name && <span className="block text-[10px] text-slate-400 font-normal">{inq.company_name}</span>}
                    </td>
                    <td className="py-4">
                      {inq.email}
                      <span className="block text-xs text-slate-400">{inq.phone}</span>
                    </td>
                    <td className="py-4 max-w-xs truncate" title={inq.message}>{inq.message}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        inq.status === 'Resolved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleResolve(inq.id, inq.status)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => handleOpenReply(inq)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                      >
                        Reply Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Reply Modal Popup Overlay */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Send Inquiry Reply</h3>
              <p className="text-xs text-slate-400 mt-1">Replying to {selectedInquiry.name} ({selectedInquiry.email})</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 text-xs text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-150">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Inquiry Text:</span>
              "{selectedInquiry.message}"
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-emerald-200/40">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reply Email Body</label>
                <textarea
                  required
                  rows="5"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter response message..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center space-x-1.5"
                >
                  {submittingReply ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Mail</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardHome;
