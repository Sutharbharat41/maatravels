import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Car,
  Users2,
  FileSignature,
  IndianRupee,
  FileBarChart2,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Vehicles Fleet', path: '/admin/dashboard/vehicles', icon: <Car size={20} /> },
    { name: 'Client Management', path: '/admin/dashboard/clients', icon: <Users2 size={20} /> },
    { name: 'Contracts Generator', path: '/admin/dashboard/contracts', icon: <FileSignature size={20} /> },
    { name: 'Payment Entries', path: '/admin/dashboard/payments', icon: <IndianRupee size={20} /> },
    { name: 'Reports & Analytics', path: '/admin/dashboard/reports', icon: <FileBarChart2 size={20} /> }
  ];

  const isLinkActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors flex text-slate-800 dark:text-slate-100">
      
      {/* 1. Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
        
        {/* Brand header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary-600 rounded text-white">
              <Car size={16} />
            </div>
            <span className="font-extrabold text-white text-base tracking-widest uppercase">MAA TRAVELS</span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${
                isLinkActive(item.path)
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600'
                  : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-full text-primary-400">
              <UserCheck size={18} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white leading-tight truncate">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Navbar - Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-30">
          
          {/* Left: Mobile sidebar trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-sm tracking-wider text-slate-800 dark:text-white ml-2">MAA TRAVELS</span>
          </div>

          <div className="hidden lg:block">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {navItems.find(item => isLinkActive(item.path))?.name || 'Admin Area'}
            </span>
          </div>

          {/* Right: Theme Toggle & Admin Profile indicator */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">{user?.name}</span>
              <span className="text-[10px] bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-extrabold uppercase px-2 py-0.5 rounded-md">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar overlay drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            
            {/* Overlay backdrop */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            
            {/* Drawer body */}
            <div className="relative flex flex-col w-64 max-w-xs bg-slate-950 border-r border-slate-800 text-slate-300 py-6 px-4 animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <span className="font-extrabold text-white text-base tracking-widest uppercase">MAA TRAVELS</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Drawer Links */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800 hover:text-white ${
                      isLinkActive(item.path)
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="border-t border-slate-800 pt-4 mt-4 flex flex-col space-y-4">
                <button
                  onClick={() => { setSidebarOpen(false); handleLogout(); }}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Dashboard Area Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
