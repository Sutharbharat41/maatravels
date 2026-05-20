const XLSX = require('xlsx');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const db = require('../services/supabase');

// 1. Get Analytics Dashboard Data (Charts + Cards)
exports.getAnalytics = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();

    // Fetch collections
    const payments = await db.query('payments');
    const vehicles = await db.query('vehicles');
    const clients = await db.query('clients');
    const inquiries = await db.query('inquiries');

    // Stats calculations
    const activeVehicles = vehicles.filter(v => v.availability).length;
    const totalVehiclesCount = vehicles.length;
    const totalClientsCount = clients.length;
    const pendingInquiriesCount = inquiries.filter(i => i.status !== 'Resolved').length;

    // Payments calculations
    let totalEarnings = 0; // Cumulative net paid
    let totalPending = 0;  // Net to pay of pending invoices
    let totalPaid = 0;     // Net to pay of paid invoices

    payments.forEach(p => {
      const netToPay = parseFloat(p.net_to_pay) || 0;
      if (p.paid_status === 'Paid') {
        totalPaid += netToPay;
      } else {
        totalPending += netToPay;
      }
      totalEarnings += netToPay;
    });

    // Chart Data: Monthly Revenue Distribution for the selected year
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyData = months.map(m => {
      const monthlyPayments = payments.filter(p => 
        p.month.toLowerCase() === m.toLowerCase() && 
        parseInt(p.year) === currentYear
      );

      let basicSum = 0;
      let commissionSum = 0;
      let netPaySum = 0;

      monthlyPayments.forEach(p => {
        basicSum += parseFloat(p.basic_amount) || 0;
        commissionSum += parseFloat(p.commission_amount) || 0;
        netPaySum += parseFloat(p.net_to_pay) || 0;
      });

      return {
        month: m.substring(0, 3),
        basic: Math.round(basicSum),
        commission: Math.round(commissionSum),
        netPay: Math.round(netPaySum)
      };
    });

    // Vehicle Category Distribution
    const categoryStats = {};
    vehicles.forEach(v => {
      categoryStats[v.type] = (categoryStats[v.type] || 0) + 1;
    });
    const vehicleDistribution = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

    return res.status(200).json({
      cards: {
        totalEarnings: Math.round(totalEarnings),
        totalPaid: Math.round(totalPaid),
        totalPending: Math.round(totalPending),
        totalVehicles: totalVehiclesCount,
        activeVehicles,
        totalClients: totalClientsCount,
        pendingInquiries: pendingInquiriesCount
      },
      charts: {
        monthlyRevenue: monthlyData,
        vehicleDistribution
      }
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    return res.status(500).json({ error: 'Failed to compile analytics statistics.' });
  }
};

