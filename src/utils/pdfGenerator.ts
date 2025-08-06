import { Entry, ReportSettings } from '../types';

export function generatePDF(
  entries: Entry[], 
  bookName: string, 
  userName: string, 
  settings: ReportSettings
) {
  const totals = entries.reduce((acc, entry) => {
    if (entry.type === 'cash_in') {
      acc.cashIn += Number(entry.amount);
    } else {
      acc.cashOut += Number(entry.amount);
    }
    return acc;
  }, { cashIn: 0, cashOut: 0 });

  const balance = totals.cashIn - totals.cashOut;

  const formatAmount = (amount: number) => new Intl.NumberFormat('en-IN').format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-GB');

  // Generate table headers
  const headers = [];
  if (settings.columns.date) headers.push('Date');
  if (settings.columns.remark) headers.push('Remark');
  if (settings.columns.contact) headers.push('Contact');
  if (settings.columns.category) headers.push('Category');
  if (settings.columns.paymentModes) headers.push('Mode');
  if (settings.columns.attachments) headers.push('Attachments');
  if (settings.columns.voice) headers.push('Voice');
  if (settings.columns.cashIn) headers.push('Cash In');
  if (settings.columns.cashOut) headers.push('Cash Out');
  if (settings.columns.members) headers.push('Entry By');
  if (settings.columns.balance) headers.push('Balance');

  // Generate table rows
  let runningBalance = 0;
  const rows = entries.map(entry => {
    runningBalance += entry.type === 'cash_in' ? Number(entry.amount) : -Number(entry.amount);
    
    const row = [];
    if (settings.columns.date) row.push(formatDate(entry.date));
    if (settings.columns.remark) row.push(entry.remarks || '--');
    if (settings.columns.contact) row.push(entry.contact_name || '--');
    if (settings.columns.category) row.push(entry.category || '--');
    if (settings.columns.paymentModes) row.push(entry.payment_mode);
    if (settings.columns.attachments) row.push(entry.attachments?.length ? `${entry.attachments.length} file(s)` : '--');
    if (settings.columns.voice) row.push(entry.voice_recording ? 'Yes' : '--');
    if (settings.columns.cashIn) row.push(entry.type === 'cash_in' ? formatAmount(Number(entry.amount)) : '');
    if (settings.columns.cashOut) row.push(entry.type === 'cash_out' ? formatAmount(Number(entry.amount)) : '');
    if (settings.columns.members) row.push(userName);
    if (settings.columns.balance) row.push(formatAmount(runningBalance));
    
    return row;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CashBook Report - ${bookName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 40px;
          height: 40px;
          background: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 15px;
        }
        .header-text h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .header-text p {
          margin: 5px 0 0 0;
          font-size: 12px;
          color: #666;
        }
        .book-title {
          font-size: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 30px;
          margin: 20px 0;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .summary-value {
          font-size: 18px;
          font-weight: bold;
        }
        .cash-in { color: #059669; }
        .cash-out { color: #dc2626; }
        .balance { color: ${balance >= 0 ? '#059669' : '#dc2626'}; }
        .entries-count {
          font-size: 14px;
          color: #666;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .text-right {
          text-align: right;
        }
        .final-balance-row {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">C</div>
        <div class="header-text">
          <h1>CashBook Report</h1>
          <p>Generated On - ${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-US', { hour12: false })} AM. Generated by - ${userName}</p>
        </div>
      </div>

      <div class="book-title">${bookName}</div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Cash In</div>
          <div class="summary-value cash-in">${formatAmount(totals.cashIn)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Cash Out</div>
          <div class="summary-value cash-out">${formatAmount(totals.cashOut)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Final Balance</div>
          <div class="summary-value balance">${formatAmount(balance)}</div>
        </div>
      </div>

      <div class="entries-count">Total No. of entries: ${entries.length}</div>

      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th${header.includes('Cash') || header === 'Balance' ? ' class="text-right"' : ''}>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map((cell, index) => {
                const isRightAlign = headers[index] && (headers[index].includes('Cash') || headers[index] === 'Balance');
                return `<td${isRightAlign ? ' class="text-right"' : ''}>${cell}</td>`;
              }).join('')}
            </tr>
          `).join('')}
          ${settings.columns.balance ? `
            <tr class="final-balance-row">
              <td colspan="${headers.length - 1}" class="text-right">Final Balance</td>
              <td class="text-right">${formatAmount(balance)}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${bookName}_${new Date().toISOString().split('T')[0]}.html`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Also try to open print dialog for immediate PDF conversion
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}