// backend/utils/emailReports.js
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { downloadPDFReport } = require('../utils/pdfGenerator'); // We'll create this soon
const User = require('../models/User');
require('dotenv').config();

// Configure email (use Gmail, SendGrid, or Brevo)
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate PDF buffer (server-side)
const generateSummaryPDF = async () => {
  // Reuse frontend logic, but server-side — simplified version
  // In practice: call /api/reports/summary and generate PDF
  // For brevity, we’ll simulate:
  return Buffer.from('%PDF-1.4...fake pdf...'); 
};

const sendWeeklyReport = async () => {
  try {
    const admins = await User.find({ role: 'admin' });
    const pdfBuffer = await generateSummaryPDF();

    const mailOptions = {
      from: '"Kayoni Graphics" <noreply@kayonigraphics.co.ke>',
      to: admins.map(u => u.email).join(','),
      subject: `📊 Weekly Report — ${new Date().toLocaleDateString()}`,
      text: `Hi team,\n\nAttached is your weekly inventory & profit summary.\n\n— Kayoni Graphics System`,
      attachments: [{
        filename: `Kayoni_Weekly_${new Date().toISOString().slice(0,10)}.pdf`,
        content: pdfBuffer
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Weekly report email sent');
  } catch (err) {
    console.error('❌ Weekly report email failed:', err);
  }
};

// Schedule: Every Monday at 8 AM EAT
cron.schedule('0 8 * * 1', sendWeeklyReport, {
  scheduled: true,
  timezone: 'Africa/Nairobi'
});

module.exports = { sendWeeklyReport };