// 2. Export Payments Report to Excel (.xlsx)
exports.exportExcel = async (req, res) => {
  try {
    const { month, year, vehicle_number, reportType } = req.query;

    let payments = await db.query('payments', { order: 'created_at:desc' });

    // Filter payments
    if (month) {
      payments = payments.filter(p => p.month.toLowerCase() === month.toLowerCase());
    }
    if (year) {
      payments = payments.filter(p => parseInt(p.year) === parseInt(year));
    }
    if (vehicle_number) {
      payments = payments.filter(p => p.vehicle_number.toLowerCase() === vehicle_number.toLowerCase());
    }

    let reportData = [];
    let title = 'MAA Travels - General Payments Report';

    if (reportType === 'earnings') {
      title = 'MAA Travels - Earnings and Commission Report';
      reportData = payments.map(p => ({
        'Bill Number': p.bill_number,
        'Period': `${p.month} ${p.year}`,
        'Vehicle Number': p.vehicle_number,
        'Vehicle Name': p.vehicle_name,
        'PAN': p.pan,
        'Basic Amount (Rs.)': p.basic_amount,
        'Commission %': p.commission_percentage,
        'Commission Amt (Rs.)': p.commission_amount,
        'Net Total (Rs.)': p.net_total,
        'Status': p.paid_status
      }));
    } else if (reportType === 'pending') {
      title = 'MAA Travels - Outstanding Pending Payments';
      payments = payments.filter(p => p.paid_status === 'Pending');
      reportData = payments.map(p => ({
        'Bill Number': p.bill_number,
        'Period': `${p.month} ${p.year}`,
        'Vehicle Number': p.vehicle_number,
        'Vehicle Name': p.vehicle_name,
        'Basic Amount (Rs.)': p.basic_amount,
        'TDS Amt (Rs.)': p.tds_amount,
        'Deductions (Rs.)': p.deductions,
        'Net To Pay (Rs.)': p.net_to_pay,
        'Notes': p.notes
      }));
    } else {
      // General full report
      reportData = payments.map(p => ({
        'Bill Number': p.bill_number,
        'Month': p.month,
        'Year': p.year,
        'Vehicle Number': p.vehicle_number,
        'Vehicle Name': p.vehicle_name,
        'PAN': p.pan,
        'Basic Amount (Rs.)': p.basic_amount,
        'Commission Amount (Rs.)': p.commission_amount,
        'Net Total (Rs.)': p.net_total,
        'TDS Amount (Rs.)': p.tds_amount,
        'Total Amount (Rs.)': p.total_amount,
        'Deductions (Rs.)': p.deductions,
        'Net To Pay (Rs.)': p.net_to_pay,
        'Status': p.paid_status,
        'Paid Date': p.paid_date || 'N/A',
        'Notes': p.notes
      }));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    
    // Set column widths dynamically
    const wscols = Object.keys(reportData[0] || {}).map(key => ({
      wch: Math.max(key.length + 4, 12)
    }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Accounting Sheet');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Report_${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(buffer);
  } catch (error) {
    console.error('Export Excel Error:', error);
    return res.status(500).json({ error: 'Failed to generate Excel sheet.' });
  }
};

// 3. Export PDF Report Summary (pdf-lib)
exports.exportPdf = async (req, res) => {
  try {
    const { month, year, vehicle_number, reportType } = req.query;

    let payments = await db.query('payments', { order: 'created_at:desc' });

    // Filter payments
    if (month) {
      payments = payments.filter(p => p.month.toLowerCase() === month.toLowerCase());
    }
    if (year) {
      payments = payments.filter(p => parseInt(p.year) === parseInt(year));
    }
    if (vehicle_number) {
      payments = payments.filter(p => p.vehicle_number.toLowerCase() === vehicle_number.toLowerCase());
    }

    if (reportType === 'pending') {
      payments = payments.filter(p => p.paid_status === 'Pending');
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // Header
    page.drawText('MAA TRAVELS - FINANCIAL SUMMARY REPORT', { x: 50, y, size: 16, font: fontBold, color: rgb(0.12, 0.23, 0.47) });
    y -= 15;
    page.drawText(`Generated on: ${new Date().toLocaleString()}`, { x: 50, y, size: 9, font: font, color: rgb(0.5, 0.5, 0.5) });
    
    // Draw line
    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

    // Aggregate summary numbers
    let totalBasic = 0;
    let totalNetPay = 0;
    payments.forEach(p => {
      totalBasic += parseFloat(p.basic_amount) || 0;
      totalNetPay += parseFloat(p.net_to_pay) || 0;
    });

    y -= 25;
    page.drawText('Summary Metrics:', { x: 50, y, size: 11, font: fontBold });
    y -= 15;
    page.drawText(`Total Invoices: ${payments.length}`, { x: 60, y, size: 10, font: font });
    page.drawText(`Total Gross Basic: Rs. ${Math.round(totalBasic)}`, { x: 200, y, size: 10, font: font });
    page.drawText(`Total Net to Pay: Rs. ${Math.round(totalNetPay)}`, { x: 400, y, size: 10, font: fontBold });

    // Table Headers
    y -= 30;
    page.drawText('Bill No.', { x: 50, y, size: 10, font: fontBold });
    page.drawText('Period', { x: 100, y, size: 10, font: fontBold });
    page.drawText('Vehicle No.', { x: 160, y, size: 10, font: fontBold });
    page.drawText('Basic Amt (Rs.)', { x: 250, y, size: 10, font: fontBold });
    page.drawText('Net to Pay (Rs.)', { x: 350, y, size: 10, font: fontBold });
    page.drawText('Status', { x: 450, y, size: 10, font: fontBold });

    y -= 5;
    page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0, 0, 0) });

    // Table Rows
    y -= 15;
    payments.slice(0, 30).forEach(p => {
      if (y < 60) {
        // Add new page if space is low
        page = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
        
        page.drawText('Bill No.', { x: 50, y, size: 10, font: fontBold });
        page.drawText('Period', { x: 100, y, size: 10, font: fontBold });
        page.drawText('Vehicle No.', { x: 160, y, size: 10, font: fontBold });
        page.drawText('Basic Amt (Rs.)', { x: 250, y, size: 10, font: fontBold });
        page.drawText('Net to Pay (Rs.)', { x: 350, y, size: 10, font: fontBold });
        page.drawText('Status', { x: 450, y, size: 10, font: fontBold });
        
        y -= 5;
        page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0, 0, 0) });
        y -= 15;
      }

      page.drawText(p.bill_number || '', { x: 50, y, size: 9, font: font });
      page.drawText(`${p.month} ${p.year}`, { x: 100, y, size: 9, font: font });
      page.drawText(p.vehicle_number || '', { x: 160, y, size: 9, font: font });
      page.drawText(String(Math.round(p.basic_amount)), { x: 250, y, size: 9, font: font });
      page.drawText(String(Math.round(p.net_to_pay)), { x: 350, y, size: 9, font: font });
      
      const statusColor = p.paid_status === 'Paid' ? rgb(0, 0.5, 0) : rgb(0.7, 0, 0);
      page.drawText(p.paid_status || '', { x: 450, y, size: 9, font: fontBold, color: statusColor });

      y -= 18;
    });

    if (payments.length > 30) {
      page.drawText(`* Showing first 30 of ${payments.length} total entries.`, { x: 50, y: y - 10, size: 8, font: font, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `Report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Export PDF Error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF summary.' });
  }
};
