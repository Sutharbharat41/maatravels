const nodemailer = require('nodemailer');
const db = require('../services/supabase');

// 1. Submit contact inquiry (Public route)
exports.submitInquiry = async (req, res) => {
  try {
    const { name, company_name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: 'Name, Phone, Email, and Message are required.' });
    }

    const newInquiry = await db.insert('inquiries', {
      name,
      company_name: company_name || '',
      phone,
      email,
      message,
      status: 'Unresolved'
    });

    return res.status(201).json({
      message: 'Inquiry submitted successfully. We will get back to you shortly!',
      inquiry: newInquiry
    });
  } catch (error) {
    console.error('Submit Inquiry Error:', error);
    return res.status(500).json({ error: 'Failed to submit inquiry. Please try again later.' });
  }
};

// 2. Get all inquiries (Admin route)
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await db.query('inquiries', { order: 'created_at:desc' });
    return res.status(200).json(inquiries);
  } catch (error) {
    console.error('Get Inquiries Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve inquiries.' });
  }
};

// 3. Reply to inquiry (Admin route - sends email and updates database)
exports.replyInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: 'Reply message is required.' });
    }

    const inquiries = await db.query('inquiries', { eq: { id } });
    if (!inquiries || inquiries.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    const inquiry = inquiries[0];

    // Transporter configuration using env variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"MAA Travels Support" <support@maatravels.com>`;

    let emailSent = false;
    let emailError = null;

    if (smtpUser && smtpUser !== 'test@gmail.com' && smtpPass && smtpPass !== 'testpass') {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: inquiry.email,
          subject: `Re: MAA Travels Inquiry Reference`,
          text: `Dear ${inquiry.name},\n\nThank you for reaching out to MAA Travels.\n\nIn response to your inquiry:\n"${inquiry.message}"\n\nOur reply:\n${replyMessage}\n\nWarm regards,\nMAA Travels Team\nPhone: +91 9876543210\nEmail: support@maatravels.com`,
          html: `<p>Dear <strong>${inquiry.name}</strong>,</p>
                 <p>Thank you for reaching out to MAA Travels.</p>
                 <p>In response to your inquiry:</p>
                 <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0; color: #555;">
                   "${inquiry.message}"
                 </blockquote>
                 <p><strong>Our reply:</strong></p>
                 <p>${replyMessage.replace(/\n/g, '<br>')}</p>
                 <br>
                 <p>Warm regards,<br>
                 <strong>MAA Travels Team</strong><br>
                 Phone: +91 9876543210<br>
                 Email: support@maatravels.com</p>`
        });
        
        emailSent = true;
        console.log(`Email successfully sent to ${inquiry.email}`);
      } catch (err) {
        emailError = err.message;
        console.warn('Mailer failed. Details:', err.message);
      }
    } else {
      console.log(`--- [SMTP Simulated Reply] ---
To: ${inquiry.email}
Subject: Re: MAA Travels Inquiry Reference
Message: ${replyMessage}
-------------------------------`);
    }

    // Update database record
    const updated = await db.update('inquiries', id, {
      reply_message: replyMessage,
      status: 'Resolved' // Auto-resolve upon reply
    });

    return res.status(200).json({
      message: emailSent 
        ? 'Reply email sent and inquiry marked as resolved.' 
        : 'Inquiry reply saved successfully (SMTP mock log printed). Marked as resolved.',
      inquiry: updated,
      emailError: emailSent ? null : (emailError || 'SMTP credentials missing. Email simulated in console.')
    });
  } catch (error) {
    console.error('Reply Inquiry Error:', error);
    return res.status(500).json({ error: 'Failed to process inquiry reply.' });
  }
};

// 4. Mark inquiry resolved / unresolved manually (Admin route)
exports.toggleResolve = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Resolved' or 'Unresolved'

    if (!status || !['Resolved', 'Unresolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "Resolved" or "Unresolved".' });
    }

    const inquiries = await db.query('inquiries', { eq: { id } });
    if (!inquiries || inquiries.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    const updated = await db.update('inquiries', id, { status });

    return res.status(200).json({
      message: `Inquiry status updated to ${status}.`,
      inquiry: updated
    });
  } catch (error) {
    console.error('Toggle Resolve Error:', error);
    return res.status(500).json({ error: 'Failed to update inquiry status.' });
  }
};
