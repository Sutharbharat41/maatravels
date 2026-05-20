const db = require('../services/supabase');

// Helper: Calculate payment metrics in round figures
const calculatePaymentMetrics = (basic, commPercent, tdsPercent, deductions) => {
  const basicAmount = parseFloat(basic) || 0;
  const commissionPercentage = parseFloat(commPercent) || 0;
  const tdsPercentage = parseFloat(tdsPercent) || 0;
  const deductionAmount = parseFloat(deductions) || 0;

  const commissionAmount = Math.round(basicAmount * (commissionPercentage / 100));
  const netTotal = Math.round(basicAmount - commissionAmount);
  const tdsAmount = Math.round(netTotal * (tdsPercentage / 100));
  const totalAmount = Math.round(netTotal - tdsAmount);
  const netToPay = Math.round(totalAmount - deductionAmount);

  return {
    basic_amount: basicAmount,
    commission_percentage: commissionPercentage,
    commission_amount: commissionAmount,
    net_total: netTotal,
    tds_percentage: tdsPercentage,
    tds_amount: tdsAmount,
    total_amount: totalAmount,
    deductions: deductionAmount,
    net_to_pay: netToPay
  };
};

// 1. Get all payment entries
exports.getPayments = async (req, res) => {
  try {
    const { month, year, vehicle_number, paid_status } = req.query;
    let payments = await db.query('payments', { order: 'created_at:desc' });

    // Filter in JS for simplicity and compatibility with mock DB
    if (month) {
      payments = payments.filter(p => p.month.toLowerCase() === month.toLowerCase());
    }
    if (year) {
      payments = payments.filter(p => parseInt(p.year) === parseInt(year));
    }
    if (vehicle_number) {
      payments = payments.filter(p => p.vehicle_number.toLowerCase() === vehicle_number.toLowerCase());
    }
    if (paid_status) {
      payments = payments.filter(p => p.paid_status.toLowerCase() === paid_status.toLowerCase());
    }

    return res.status(200).json(payments);
  } catch (error) {
    console.error('Get Payments Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve payment records.' });
  }
};

// 2. Add payment entry
exports.addPayment = async (req, res) => {
  try {
    const {
      bill_number,
      month,
      year,
      vehicle_number,
      vehicle_name,
      pan,
      basic_amount,
      commission_percentage,
      tds_percentage,
      deductions,
      paid_status,
      paid_date,
      notes
    } = req.body;

    if (!bill_number || !month || !year || !vehicle_number) {
      return res.status(400).json({ error: 'Bill Number, Month, Year, and Vehicle Number are required.' });
    }

    // Check if bill number already exists
    const existing = await db.query('payments', { eq: { bill_number } });
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'A payment with this bill number already exists.' });
    }

    // Run auto calculations
    const calculations = calculatePaymentMetrics(
      basic_amount,
      commission_percentage,
      tds_percentage,
      deductions
    );

    const newPayment = await db.insert('payments', {
      bill_number,
      month,
      year: parseInt(year),
      vehicle_number,
      vehicle_name: vehicle_name || '',
      pan: pan || '',
      ...calculations,
      paid_status: paid_status || 'Pending',
      paid_date: paid_status === 'Paid' ? (paid_date || new Date().toISOString().split('T')[0]) : null,
      notes: notes || ''
    });

    return res.status(201).json({
      message: 'Payment entry added successfully',
      payment: newPayment
    });
  } catch (error) {
    console.error('Add Payment Error:', error);
    return res.status(500).json({ error: 'Failed to add payment entry.' });
  }
};

// 3. Update payment entry
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bill_number,
      month,
      year,
      vehicle_number,
      vehicle_name,
      pan,
      basic_amount,
      commission_percentage,
      tds_percentage,
      deductions,
      paid_status,
      paid_date,
      notes
    } = req.body;

    const payments = await db.query('payments', { eq: { id } });
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    const current = payments[0];

    // Check if bill number already exists if changed
    if (bill_number && bill_number !== current.bill_number) {
      const existing = await db.query('payments', { eq: { bill_number } });
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'A payment with this bill number already exists.' });
      }
    }

    // Calculate inputs with fallbacks to current values
    const basic = basic_amount !== undefined ? basic_amount : current.basic_amount;
    const commP = commission_percentage !== undefined ? commission_percentage : current.commission_percentage;
    const tdsP = tds_percentage !== undefined ? tds_percentage : current.tds_percentage;
    const ded = deductions !== undefined ? deductions : current.deductions;

    const calculations = calculatePaymentMetrics(basic, commP, tdsP, ded);

    const updatedData = {
      bill_number: bill_number || current.bill_number,
      month: month || current.month,
      year: year ? parseInt(year) : current.year,
      vehicle_number: vehicle_number || current.vehicle_number,
      vehicle_name: vehicle_name || current.vehicle_name,
      pan: pan || current.pan,
      ...calculations,
      paid_status: paid_status || current.paid_status,
      paid_date: paid_status === 'Paid' ? (paid_date || new Date().toISOString().split('T')[0]) : null,
      notes: notes !== undefined ? notes : current.notes
    };

    const updatedPayment = await db.update('payments', id, updatedData);

    return res.status(200).json({
      message: 'Payment entry updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update Payment Error:', error);
    return res.status(500).json({ error: 'Failed to update payment record.' });
  }
};

// 4. Delete payment entry
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payments = await db.query('payments', { eq: { id } });
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    await db.delete('payments', id);

    return res.status(200).json({ message: 'Payment record deleted successfully.' });
  } catch (error) {
    console.error('Delete Payment Error:', error);
    return res.status(500).json({ error: 'Failed to delete payment record.' });
  }
};
