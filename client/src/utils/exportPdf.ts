/**
 * PDF Export Utility
 * Generates a professional PDF report of loans and obligations
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Loan } from '../api';

function fmt(n: number, currency = 'PLN') {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(n);
}

export function exportLoansToPdf(loans: Loan[]) {
  const doc = new jsPDF();
  const now = new Date();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // primary color
  doc.text('Dluznik - Raport Pozyczek', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(107, 122, 153); // text-muted
  doc.text(`Wygenerowano: ${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 28);

  // Summary stats
  const totalDebt = loans.reduce((s, l) => s + Number(l.currentBalance), 0);
  const totalOriginal = loans.reduce((s, l) => s + Number(l.originalAmount), 0);
  const totalPaid = totalOriginal - totalDebt;
  const activeCount = loans.filter(l => l.status === 'active').length;
  const paidCount = loans.filter(l => l.status === 'paid').length;
  const overdueCount = loans.filter(l => l.status === 'active' && l.dueDate && new Date(l.dueDate) < now).length;

  doc.setFontSize(11);
  doc.setTextColor(30, 37, 53);
  doc.text('Podsumowanie:', 14, 40);

  const summaryData = [
    ['Całkowite zadłużenie', fmt(totalDebt)],
    ['Łącznie spłacono', fmt(totalPaid)],
    ['Aktywne pożyczki', String(activeCount)],
    ['Spłacone pożyczki', String(paidCount)],
    ['Przeterminowane', String(overdueCount)],
  ];

  autoTable(doc, {
    startY: 44,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { textColor: [107, 122, 153], cellWidth: 60 },
      1: { fontStyle: 'bold', textColor: [30, 37, 53] },
    },
  });

  // Loans table
  const tableY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setTextColor(30, 37, 53);
  doc.text('Lista Pozyczek:', 14, tableY);

  const tableData = loans.map(loan => {
    const isOverdue = loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < now;
    const pct = loan.originalAmount > 0
      ? ((Number(loan.originalAmount) - Number(loan.currentBalance)) / Number(loan.originalAmount) * 100).toFixed(0)
      : '0';
    return [
      loan.borrowerName,
      fmt(Number(loan.originalAmount), loan.currency),
      fmt(Number(loan.currentBalance), loan.currency),
      `${pct}%`,
      loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('pl-PL') : '—',
      isOverdue ? 'Przeterminowana' : loan.status === 'paid' ? 'Splacona' : 'Aktywna',
    ];
  });

  autoTable(doc, {
    startY: tableY + 4,
    head: [['Dluznik', 'Kwota', 'Pozostalo', 'Splacono', 'Termin', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    columnStyles: {
      0: { cellWidth: 40 },
      5: { cellWidth: 28 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw);
        if (val === 'Przeterminowana') data.cell.styles.textColor = [244, 63, 94];
        else if (val === 'Splacona') data.cell.styles.textColor = [16, 185, 129];
        else data.cell.styles.textColor = [99, 102, 241];
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 122, 153);
    doc.text(`Dluznik App - Strona ${i} z ${pageCount}`, 14, doc.internal.pageSize.height - 8);
    doc.text(now.toLocaleDateString('pl-PL'), doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' });
  }

  doc.save(`dluznik-raport-${now.toISOString().slice(0, 10)}.pdf`);
}
