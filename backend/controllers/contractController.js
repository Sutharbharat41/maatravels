const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } = require('docx');
const db = require('../services/supabase');

// Helper: Clean XML tags within placeholders in Word document.xml
// If MS Word split "{{placeholder}}" into separate XML tags, this strips them
const cleanWordXmlPlaceholders = (xml) => {
  // Find any {{...}} content and strip XML tags inside it
  return xml.replace(/\{\{[^}]+\}\}/g, (match) => {
    return match.replace(/<\/?[^>]+>/g, '');
  });
};

// Helper: Replace placeholders in unzipped docx XML
const replaceDocxXmlContent = (xml, replacements) => {
  let cleanedXml = cleanWordXmlPlaceholders(xml);
  
  Object.entries(replacements).forEach(([key, val]) => {
    const placeholder = `{{${key}}}`;
    const safeValue = val !== undefined && val !== null ? String(val) : '';
    // Standard XML escape for basic characters
    const escapedValue = safeValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    
    // Perform global replacement
    cleanedXml = cleanedXml.split(placeholder).join(escapedValue);
  });
  
  return cleanedXml;
};

// 1. Get all contracts
exports.getContracts = async (req, res) => {
  try {
    const contracts = await db.query('contracts', { order: 'created_at:desc' });
    return res.status(200).json(contracts);
  } catch (error) {
    console.error('Get Contracts Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve contract records.' });
  }
};

// 2. Get latest terms & conditions and payment terms for auto-fill
exports.getLatestTerms = async (req, res) => {
  try {
    const contracts = await db.query('contracts', { order: 'created_at:desc', limit: 1 });
    if (contracts && contracts.length > 0) {
      return res.status(200).json({
        terms_conditions: contracts[0].terms_conditions,
        payment_terms: contracts[0].payment_terms
      });
    }
    // Fallback default terms if no contracts exist yet
    return res.status(200).json({
      terms_conditions: '1. The vehicle hired shall be maintained in clean and roadworthy condition.\n2. Toll, parking, and state entry taxes shall be paid by the client.\n3. Drivers must hold a valid commercial license and exhibit professional conduct.',
      payment_terms: '1. Invoices will be generated monthly on the 1st day of the succeeding month.\n2. Payment terms are 15 days from the date of submission.\n3. TDS will be deducted as per applicable income tax rules.'
    });
  } catch (error) {
    console.error('Get Latest Terms Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve auto-fill terms.' });
  }
};

// 3. Upload template .docx
exports.uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a Word (.docx) file.' });
    }
    
    // Save template path to a config JSON file or just keep it in uploads
    const templateConfigPath = path.join(__dirname, '../uploads/template_config.json');
    const config = {
      templateName: req.file.originalname,
      templatePath: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(templateConfigPath, JSON.stringify(config, null, 2), 'utf8');
    
    return res.status(200).json({
      message: 'Contract template uploaded successfully.',
      template: config
    });
  } catch (error) {
    console.error('Upload Template Error:', error);
    return res.status(500).json({ error: 'Failed to upload contract template.' });
  }
};

// 4. Get current uploaded template info
exports.getTemplateInfo = async (req, res) => {
  try {
    const templateConfigPath = path.join(__dirname, '../uploads/template_config.json');
    if (fs.existsSync(templateConfigPath)) {
      const config = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
      return res.status(200).json(config);
    }
    return res.status(200).json({ templateName: 'None (Default System Generator will be used)' });
  } catch (error) {
    return res.status(200).json({ templateName: 'None (Default System Generator will be used)' });
  }
};

