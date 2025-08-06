import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useInvoices } from '../../hooks/useInvoices';
import { useBooks } from '../../hooks/useBooks';
import { Invoice, InvoiceItem } from '../../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

export function CreateInvoiceModal({ isOpen, onClose, invoice }: CreateInvoiceModalProps) {
  const { createInvoice, updateInvoice } = useInvoices();
  const { books } = useBooks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [bookId, setBookId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]>([
    { description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  // Load invoice data for editing
  useEffect(() => {
    if (invoice) {
      setBookId(invoice.book_id);
      setCustomerName(invoice.customer_name);
      setCustomerEmail(invoice.customer_email);
      setCustomerPhone(invoice.customer_phone);
      setCustomerAddress(invoice.customer_address);
      setInvoiceDate(invoice.invoice_date);
      setDueDate(invoice.due_date);
      setTaxRate(invoice.tax_rate);
      setDiscountAmount(invoice.discount_amount);
      setNotes(invoice.notes);
      
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })));
      }
    } else {
      resetForm();
    }
  }, [invoice]);

  const resetForm = () => {
    setBookId(books[0]?.id || '');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTaxRate(0);
    setDiscountAmount(0);
    setNotes('');
    setItems([{ description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!customerName.trim()) {
      setError('Customer name is required');
      setLoading(false);
      return;
    }

    if (!bookId) {
      setError('Please select a book');
      setLoading(false);
      return;
    }

    if (items.some(item => !item.description.trim())) {
      setError('All items must have a description');
      setLoading(false);
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      const tax_amount = calculateTaxAmount();
      const total_amount = calculateTotal();

      const invoiceData = {
        book_id: bookId,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal,
        tax_rate: taxRate,
        tax_amount,
        discount_amount: discountAmount,
        total_amount,
        status: 'draft' as const,
        notes: notes.trim()
      };

      if (invoice) {
        await updateInvoice(invoice.id, invoiceData, items);
      } else {
        await createInvoice(invoiceData, items);
      }

      // Small delay to ensure the invoice is properly created
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!invoice) {
      resetForm();
    }
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={invoice ? 'Edit Invoice' : 'Create New Invoice'}>
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Book Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Book <span className="text-red-500">*</span>
          </label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            placeholder="Enter customer name"
          />
          <Input
            label="Customer Email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="customer@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+91 9876543210"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Enter customer address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Invoice Date"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Input
                    label={index === 0 ? "Description" : ""}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Qty" : ""}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Unit Price" : ""}
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Total" : ""}
                    type="number"
                    value={item.total_price}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
              />
              <Input
                label="Discount Amount"
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax Amount:</span>
              <span className="text-sm font-medium">₹{calculateTaxAmount().toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between border-t pt-3">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes or terms..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}