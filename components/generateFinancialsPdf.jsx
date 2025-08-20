// components/generateFinancialsPdf.jsx
import jsPDF from 'jspdf';

export const generateFinancialsPdf = ({
  fullProjectData,
  receivedAmount,
  paymentSchedule,
  totalReceived
}) => {
  const doc = new jsPDF();
  const lineGap = 8;
  let y = 20;

  // ====== Title ======
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('FirstHash', 105, y, { align: 'center' });

  y += lineGap + 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Financial Overview', 105, y, { align: 'center' });

  // ====== Financial Breakdown ======
  y += lineGap * 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('📌 Financial Breakdown', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  y += lineGap;
  doc.text(`• Base Package Cost: ₹ ${Number(fullProjectData.projectPackageCost).toLocaleString('en-IN')}`, 14, y);
  y += lineGap;
  doc.text(`• Additional Deliverables Cost: ₹ ${Number(fullProjectData.deliverablesAdditionalCost).toLocaleString('en-IN')}`, 14, y);
  y += lineGap;
  doc.text(`• Total Project Cost: ₹ ${Number(fullProjectData.overallTotalCost).toLocaleString('en-IN')}`, 14, y);

  // ====== Amount Received ======
  y += lineGap * 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('📥 Amount Received', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const transactions = receivedAmount?.transactions || [];
  if (transactions.length > 0) {
    transactions.forEach((tx, i) => {
      y += lineGap;
      const date = new Date(tx.date_received).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      doc.text(`${i + 1}) ₹ ${Number(tx.amount).toLocaleString('en-IN')} on ${date} - ${tx.description || 'No note'}`, 14, y);
    });
  } else {
    y += lineGap;
    doc.setFont('helvetica', 'italic');
    doc.text('No payments have been recorded yet.', 14, y);
  }

  // ====== Payment Installments ======
  const installments = paymentSchedule?.paymentInstallments || [];
  if (installments.length > 0) {
    y += lineGap * 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('📆 Payment Installment Plan', 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    installments.forEach((installment, i) => {
      y += lineGap;
      const date = installment.due_date
        ? new Date(installment.due_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'N/A';
      doc.text(`${i + 1}) ${installment.description || `Installment ${i + 1}`} - ₹ ${Number(installment.amount).toLocaleString('en-IN')} (Due: ${date})`, 14, y);
    });
  }

  // ====== Final Balance ======
  const finalBalance = fullProjectData.overallTotalCost - totalReceived;
  y += lineGap * 2;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 0, 0);
  doc.setFontSize(13);
  doc.text(`💰 Final Balance Due: ₹ ${Number(finalBalance).toLocaleString('en-IN')}`, 14, y);

  // ====== Save PDF ======
  doc.save('FirstHash_Financial_Report.pdf');
};
