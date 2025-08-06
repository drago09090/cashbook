import { useState } from 'react';
import { Send, Mail, Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useInvoices } from '../../hooks/useInvoices';
import { Invoice } from '../../types';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function SendInvoiceModal({ isOpen, onClose, invoice }: SendInvoiceModalProps) {
  const { sendInvoice } = useInvoices();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize form when invoice changes
  useState(() => {
    if (invoice) {
      setEmail(invoice.customer_email || '');
      setSubject(`Invoice ${invoice.invoice_number} from ${invoice.customer_name}`);
      setMessage(`Dear ${invoice.customer_name},

Please find attached your invoice ${invoice.invoice_number} for the amount of ₹${invoice.total_amount.toFixed(2)}.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
- Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-GB')}
- Amount: ₹${invoice.total_amount.toFixed(2)}

Please make the payment by the due date to avoid any late fees.

Thank you for your business!

Best regards,
Your Business Team`);
    }
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setLoading(true);
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    try {
      await sendInvoice(invoice.id, email.trim());
      setSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubject('');
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!invoice) return null;

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Invoice Sent Successfully">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Sent!</h3>
          <p className="text-gray-600">
            Invoice {invoice.invoice_number} has been sent to {email}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send Invoice">
      <form onSubmit={handleSend} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Invoice Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Invoice Number:</span>
              <span className="ml-2 font-medium">{invoice.invoice_number}</span>
            </div>
            <div>
              <span className="text-gray-600">Customer:</span>
              <span className="ml-2 font-medium">{invoice.customer_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium">₹{invoice.total_amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Due Date:</span>
              <span className="ml-2 font-medium">
                {new Date(invoice.due_date).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>

        {/* Email Form */}
        <Input
          label="Send to Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          required
          icon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Invoice subject"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Email message..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Send Options */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What will be sent:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Professional PDF invoice</li>
            <li>• Email with your custom message</li>
            <li>• Invoice status will be updated to "Sent"</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending...' : 'Send Invoice'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}