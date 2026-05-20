const db = require('../services/supabase');

// 1. Get all vehicles (with filters for front-end & fleet page)
exports.getVehicles = async (req, res) => {
  try {
    const { search, type, seating_capacity, ac_status, availability } = req.query;
    
    // Fetch all vehicles
    let vehicles = await db.query('vehicles', { order: 'created_at:desc' });

    // Apply filtering in JavaScript for ease of implementation & mock compatibility
    if (search) {
      const searchLower = search.toLowerCase();
      vehicles = vehicles.filter(v => 
        v.name.toLowerCase().includes(searchLower) || 
        v.number.toLowerCase().includes(searchLower)
      );
    }
    if (type) {
      vehicles = vehicles.filter(v => v.type.toLowerCase() === type.toLowerCase());
    }
    if (seating_capacity) {
      vehicles = vehicles.filter(v => v.seating_capacity === parseInt(seating_capacity));
    }
    if (ac_status !== undefined && ac_status !== '') {
      const isAc = ac_status === 'true' || ac_status === true;
      vehicles = vehicles.filter(v => v.ac_status === isAc);
    }
    if (availability !== undefined && availability !== '') {
      const isAvail = availability === 'true' || availability === true;
      vehicles = vehicles.filter(v => v.availability === isAvail);
    }

    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve vehicles.' });
  }
};

// 2. Add a new vehicle
exports.addVehicle = async (req, res) => {
  try {
    const {
      name,
      number,
      type,
      seating_capacity,
      fuel_type,
      transmission,
      ac_status,
      rate_per_km,
      driver_allowance,
      availability
    } = req.body;

    if (!name || !number || !type) {
      return res.status(400).json({ error: 'Vehicle Name, Number, and Type are required.' });
    }

    // Check if vehicle number already exists
    const existing = await db.query('vehicles', { eq: { number } });
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'A vehicle with this registration number already exists.' });
    }

    // Set image path if uploaded
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const newVehicle = await db.insert('vehicles', {
      name,
      number,
      type,
      seating_capacity: parseInt(seating_capacity) || 4,
      fuel_type: fuel_type || 'Diesel',
      transmission: transmission || 'Manual',
      ac_status: ac_status === 'true' || ac_status === true,
      rate_per_km: parseFloat(rate_per_km) || 0.0,
      driver_allowance: parseFloat(driver_allowance) || 0.0,
      image_url,
      availability: availability === undefined ? true : (availability === 'true' || availability === true)
    });

    return res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle: newVehicle
    });
  } catch (error) {
    console.error('Add Vehicle Error:', error);
    return res.status(500).json({ error: 'Failed to add vehicle.' });
  }
};

// 3. Edit a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      number,
      type,
      seating_capacity,
      fuel_type,
      transmission,
      ac_status,
      rate_per_km,
      driver_allowance,
      availability,
      image_url: existingImageUrl
    } = req.body;

    // Check if vehicle exists
    const vehicles = await db.query('vehicles', { eq: { id } });
    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // If changing vehicle number, verify uniqueness
    if (number && number !== vehicles[0].number) {
      const existing = await db.query('vehicles', { eq: { number } });
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'A vehicle with this registration number already exists.' });
      }
    }

    // Get image url
    let image_url = existingImageUrl || vehicles[0].image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const updatedData = {
      name: name || vehicles[0].name,
      number: number || vehicles[0].number,
      type: type || vehicles[0].type,
      seating_capacity: seating_capacity !== undefined ? parseInt(seating_capacity) : vehicles[0].seating_capacity,
      fuel_type: fuel_type || vehicles[0].fuel_type,
      transmission: transmission || vehicles[0].transmission,
      ac_status: ac_status !== undefined ? (ac_status === 'true' || ac_status === true) : vehicles[0].ac_status,
      rate_per_km: rate_per_km !== undefined ? parseFloat(rate_per_km) : vehicles[0].rate_per_km,
      driver_allowance: driver_allowance !== undefined ? parseFloat(driver_allowance) : vehicles[0].driver_allowance,
      image_url,
      availability: availability !== undefined ? (availability === 'true' || availability === true) : vehicles[0].availability
    };

    const updatedVehicle = await db.update('vehicles', id, updatedData);

    return res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Update Vehicle Error:', error);
    return res.status(500).json({ error: 'Failed to update vehicle.' });
  }
};

// 4. Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vehicle exists
    const vehicles = await db.query('vehicles', { eq: { id } });
    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    await db.delete('vehicles', id);

    return res.status(200).json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    console.error('Delete Vehicle Error:', error);
    return res.status(500).json({ error: 'Failed to delete vehicle.' });
  }
};
