import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Mic, MicOff, Paperclip, ChevronDown, Play, Pause } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Entry } from '../../types';
import { useEntries } from '../../hooks/useEntries';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry | null;
  bookId: string;
}

export function EditEntryModal({ isOpen, onClose, entry, bookId }: EditEntryModalProps) {
  const { updateEntry } = useEntries(bookId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Form state
  const [type, setType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Initialize form with entry data
  useEffect(() => {
    if (entry) {
      setType(entry.type);
      setDate(entry.date);
      setTime(entry.time);
      setAmount(entry.amount.toString());
      setContactName(entry.contact_name || '');
      setRemarks(entry.remarks || '');
      setCategory(entry.category || '');
      setPaymentMode(entry.payment_mode || 'Cash');
    }
  }, [entry]);

  const categories = {
    'cash_in': ['Salary', 'Sale', 'Bonus', 'Income From Rent', 'Profit'],
    'cash_out': ['Office Expense', 'Travel', 'Food', 'Utilities', 'Rent', 'Supplies']
  };

  const paymentModes = ['Cash', 'Online', 'PhonePe', 'Paytm', 'Bank Transfer', 'Credit Card'];

  const playVoiceRecording = () => {
    if (entry?.voice_recording) {
      const audio = new Audio(entry.voice_recording);
      setIsPlayingVoice(true);
      
      audio.onended = () => {
        setIsPlayingVoice(false);
      };
      
      audio.onerror = () => {
        setIsPlayingVoice(false);
        alert('Error playing voice recording');
      };
      
      audio.play();
    }
  };

  const resetForm = () => {
    setType('cash_in');
    setDate('');
    setTime('');
    setAmount('');
    setContactName('');
    setRemarks('');
    setCategory('');
    setPaymentMode('Cash');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    if (!amount.trim()) {
      setError('Amount is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedData = {
        type,
        amount: parseFloat(amount),
        contact_name: contactName,
        remarks,
        category,
        payment_mode: paymentMode,
        date,
        time,
        // Keep existing fields that we're not editing
        attachments: entry.attachments || [],
        custom_fields: entry.custom_fields || {},
        voice_recording: entry.voice_recording,
        custom_fields: entry.custom_fields
      };

      await updateEntry(entry.id, updatedData);
      handleClose();
    } catch (error) {
      console.error('Failed to update entry:', error);
      setError('Failed to update entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!entry) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Entry">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Entry Type Switcher */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('cash_in')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === 'cash_in'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cash In
          </button>
          <button
            type="button"
            onClick={() => setType('cash_out')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === 'cash_out'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cash Out
          </button>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 890 or 100 + 200*3"
          required
        />

        {/* Contact Name */}
        <Input
          label="Contact Name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Search or Select"
        />

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Enter Details (Name, Bill No, Item Name, Quantity etc)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Voice Recording Display */}
        {entry?.voice_recording && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voice Recording</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <button
                type="button"
                onClick={playVoiceRecording}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                disabled={isPlayingVoice}
              >
                {isPlayingVoice ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isPlayingVoice ? 'Playing...' : 'Play Recording'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Attachments Display */}
        {entry?.attachments && entry.attachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {entry.attachments.length} attachment{entry.attachments.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {entry.attachments.map((attachment, index) => (
                  <div key={index} className="text-xs text-gray-600 truncate">
                    {typeof attachment === 'string' ? attachment : `Attachment ${index + 1}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category and Payment Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
              >
                <span className={category || 'text-gray-400'}>
                  {category || 'Select'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2">Suggestions</div>
                    {categories[type].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
              >
                <span>{paymentMode}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showPaymentDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    {paymentModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setPaymentMode(mode);
                          setShowPaymentDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
            className={`${type === 'cash_in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Updating...' : 'Update Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}