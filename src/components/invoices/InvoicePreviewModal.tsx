import { X, Download, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Invoice } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useBooks } from '../../hooks/useBooks';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoicePreviewModal({ isOpen, onClose, invoice }: InvoicePreviewModalProps) {
  const { user } = useAuth();
  const { books } = useBooks();

  if (!invoice) return null;

  const book = books.find(b => b.id === invoice.book_id);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .company-info h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .company-info p {
            margin: 5px 0;
            color: #666;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .bill-to h3, .invoice-meta h3 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
          }
          .items-table td {
            border: 1px solid #e2e8f0;
            padding: 12px;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .text-right {
            text-align: right;
          }
          .totals {
            margin-left: auto;
            width: 300px;
          }
          .totals table {
            width: 100%;
            border-collapse: collapse;
          }
          .totals td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .total-row {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            font-size: 18px;
          }
          .notes {
            margin-top: 40px;
            padding: 20px;
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
          }
          .notes h4 {
            margin-top: 0;
            color: #2563eb;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .status-draft { background-color: #f3f4f6; color: #374151; }
          .status-sent { background-color: #dbeafe; color: #1d4ed8; }
          .status-paid { background-color: #d1fae5; color: #065f46; }
          .status-overdue { background-color: #fee2e2; color: #dc2626; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>${user?.business_name || user?.full_name || 'Your Business'}</h1>
            <p>${user?.email}</p>
            <p>CashBook Invoice System</p>
          </div>
          <div class="invoice-details">
            <div class="invoice-number">INVOICE</div>
            <div class="invoice-number">${invoice.invoice_number}</div>
            <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
          </div>
        </div>

        <div class="invoice-info">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer_name}</strong></p>
            ${invoice.customer_email ? `<p>${invoice.customer_email}</p>` : ''}
            ${invoice.customer_phone ? `<p>${invoice.customer_phone}</p>` : ''}
            ${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
          </div>
          <div class="invoice-meta">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> ${formatDate(invoice.invoice_date)}</p>
            <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
            <p><strong>Book:</strong> ${book?.name || 'Unknown'}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatAmount(item.unit_price)}</td>
                <td class="text-right">${formatAmount(item.total_price)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">${formatAmount(invoice.subtotal)}</td>
            </tr>
            ${invoice.tax_rate > 0 ? `
              <tr>
                <td>Tax (${invoice.tax_rate}%):</td>
                <td class="text-right">${formatAmount(invoice.tax_amount)}</td>
              </tr>
            ` : ''}
            ${invoice.discount_amount > 0 ? `
              <tr>
                <td>Discount:</td>
                <td class="text-right">-${formatAmount(invoice.discount_amount)}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td>Total:</td>
              <td class="text-right">${formatAmount(invoice.total_amount)}</td>
            </tr>
          </table>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div style="margin-top: 60px; text-align: center; color: #666; font-size: 12px;">
          <p>Generated by CashBook Invoice System</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center space-x-3">
            <Button onClick={generatePDF} variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-h-[70vh] overflow-y-auto">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-blue-600">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-2">
                {user?.business_name || user?.full_name || 'Your Business'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-gray-600">CashBook Invoice System</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-2">INVOICE</div>
              <div className="text-xl font-bold text-gray-900 mb-2">{invoice.invoice_number}</div>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Bill To:</h3>
              <div className="text-gray-900">
                <p className="font-semibold">{invoice.customer_name}</p>
                {invoice.customer_email && <p>{invoice.customer_email}</p>}
                {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                {invoice.customer_address && <p className="whitespace-pre-line">{invoice.customer_address}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Invoice Details:</h3>
              <div className="text-gray-900">
                <p><span className="font-medium">Invoice Date:</span> {formatDate(invoice.invoice_date)}</p>
                <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
                <p><span className="font-medium">Book:</span> {book?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Quantity</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Unit Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{formatAmount(item.unit_price)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{formatAmount(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 text-right font-medium">Subtotal:</td>
                    <td className="py-2 text-right">{formatAmount(invoice.subtotal)}</td>
                  </tr>
                  {invoice.tax_rate > 0 && (
                    <tr>
                      <td className="py-2 text-right font-medium">Tax ({invoice.tax_rate}%):</td>
                      <td className="py-2 text-right">{formatAmount(invoice.tax_amount)}</td>
                    </tr>
                  )}
                  {invoice.discount_amount > 0 && (
                    <tr>
                      <td className="py-2 text-right font-medium">Discount:</td>
                      <td className="py-2 text-right">-{formatAmount(invoice.discount_amount)}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-600 text-white">
                    <td className="py-3 px-4 text-right font-bold text-lg">Total:</td>
                    <td className="py-3 px-4 text-right font-bold text-lg">{formatAmount(invoice.total_amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
              <h4 className="font-semibold text-blue-600 mb-2">Notes:</h4>
              <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Generated by CashBook Invoice System</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}