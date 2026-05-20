import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../../services/api';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw, X, ShieldAlert, Image } from 'lucide-react';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [type, setType] = useState('Sedan');
  const [seatingCapacity, setSeatingCapacity] = useState(4);
  const [fuelType, setFuelType] = useState('Diesel');
  const [transmission, setTransmission] = useState('Manual');
  const [acStatus, setAcStatus] = useState(true);
  const [ratePerKm, setRatePerKm] = useState(12);
  const [driverAllowance, setDriverAllowance] = useState(300);
  const [availability, setAvailability] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vehicleAPI.list();
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch fleet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setNumber('');
    setType('Sedan');
    setSeatingCapacity(4);
    setFuelType('Diesel');
    setTransmission('Manual');
    setAcStatus(true);
    setRatePerKm(12);
    setDriverAllowance(300);
    setAvailability(true);
    setImageFile(null);
    setExistingImageUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setName(v.name);
    setNumber(v.number);
    setType(v.type);
    setSeatingCapacity(v.seating_capacity);
    setFuelType(v.fuel_type);
    setTransmission(v.transmission);
    setAcStatus(v.ac_status);
    setRatePerKm(v.rate_per_km);
    setDriverAllowance(v.driver_allowance);
    setAvailability(v.availability);
    setImageFile(null);
    setExistingImageUrl(v.image_url || '');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('number', number);
    formData.append('type', type);
    formData.append('seating_capacity', seatingCapacity);
    formData.append('fuel_type', fuelType);
    formData.append('transmission', transmission);
    formData.append('ac_status', acStatus);
    formData.append('rate_per_km', ratePerKm);
    formData.append('driver_allowance', driverAllowance);
    formData.append('availability', availability);
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (existingImageUrl) {
      formData.append('image_url', existingImageUrl);
    }

    try {
      if (editingId) {
        await vehicleAPI.update(editingId, formData);
      } else {
        await vehicleAPI.create(formData);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save vehicle details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from the fleet?')) return;
    try {
      await vehicleAPI.delete(id);
      fetchVehicles();
    } catch (err) {
      alert('Failed to delete vehicle.');
    }
  };

  const vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'Traveller', 'Bus', 'Luxury'];

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">Owned Vehicles Fleet</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage and add vehicles published on the public website booking listings.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md btn-premium"
        >
          <Plus size={16} />
          <span>Add Fleet Vehicle</span>
        </button>
      </div>

      {/* Fleet table */}
      {loading ? (
        <div className="flex flex-col items-center py-20 space-y-4">
          <RefreshCw className="animate-spin text-primary-500" size={36} />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading fleet data...</p>
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
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Registration</th>
                  <th className="p-4">Pricing Specs</th>
                  <th className="p-4">AC Status</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-12 h-10 rounded-lg bg-slate-150 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {v.image_url ? (
                          <img src={`http://localhost:5000${v.image_url}`} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><Image size={16} /></div>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block">{v.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{v.type} • {v.fuel_type} • {v.seating_capacity} Seater</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">{v.number}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 dark:text-white">Rs. {v.rate_per_km}/KM</span>
                      <span className="block text-[10px] text-slate-400">Driver Charge: Rs. {v.driver_allowance}/day</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${v.ac_status ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-500/10 text-slate-400'}`}>
                        {v.ac_status ? 'AC' : 'Non-AC'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${v.availability ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {v.availability ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{v.availability ? 'Available' : 'Booked'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
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
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingId ? 'Edit Vehicle Details' : 'Add Fleet Vehicle'}
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

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maruti Suzuki Swift Dzire"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Reg Number *</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="e.g. WB 02 AB 1234"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Seating *</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="60"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fuel Type *</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Transmission *</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Rate Per KM (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePerKm}
                    onChange={(e) => setRatePerKm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Driver Allowance / Day (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={driverAllowance}
                    onChange={(e) => setDriverAllowance(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <label className="flex items-center space-x-2.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acStatus}
                    onChange={(e) => setAcStatus(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                  />
                  <span>Air Conditioned (AC)</span>
                </label>
                
                <label className="flex items-center space-x-2.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                  />
                  <span>Active & Available</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Upload Vehicle Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 dark:file:bg-slate-800 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100"
                />
              </div>

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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleManagement;
