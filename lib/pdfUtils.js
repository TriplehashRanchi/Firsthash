// lib/pdfUtils.js or lib/pdfUtils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function createJsPdf() {
  const doc = new jsPDF();
  // attach autoTable manually
  doc.autoTable = autoTable;
  return doc;
}
