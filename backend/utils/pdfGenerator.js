const PDFDocument = require('pdfkit');

const generateReportPDF = (title, period, items, totals, res) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
  doc.pipe(res);

  // Title and Period
  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${period}`);
  doc.moveDown();

  // Define Column X-Positions
  const col = {
    item: 40,
    bought: 220,
    sold: 280,
    revenue: 330,
    cost: 410,
    profit: 490
  };

  // Helper function to draw a row
  const drawRow = (item, bought, sold, rev, cost, prof, isHeader = false) => {
    const y = doc.y;
    if (isHeader) doc.font('Helvetica-Bold');
    else doc.font('Helvetica');

    doc.text(item, col.item, y, { width: 170, truncate: true }); // Wrap/truncate long names
    doc.text(bought, col.bought, y, { width: 50, align: 'right' });
    doc.text(sold, col.sold, y, { width: 50, align: 'right' });
    doc.text(rev, col.revenue, y, { width: 70, align: 'right' });
    doc.text(cost, col.cost, y, { width: 70, align: 'right' });
    doc.text(prof, col.profit, y, { width: 70, align: 'right' });
    
    doc.moveDown(0.5); // Space for next line
  };

  // Header
  doc.fontSize(10);
  drawRow('Item', 'Bought', 'Sold', 'Revenue', 'Cost', 'Profit', true);
  doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke(); // Underline header
  doc.moveDown(0.5);

  // Data Rows
  items.forEach(i => {
    // Check if we need a new page
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

  // Totals Section
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(12).text(`Totals`, col.item);
  doc.fontSize(10);
  doc.text(`Total Revenue: KSh ${totals.totalRevenue.toFixed(2)}`, col.item);
  doc.text(`Total Cost: KSh ${totals.totalCost.toFixed(2)}`, col.item);
  doc.text(`Total Profit: KSh ${totals.totalProfit.toFixed(2)}`, col.item);

  doc.end();
};

module.exports = { generateReportPDF };