// 5. Generate and export contract (returns docx or pdf based on format query)
exports.generateContract = async (req, res) => {
  try {
    const {
      client_name,
      address,
      pan,
      gst,
      vehicle_name,
      vehicle_no,
      rc_number,
      insurance_details,
      rates,
      contract_duration,
      terms_conditions,
      payment_terms,
      bank_name,
      bank_holder_name,
      bank_account_number,
      bank_ifsc,
      format // 'docx' or 'pdf'
    } = req.body;

    if (!client_name || !vehicle_no || !rates) {
      return res.status(400).json({ error: 'Client Name, Vehicle Number, and Rates are required.' });
    }

    const replacements = {
      client_name,
      address,
      pan,
      gst: gst || 'N/A',
      vehicle_name: vehicle_name || 'N/A',
      vehicle_no,
      rc_number: rc_number || 'N/A',
      insurance_details: insurance_details || 'N/A',
      rates,
      contract_duration: contract_duration || '12 Months',
      terms_conditions: terms_conditions || '',
      payment_terms: payment_terms || '',
      bank_name: bank_name || 'N/A',
      bank_holder_name: bank_holder_name || 'N/A',
      bank_account_number: bank_account_number || 'N/A',
      bank_ifsc: bank_ifsc || 'N/A'
    };

    // Save contract record to Database
    const newContract = await db.insert('contracts', {
      client_name,
      address: address || '',
      pan,
      gst: gst || '',
      vehicle_details: `${vehicle_name || ''} (${vehicle_no})`,
      rates,
      contract_duration: contract_duration || '',
      terms_conditions,
      payment_terms,
      document_url: '' // Will update with file path
    });

    const docName = `Contract_${client_name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const uploadsDir = path.join(__dirname, '../uploads');

    if (format === 'pdf') {
      // Create PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
      const { width, height } = page.getSize();
      
      let y = height - 50;

      // Draw Letterhead Header
      page.drawText('MAA TRAVELS', { x: 50, y, size: 24, font: fontBold, color: rgb(0.12, 0.23, 0.47) });
      y -= 15;
      page.drawText('Professional Vehicle Hiring & Travel Services', { x: 50, y, size: 10, font: font, color: rgb(0.4, 0.4, 0.4) });
      y -= 12;
      page.drawText('Address: 12, N.S. Road, Kolkata - 700001  |  Mobile: +91 98300 98300  |  Email: contact@maatravels.com', { x: 50, y, size: 8.5, font: font, color: rgb(0.4, 0.4, 0.4) });
      
      // Horizontal Line
      y -= 15;
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1.5,
        color: rgb(0.12, 0.23, 0.47)
      });
      
      y -= 30;
      page.drawText('VEHICLE HIRE SERVICE AGREEMENT', { x: width / 2 - 130, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      
      y -= 30;
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y, size: 10, font: font });
      page.drawText(`Contract ID: CON-${newContract.id.substr(0, 8).toUpperCase()}`, { x: width - 200, y, size: 10, font: font });
      
      y -= 25;
      page.drawText('This agreement is entered between MAA TRAVELS (Service Provider) and:', { x: 50, y, size: 10, font: fontBold });
      
      y -= 20;
      page.drawText(`Client Name: ${client_name}`, { x: 50, y, size: 10, font: font });
      y -= 15;
      page.drawText(`Address: ${address}`, { x: 50, y, size: 10, font: font });
      y -= 15;
      page.drawText(`PAN: ${pan}  |  GST: ${gst || 'N/A'}`, { x: 50, y, size: 10, font: font });

      y -= 25;
      page.drawText('1. VEHICLE DETAILS & RATES', { x: 50, y, size: 11, font: fontBold, color: rgb(0.12, 0.23, 0.47) });
      y -= 15;
      page.drawText(`Vehicle Name: ${vehicle_name}`, { x: 70, y, size: 10, font: font });
      y -= 15;
      page.drawText(`Vehicle Number: ${vehicle_no}`, { x: 70, y, size: 10, font: font });
      y -= 15;
      page.drawText(`RC Number: ${rc_number || 'N/A'}`, { x: 70, y, size: 10, font: font });
      y -= 15;
      page.drawText(`Insurance Details: ${insurance_details || 'N/A'}`, { x: 70, y, size: 10, font: font });
      y -= 15;
      page.drawText(`Contract Rate: ${rates}`, { x: 70, y, size: 10, font: fontBold });
      y -= 15;
      page.drawText(`Duration: ${contract_duration || '12 Months'}`, { x: 70, y, size: 10, font: font });

      y -= 25;
      page.drawText('2. CLIENT BANK DETAILS', { x: 50, y, size: 11, font: fontBold, color: rgb(0.12, 0.23, 0.47) });
      y -= 15;
      page.drawText(`Bank Name: ${bank_name || 'N/A'}  |  A/C Holder Name: ${bank_holder_name || 'N/A'}`, { x: 70, y, size: 10, font: font });
      y -= 15;
      page.drawText(`Account Number: ${bank_account_number || 'N/A'}  |  IFSC Code: ${bank_ifsc || 'N/A'}`, { x: 70, y, size: 10, font: font });

      y -= 25;
      page.drawText('3. TERMS & CONDITIONS', { x: 50, y, size: 11, font: fontBold, color: rgb(0.12, 0.23, 0.47) });
      
      const drawParagraphText = (text, startY) => {
        let currentY = startY;
        const lines = text.split('\n');
        lines.forEach(line => {
          // Wrap text if too long (simple character wrap)
          const maxChar = 85;
          let i = 0;
          while (i < line.length) {
            const chunk = line.substring(i, i + maxChar);
            page.drawText(chunk, { x: 70, y: currentY, size: 9, font: font, color: rgb(0.2, 0.2, 0.2) });
            currentY -= 13;
            i += maxChar;
          }
        });
        return currentY;
      };

      y = drawParagraphText(terms_conditions, y - 15);

      y -= 15;
      page.drawText('4. PAYMENT TERMS', { x: 50, y, size: 11, font: fontBold, color: rgb(0.12, 0.23, 0.47) });
      y = drawParagraphText(payment_terms, y - 15);

      // Signatures
      y = 120;
      page.drawLine({ start: { x: 50, y }, end: { x: 180, y }, thickness: 1 });
      page.drawLine({ start: { x: width - 180, y }, end: { x: width - 50, y }, thickness: 1 });
      y -= 15;
      page.drawText('Authorized Signatory', { x: 60, y, size: 10, font: fontBold });
      page.drawText('Client Signature / Stamp', { x: width - 170, y, size: 10, font: fontBold });
      y -= 12;
      page.drawText('MAA TRAVELS', { x: 80, y, size: 9, font: font });
      page.drawText(client_name, { x: width - 150, y, size: 9, font: font });

      const pdfBytes = await pdfDoc.save();
      const fileName = `${docName}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, pdfBytes);

      // Update database URL
      await db.update('contracts', newContract.id, { document_url: `/uploads/${fileName}` });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.send(Buffer.from(pdfBytes));

    } else {
      // Export to Word (.docx)
      // Check if user uploaded a template first
      const templateConfigPath = path.join(__dirname, '../uploads/template_config.json');
      let docxBuffer = null;

      if (fs.existsSync(templateConfigPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
          const templateFilePath = path.join(__dirname, '..', config.templatePath);
          
          if (fs.existsSync(templateFilePath)) {
            // Load uploaded docx template
            const zip = new AdmZip(templateFilePath);
            let xmlContent = zip.readAsText('word/document.xml');
            
            // Replace placeholders in xml
            xmlContent = replaceDocxXmlContent(xmlContent, replacements);
            zip.updateFile('word/document.xml', Buffer.from(xmlContent, 'utf-8'));
            docxBuffer = zip.toBuffer();
          }
        } catch (templateError) {
          console.error('Error reading/replacing template. Falling back to code builder:', templateError);
        }
      }

      // If no template is uploaded, or replacement fails, build from scratch using docx library
      if (!docxBuffer) {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'MAA TRAVELS', bold: true, size: 36, color: '1A365D' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Professional Vehicle Hiring Services for Corporate & Personal Travel', italics: true, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Address: 12, N.S. Road, Kolkata - 700001  |  Mobile: +91 98300 98300  |  Email: contact@maatravels.com', size: 17, color: '555555' }),
                ],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'VEHICLE HIRE CONTRACT AGREEMENT', bold: true, size: 28, underline: {} }),
                ],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Date: ${new Date().toLocaleDateString()}`, bold: true }),
                ]
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'CLIENT / CONTRACTOR DETAILS', bold: true, color: '1A365D' })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: `Client Name: ${client_name}` })] }),
              new Paragraph({ children: [new TextRun({ text: `Address: ${address}` })] }),
              new Paragraph({ children: [new TextRun({ text: `PAN Number: ${pan}   |   GST: ${gst || 'N/A'}` })] }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'VEHICLE DETAILS', bold: true, color: '1A365D' })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: `Vehicle: ${vehicle_name} (${vehicle_no})` })] }),
              new Paragraph({ children: [new TextRun({ text: `RC Number: ${rc_number || 'N/A'}   |   Insurance: ${insurance_details || 'N/A'}` })] }),
              new Paragraph({ children: [new TextRun({ text: `Duration of Contract: ${contract_duration || '12 Months'}` })] }),
              new Paragraph({ children: [new TextRun({ text: `Hire Rate / Terms: ${rates}`, bold: true })] }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'CLIENT BANK DETAILS', bold: true, color: '1A365D' })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: `Bank Name: ${bank_name || 'N/A'}` })] }),
              new Paragraph({ children: [new TextRun({ text: `Account Holder Name: ${bank_holder_name || 'N/A'}` })] }),
              new Paragraph({ children: [new TextRun({ text: `Account Number: ${bank_account_number || 'N/A'}` })] }),
              new Paragraph({ children: [new TextRun({ text: `IFSC Code: ${bank_ifsc || 'N/A'}` })] }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'TERMS & CONDITIONS', bold: true, color: '1A365D' })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: terms_conditions })] }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'PAYMENT TERMS', bold: true, color: '1A365D' })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: payment_terms })] }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: '_____________________                 _____________________', bold: true })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Authorized Signatory                                   Client Signature', bold: true })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'MAA TRAVELS                                                ' + client_name })
                ]
              }),
            ],
          }],
        });

        docxBuffer = await Packer.toBuffer(doc);
      }

      const fileName = `${docName}.docx`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, docxBuffer);

      // Update database URL
      await db.update('contracts', newContract.id, { document_url: `/uploads/${fileName}` });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.send(Buffer.from(docxBuffer));
    }
  } catch (error) {
    console.error('Generate Contract Error:', error);
    return res.status(500).json({ error: 'Failed to generate contract.' });
  }
};
