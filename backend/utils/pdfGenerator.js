const PDFDocument = require('pdfkit');

const generateReportPDF = (title, period, items, totals, res) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${period}`);
  doc.moveDown();

  doc.fontSize(11).text('Item                     Bought   Sold   Revenue(KSh)   Cost(KSh)   Profit(KSh)');
  doc.moveDown(0.5);

  items.forEach(i => {
    doc.text(
      `${i.name.padEnd(25)} ${i.bought.toString().padEnd(7)} ${i.sold.toString().padEnd(7)} ${i.revenue.toFixed(2).padEnd(14)} ${i.cost.toFixed(2).padEnd(12)} ${i.profit.toFixed(2)}`
    );
  });

  doc.moveDown();
  doc.fontSize(12).text(`Totals`);
  doc.text(`Revenue: KSh ${totals.totalRevenue.toFixed(2)}`);
  doc.text(`Cost: KSh ${totals.totalCost.toFixed(2)}`);
  doc.text(`Profit: KSh ${totals.totalProfit.toFixed(2)}`);

  doc.end();
};

module.exports = { generateReportPDF };
