const db = require('../services/supabase');

// 1. Get all clients (with search)
exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;
    let clients = await db.query('clients', { order: 'created_at:desc' });

    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(c => 
        c.client_name.toLowerCase().includes(searchLower) ||
        c.vehicle_no.toLowerCase().includes(searchLower) ||
        c.vehicle_name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.pan_number.toLowerCase().includes(searchLower) ||
        (c.gst_number && c.gst_number.toLowerCase().includes(searchLower))
      );
    }

    return res.status(200).json(clients);
  } catch (error) {
    console.error('Get Clients Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve clients.' });
  }
};

// 2. Add a client
exports.addClient = async (req, res) => {
  try {
    const {
      vehicle_no,
      client_name,
      address,
      contact_number,
      email,
      pan_number,
      gst_number,
      bank_holder_name,
      bank_account_number,
      bank_ifsc,
      bank_name,
      vehicle_name,
      rc_number,
      insurance_details
    } = req.body;

    if (!vehicle_no || !client_name || !pan_number || !bank_account_number || !bank_ifsc) {
      return res.status(400).json({ error: 'Vehicle No, Client Name, PAN, Bank Account Number, and IFSC Code are required.' });
    }

    // Verify vehicle number uniqueness
    const existing = await db.query('clients', { eq: { vehicle_no } });
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'A client with this vehicle number is already registered.' });
    }

    // Handle document file uploads
    const document_urls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        document_urls.push({
          name: file.originalname,
          url: `/uploads/${file.filename}`
        });
      });
    }

    const newClient = await db.insert('clients', {
      vehicle_no,
      client_name,
      address: address || '',
      contact_number: contact_number || '',
      email: email || '',
      pan_number,
      gst_number: gst_number || '',
      bank_holder_name,
      bank_account_number,
      bank_ifsc,
      bank_name: bank_name || '',
      vehicle_name: vehicle_name || '',
      rc_number: rc_number || '',
      insurance_details: insurance_details || '',
      document_urls: JSON.stringify(document_urls)
    });

    return res.status(201).json({
      message: 'Client added successfully',
      client: newClient
    });
  } catch (error) {
    console.error('Add Client Error:', error);
    return res.status(500).json({ error: 'Failed to add client.' });
  }
};

// 3. Edit a client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicle_no,
      client_name,
      address,
      contact_number,
      email,
      pan_number,
      gst_number,
      bank_holder_name,
      bank_account_number,
      bank_ifsc,
      bank_name,
      vehicle_name,
      rc_number,
      insurance_details,
      existing_documents // JSON string representing existing docs to keep
    } = req.body;

    const clients = await db.query('clients', { eq: { id } });
    if (!clients || clients.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const currentClient = clients[0];

    // Verify vehicle number uniqueness if changed
    if (vehicle_no && vehicle_no !== currentClient.vehicle_no) {
      const existing = await db.query('clients', { eq: { vehicle_no } });
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'A client with this vehicle number is already registered.' });
      }
    }

    // Determine documents to keep
    let docs = [];
    if (existing_documents) {
      try {
        docs = JSON.parse(existing_documents);
      } catch (err) {
        docs = typeof currentClient.document_urls === 'string' 
          ? JSON.parse(currentClient.document_urls) 
          : (currentClient.document_urls || []);
      }
    } else {
      docs = typeof currentClient.document_urls === 'string' 
        ? JSON.parse(currentClient.document_urls) 
        : (currentClient.document_urls || []);
    }

    // Append newly uploaded documents
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        docs.push({
          name: file.originalname,
          url: `/uploads/${file.filename}`
        });
      });
    }

    const updatedData = {
      vehicle_no: vehicle_no || currentClient.vehicle_no,
      client_name: client_name || currentClient.client_name,
      address: address !== undefined ? address : currentClient.address,
      contact_number: contact_number !== undefined ? contact_number : currentClient.contact_number,
      email: email !== undefined ? email : currentClient.email,
      pan_number: pan_number || currentClient.pan_number,
      gst_number: gst_number !== undefined ? gst_number : currentClient.gst_number,
      bank_holder_name: bank_holder_name || currentClient.bank_holder_name,
      bank_account_number: bank_account_number || currentClient.bank_account_number,
      bank_ifsc: bank_ifsc || currentClient.bank_ifsc,
      bank_name: bank_name || currentClient.bank_name,
      vehicle_name: vehicle_name || currentClient.vehicle_name,
      rc_number: rc_number || currentClient.rc_number,
      insurance_details: insurance_details || currentClient.insurance_details,
      document_urls: JSON.stringify(docs)
    };

    const updatedClient = await db.update('clients', id, updatedData);

    return res.status(200).json({
      message: 'Client updated successfully',
      client: updatedClient
    });
  } catch (error) {
    console.error('Update Client Error:', error);
    return res.status(500).json({ error: 'Failed to update client.' });
  }
};

// 4. Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const clients = await db.query('clients', { eq: { id } });
    if (!clients || clients.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    await db.delete('clients', id);

    return res.status(200).json({ message: 'Client deleted successfully.' });
  } catch (error) {
    console.error('Delete Client Error:', error);
    return res.status(500).json({ error: 'Failed to delete client.' });
  }
};
