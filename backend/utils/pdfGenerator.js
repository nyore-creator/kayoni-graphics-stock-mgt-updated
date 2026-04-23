const PDFDocument = require('pdfkit');

const generateReportPDF = (fileName, periodLabel, items, totals, salesSummary, res) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
  doc.pipe(res);

  // --- HEADER ---
  doc.fontSize(18).font('Helvetica-Bold').text('Kayoni Graphics Inventory Report', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Period: ${periodLabel}`, { align: 'center' });
  doc.moveDown(2);

  // --- MAIN INVENTORY TABLE (Includes Stock) ---
  const tableTop = 120;
  // Columns: Item, Bought, Sold, Revenue, Cost, Profit, Stock
  const colWidths = [150, 50, 45, 65, 75, 75, 60]; 
  const headers = ['Item', 'Bought', 'Sold', 'Revenue', 'Cost', 'Profit', 'Stock'];

  // Draw Headers
  doc.fontSize(10).font('Helvetica-Bold');
  headers.forEach((h, i) => {
    const xPos = 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, xPos, tableTop);
  });

  doc.font('Helvetica').fontSize(9);
  let currentY = tableTop + 18;

  items.forEach((item) => {
    // Page break logic
    if (currentY > 750) { 
      doc.addPage(); 
      currentY = 50; 
      // Redraw headers on new page
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((h, i) => {
        const xPos = 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(h, xPos, currentY);
      });
      currentY += 18;
      doc.font('Helvetica').fontSize(9);
    }

    const rowData = [
      item.name,
      item.bought.toString(),
      item.sold.toString(),
      item.revenue.toFixed(2),
      item.cost.toFixed(2),
      item.profit.toFixed(2),
      (item.stockAtEnd || 0).toString()
    ];

    rowData.forEach((data, i) => {
      const xPos = 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(data, xPos, currentY, { width: colWidths[i] - 5, truncate: true });
    });
    currentY += 15;
  });

  // --- DETAILED SALES PERFORMANCE SUMMARY ---
  doc.addPage();
  doc.fontSize(14).font('Helvetica-Bold').text('Detailed Sales Performance Summary', 30, 50);
  doc.moveDown();

  // Determine if we should show "Month" or "Day"
  const isYearly = fileName.toLowerCase().includes('yearly');
  const timeLabel = isYearly ? 'Month' : 'Day';
  const salesHeaders = [timeLabel, 'Item Name', 'Qty Sold', 'Unit Price', 'Total (KSh)'];
  const sColWidths = [75, 195, 60, 80, 100];
  
  let salesY = 85;
  doc.fontSize(10).font('Helvetica-Bold');
  salesHeaders.forEach((h, i) => {
    const xPos = 30 + sColWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, xPos, salesY);
  });

  doc.font('Helvetica').fontSize(9);
  salesY += 18;

  salesSummary.forEach((entry) => {
    if (salesY > 750) { 
      doc.addPage(); 
      salesY = 50; 
    }
    
    const unitPrice = entry.itemsSold > 0 ? (entry.revenue / entry.itemsSold) : 0;
    
    // Formatting the Time column
    let timeValue = "";
    if (isYearly && entry._id.month) {
        // Converts 1 -> January, 2 -> February, etc.
        const date = new Date(2000, entry._id.month - 1, 1);
        timeValue = date.toLocaleString('en-KE', { month: 'long' });
    } else {
        timeValue = `Day ${entry._id.day || entry._id.month || 'N/A'}`;
    }

    const rowData = [
      timeValue,
      entry.itemName,
      entry.itemsSold.toString(),
      unitPrice.toFixed(2),
      entry.revenue.toLocaleString()
    ];

    rowData.forEach((data, i) => {
      const xPos = 30 + sColWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(data, xPos, salesY, { width: sColWidths[i] - 5 });
    });
    salesY += 15;
  });

  // --- FINAL FINANCIAL SUMMARY ---
  doc.moveDown(3);
  // Re-calculate Y position to prevent overlapping at page bottom
  if (doc.y > 700) doc.addPage();

  const netProfit = totals.totalRevenue - totals.totalCost;
  
  doc.fontSize(12).font('Helvetica-Bold').text('FINANCIAL SUMMARY', 30);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Revenue: KSh ${totals.totalRevenue.toLocaleString()}`);
  doc.text(`Total Cost of Purchases: KSh ${totals.totalCost.toLocaleString()}`);
  
  // ✅ Added Inventory Valuation
  doc.text(`Current Value of Unsold Stock: KSh ${(totals.stockValue || 0).toLocaleString()}`); 
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Net Profit/Loss: KSh ${netProfit.toLocaleString()}`, {
    underline: true,
    color: netProfit >= 0 ? 'black' : 'red'
  });

  doc.end();
};

module.exports = { generateReportPDF };