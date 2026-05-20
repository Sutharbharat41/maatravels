import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { Users, Fuel, Gauge, AlertCircle, RefreshCw, Snowflake, CheckCircle, XCircle, Car } from 'lucide-react';

const Fleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [acStatus, setAcStatus] = useState('');
  
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vehicleAPI.list({
        search,
        type,
        ac_status: acStatus
      });
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch fleet details from the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, type, acStatus]);

  const handleBookNow = (vehicle) => {
    const bookingDetails = `Booking Request for ${vehicle.name} (${vehicle.number}). Rates: Rs. ${vehicle.rate_per_km}/KM, Driver Allowances: Rs. ${vehicle.driver_allowance}/Day.`;
    navigate(`/contact?message=${encodeURIComponent(bookingDetails)}`);
  };

  const vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'Traveller', 'Bus', 'Luxury'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">Our Premium Fleet</h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-light">
          Browse and filter our diverse range of fully compliance-ready owned vehicles. Clean interiors, strict service schedules, and full insurance coverage.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 shadow-md">
        
        {/* Search */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Search Fleet</label>
          <input
            type="text"
            placeholder="Search name or vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Category Type */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Vehicle Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          >
            <option value="">All Categories</option>
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* AC Status */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Air Conditioning</label>
          <select
            value={acStatus}
            onChange={(e) => setAcStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          >
            <option value="">All Cabs</option>
            <option value="true">AC Cabs Only</option>
            <option value="false">Non-AC Only</option>
          </select>
        </div>

      </div>

      {/* Fleet Listing Area */}
      {loading ? (
        <div className="flex flex-col items-center py-20 space-y-4">
          <RefreshCw className="animate-spin text-primary-500" size={36} />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading fleet database...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-3xl text-center border-red-200/50 bg-red-50/10 max-w-lg mx-auto flex flex-col items-center space-y-4">
          <AlertCircle className="text-red-500" size={40} />
          <p className="text-slate-700 dark:text-slate-300 font-medium">{error}</p>
          <button onClick={fetchVehicles} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">
            Try Again
          </button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center max-w-lg mx-auto space-y-4">
          <Car size={48} className="text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Vehicles Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            There are no vehicles matching your search criteria. Please adjust your filters or contact administrative services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="glass-card rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
              
              {/* Image & Badges */}
              <div className="relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={vehicle.image_url ? (vehicle.image_url.startsWith('/uploads') ? `http://localhost:5000${vehicle.image_url}` : vehicle.image_url) : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Availability Badge */}
                <div className="absolute top-4 right-4">
                  {vehicle.availability ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={12} />
                      <span>Available</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <XCircle size={12} />
                      <span>Booked / Maintenance</span>
                    </span>
                  )}
                </div>

                {/* AC status badge */}
                {vehicle.ac_status && (
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-extrabold bg-slate-900/80 text-white backdrop-blur-sm">
                      <Snowflake size={10} className="text-cyan-400 animate-pulse" />
                      <span>AC Cab</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle Specs */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{vehicle.name}</h3>
                  <span className="inline-block text-[10px] text-primary-500 font-extrabold tracking-widest uppercase">
                    {vehicle.type} • {vehicle.number}
                  </span>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Users size={14} className="text-slate-400" />
                      <span>{vehicle.seating_capacity} Seater</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Fuel size={14} className="text-slate-400" />
                      <span>{vehicle.fuel_type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Gauge size={14} className="text-slate-400" />
                      <span>{vehicle.transmission}</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Per KM Rate</span>
                      <span className="text-lg font-extrabold text-slate-800 dark:text-white">Rs. {Math.round(vehicle.rate_per_km)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Driver Allowance</span>
                      <span className="text-lg font-extrabold text-slate-800 dark:text-white">Rs. {Math.round(vehicle.driver_allowance)} <span className="text-xs font-normal text-slate-500">/day</span></span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    disabled={!vehicle.availability}
                    onClick={() => handleBookNow(vehicle)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
                      vehicle.availability
                        ? 'bg-primary-600 hover:bg-primary-700 text-white btn-premium'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {vehicle.availability ? 'Book Now' : 'Out of Service'}
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Fleet;
