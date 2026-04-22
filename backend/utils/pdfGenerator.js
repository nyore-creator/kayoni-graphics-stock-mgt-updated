const PDFDocument = require('pdfkit');

/**
 * @param {string} title - The PDF title
 * @param {string} period - The display period (e.g., "January 2026")
 * @param {Array} items - List of inventory items
 * @param {Object} totals - Calculated totals for the period
 * @param {Array} salesSummary - New: Aggregated sales data by month or day
 * @param {Object} res - Express response stream
 */
const generateReportPDF = (title, period, items, totals, salesSummary = [], res) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
  doc.pipe(res);

  // --- SECTION 1: HEADER ---
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Period: ${period}`, { align: 'center' });
  doc.moveDown();

  // --- SECTION 2: INVENTORY & PROFIT TABLE ---
  const col = {
    item: 40,
    bought: 220,
    sold: 280,
    revenue: 330,
    cost: 410,
    profit: 490
  };

  const drawRow = (item, bought, sold, rev, cost, prof, isHeader = false) => {
    const y = doc.y;
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
    doc.fontSize(10);

    doc.text(item, col.item, y, { width: 170, truncate: true });
    doc.text(bought, col.bought, y, { width: 50, align: 'right' });
    doc.text(sold, col.sold, y, { width: 50, align: 'right' });
    doc.text(rev, col.revenue, y, { width: 70, align: 'right' });
    doc.text(cost, col.cost, y, { width: 70, align: 'right' });
    doc.text(prof, col.profit, y, { width: 70, align: 'right' });
    
    doc.moveDown(0.6);
  };

  // Draw Inventory Header
  drawRow('Item', 'Bought', 'Sold', 'Revenue', 'Cost', 'Profit', true);
  doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
  doc.moveDown(0.5);

  // Draw Inventory Rows
  items.forEach(i => {
    if (doc.y > 700) doc.addPage(); 
    drawRow(
      i.name,
      i.bought.toString(),
      i.sold.toString(),
      i.revenue.toFixed(2),
      i.cost.toFixed(2),
      i.profit.toFixed(2)
    );
  });

  // --- SECTION 3: SALES PERFORMANCE SUMMARY ---
  // Start on a new page to keep sections distinct
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('Sales Performance Summary', 40);
  doc.moveDown();

  const sCol = { period: 40, items: 180, revenue: 350 };
  
  // Header for Sales Table
  doc.fontSize(11).font('Helvetica-Bold');
  const label = period.includes(' ') ? 'Day of Month' : 'Month'; // Detect if monthly or yearly report
  doc.text(label, sCol.period);
  doc.text('Items Sold', sCol.items, doc.y - 13, { width: 100, align: 'right' });
  doc.text('Total Revenue (KSh)', sCol.revenue, doc.y - 13, { width: 150, align: 'right' });
  doc.moveTo(40, doc.y).lineTo(520, doc.y).stroke();
  doc.moveDown(0.5);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  doc.font('Helvetica').fontSize(10);
  salesSummary.forEach(s => {
    if (doc.y > 700) doc.addPage();
    const y = doc.y;
    
    // Format the period label (Month name for yearly, Date number for monthly)
    const timeLabel = s._id.month ? monthNames[s._id.month - 1] : `Day ${s._id.day}`;
    
    doc.text(timeLabel, sCol.period, y);
    doc.text(s.itemsSold.toString(), sCol.items, y, { width: 100, align: 'right' });
    doc.text(s.revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 }), sCol.revenue, y, { width: 150, align: 'right' });
    doc.moveDown(0.5);
  });

  // --- SECTION 4: FINAL TOTALS ---
  doc.moveDown(2);
  doc.rect(40, doc.y, 520, 80).stroke(); // Draw a box around totals
  const totalY = doc.y + 10;
  
  doc.font('Helvetica-Bold').fontSize(12).text(`FINANCIAL SUMMARY`, 50, totalY);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Revenue: KSh ${totals.totalRevenue.toLocaleString()}`, 50, doc.y + 5);
  doc.text(`Total Cost:    KSh ${totals.totalCost.toLocaleString()}`, 50);
  doc.font('Helvetica-Bold').text(`Net Profit:    KSh ${totals.totalProfit.toLocaleString()}`, 50);

  doc.end();
};

module.exports = { generateReportPDF };